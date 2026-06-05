import { UserGroup } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import ExternalUserService from './externalUserService'

jest.mock('../data/manageUsersApiClient')

describe('ExternalUserService', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: ExternalUserService

  beforeEach(() => {
    apiClient = {
      assignableGroups: jest.fn(),
    } as unknown as jest.Mocked<ManageUsersApiClient>

    service = new ExternalUserService(apiClient)
  })

  const token = 'test-token'

  it('Gets assignable groups', async () => {
    const response: UserGroup[] = [
      { groupCode: 'SOC_NORTH_WEST', groupName: 'SOCU North West' },
      { groupCode: 'PECS_TVP', groupName: 'PECS Police Force Thames Valley' },
      { groupCode: 'PECS_SOUTBC', groupName: 'PECS Court Southend Combined Court' },
      { groupCode: 'SITE_1_GROUP_2', groupName: 'Site 1 - Group 2' },
    ]

    apiClient.assignableGroups.mockResolvedValue(response)

    const result = await service.assignableGroups(token)

    expect(apiClient.assignableGroups).toHaveBeenCalledWith(token)
    expect(result).toBe(response)
  })
})
