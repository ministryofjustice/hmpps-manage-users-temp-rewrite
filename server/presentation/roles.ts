import { Role } from 'manageUsersApiClient'
import { SelectItem, SelectItemWithHint } from '../interfaces/selectItem'

export const roleDropdownValues = (roles: Role[]): SelectItem[] =>
  roles.map(role => ({
    text: role.roleName,
    value: role.roleCode,
  }))

export const roleDropdownValuesWithHint = (roles: Role[]): SelectItemWithHint[] =>
  roles.map((r: Role) => ({
    text: r.roleName,
    value: r.roleCode,
    ...(r.roleDescription && {
      hint: {
        text: r.roleDescription,
      },
    }),
  }))
