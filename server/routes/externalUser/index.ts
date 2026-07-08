import { Router } from 'express'
import { Services } from '../../services'
import paths from '../paths'
import createRouter from './createRouter'

export default function index(services: Services): Router {
  const router = Router()

  router.use(paths.externalUser.create.pattern, createRouter(services))

  return router
}
