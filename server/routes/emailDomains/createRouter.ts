import { Router } from 'express'
import { CreateEmailDomainRequest, EmailDomain } from 'manageUsersApiClient'
import { Services } from '../../services'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../middleware/route/formMiddleware'
import paths from '../paths'
import { FormError } from '../../interfaces/formError'
import { validateDomainDescription, validateDomainName } from '../../presentation/validation/emailDomainValidation'
import { EventType, SubjectType } from '../../services/auditService'
import AuthRole from '../../interfaces/authRole'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'

const validate = (body: CreateEmailDomainRequest): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateDomainName(body.name))
  errors.push(...validateDomainDescription(body.description))

  return errors
}

export default (services: Services): Router => {
  const router = Router()

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_EMAIL_DOMAINS]))

  router.get('/', async (req, res) => {
    const body = bodyFromFlash<CreateEmailDomainRequest>(req)
    const errors = formErrorsFromFlash(req)

    const createUrl = paths.emailDomains.create.pattern
    const listUrl = paths.emailDomains.list.pattern

    return res.render('pages/emailDomains/create', {
      ...body,
      errors,
      createUrl,
      listUrl,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, _req => paths.emailDomains.create.pattern),
    async (req, res) => {
      const { auditService, emailDomainsService } = services
      const body = bodyFromFlash<CreateEmailDomainRequest>(req)
      const { username } = res.locals.user
      const errors: FormError[] = []
      let emailDomain: EmailDomain
      try {
        emailDomain = await emailDomainsService.createEmailDomain(res.locals.user.token, body)
      } catch (err) {
        if (err.responseStatus === 409 && err.data) {
          errors.push({ href: '#name', text: err.data.userMessage })
        } else {
          throw err
        }
      }
      if (errors.length) {
        flashBody(req, body)
        flashErrors(req, errors)
        return res.redirect(paths.emailDomains.create.pattern)
      }
      await auditService.logAuditEvent({
        what: EventType.CREATE_EMAIL_DOMAIN,
        who: username,
        subjectId: emailDomain.id,
        subjectType: SubjectType.EMAIL_DOMAIN_ID,
        details: body,
      })
      return res.redirect(paths.emailDomains.list.pattern)
    },
  )

  return router
}
