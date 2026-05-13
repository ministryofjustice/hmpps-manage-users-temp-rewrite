import { Router } from 'express'
import createUserRouter from './create/createUserRouter'
import createUserOptionRouter from './create/createUserOptionRouter'
import createDpsUserRouter from './create/createDpsUserRouter'
import createLinkedDpsUserRouter from './create/createLinkedDpsUserRouter'
import { downloadHandler, downloadLsaHandler, searchDpsUserRouter } from './searchDpsUserRouter'
import paths from '../paths'
import { Services } from '../../services'
import manageDpsUserRouter from './manageDpsUserRouter'

export default function index(services: Services): Router {
  const router = Router()

  router.use(paths.dpsUser.createUser.pattern, createUserRouter())
  router.use(paths.dpsUser.createUserOptions.pattern, createUserOptionRouter())
  router.use(paths.dpsUser.createDpsUser.pattern, createDpsUserRouter(services))
  router.use(paths.dpsUser.createLinkedDpsUser.pattern, createLinkedDpsUserRouter(services))
  router.use(paths.dpsUser.search.pattern, searchDpsUserRouter(services))
  router.use(paths.dpsUser.download.pattern, downloadHandler(services))
  router.use(paths.dpsUser.downloadLsa.pattern, downloadLsaHandler(services))
  router.use(paths.dpsUser.manage.root.pattern, manageDpsUserRouter(services))

  return router
}
