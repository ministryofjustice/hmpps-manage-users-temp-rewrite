import { CreateRoleRequest, NotificationMessage, Role } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import RolesService from './rolesService'
import { PrisonUser } from '../interfaces/hmppsUser'

jest.mock('../data/manageUsersApiClient')

describe('RolesService', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: RolesService

  beforeEach(() => {
    apiClient = {
      getRoles: jest.fn(),
      getNotificationBannerMessage: jest.fn(),
      createRole: jest.fn(),
      getRoleDetails: jest.fn(),
    } as unknown as jest.Mocked<ManageUsersApiClient>

    service = new RolesService(apiClient)
  })

  const token = 'test-token'

  it('gets assignable roles including OAUTH_ADMIN if has role OAUTH_ADMIN', async () => {
    const user: PrisonUser = {
      username: 'some-user',
      authSource: 'nomis',
      staffId: 1234,
      userId: '1234',
      name: 'Some User',
      displayName: 'S. User',
      userRoles: ['MAINTAIN_ACCESS_ROLES_ADMIN', 'OAUTH_ADMIN'],
      token,
    }

    const roles = [
      {
        roleCode: 'ROLE_TEST',
        roleName: 'Test role',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
      {
        roleCode: 'OAUTH_ADMIN',
        roleName: 'OAuth admin',
        roleDescription: 'Manages oauth client details',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
    ]

    apiClient.getRoles.mockResolvedValue(roles)

    const result = await service.getAssignableRoles(user)

    expect(apiClient.getRoles).toHaveBeenCalledWith(token, 'DPS_ADM')
    expect(result).toBe(roles)
  })

  it('gets assignable roles excluding OAUTH_ADMIN if does not have role OAUTH_ADMIN', async () => {
    const user: PrisonUser = {
      username: 'some-user',
      authSource: 'nomis',
      staffId: 1234,
      userId: '1234',
      name: 'Some User',
      displayName: 'S. User',
      userRoles: ['MAINTAIN_ACCESS_ROLES_ADMIN'],
      token,
    }

    const roles = [
      {
        roleCode: 'ROLE_TEST',
        roleName: 'Test role',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
      {
        roleCode: 'OAUTH_ADMIN',
        roleName: 'OAuth admin',
        roleDescription: 'Manages oauth client details',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
    ]

    const expectedRoles = [
      {
        roleCode: 'ROLE_TEST',
        roleName: 'Test role',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
    ]

    apiClient.getRoles.mockResolvedValue(roles)

    const result = await service.getAssignableRoles(user)

    expect(apiClient.getRoles).toHaveBeenCalledWith(token, 'DPS_ADM')
    expect(result).toStrictEqual(expectedRoles)
  })

  it('gets central admin roles for maintain access roles admin user ', async () => {
    const user: PrisonUser = {
      username: 'some-user',
      authSource: 'nomis',
      staffId: 1234,
      userId: '1234',
      name: 'Some User',
      displayName: 'S. User',
      userRoles: ['MAINTAIN_ACCESS_ROLES_ADMIN'],
      token,
    }

    const roles = [
      {
        roleCode: 'ROLE_TEST',
        roleName: 'Test role',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
      {
        roleCode: 'OAUTH_ADMIN',
        roleName: 'OAuth admin',
        roleDescription: 'Manages oauth client details',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central DPS Administrator',
          },
        ],
      },
    ]

    apiClient.getRoles.mockResolvedValue(roles)

    const result = await service.getRolesForMaintainAccessRolesUser(user)

    expect(apiClient.getRoles).toHaveBeenCalledWith(token, 'DPS_ADM')
    expect(result).toStrictEqual(roles)
  })

  it('gets local admin roles for maintain access roles user ', async () => {
    const user: PrisonUser = {
      username: 'some-user',
      authSource: 'nomis',
      staffId: 1234,
      userId: '1234',
      name: 'Some User',
      displayName: 'S. User',
      userRoles: ['MAINTAIN_ACCESS_ROLES'],
      token,
    }

    const roles = [
      {
        roleCode: 'ROLE_TEST',
        roleName: 'Test role',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_LSA',
            adminTypeName: 'Local System Administrator',
          },
        ],
      },
      {
        roleCode: 'ROLE_JUST_FOR_LSA',
        roleName: 'Lsa Role',
        roleDescription: 'Role just for Lsa',
        adminType: [
          {
            adminTypeCode: 'DPS_LSA',
            adminTypeName: 'Local System Administrator',
          },
        ],
      },
    ]

    apiClient.getRoles.mockResolvedValue(roles)

    const result = await service.getRolesForMaintainAccessRolesUser(user)

    expect(apiClient.getRoles).toHaveBeenCalledWith(token, 'DPS_LSA')
    expect(result).toStrictEqual(roles)
  })

  it.each([['DPS_LSA'], ['DPS_ADM'], ['EXT_ADM'], ['IMS_HIDDEN']])(
    'gets roles for admin type %s',
    async (adminType: 'DPS_LSA' | 'DPS_ADM' | 'EXT_ADM' | 'IMS_HIDDEN') => {
      const roles = [
        {
          roleCode: 'ROLE_TEST',
          roleName: 'Test role',
          roleDescription: 'Test role to allow this test to pass',
          adminType: [
            {
              adminTypeCode: adminType,
              adminTypeName: `${adminType} Administrator`,
            },
          ],
        },
        {
          roleCode: 'ROLE_ADMIN_TEST',
          roleName: 'Test admin Role',
          roleDescription: 'Test admin role to allow this test to pass',
          adminType: [
            {
              adminTypeCode: adminType,
              adminTypeName: `${adminType} Administrator`,
            },
          ],
        },
      ]

      apiClient.getRoles.mockResolvedValue(roles)

      const result = await service.getRoles(token, adminType)

      expect(apiClient.getRoles).toHaveBeenCalledWith(token, adminType)
      expect(result).toStrictEqual(roles)
    },
  )

  it('gets the roles banner message', async () => {
    const message = 'Test Roles Banner'
    const notificationMessage: NotificationMessage = {
      message,
    }
    apiClient.getNotificationBannerMessage.mockResolvedValue(notificationMessage)
    const result = await service.getBannerMessage(token)

    expect(apiClient.getNotificationBannerMessage).toHaveBeenCalledWith(token, 'ROLES')
    expect(result).toEqual(message)
  })

  describe('Create role', () => {
    it('removes ROLE_ from the start of the role code', async () => {
      const role: Role = {
        roleCode: 'ROLES_ADMIN',
        roleName: 'Roles Admin',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central Admin',
          },
        ],
      }
      const roleRequest: CreateRoleRequest = {
        roleCode: 'ROLE_ROLES_ADMIN',
        roleName: 'Roles Admin',
        roleDescription: 'Test role to allow this test to pass',
        adminType: ['DPS_ADM'],
      }
      apiClient.createRole.mockResolvedValue(role)
      const result = await service.createRole(token, roleRequest)

      expect(apiClient.createRole).toHaveBeenCalledWith(token, { ...roleRequest, roleCode: 'ROLES_ADMIN' })
      expect(result).toEqual(role)
    })

    it('ensures the adminType is an array', async () => {
      const role: Role = {
        roleCode: 'ROLES_ADMIN',
        roleName: 'Roles Admin',
        roleDescription: 'Test role to allow this test to pass',
        adminType: [
          {
            adminTypeCode: 'DPS_ADM',
            adminTypeName: 'Central Admin',
          },
        ],
      }
      const roleRequest: CreateRoleRequest = {
        roleCode: 'ROLES_ADMIN',
        roleName: 'Roles Admin',
        roleDescription: 'Test role to allow this test to pass',
        adminType: 'DPS_ADM',
      }
      apiClient.createRole.mockResolvedValue(role)
      const result = await service.createRole(token, roleRequest)

      expect(apiClient.createRole).toHaveBeenCalledWith(token, { ...roleRequest, adminType: ['DPS_ADM'] })
      expect(result).toEqual(role)
    })
  })

  it('gets role details', async () => {
    const role: Role = {
      roleCode: 'ROLES_ADMIN',
      roleName: 'Roles Admin',
      roleDescription: 'Test role to allow this test to pass',
      adminType: [
        {
          adminTypeCode: 'DPS_ADM',
          adminTypeName: 'Central Admin',
        },
      ],
    }

    apiClient.getRoleDetails.mockResolvedValue(role)

    const result = await service.getRoleDetails(token, 'ROLES_ADMIN')

    expect(apiClient.getRoleDetails).toHaveBeenCalledWith(token, 'ROLES_ADMIN')
    expect(result).toBe(role)
  })
})
