import { Router } from 'express'

import type { Services } from '../services'
import menuRouter from './menuRouter'
import dpsUserRouter from './dpsUser'
import emailDomainsRouter from './emailDomains'
import groupsRouter from './groups'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(menuRouter(services))
  router.use(dpsUserRouter(services))
  router.use(emailDomainsRouter(services))
  router.use(groupsRouter(services))

  return router
}
