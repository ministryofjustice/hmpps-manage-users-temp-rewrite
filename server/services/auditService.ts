import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  VIEW_DPS_USER = 'VIEW_DPS_USER',
  VIEW_EMAIL_DOMAINS = 'VIEW_EMAIL_DOMAINS',
  VIEW_GROUP_DETAILS = 'VIEW_GROUP_DETAILS',
  VIEW_GROUP_LIST = 'VIEW_GROUP_LIST',
  VIEW_ROLE_DETAILS = 'VIEW_ROLE_DETAILS',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export enum SubjectType {
  USER_ID = 'USER_ID',
  EMAIL_DOMAIN_ID = 'EMAIL_DOMAIN_ID',
  GROUP_CODE = 'GROUP_CODE',
  ROLE_CODE = 'ROLE_CODE',
}

export enum EventType {
  CREATE_DPS_USER = 'CREATE_DPS_USER',
  CREATE_LINKED_DPS_USER = 'CREATE_LINKED_DPS_USER',
  UPDATE_USER = 'UPDATE_USER',
  ADD_USER_ROLES = 'ADD_USER_ROLES',
  ADD_USER_CASELOADS = 'ADD_USER_CASELOADS',
  VIEW_USER_ROLES = 'VIEW_USER_ROLES',
  VIEW_USER_CASELOADS = 'VIEW_USER_CASELOADS',
  REMOVE_USER_ROLE = 'REMOVE_USER_ROLE',
  REMOVE_USER_CASELOAD = 'REMOVE_USER_CASELOAD',
  ENABLE_USER = 'ENABLE_USER',
  DISABLE_USER = 'DISABLE_USER',
  CREATE_EMAIL_DOMAIN = 'CREATE_EMAIL_DOMAIN',
  DELETE_EMAIL_DOMAIN = 'DELETE_EMAIL_DOMAIN',
  CREATE_GROUP = 'CREATE_GROUP',
  CHANGE_GROUP_NAME = 'CHANGE_GROUP_NAME',
  DELETE_GROUP = 'DELETE_GROUP',
  CREATE_ROLE = 'CREATE_ROLE',
  DOWNLOAD_REPORT_ATTEMPT = 'DOWNLOAD_REPORT_ATTEMPT',
  DOWNLOAD_REPORT_FAILURE = 'DOWNLOAD_REPORT_FAILURE',
  SEARCH_USER_ATTEMPT = 'SEARCH_USER_ATTEMPT',
  SEARCH_USER_FAILURE = 'SEARCH_USER_FAILURE',
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
