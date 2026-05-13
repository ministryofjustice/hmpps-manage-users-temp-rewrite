import { EmailAddress } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'

export default class UserService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  getUserEmail = async (token: string, username: string): Promise<EmailAddress> =>
    this.manageUsersApiClient.getUserEmail(token, username)
}
