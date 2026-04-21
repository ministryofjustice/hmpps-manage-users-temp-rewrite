import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
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
