import { dataAccess } from '../data'
import AuditService from './auditService'
import MenuService from './menuService'
import DpsUserService from './dpsUserService'
import RolesService from './rolesService'
import UserService from './userService'
import EmailDomainsService from './emailDomainsService'
import GroupsService from './groupsService'
import ExternalUserService from './externalUserService'
import UserAllowListService from './userAllowListService'
import paginationService from './paginationService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, manageUsersApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    menuService: new MenuService(manageUsersApiClient),
    dpsUserService: new DpsUserService(manageUsersApiClient),
    rolesService: new RolesService(manageUsersApiClient),
    userService: new UserService(manageUsersApiClient),
    emailDomainsService: new EmailDomainsService(manageUsersApiClient),
    groupsService: new GroupsService(manageUsersApiClient),
    externalUserService: new ExternalUserService(manageUsersApiClient),
    userAllowListService: new UserAllowListService(manageUsersApiClient),
    paginationService,
  }
}

export type Services = ReturnType<typeof services>
