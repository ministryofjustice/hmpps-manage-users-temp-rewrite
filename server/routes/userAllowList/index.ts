import { Router } from 'express'
import { Services } from '../../services'
import paths from '../paths'
import addUserRouter from './addUserRouter'

export default function index(services: Services): Router {
  const router = Router()

  router.use(paths.userAllowList.addUser.pattern, addUserRouter(services))

  return router
}
