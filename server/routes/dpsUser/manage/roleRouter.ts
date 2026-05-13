import { Request, Router } from 'express'
import { Services } from '../../../services'
import paths from '../../paths'
import { RoleParam } from './paramTypes'
import { appInsightsEvent, Event } from '../../../utils/azureAppInsights'
import { getRemovalMessage } from '../../../presentation/restrictedRoles'
import setupRestrictedRoles from '../../../middleware/route/restrictedRolesMiddleware'
import { EventType, SubjectType } from '../../../services/auditService'

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.post(paths.dpsUser.manage.roles.relative.remove.pattern, async (req: Request<RoleParam>, res) => {
    const { userId, role } = req.params
    const { username, token } = res.locals.user
    const { dpsUserService, auditService } = services

    try {
      await dpsUserService.removeRole(token, userId, role)
      await auditService.logAuditEvent({
        what: EventType.REMOVE_USER_ROLE,
        who: username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: { role },
      })
      return res.redirect(paths.dpsUser.manage.details({ userId }))
    } catch (err) {
      if (err.responseStatus === 400) {
        // role already removed from user
        return res.redirect(req.originalUrl)
      }
      throw err
    }
  })

  router.get(
    paths.dpsUser.manage.roles.relative.requestRemoval.pattern,
    setupRestrictedRoles<RoleParam>(services),
    async (req: Request<RoleParam>, res) => {
      const { userId, role } = req.params
      const { username } = res.locals.user
      const staffDetailsUrl = paths.dpsUser.manage.details({ userId })

      appInsightsEvent(Event.REQUEST_REMOVE_USER_ROLE_ATTEMPT, username, { userId, roleCode: role })
      const removalMessage = getRemovalMessage(role, res.locals.restrictedRoles)

      res.render('pages/dpsUser/requestUserRoleRemoval', {
        staffDetailsUrl,
        removalMessage,
      })
    },
  )

  return router
}
