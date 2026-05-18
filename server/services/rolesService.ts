import { Role } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { hasRole, HmppsUser } from '../interfaces/hmppsUser'
import AuthRole from '../interfaces/authRole'

export default class RolesService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  getAssignableRoles = async (user: HmppsUser): Promise<Role[]> => {
    return this.getRolesForMaintainAccessRolesUser(user).then(allAssignableRoles =>
      hasRole(user, AuthRole.OAUTH_ADMIN)
        ? allAssignableRoles
        : allAssignableRoles.filter((role: Role) => role.roleCode !== 'OAUTH_ADMIN'),
    )
  }

  getRolesForMaintainAccessRolesUser = async (user: HmppsUser): Promise<Role[]> =>
    this.getRoles(user.token, hasRole(user, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN) ? 'DPS_ADM' : 'DPS_LSA')

  getRoles = async (token: string, adminType: 'DPS_LSA' | 'DPS_ADM' | 'EXT_ADM' | 'IMS_HIDDEN'): Promise<Role[]> =>
    this.manageUsersApiClient.getRoles(token, adminType)

  getBannerMessage = async (token: string): Promise<string> =>
    this.manageUsersApiClient.getNotificationBannerMessage(token, 'ROLES').then(res => res.message)
}
