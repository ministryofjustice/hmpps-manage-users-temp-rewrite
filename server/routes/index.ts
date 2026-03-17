import { Router } from 'express'

import type { Services } from '../services'
import menuRouter from './menuRouter'
import dpsUserRouter from './dpsUser'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(menuRouter(services))
  router.use(dpsUserRouter(services))

  return router
}
