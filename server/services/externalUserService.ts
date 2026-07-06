import { ExternalUser, UserGroup } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'

export default class ExternalUserService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  assignableGroups = async (token: string): Promise<UserGroup[]> => this.manageUsersApiClient.assignableGroups(token)

  getUsersInCRSGroup = async (token: string, groupCode: string): Promise<ExternalUser[]> =>
    this.manageUsersApiClient.getUsersInCRSGroup(token, groupCode)
}
