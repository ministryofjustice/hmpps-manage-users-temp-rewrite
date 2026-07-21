import { UserAllowlistAddRequest, UserAllowlistDetail } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { HttpStatusCode } from '../utils/utils'

export default class UserAllowListService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  getAllowListUser = async (token: string, username: string): Promise<UserAllowlistDetail> =>
    this.manageUsersApiClient.getAllowlistUser(token, username)

  usernameExists = async (token: string, username: string): Promise<boolean> => {
    try {
      await this.getAllowListUser(token, username)
      return true
    } catch (err) {
      if (err.responseStatus === HttpStatusCode.NOT_FOUND) {
        return false
      }
      throw err
    }
  }

  addAllowListUser = async (token: string, user: UserAllowlistAddRequest): Promise<void> => {
    await this.manageUsersApiClient.addAllowlistUser(token, user)
  }
}
