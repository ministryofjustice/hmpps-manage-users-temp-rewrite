import type { SuperAgentRequest } from 'superagent'
import { EmailDomain, Group, PrisonUserGroupDetail, Role, RoleDetail, UserCaseloadDetail } from 'manageUsersApiClient'
import { stubJson } from './wiremock'
import { UserTypeKey } from '../../server/presentation/userType'
import { HttpStatusCode } from '../../server/utils/utils'

const manageUsersApiCreateLinkedUrlMap = new Map<UserTypeKey, string>([
  ['DPS_ADM', 'linkedprisonusers/admin'],
  ['DPS_GEN', 'linkedprisonusers/general'],
  ['DPS_LSA', 'linkedprisonusers/lsa'],
])

const defaultImsHiddenRoles: Role[] = [
  {
    roleCode: 'IMS_USER',
    roleName: 'IMS user',
    roleDescription: 'IMS user',
    adminType: [
      {
        adminTypeCode: 'IMS_HIDDEN',
        adminTypeName: 'IMS Administrator',
      },
    ],
  },
]

const defaultDpsAdminRoles: Role[] = [
  {
    roleCode: 'MAINTAIN_ACCESS_ROLES',
    roleName: 'Maintain Roles',
    roleDescription: 'Maintaining roles for everyone',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'DPS_LSA',
        adminTypeName: 'DPS Local System Administrator',
      },
    ],
  },
  {
    roleCode: 'USER_ADMIN',
    roleName: 'User Admin',
    roleDescription: 'Administering users',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'DPS_LSA',
        adminTypeName: 'DPS Local System Administrator',
      },
    ],
  },
  {
    roleCode: 'ANOTHER_ADMIN_ROLE',
    roleName: 'Another admin role',
    roleDescription: 'Some text for another Admin Role',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
    ],
  },
  {
    roleCode: 'ANOTHER_GENERAL_ROLE',
    roleName: 'Another general role',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'EXT_ADM',
        adminTypeName: 'External Administrator',
      },
    ],
  },
  {
    roleCode: 'OAUTH_ADMIN',
    roleName: 'Oauth Admin',
    roleDescription: 'Some text for oauth admin',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'EXT_ADM',
        adminTypeName: 'External Administrator',
      },
    ],
  },
]

const defaultLsaRoles: Role[] = [
  {
    roleCode: 'MAINTAIN_ACCESS_ROLES',
    roleName: 'Maintain Roles',
    roleDescription: 'Maintaining roles for everyone',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'DPS_LSA',
        adminTypeName: 'DPS Local System Administrator',
      },
    ],
  },
  {
    roleCode: 'USER_ADMIN',
    roleName: 'User Admin',
    roleDescription: 'Administering users',
    adminType: [
      {
        adminTypeCode: 'DPS_ADM',
        adminTypeName: 'DPS Central Administrator',
      },
      {
        adminTypeCode: 'DPS_LSA',
        adminTypeName: 'DPS Local System Administrator',
      },
    ],
  },
]

const replicateUser = (times: number) =>
  [...Array(times).keys()].map(i => ({
    username: `ITAG_USER${i}`,
    staffId: i,
    firstName: 'Itag',
    lastName: `User${i}`,
    active: i % 2 === 0,
    status: i % 2 === 0 ? 'OPEN' : 'LOCKED',
    locked: false,
    expired: false,
    lastLogonDate: '2023-12-25T12:57:50',
    activeCaseload: {
      id: 'BXI',
      name: 'Brixton (HMP)',
    },
    dpsRoleCount: i,
    email: `ITAG_USER${i}@gov.uk`,
    staffStatus: 'ACTIVE',
  }))

const stubDpsRoles = (adminTypes: string, body: Role[] = defaultDpsAdminRoles): SuperAgentRequest =>
  stubJson({
    urlPattern: `/manage-users-api/roles\\?adminTypes=${adminTypes}`,
    body,
  })

const stubGetDpsUser = ({
  username = 'ITAG_USER5',
  firstName = 'Itag',
  lastName = 'User',
  email = 'ITAG_USER@gov.uk',
  active = true,
  enabled = true,
  administratorOfUserGroups,
  accountStatus = 'OPEN',
}: {
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  active?: boolean
  enabled?: boolean
  administratorOfUserGroups?: PrisonUserGroupDetail[]
  accountStatus?: string
}): SuperAgentRequest =>
  stubJson({
    urlPattern: `/manage-users-api/prisonusers/${username}/details`,
    body: {
      staffId: '12345',
      username,
      firstName,
      lastName,
      primaryEmail: email,
      email,
      lastLogonDate: '2023-12-25T12:57:50',
      active,
      enabled,
      accountStatus,
      administratorOfUserGroups,
    },
  })

const stubLsaDpsRoles = () => {
  return stubDpsRoles('DPS_LSA', defaultLsaRoles)
}

const stubCentralAdminDpsRoles = () => {
  return stubDpsRoles('DPS_ADM', defaultDpsAdminRoles)
}

const stubOAuthAdminDpsRoles = () => {
  return stubDpsRoles('DPS_ADM', [
    {
      roleCode: 'USER_ADMIN',
      roleName: 'User Admin',
      roleDescription: 'Administering users',
      adminType: [
        {
          adminTypeCode: 'DPS_ADM',
          adminTypeName: 'DPS Central Administrator',
        },
        {
          adminTypeCode: 'DPS_LSA',
          adminTypeName: 'DPS Local System Administrator',
        },
      ],
    },
    {
      roleCode: 'OAUTH_ADMIN',
      roleName: 'Oauth Admin',
      roleDescription: 'Some text for oauth admin',
      adminType: [
        {
          adminTypeCode: 'DPS_ADM',
          adminTypeName: 'DPS Central Administrator',
        },
        {
          adminTypeCode: 'EXT_ADM',
          adminTypeName: 'External Administrator',
        },
      ],
    },
  ])
}

export default {
  stubPing: (httpStatus = HttpStatusCode.OK): SuperAgentRequest =>
    stubJson({
      urlPattern: '/manage-users-api/health/ping',
      body: { status: httpStatus === HttpStatusCode.OK ? 'UP' : 'DOWN' },
      status: httpStatus,
    }),

  stubNotificationBannerMessage: (notificationType: string, message: string): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/notification/banner/${notificationType}`,
      body: { message },
    }),

  stubGetCaseloads: (): SuperAgentRequest =>
    stubJson({
      urlPattern: '/manage-users-api/prisonusers/reference-data/caseloads',
      body: [
        {
          id: 'MDI',
          name: 'Moorland (HMP & YOI)',
        },
        {
          id: 'LEI',
          name: 'Leeds (HMP)',
        },
      ],
    }),

  stubCreateDpsUser: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    caseloadId: string,
  ): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers',
      body: {
        username,
        staffId: 100,
        firstName,
        lastName,
        activeCaseloadId: caseloadId,
        accountStatus: 'EXPIRED',
        accountType: 'ADMIN',
        primaryEmail: email,
        dpsRoleCodes: [],
        accountNonLocked: true,
        credentialsNonExpired: false,
        enabled: true,
        admin: true,
        active: false,
      },
    }),

  stubCreateDpsUser400Response: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.BAD_REQUEST,
      urlPattern: '/manage-users-api/prisonusers',
      body: {
        userMessage: 'Bad request',
      },
    }),

  stubCreateDpsUserAlreadyExists: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.CONFLICT,
      urlPattern: '/manage-users-api/prisonusers',
      body: {
        errorCode: 601,
      },
    }),

  stubCreateDpsUserInvalidEmailDomain: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.CONFLICT,
      urlPattern: '/manage-users-api/prisonusers',
      body: {
        errorCode: 602,
      },
    }),

  stubGetDpsUser,
  stubGetDpsUserNotFound: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      status: HttpStatusCode.NOT_FOUND,
      body: {},
    }),

  stubGetDpsUser400Response: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      status: HttpStatusCode.BAD_REQUEST,
      body: {
        userMessage: 'Bad request',
      },
    }),

  stubCreateLinkedDpsUser: (
    userType: UserTypeKey,
    username: string = 'TUSER_GEN',
    firstName: string = 'Test',
    lastName: string = 'User',
    email: string = 'test.user@djustice.gov.uk',
  ): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      body: {
        staffId: 100,
        firstName,
        lastName,
        status: 'ACTIVE',
        primaryEmail: email,
        [`${userType === 'DPS_GEN' ? 'generalAccount' : 'adminAccount'}`]: { username },
      },
    }),

  stubCreateLinkedDpsUser400Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.BAD_REQUEST,
      urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      body: {
        userMessage: 'Bad request',
      },
    }),

  stubCreateLinkedDpsUser409Response: (
    userType: UserTypeKey,
    userMessage: string = 'User already exists',
  ): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.CONFLICT,
      urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      body: {
        userMessage,
      },
    }),

  stubCreateLinkedDpsUser404Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      status: HttpStatusCode.NOT_FOUND,
      urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      body: {},
    }),

  stubDpsRoles,

  stubLsaDpsRoles,

  stubCentralAdminDpsRoles,

  stubOAuthAdminDpsRoles,

  stubDpsUserRoles: ({
    activeCaseload = true,
    dpsRoles = [
      {
        code: 'MAINTAIN_ACCESS_ROLES',
        name: 'Maintain Roles',
        adminRoleOnly: false,
      },
      {
        code: 'ANOTHER_GENERAL_ROLE',
        name: 'Another general role',
        adminRoleOnly: false,
      },
    ],
  }: {
    activeCaseload?: boolean
    dpsRoles?: RoleDetail[]
  }): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/prisonusers/.*/roles`,
      body: {
        ...(activeCaseload && {
          activeCaseload: {
            id: 'MDI',
            name: 'Moorland',
          },
        }),
        dpsRoles,
      },
    }),

  stubDpsAddUserRoles: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      urlPattern: `/manage-users-api/prisonusers/.*/roles`,
      body: {},
    }),

  stubDpsRemoveUserRole: (): SuperAgentRequest =>
    stubJson({
      method: 'DELETE',
      urlPattern: `/manage-users-api/prisonusers/.*/roles/.*`,
    }),

  stubDpsUserCaseloads: (caseloads?: UserCaseloadDetail, username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/prisonusers/${username}/caseloads`,
      body: caseloads || {
        username,
        activeCaseload: {
          id: 'MDI',
          name: 'Moorland',
        },
        caseloads: [
          {
            id: 'MDI',
            name: 'Moorland',
          },
          {
            id: 'LEI',
            name: 'Leeds (HMP)',
          },
          {
            id: 'PVI',
            name: 'Pentonville (HMP)',
          },
        ],
      },
    }),

  stubDpsRemoveUserCaseload: (): SuperAgentRequest =>
    stubJson({
      method: 'DELETE',
      urlPattern: '/manage-users-api/prisonusers/.*/caseloads/.*',
    }),

  stubDpsAddUserCaseload: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers/.*/caseloads',
    }),

  stubEmail: ({
    username = 'ITAG_USER5',
    email,
    verified = true,
  }: {
    username?: string
    email: string
    verified?: boolean
  }): SuperAgentRequest =>
    stubJson({
      urlPattern: `/manage-users-api/users/[^/]*/email\\?unverified=true`,
      body: {
        username,
        email,
        verified,
      },
    }),

  stubRestrictedRolesMiddleware: ({
    username = 'USER1',
    isLocalAdmin = false,
  }: {
    username?: string
    isLocalAdmin?: boolean
  }) => {
    return Promise.all([
      stubDpsRoles('IMS_HIDDEN', defaultImsHiddenRoles),
      stubCentralAdminDpsRoles(),
      stubLsaDpsRoles(),
      stubGetDpsUser({
        username,
        administratorOfUserGroups: isLocalAdmin
          ? [
              { id: 'BLM', name: 'Belmarsh (HMP)' },
              { id: 'BXI', name: 'Brixton (HMP)' },
            ]
          : [],
      }),
    ])
  },

  stubSearchDpsUsers: ({ totalElements = 1, page = 0, size = 10 }): SuperAgentRequest =>
    stubJson({
      urlPath: '/manage-users-api/prisonusers/search',
      body: {
        content: replicateUser(Math.floor(totalElements / size) === page ? totalElements % size : size),
        size,
        totalElements,
        number: page,
        numberOfElements: totalElements < size ? totalElements : size,
      },
    }),

  stubDpsUsersDownload: (): SuperAgentRequest =>
    stubJson({
      urlPattern: '/manage-users-api/prisonusers/download\\?.*',
      body: [
        {
          username: 'LOCKED_USER',
          staffId: 7,
          firstName: 'User',
          lastName: 'Locked',
          active: false,
          status: 'LOCKED',
          locked: true,
          expired: false,
          activeCaseload: null,
          dpsRoleCount: 0,
          email: null,
        },
        {
          username: 'ITAG_USER',
          staffId: 1,
          firstName: 'Itag',
          lastName: 'User',
          active: true,
          status: 'OPEN',
          locked: false,
          expired: false,
          activeCaseload: {
            id: 'MDI',
            name: 'Moorland Closed (HMP & YOI)',
          },
          dpsRoleCount: 0,
          email: 'multiple.user.test@digital.justice.gov.uk',
        },
      ],
    }),

  stubDpsLsaDownload: (): SuperAgentRequest =>
    stubJson({
      urlPattern: '/manage-users-api/prisonusers/download/admins\\?.*',
      body: [
        {
          username: 'ITAG_USER',
          staffId: 1,
          firstName: 'Itag',
          lastName: 'User',
          active: true,
          status: 'OPEN',
          locked: false,
          expired: false,
          activeCaseload: {
            id: 'MDI',
            name: 'Moorland Closed (HMP & YOI)',
          },
          dpsRoleCount: 0,
          email: 'multiple.user.test@digital.justice.gov.uk',
          administratorOfUserGroups: [
            { id: 'BXI', name: 'Brixton (HMP)' },
            { id: 'MDI', name: 'Moorland (HMP & YOI)' },
          ],
        },
        {
          username: 'ITAG_USER2',
          staffId: 2,
          firstName: 'Itag2',
          lastName: 'User',
          active: true,
          status: 'OPEN',
          locked: false,
          expired: false,
          activeCaseload: {
            id: 'MDI',
            name: 'Moorland Closed (HMP & YOI)',
          },
          dpsRoleCount: 0,
          email: 'multiple.user.test2@digital.justice.gov.uk',
          administratorOfUserGroups: [{ id: 'MAN', name: 'Manchester (HMP)' }],
        },
      ],
    }),

  stubSyncDpsEmail: (): SuperAgentRequest =>
    stubJson({
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers/[^/]*/email/sync',
      body: undefined,
    }),

  stubDpsUserChangeEmail: () =>
    stubJson({
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers/[^/]*/email',
    }),

  stubDpsUserChangeEmailInvalidDomain: () =>
    stubJson({
      status: HttpStatusCode.BAD_REQUEST,
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers/[^/]*/email',
      body: {
        developerMessage: 'Validate email failed with reason: domain',
      },
    }),

  stubDpsUserChangeEmailAlreadyAssigned: () =>
    stubJson({
      status: HttpStatusCode.BAD_REQUEST,
      method: 'POST',
      urlPattern: '/manage-users-api/prisonusers/[^/]*/email',
      body: {
        developerMessage: 'Validate email failed with reason: duplicate',
      },
    }),

  stubDpsUserEnable: () =>
    stubJson({
      method: 'PUT',
      urlPattern: '/manage-users-api/prisonusers/.*/enable-user',
    }),

  stubDpsUserDisable: () =>
    stubJson({
      method: 'PUT',
      urlPattern: '/manage-users-api/prisonusers/.*/disable-user',
    }),

  stubGetAllEmailDomains: (emailDomains?: EmailDomain[]) =>
    stubJson({
      urlPath: '/manage-users-api/email-domains',
      body: emailDomains || [
        {
          id: 'cb5d9f0c-b7c8-40d5-8626-2e97f66d5127',
          domain: 'test.justice.gov.uk',
          description: 'Test justice domain',
        },
        {
          id: 'acf5e424-2f7c-4bea-ac1e-07d2553f3e63',
          domain: 'test.police.uk',
          description: 'Test police domain',
        },
        {
          id: '8529edfa-6bcf-462f-ae29-5433a615d405',
          domain: 'test.external.com',
          description: 'Test external domain',
        },
      ],
    }),

  stubGetEmailDomain: (id: string) =>
    stubJson({
      urlPath: `/manage-users-api/email-domains/${id}`,
      body: {
        id,
        domain: 'test.justice.gov.uk',
        description: 'Test justice domain',
      },
    }),

  stubGetEmailDomainBadRequest: (id: string) =>
    stubJson({
      status: HttpStatusCode.BAD_REQUEST,
      urlPath: `/manage-users-api/email-domains/${id}`,
    }),

  stubGetEmailDomainNotFound: (id: string) =>
    stubJson({
      status: HttpStatusCode.NOT_FOUND,
      urlPath: `/manage-users-api/email-domains/${id}`,
    }),

  stubCreateEmailDomain: () =>
    stubJson({
      method: 'POST',
      urlPath: `/manage-users-api/email-domains`,
      body: {
        id: 'cb5d9f0c-b7c8-40d5-8626-2e97f66d5127',
        domain: 'test.justice.gov.uk',
        description: 'Test justice domain',
      },
    }),

  stubDeleteEmailDomain: (id: string) =>
    stubJson({
      method: 'DELETE',
      urlPath: `/manage-users-api/email-domains/${id}`,
    }),

  stubCreateGroup: (status: HttpStatusCode = HttpStatusCode.OK) =>
    stubJson({
      method: 'POST',
      urlPath: `/manage-users-api/groups`,
      status,
    }),

  stubGroupDetails: (group: Group) =>
    stubJson({
      method: 'GET',
      urlPath: `/manage-users-api/groups/${group.groupCode}`,
      body: group,
    }),
}
