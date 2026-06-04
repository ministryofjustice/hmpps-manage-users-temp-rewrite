import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import MenuService from './menuService'
import DpsUserService from './dpsUserService'
import RolesService from './rolesService'
import UserService from './userService'
import EmailDomainsService from './emailDomainsService'
import GroupsService from './groupsService'
import paginationService from './paginationService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, manageUsersApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    menuService: new MenuService(manageUsersApiClient),
    dpsUserService: new DpsUserService(manageUsersApiClient),
    rolesService: new RolesService(manageUsersApiClient),
    userService: new UserService(manageUsersApiClient),
    emailDomainsService: new EmailDomainsService(manageUsersApiClient),
    groupsService: new GroupsService(manageUsersApiClient),
    paginationService,
  }
}

export type Services = ReturnType<typeof services>
