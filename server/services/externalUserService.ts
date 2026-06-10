import { UserGroup } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'

export default class ExternalUserService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  assignableGroups = async (token: string): Promise<UserGroup[]> => this.manageUsersApiClient.assignableGroups(token)
}
