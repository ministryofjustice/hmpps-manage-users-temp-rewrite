import { Router } from 'express'
import createUserRouter from './createUserRouter'
import createUserOptionRouter from './createUserOptionRouter'
import createDpsUserRouter from './createDpsUserRouter'
import createLinkedDpsUserRouter from './createLinkedDpsUserRouter'
import { downloadHandler, downloadLsaHandler, searchDpsUserRouter } from './searchDpsUserRouter'
import paths from '../paths'
import { Services } from '../../services'

export default function index(services: Services): Router {
  const router = Router()

  router.use(paths.dpsUser.createUser({}), createUserRouter())
  router.use(paths.dpsUser.createUserOptions({}), createUserOptionRouter())
  router.use(paths.dpsUser.createDpsUser({}), createDpsUserRouter(services))
  router.use(paths.dpsUser.createLinkedDpsUser({}), createLinkedDpsUserRouter(services))
  router.use(paths.dpsUser.searchDpsUser({}), searchDpsUserRouter(services))
  router.use(paths.dpsUser.searchDpsUserDownload({}), downloadHandler(services))
  router.use(paths.dpsUser.searchDpsUserLsaDownload({}), downloadLsaHandler(services))

  return router
}
