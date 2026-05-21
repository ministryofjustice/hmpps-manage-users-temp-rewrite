import { Request, Router } from 'express'
import { EmailDomain } from 'manageUsersApiClient'
import { Services } from '../../services'
import paths from '../paths'
import { EventType, SubjectType } from '../../services/auditService'
import logger from '../../../logger'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../interfaces/authRole'

type EmailDomainRequest = Request & {
  emailDomain: EmailDomain
}

export default (services: Services): Router => {
  const router = Router()

  router.param('id', async (req: EmailDomainRequest, res, next, id: string) => {
    const { emailDomainsService } = services
    try {
      req.emailDomain = await emailDomainsService.getEmailDomain(res.locals.user.token, id)
    } catch (err) {
      logger.info('An error occurred while deleting email domain', err)
      return res.redirect(paths.emailDomains.list.pattern)
    }
    return next()
  })

  router.get(
    '/:id',
    authRoleGuardMiddleware([AuthRole.MAINTAIN_EMAIL_DOMAINS]),
    async (req: EmailDomainRequest, res) => {
      const { emailDomain } = req
      const deleteUrl = paths.emailDomains.deleteWithId({ id: emailDomain.id })
      const listUrl = paths.emailDomains.list.pattern

      return res.render('pages/emailDomains/delete', {
        ...emailDomain,
        deleteUrl,
        listUrl,
      })
    },
  )

  router.post(
    '/:id',
    authRoleGuardMiddleware([AuthRole.MAINTAIN_EMAIL_DOMAINS]),
    async (req: EmailDomainRequest, res) => {
      const { auditService, emailDomainsService } = services
      const { emailDomain } = req
      const { username } = res.locals.user

      await emailDomainsService.deleteEmailDomain(res.locals.user.token, emailDomain.id)
      await auditService.logAuditEvent({
        what: EventType.DELETE_EMAIL_DOMAIN,
        who: username,
        subjectId: emailDomain.id,
        subjectType: SubjectType.EMAIL_DOMAIN_ID,
        details: emailDomain,
      })
      return res.redirect(paths.emailDomains.list.pattern)
    },
  )

  return router
}
