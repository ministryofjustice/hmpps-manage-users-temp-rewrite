import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import MenuService from './menuService'
import DpsUserService from './dpsUserService'
import paginationService from './paginationService'
import RolesService from './rolesService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, manageUsersApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    menuService: new MenuService(manageUsersApiClient),
    dpsUserService: new DpsUserService(manageUsersApiClient),
    rolesService: new RolesService(manageUsersApiClient),
    paginationService,
  }
}

export type Services = ReturnType<typeof services>
