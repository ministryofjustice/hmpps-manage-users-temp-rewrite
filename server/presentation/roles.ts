import { Role } from 'manageUsersApiClient'
import { SelectItem } from '../interfaces/selectItem'

const roleDropdownValues = (roles: Role[]): SelectItem[] =>
  roles.map(role => ({
    text: role.roleName,
    value: role.roleCode,
  }))
export default roleDropdownValues
