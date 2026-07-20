import { Request, Response, Router } from 'express'
import paths from '../paths'
import type { FormError } from '../../interfaces/formError'
import { bodyFromFlash, flashBody, flashErrors, formErrorsFromFlash } from '../../middleware/route/formMiddleware'
import type { Services } from '../../services'
import { EventType, SubjectType } from '../../services/auditService'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../interfaces/authRole'
import { validateEmail } from '../../presentation/validation/userValidation'

interface Form {
  username: string
  email: string
  firstName: string
  lastName: string
  accessPeriod: string
  reason: string
}

const DEFAULT_ACCESS_PERIOD = 'ONE_MONTH'

const validate = (body: Form, usernameExists: boolean): FormError[] => {
  const errors: FormError[] = []
  if (!body.username) {
    errors.push({ href: '#username', text: 'Enter a valid username' })
  } else if (usernameExists) {
    errors.push({ href: '#username', text: 'Username already exists, please update their access instead' })
  }
  errors.push(...validateEmail(body.email))
  if (!body.firstName) {
    errors.push({ href: '#firstName', text: 'Enter a valid first name' })
  }
  if (!body.lastName) {
    errors.push({ href: '#lastName', text: 'Enter a valid last name' })
  }
  if (!body.reason) {
    errors.push({ href: '#reason', text: 'Enter a valid business reason' })
  }
  return errors
}

export default ({ userAllowListService, auditService }: Services): Router => {
  const router = Router()

  router.use(authRoleGuardMiddleware([AuthRole.MANAGE_USER_ALLOW_LIST]))

  router.get('/', (req: Request, res: Response) => {
    const body = bodyFromFlash<Form>(req)
    const errors = formErrorsFromFlash(req)
    return res.render('pages/userAllowList/addUser', {
      ...body,
      accessPeriod: body.accessPeriod ?? DEFAULT_ACCESS_PERIOD,
      errors,
    })
  })

  router.post('/', async (req: Request, res: Response) => {
    const { _csrf, ...form } = req.body

    const usernameExists = form.username
      ? await userAllowListService.usernameExists(res.locals.user.token, form.username)
      : false
    const errors = validate(form, usernameExists)

    if (errors.length > 0) {
      flashBody(req, form)
      flashErrors(req, errors)
      return res.redirect(paths.userAllowList.addUser.pattern)
    }

    await userAllowListService.addAllowListUser(res.locals.user.token, { ...form })

    await auditService.logAuditEvent({
      what: EventType.ADD_ALLOW_LIST_USER,
      who: res.locals.user.username,
      subjectId: form.username,
      subjectType: SubjectType.USER_ID,
      details: form,
    })

    // TODO redirect back to the search URL when implemented
    return res.redirect('/')
  })

  return router
}
