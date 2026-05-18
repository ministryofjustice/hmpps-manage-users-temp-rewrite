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
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../interfaces/authRole'

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_ACCESS_ROLES, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN]))

  router.use(paths.dpsUser.manage.relative.selectRoles.pattern, selectRolesRouter(services))
  router.use(paths.dpsUser.manage.relative.roleRoot.pattern, roleRouter(services))
  router.use(paths.dpsUser.manage.relative.selectCaseloads.pattern, selectCaseloadsRouter(services))
  router.use(paths.dpsUser.manage.relative.removeCaseload.pattern, removeCaseloadRouter(services))
  router.use(paths.dpsUser.manage.relative.details.pattern, detailsRouter(services))
  router.use(paths.dpsUser.manage.relative.changeEmail.pattern, changeEmailRouter(services))
  router.get(paths.dpsUser.manage.relative.changeEmailSuccess.pattern, changeEmailSuccessHandler(services))
  router.post(
    paths.dpsUser.manage.relative.activate.pattern,
    authRoleGuardMiddleware([AuthRole.MANAGE_NOMIS_USER_ACCOUNT]),
    activateHandler(services),
  )
  router.post(
    paths.dpsUser.manage.relative.deactivate.pattern,
    authRoleGuardMiddleware([AuthRole.MANAGE_NOMIS_USER_ACCOUNT]),
    deactivateHandler(services),
  )

  return router
}
