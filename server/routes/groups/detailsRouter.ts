import { Request, Router } from 'express'
import { Services } from '../../services'
import { formErrorsFromFlash } from '../../middleware/route/formMiddleware'
import paths from '../paths'
import AuthRole from '../../interfaces/authRole'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import { GroupParam } from './paramTypes'
import { hasRole } from '../../interfaces/hmppsUser'
import { Page, SubjectType } from '../../services/auditService'
import logger from '../../../logger'

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_OAUTH_USERS, AuthRole.AUTH_GROUP_MANAGER]))

  router.get('/', async (req: Request<GroupParam>, res) => {
    const { auditService, groupsService } = services
    const { group } = req.params
    const { user } = res.locals
    const hasMaintainAuthUsers = hasRole(user, AuthRole.MAINTAIN_OAUTH_USERS)
    const errors = formErrorsFromFlash(req)
    const maintainUrl = paths.groups.list.pattern

    try {
      const groupDetails = await groupsService.groupDetails(user.token, group)

      await auditService.logPageView(Page.VIEW_GROUP_DETAILS, {
        who: user.username,
        subjectId: group,
        subjectType: SubjectType.GROUP_CODE,
      })

      return res.render('pages/groups/details', {
        groupDetails,
        hasMaintainAuthUsers,
        maintainUrl,
        errors,
      })
    } catch (err) {
      logger.info(`An error occurred while fetching group with group code ${group}`, err)
      return res.redirect(paths.groups.list.pattern)
    }
  })

  return router
}
