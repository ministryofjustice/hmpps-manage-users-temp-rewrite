import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { UserTypeKey } from '../../server/presentation/userType'

const manageUsersApiCreateLinkedUrlMap = new Map<UserTypeKey, string>([
  ['DPS_ADM', 'linkedprisonusers/admin'],
  ['DPS_GEN', 'linkedprisonusers/general'],
  ['DPS_LSA', 'linkedprisonusers/lsa'],
])

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubNotificationBannerMessage: (notificationType: string, message: string): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/notification/banner/${notificationType}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { message },
      },
    }),

  stubGetCaseloads: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/manage-users-api/prisonusers/reference-data/caseloads',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            id: 'MDI',
            name: 'Moorland (HMP & YOI)',
          },
          {
            id: 'LEI',
            name: 'Leeds (HMP)',
          },
        ],
      },
    }),

  stubCreateDpsUser: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    caseloadId: string,
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          username,
          staffId: 100,
          firstName,
          lastName,
          activeCaseloadId: caseloadId,
          accountStatus: 'EXPIRED',
          accountType: 'ADMIN',
          primaryEmail: email,
          dpsRoleCodes: [],
          accountNonLocked: true,
          credentialsNonExpired: false,
          enabled: true,
          admin: true,
          active: false,
        },
      },
    }),

  stubCreateDpsUser400Response: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateDpsUserAlreadyExists: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorCode: 601,
        },
      },
    }),

  stubCreateDpsUserInvalidEmailDomain: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/manage-users-api/prisonusers',
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          errorCode: 602,
        },
      },
    }),

  stubGetDpsUser: (
    username: string = 'ITAG_USER5',
    firstName: string = 'Itag',
    lastName: string = 'User',
    email: string = 'ITAG_USER@gov.uk',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          staffId: '12345',
          username,
          firstName,
          lastName,
          primaryEmail: email,
          email,
          lastLogonDate: '2023-12-25T12:57:50',
          active: true,
          enabled: true,
          accountStatus: 'OPEN',
          administratorOfUserGroups: null,
        },
      },
    }),

  stubGetDpsUserNotFound: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),

  stubGetDpsUser400Response: (username: string = 'ITAG_USER5'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/manage-users-api/prisonusers/${username}/details`,
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateLinkedDpsUser: (
    userType: UserTypeKey,
    username: string = 'TUSER_GEN',
    firstName: string = 'Test',
    lastName: string = 'User',
    email: string = 'test.user@djustice.gov.uk',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          staffId: 100,
          firstName,
          lastName,
          status: 'ACTIVE',
          primaryEmail: email,
          [`${userType === 'DPS_GEN' ? 'generalAccount' : 'adminAccount'}`]: { username },
        },
      },
    }),

  stubCreateLinkedDpsUser400Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 400,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage: 'Bad request',
        },
      },
    }),

  stubCreateLinkedDpsUser409Response: (
    userType: UserTypeKey,
    userMessage: string = 'User already exists',
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 409,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          userMessage,
        },
      },
    }),

  stubCreateLinkedDpsUser404Response: (userType: UserTypeKey): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/manage-users-api/${manageUsersApiCreateLinkedUrlMap.get(userType)}`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),
}
