import { CreateUserRequest, PrisonCaseload, PrisonStaffNewUser, PrisonUserDetails } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { CreateLinkedDpsUserRequest } from '../interfaces/createLinkedDpsUserRequest'

export default class DpsUserService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  createDpsUser = async (token: string, request: CreateUserRequest): Promise<PrisonStaffNewUser> =>
    this.manageUsersApiClient.createUser(token, request)

  getCaseloads = async (token: string): Promise<PrisonCaseload[]> => this.manageUsersApiClient.getCaseloads(token)

  getDpsUser = async (token: string, username: string): Promise<PrisonUserDetails> =>
    this.manageUsersApiClient.getDpsUser(token, username)

  createLinkedDpsUser = async (token: string, request: CreateLinkedDpsUserRequest): Promise<string> => {
    switch (request.userType) {
      case 'DPS_ADM': {
        return this.manageUsersApiClient
          .createLinkedCentralAdminUser(token, {
            existingUsername: request.existingUsername,
            adminUsername: request.username,
          })
          .then(user => user.adminAccount.username)
      }
      case 'DPS_LSA': {
        return this.manageUsersApiClient
          .createLinkedLsaUser(token, {
            existingUsername: request.existingUsername,
            adminUsername: request.username,
            localAdminGroup: request.defaultCaseloadId,
          })
          .then(user => user.adminAccount.username)
      }
      default: {
        return this.manageUsersApiClient
          .createLinkedGeneralUser(token, {
            existingAdminUsername: request.existingUsername,
            generalUsername: request.username,
            defaultCaseloadId: request.defaultCaseloadId,
          })
          .then(user => user.generalAccount.username)
      }
    }
  }
}
