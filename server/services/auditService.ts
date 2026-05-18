import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  VIEW_DPS_USER = 'VIEW_DPS_USER',
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
