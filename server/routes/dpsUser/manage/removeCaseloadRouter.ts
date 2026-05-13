import { Router, Request } from 'express'
import { Services } from '../../../services'
import { CaseloadParam } from './paramTypes'
import { EventType, SubjectType } from '../../../services/auditService'
import paths from '../../paths'

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
        case 400: // role already removed from user
          return res.redirect(req.originalUrl)
        case 404:
          return res.redirect(staffUrl)
        default:
          throw err
      }
    }
  })

  return router
}
