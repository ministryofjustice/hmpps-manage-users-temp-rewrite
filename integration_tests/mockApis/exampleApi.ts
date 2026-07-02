import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import { HttpStatusCode } from '../../server/utils/utils'

export default {
  stubPing: (httpStatus = HttpStatusCode.OK): SuperAgentRequest => stubPing('/example-api', httpStatus),

  stubExampleTime: (httpStatus = HttpStatusCode.OK): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/example-api/example/time',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/text;charset=UTF-8' },
        body: '2025-01-01T12:00:00Z',
      },
    }),
}
