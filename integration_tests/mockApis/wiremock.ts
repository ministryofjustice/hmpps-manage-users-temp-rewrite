import superagent, { SuperAgentRequest, Response } from 'superagent'
import { HttpStatusCode } from '../../server/utils/utils'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = (body: string | object) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const stubJson = ({
  body = {},
  urlPattern,
  urlPath,
  method = 'GET',
  status = HttpStatusCode.OK,
}: {
  body?: unknown
  urlPattern?: string
  urlPath?: string
  method?: string
  status?: HttpStatusCode
}) =>
  stubFor({
    request: {
      method,
      urlPattern,
      urlPath,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: body,
    },
  })

export { stubFor, getMatchingRequests, resetStubs, stubJson }
