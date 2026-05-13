import { Request, RequestHandler, Response } from 'express'
import { Services } from '../../../services'
import { UserParam } from './paramTypes'
import paths from '../../paths'
import { EventType, SubjectType } from '../../../services/auditService'

export const activateHandler =
  ({ dpsUserService, auditService }: Services): RequestHandler<UserParam> =>
  async (req: Request<UserParam>, res: Response) => {
    const { userId } = req.params
    const { username, token } = res.locals.user
    await dpsUserService.enableUser(token, userId)
    await auditService.logAuditEvent({
      what: EventType.ENABLE_USER,
      who: username,
      subjectId: userId,
      subjectType: SubjectType.USER_ID,
    })
    return res.redirect(paths.dpsUser.manage.details({ userId }))
  }

export const deactivateHandler =
  ({ dpsUserService, auditService }: Services): RequestHandler<UserParam> =>
  async (req: Request<UserParam>, res: Response) => {
    const { userId } = req.params
    const { username, token } = res.locals.user
    await dpsUserService.disableUser(token, userId)
    await auditService.logAuditEvent({
      what: EventType.DISABLE_USER,
      who: username,
      subjectId: userId,
      subjectType: SubjectType.USER_ID,
    })
    return res.redirect(paths.dpsUser.manage.details({ userId }))
  }
