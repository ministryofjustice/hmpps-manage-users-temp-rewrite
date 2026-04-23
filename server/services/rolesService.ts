import { Role } from 'manageUsersApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import { hasRole, HmppsUser } from '../interfaces/hmppsUser'
import AuthRole from '../interfaces/authRole'

export default class RolesService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  getRoles = async (user: HmppsUser): Promise<Role[]> =>
    this.manageUsersApiClient.getRoles(
      user.token,
      hasRole(user, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN) ? 'DPS_ADM' : 'DPS_LSA',
    )
}
