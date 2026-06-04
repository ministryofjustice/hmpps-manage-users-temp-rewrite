import { Router, Request } from 'express'
import { Services } from '../../../services'
import { CaseloadParam } from './paramTypes'
import { EventType, SubjectType } from '../../../services/auditService'
import paths from '../../paths'
import { HttpStatusCode } from '../../../utils/utils'

export default ({ dpsUserService, auditService }: Services): Router => {
  const router = Router({ mergeParams: true })

  router.post('/', async (req: Request<CaseloadParam>, res) => {
    const { userId, caseload } = req.params
    const { username, token } = res.locals.user
    const staffUrl = paths.dpsUser.manage.details({ userId })

    try {
      await dpsUserService.removeCaseload(token, userId, caseload)
      await auditService.logAuditEvent({
        what: EventType.REMOVE_USER_CASELOAD,
        who: username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: { caseload },
      })
      return res.redirect(staffUrl)
    } catch (err) {
      switch (err.responseStatus) {
        case HttpStatusCode.BAD_REQUEST: // role already removed from user
          return res.redirect(staffUrl)
        case HttpStatusCode.NOT_FOUND:
          return res.redirect(staffUrl)
        default:
          throw err
      }
    }
  })

  return router
}
