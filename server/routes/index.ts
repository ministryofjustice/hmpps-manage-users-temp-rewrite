import { Router } from 'express'

import type { Services } from '../services'
import menuRouter from './menuRouter'

export default function routes({ menuService }: Services): Router {
  const router = Router()

  router.use(menuRouter(menuService))

  return router
}
