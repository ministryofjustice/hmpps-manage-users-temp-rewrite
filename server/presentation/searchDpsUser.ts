import { PrisonCaseload, Role } from 'manageUsersApiClient'
import { hasRole, HmppsUser } from '../interfaces/hmppsUser'
import AuthRole from '../interfaces/authRole'
import Category, { CategoryItem } from '../interfaces/filter'
import paths from '../routes/paths'
import { statusDisplay, StatusKey } from './status'

export interface Filter {
  user?: string
  status?: string
  roleCode?: string[]
  groupCode?: string
  restrictToActiveGroup?: boolean
  inclusiveRoles?: boolean
  showOnlyLSAs?: boolean
}

export const asUrlSearchParams = (filter: Filter): URLSearchParams => {
  const { roleCode, ...withoutRoles } = filter
  const stringify: [string, string][] = Object.entries(withoutRoles)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)])
  const searchParams = new URLSearchParams(stringify)
  if (roleCode !== undefined) {
    roleCode.forEach(role => searchParams.append('roleCode', role))
  }
  return searchParams
}

const getUserCategory = (searchParams: URLSearchParams, filter: Filter) => {
  return {
    heading: {
      text: 'User',
    },
    items: [
      {
        href: hrefToRemoveFilter(searchParams, 'user'),
        text: filter.user,
      },
    ],
  }
}

const getStatusCategory = (searchParams: URLSearchParams, filter: Filter) => {
  return {
    heading: {
      text: 'Status',
    },
    items: [
      {
        href: hrefToRemoveFilter(searchParams, 'status'),
        text: statusDisplay(filter.status as StatusKey),
      },
    ],
  }
}

const getPrisonCategory = (searchParams: URLSearchParams, filter: Filter, prisons: PrisonCaseload[]) => {
  const items: CategoryItem[] = []
  if (filter.groupCode) {
    items.push({
      // need to also remove the restrictToActiveGroup if set, if we're removing the groupCode
      href: hrefToRemoveFilter(removeField(searchParams, 'groupCode'), 'restrictToActiveGroup'),
      text: prisons.find(prison => prison.id === filter.groupCode)?.name,
    })
    if (filter.restrictToActiveGroup) {
      const searchParamsCopy = new URLSearchParams(searchParams)
      searchParamsCopy.set('restrictToActiveGroup', 'false')
      items.push({
        href: `${paths.dpsUser.searchDpsUser({})}?${searchParamsCopy.toString()}`,
        text: 'Active caseload only',
      })
    }
  }
  return {
    heading: {
      text: 'Prison',
    },
    items,
  }
}

const getRolesCategory = (searchParams: URLSearchParams, filter: Filter, roles: Role[]) => {
  return {
    heading: {
      text: 'Roles',
    },
    items: filter.roleCode.map(roleCode => ({
      href: hrefToRemoveFilter(searchParams, 'roleCode', roleCode),
      text: roles.find(role => role.roleCode === roleCode)?.roleName,
    })),
  }
}

const getRoleInclusivityCategory = (searchParams: URLSearchParams) => {
  return {
    heading: {
      text: 'Role match',
    },
    items: [
      {
        href: hrefToRemoveFilter(searchParams, 'inclusiveRoles'),
        text: 'Any',
      },
    ],
  }
}

const getOnlyLsaCategory = (searchParams: URLSearchParams) => {
  return {
    heading: {
      text: 'Local System Administrator',
    },
    items: [
      {
        href: hrefToRemoveFilter(searchParams, 'showOnlyLSAs'),
        text: 'Only',
      },
    ],
  }
}

export const filterCategories = (
  filter: Filter,
  roles: Role[],
  prisons: PrisonCaseload[],
  showPrisonDropdown: boolean,
): Category[] => {
  const categories: Category[] = []
  const searchParams = asUrlSearchParams(filter)
  if (filter.user) {
    categories.push(getUserCategory(searchParams, filter))
  }
  if (filter.status && filter.status !== 'ALL') {
    categories.push(getStatusCategory(searchParams, filter))
  }
  if (showPrisonDropdown && filter.groupCode) {
    categories.push(getPrisonCategory(searchParams, filter, prisons))
  }
  if (filter.roleCode && filter.roleCode.length > 0) {
    categories.push(getRolesCategory(searchParams, filter, roles))
  }
  if (String(filter.inclusiveRoles) === 'true') {
    categories.push(getRoleInclusivityCategory(searchParams))
  }
  if (filter.showOnlyLSAs) {
    categories.push(getOnlyLsaCategory(searchParams))
  }
  return categories
}

const removeField = (searchParams: URLSearchParams, fieldName: string, fieldValue?: string): URLSearchParams => {
  const searchParamsCopy = new URLSearchParams(searchParams)
  searchParamsCopy.delete(fieldName, fieldValue)
  return searchParamsCopy
}

const hrefToRemoveFilter = (searchParams: URLSearchParams, fieldName: string, fieldValue?: string): string => {
  const searchParamsCopy = removeField(searchParams, fieldName, fieldValue)
  return `${paths.dpsUser.searchDpsUser({})}?${searchParamsCopy.toString()}`
}

export type DownloadAuthorisationCheck = (user: HmppsUser) => boolean
export const canDownload: DownloadAuthorisationCheck = (user: HmppsUser) => {
  return (
    hasRole(user, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN) ||
    (hasRole(user, AuthRole.MAINTAIN_OAUTH_USERS) && !hasRole(user, AuthRole.AUTH_GROUP_MANAGER))
  )
}
