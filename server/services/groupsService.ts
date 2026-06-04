import { CreateGroupRequest, Group } from 'manageUsersApiClient'
import { Response } from 'superagent'
import ManageUsersApiClient from '../data/manageUsersApiClient'

export default class GroupsService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  createGroup = async (token: string, request: CreateGroupRequest): Promise<Response> =>
    this.manageUsersApiClient.createGroup(token, request)

  groupDetails = async (token: string, group: string): Promise<Group> =>
    this.manageUsersApiClient.groupDetails(token, group)
}
