import { CreateGroupRequest, Group } from 'manageUsersApiClient'
import { Response } from 'superagent'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import GroupsService from './groupsService'

jest.mock('../data/manageUsersApiClient')

describe('GroupsService', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: GroupsService

  beforeEach(() => {
    apiClient = {
      createGroup: jest.fn(),
      groupDetails: jest.fn(),
    } as unknown as jest.Mocked<ManageUsersApiClient>

    service = new GroupsService(apiClient)
  })

  const token = 'test-token'

  it('Creates a group', async () => {
    const request: CreateGroupRequest = {
      groupCode: 'TEST_GROUP',
      groupName: 'Test Group',
    }

    const response = {
      ok: true,
    } as Response

    apiClient.createGroup.mockResolvedValue(response)

    const result = await service.createGroup(token, request)

    expect(apiClient.createGroup).toHaveBeenCalledWith(token, request)
    expect(result).toBe(response)
  })

  it('Gets group details', async () => {
    const response: Group = {
      groupCode: 'TEST_GROUP',
      groupName: 'Test Group',
    }

    apiClient.groupDetails.mockResolvedValue(response)

    const result = await service.groupDetails(token, 'TEST_GROUP')

    expect(apiClient.groupDetails).toHaveBeenCalledWith(token, 'TEST_GROUP')
    expect(result).toBe(response)
  })
})
