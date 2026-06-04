import { Router } from 'express'
import { Services } from '../../services'
import paths from '../paths'
import createRouter from './createRouter'
import detailsRouter from './detailsRouter'

export default function index(services: Services): Router {
  const router = Router()

  router.use(paths.groups.create.pattern, createRouter(services))
  router.use(paths.groups.details.pattern, detailsRouter(services))

  return router
}
