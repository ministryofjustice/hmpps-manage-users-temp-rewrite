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

export const enum AdminType {
  EXT_ADM = 'External Administrators',
  DPS_ADM = 'DPS Central Admin',
  DPS_LSA = 'DPS Local System Administrators (LSA)',
}

export type AdminTypeKey = keyof typeof AdminType

const adminTypeMap = new Map<AdminTypeKey, AdminType>([
  ['EXT_ADM', AdminType.EXT_ADM],
  ['DPS_ADM', AdminType.DPS_ADM],
  ['DPS_LSA', AdminType.DPS_LSA],
])

export const adminTypeItems = (): SelectItem[] => Array.from(adminTypeMap, ([k, v]) => ({ value: k, text: v }))
