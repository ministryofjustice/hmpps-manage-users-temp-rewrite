import { Router } from 'express'
import { CreateUserRequest, PrisonStaffNewUser } from 'manageUsersApiClient'
import paths from '../../paths'
import { FormError } from '../../../interfaces/formError'
import { caseloadText, showCaseloadDropdown, UserTypeKey } from '../../../presentation/userType'
import { validateEmail, validateName, validateUsername } from '../../../presentation/validation/userValidation'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../../middleware/route/formMiddleware'
import { Services } from '../../../services'
import { EventType, SubjectType } from '../../../services/auditService'
import { HttpStatusCode } from '../../../utils/utils'
import authRoleGuardMiddleware from '../../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../../interfaces/authRole'

interface Form {
  userType: string
  username: string
  email: string
  firstName: string
  lastName: string
  defaultCaseloadId: string
}

const validate = (body: Form): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateUsername(body.username))

  errors.push(...validateEmail(body.email))

  errors.push(...validateName(body.firstName, 'firstName', 'First name', 2, 35))
  errors.push(...validateName(body.lastName, 'lastName', 'Last name', 2, 35))

  const userTypeKey = body.userType as UserTypeKey
  if (showCaseloadDropdown(userTypeKey) && (!body.defaultCaseloadId || body.defaultCaseloadId === '--')) {
    errors.push({ href: '#defaultCaseloadId', text: caseloadText(userTypeKey) })
  }

  return errors
}

export default ({ dpsUserService, auditService }: Services): Router => {
  const router = Router()

  router.use(authRoleGuardMiddleware([AuthRole.CREATE_USER]))

  router.get('/', async (req, res) => {
    const body = bodyFromFlash<CreateUserRequest>(req)
    const errors = formErrorsFromFlash(req)
    if (body.userType === undefined) {
      return res.redirect(paths.dpsUser.createUser.pattern)
    }
    const caseloads = await dpsUserService.getCaseloads(res.locals.user.token)
    return res.render('pages/dpsUser/create', {
      ...body,
      caseloads,
      errors,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect<Form>(validate, _req => paths.dpsUser.createDpsUser.pattern),
    async (req, res) => {
      const body = bodyFromFlash<CreateUserRequest>(req)
      const { username } = res.locals.user
      const errors: FormError[] = []
      let newUser: PrisonStaffNewUser
      try {
        newUser = await dpsUserService.createDpsUser(res.locals.user.token, body)
      } catch (err) {
        if (err.responseStatus === HttpStatusCode.BAD_REQUEST && err.data) {
          const { userMessage } = err.data
          const errorDetails = { text: userMessage }
          errors.push(errorDetails)
        } else if (err.responseStatus === HttpStatusCode.CONFLICT && err.data && err.data.errorCode === 601) {
          const usernameError = { href: '#username', text: 'Username already exists' }
          errors.push(usernameError)
        } else if (err.responseStatus === HttpStatusCode.CONFLICT && err.data && err.data.errorCode === 602) {
          const emailDomainError = { href: '#email', text: 'Invalid Email domain' }
          errors.push(emailDomainError)
        } else {
          throw err
        }
      }
      if (errors.length) {
        flashBody(req, body)
        flashErrors(req, errors)
        return res.redirect(paths.dpsUser.createDpsUser.pattern)
      }
      await auditService.logAuditEvent({
        what: EventType.CREATE_DPS_USER,
        who: username,
        subjectId: newUser.username,
        subjectType: SubjectType.USER_ID,
        details: body,
      })
      return res.render('pages/dpsUser/createSuccess', {
        email: `${newUser.primaryEmail}`,
        username: `${newUser.username}`,
      })
    },
  )

  return router
}
