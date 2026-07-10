import { Request, Response } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { Services } from '../../../services'
import paths from '../../paths'
import { RoleParam } from './paramTypes'
import { Event } from '../../../utils/azureAppInsights'
import { getRemovalMessage } from '../../../presentation/restrictedRoles'
import { EventType, SubjectType } from '../../../services/auditService'
import { HttpStatusCode } from '../../../utils/utils'

export const removeRoleHandler = (services: Services) => async (req: Request<RoleParam>, res: Response) => {
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
    if (err.responseStatus === HttpStatusCode.BAD_REQUEST) {
      // role already removed from user
      return res.redirect(paths.dpsUser.manage.details({ userId }))
    }
    throw err
  }
}

export const requestRoleRemovalHandler = async (req: Request<RoleParam>, res: Response) => {
  const { userId, role } = req.params
  const { username } = res.locals.user
  const staffDetailsUrl = paths.dpsUser.manage.details({ userId })

  telemetry.trackEvent(Event.REQUEST_REMOVE_USER_ROLE_ATTEMPT, { username, userId, roleCode: role })
  const removalMessage = getRemovalMessage(role, res.locals.restrictedRoles)

  res.render('pages/dpsUser/requestUserRoleRemoval', {
    staffDetailsUrl,
    removalMessage,
  })
}
