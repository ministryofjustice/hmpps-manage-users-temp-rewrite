import { UserGroup, UserRole } from 'manageUsersApiClient'
import { hasRole, HmppsUser } from '../interfaces/hmppsUser'
import AuthRole from '../interfaces/authRole'
import Category from '../interfaces/filter'
import paths from '../routes/paths'
import { statusDisplay, StatusKey } from './status'
import SearchParamsHelper from './searchParams'

export interface Filter {
  user?: string
  status?: string
  roleCode?: string
  groupCode?: string
}

export const asUrlSearchParams = (filter: Filter): URLSearchParams => {
  const stringify: [string, string][] = Object.entries(filter)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)])
  return new URLSearchParams(stringify)
}

const searchParamsHelper = new SearchParamsHelper(paths.externalUser.search.pattern)

const hrefToRemoveFilter = (searchParams: URLSearchParams, fieldName: string): string => {
  return searchParamsHelper.hrefToRemoveFilter(searchParams, fieldName)
}

const getUserCategory = (searchParams: URLSearchParams, filter: Filter) => ({
  heading: { text: 'User' },
  items: [{ href: hrefToRemoveFilter(searchParams, 'user'), text: filter.user }],
})

const getStatusCategory = (searchParams: URLSearchParams, filter: Filter) => ({
  heading: { text: 'Status' },
  items: [{ href: hrefToRemoveFilter(searchParams, 'status'), text: statusDisplay(filter.status as StatusKey) }],
})

const getGroupCategory = (searchParams: URLSearchParams, filter: Filter, groups: UserGroup[]) => ({
  heading: { text: 'Group' },
  items: [
    {
      href: hrefToRemoveFilter(searchParams, 'groupCode'),
      text: groups.find(g => g.groupCode === filter.groupCode)?.groupName,
    },
  ],
})

const getRoleCategory = (searchParams: URLSearchParams, filter: Filter, roles: UserRole[]) => ({
  heading: { text: 'Role' },
  items: [
    {
      href: hrefToRemoveFilter(searchParams, 'roleCode'),
      text: roles.find(r => r.roleCode === filter.roleCode)?.roleName,
    },
  ],
})

export const filterCategories = (filter: Filter, roles: UserRole[], groups: UserGroup[]): Category[] => {
  const categories: Category[] = []
  const searchParams = asUrlSearchParams(filter)
  if (filter.user) {
    categories.push(getUserCategory(searchParams, filter))
  }
  if (filter.status && filter.status !== 'ALL') {
    categories.push(getStatusCategory(searchParams, filter))
  }
  if (filter.groupCode) {
    categories.push(getGroupCategory(searchParams, filter, groups))
  }
  if (filter.roleCode) {
    categories.push(getRoleCategory(searchParams, filter, roles))
  }
  return categories
}

export const canDownload = (user: HmppsUser): boolean =>
  hasRole(user, AuthRole.MAINTAIN_OAUTH_USERS) && !hasRole(user, AuthRole.AUTH_GROUP_MANAGER)
