import { Request, Response } from 'express'
import { Services } from '../../services'
import { RoleParam, UserUrlProvider } from './paramTypes'
import { EventType, SubjectType } from '../../services/auditService'
import { HttpStatusCode } from '../../utils/utils'

type RoleRemover = (services: Services, token: string, userId: string, role: string) => Promise<void>

export default (services: Services, roleRemover: RoleRemover, userDetailsUrlProvider: UserUrlProvider) =>
  async (req: Request<RoleParam>, res: Response) => {
    const { userId, role } = req.params
    const { username, token } = res.locals.user
    const { auditService } = services

    try {
      await roleRemover(services, token, userId, role)
      await auditService.logAuditEvent({
        what: EventType.REMOVE_USER_ROLE,
        who: username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: { role },
      })
    } catch (err) {
      if (err.responseStatus !== HttpStatusCode.BAD_REQUEST) {
        throw err
      }
      // role already removed, continue to redirect
    }
    return res.redirect(userDetailsUrlProvider(userId))
  }
