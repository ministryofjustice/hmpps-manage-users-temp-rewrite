import { Request, Router } from 'express'
import { EmailDomain } from 'manageUsersApiClient'
import { Services } from '../../services'
import paths from '../paths'
import { EventType, SubjectType } from '../../services/auditService'
import logger from '../../../logger'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../interfaces/authRole'
import { bodyFromFlash, formErrorsFromFlash, validateFormOrRedirect } from '../../middleware/route/formMiddleware'
import { FormError } from '../../interfaces/formError'

interface Form {
  confirmedDomain: string
}

type EmailDomainRequest = Request & {
  emailDomain: EmailDomain
}

const validate = (body: Form, req: EmailDomainRequest): FormError[] => {
  const errors: FormError[] = []
  const expectedDomain = req.emailDomain.domain

  if (body.confirmedDomain !== expectedDomain) {
    errors.push({ href: '#confirmedDomain', text: `Enter "${expectedDomain}" to confirm deletion of domain` })
  }

  return errors
}

export default (services: Services): Router => {
  const router = Router()

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_EMAIL_DOMAINS]))

  router.param('id', async (req: EmailDomainRequest, res, next, id: string) => {
    const { emailDomainsService } = services
    try {
      req.emailDomain = await emailDomainsService.getEmailDomain(res.locals.user.token, id)
    } catch (err) {
      logger.info(`An error occurred while fetching email domain with id ${id}`, err)
      return res.redirect(paths.emailDomains.list.pattern)
    }
    return next()
  })

  router.get('/:id', async (req: EmailDomainRequest, res) => {
    const body = bodyFromFlash<Form>(req)
    const errors = formErrorsFromFlash(req)
    const { emailDomain } = req
    const deleteUrl = paths.emailDomains.deleteWithId({ id: emailDomain.id })
    const listUrl = paths.emailDomains.list.pattern

    return res.render('pages/emailDomains/delete', {
      ...body,
      ...emailDomain,
      deleteUrl,
      listUrl,
      errors,
    })
  })

  router.post(
    '/:id',
    validateFormOrRedirect(validate, (req: EmailDomainRequest) =>
      paths.emailDomains.deleteWithId({ id: req.emailDomain.id }),
    ),
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
