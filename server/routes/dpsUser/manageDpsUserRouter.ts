import { Router } from 'express'
import { Services } from '../../services'
import paths from '../paths'
import selectRolesRouter from './manage/selectRolesRouter'
import selectCaseloadsRouter from './manage/selectCaseloadsRouter'
import roleRouter from './manage/roleRouter'
import removeCaseloadRouter from './manage/removeCaseloadRouter'
import detailsRouter from './manage/detailsRouter'
import { changeEmailRouter, changeEmailSuccessHandler } from './manage/changeEmailRouter'
import { activateHandler, deactivateHandler } from './manage/activationHandlers'

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.use(paths.dpsUser.manage.relative.selectRoles.pattern, selectRolesRouter(services))
  router.use(paths.dpsUser.manage.relative.roleRoot.pattern, roleRouter(services))
  router.use(paths.dpsUser.manage.relative.selectCaseloads.pattern, selectCaseloadsRouter(services))
  router.use(paths.dpsUser.manage.relative.removeCaseload.pattern, removeCaseloadRouter(services))
  router.use(paths.dpsUser.manage.relative.details.pattern, detailsRouter(services))
  router.use(paths.dpsUser.manage.relative.changeEmail.pattern, changeEmailRouter(services))
  router.get(paths.dpsUser.manage.relative.changeEmailSuccess.pattern, changeEmailSuccessHandler(services))
  router.post(paths.dpsUser.manage.relative.activate.pattern, activateHandler(services))
  router.post(paths.dpsUser.manage.relative.deactivate.pattern, deactivateHandler(services))

  return router
}
