import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { UserTypeKey } from '../../server/presentation/userType'

const manageUsersApiCreateLinkedUrlMap = new Map<UserTypeKey, string>([
  ['DPS_ADM', 'linkedprisonusers/admin'],
  ['DPS_GEN', 'linkedprisonusers/general'],
  ['DPS_LSA', 'linkedprisonusers/lsa'],
])

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

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubNotificationBannerMessage: (notificationType: string, message: string): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/notification/banner/${notificationType}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { message },
      },
    }),

  stubGetCaseloads: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/prisonusers/reference-data/caseloads',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            id: 'MDI',
            name: 'Moorland (HMP & YOI)',
          },
          {
            id: 'LEI',
            name: 'Leeds (HMP)',
          },
        ],
      },
    }),

  stubCreateDpsUser: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    caseloadId: string,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
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
      },
    }),

  stubCreateDpsUser400Response: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateDpsUserAlreadyExists: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorCode: 601,
        },
      },
    }),

  stubCreateDpsUserInvalidEmailDomain: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorCode: 602,
        },
      },
    }),

  stubGetDpsUser: (
    username: string = 'ITAG_USER5',
    firstName: string = 'Itag',
    lastName: string = 'User',
    email: string = 'ITAG_USER@gov.uk',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          staffId: '12345',
          username,
          firstName,
          lastName,
          primaryEmail: email,
          email,
          lastLogonDate: '2023-12-25T12:57:50',
          active: true,
          enabled: true,
          accountStatus: 'OPEN',
          administratorOfUserGroups: null,
        },
      },
    }),

  stubGetDpsUserNotFound: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),

  stubGetDpsUser400Response: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateLinkedDpsUser: (
    userType: UserTypeKey,
    username: string = 'TUSER_GEN',
    firstName: string = 'Test',
    lastName: string = 'User',
    email: string = 'test.user@djustice.gov.uk',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          staffId: 100,
          firstName,
          lastName,
          status: 'ACTIVE',
          primaryEmail: email,
          [`${userType === 'DPS_GEN' ? 'generalAccount' : 'adminAccount'}`]: { username },
        },
      },
    }),

  stubCreateLinkedDpsUser400Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateLinkedDpsUser409Response: (
    userType: UserTypeKey,
    userMessage: string = 'User already exists',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage,
        },
      },
    }),

  stubCreateLinkedDpsUser404Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),

  stubDpsRoles: (adminTypes: string): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/roles\\?adminTypes=${adminTypes}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
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
        ],
      },
    }),

  stubSearchDpsUsers: ({ totalElements = 1, page = 0, size = 10 }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/manage-users-api/prisonusers/search',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          content: replicateUser(Math.floor(totalElements / size) === page ? totalElements % size : size),
          size,
          totalElements,
          number: page,
          numberOfElements: totalElements < size ? totalElements : size,
        },
      },
    }),

  stubDpsUsersDownload: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/prisonusers/download\\?.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
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
      },
    }),

  stubDpsLsaDownload: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/prisonusers/download/admins\\?.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
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
      },
    }),
}
