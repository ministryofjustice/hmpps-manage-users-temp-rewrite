import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import MenuService from './menuService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, manageUsersApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    menuService: new MenuService(manageUsersApiClient),
  }
}

export type Services = ReturnType<typeof services>
