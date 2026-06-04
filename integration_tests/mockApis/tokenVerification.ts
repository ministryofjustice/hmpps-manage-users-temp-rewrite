import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { HttpStatusCode } from '../../server/utils/utils'

export default {
  stubPing: (httpStatus = HttpStatusCode.OK): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/verification/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === HttpStatusCode.OK ? 'UP' : 'DOWN' },
      },
    }),

  stubVerifyToken: (active = true): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/verification/token/verify',
      },
      response: {
        status: HttpStatusCode.OK,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { active },
      },
    }),
}
