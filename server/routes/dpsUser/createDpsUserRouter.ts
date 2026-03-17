import { Router } from 'express'
import { CreateUserRequest, PrisonStaffNewUser } from 'manageUsersApiClient'
import paths from '../paths'
import { FormError } from '../../interfaces/formError'
import { caseloadText, showCaseloadDropdown, UserTypeKey } from '../../presentation/userType'
import { validateEmail, validateUsername } from '../../presentation/validation/userValidation'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../middleware/formMiddleware'
import { Services } from '../../services'
import { SubjectType } from '../../services/auditService'
import { isAlphaStringOrSpecialChars } from '../../utils/utils'

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

  if (!body.firstName) {
    errors.push({ href: '#firstName', text: 'Enter a first name' })
  } else if (body.firstName.length < 2) {
    errors.push({ href: '#firstName', text: 'First name must be 2 characters or more' })
  } else if (body.firstName.length > 35) {
    errors.push({ href: '#firstName', text: 'First name must be 35 characters or less' })
  } else if (!isAlphaStringOrSpecialChars(body.firstName)) {
    errors.push({
      href: '#firstName',
      text: 'First name must consist of letters, an apostrophe & a hyphen only',
    })
  }

  if (!body.lastName) {
    errors.push({ href: '#lastName', text: 'Enter a last name' })
  } else if (body.lastName.length < 2) {
    errors.push({ href: '#lastName', text: 'Last name must be 2 characters or more' })
  } else if (body.lastName.length > 35) {
    errors.push({ href: '#lastName', text: 'Last name must be 35 characters or less' })
  } else if (!isAlphaStringOrSpecialChars(body.lastName)) {
    errors.push({
      href: '#lastName',
      text: 'Last name must consist of letters, an apostrophe & a hyphen only',
    })
  }

  const userTypeKey = body.userType as UserTypeKey
  if (showCaseloadDropdown(userTypeKey) && (!body.defaultCaseloadId || body.defaultCaseloadId === '--')) {
    errors.push({ href: '#defaultCaseloadId', text: caseloadText(userTypeKey) })
  }

  return errors
}

export default ({ dpsUserService, auditService }: Services): Router => {
  const router = Router()

  router.get('/', async (req, res) => {
    const body = bodyFromFlash<CreateUserRequest>(req)
    const errors = formErrorsFromFlash(req)
    if (body.userType === undefined) {
      return res.redirect(paths.dpsUser.createUser({}))
    }
    const caseloads = await dpsUserService.getCaseloads(res.locals.user.token)
    return res.render('pages/dpsUser/create', {
      ...body,
      caseloads,
      errors,
    })
  })

  router.post('/', validateFormOrRedirect<Form>(validate, paths.dpsUser.createDpsUser({})), async (req, res) => {
    const body = bodyFromFlash<CreateUserRequest>(req)
    const { username } = res.locals.user
    const errors: FormError[] = []
    let newUser: PrisonStaffNewUser
    try {
      newUser = await dpsUserService.createDpsUser(res.locals.user.token, body)
    } catch (err) {
      if (err.responseStatus === 400 && err.data) {
        const { userMessage } = err.data
        const errorDetails = { text: userMessage }
        errors.push(errorDetails)
      } else if (err.responseStatus === 409 && err.data && err.data.errorCode === 601) {
        const usernameError = { href: '#username', text: 'Username already exists' }
        errors.push(usernameError)
      } else if (err.responseStatus === 409 && err.data && err.data.errorCode === 602) {
        const emailDomainError = { href: '#email', text: 'Invalid Email domain' }
        errors.push(emailDomainError)
      } else {
        throw err
      }
    }
    if (errors.length) {
      flashBody(req, body)
      flashErrors(req, errors)
      return res.redirect(paths.dpsUser.createDpsUser({}))
    }
    await auditService.logAuditEvent({
      what: 'CREATE_DPS_USER',
      who: username,
      subjectId: newUser.username,
      subjectType: SubjectType.USER_ID,
      details: body,
    })
    return res.render('pages/dpsUser/createSuccess', {
      email: `${newUser.primaryEmail}`,
      username: `${newUser.username}`,
    })
  })

  return router
}
