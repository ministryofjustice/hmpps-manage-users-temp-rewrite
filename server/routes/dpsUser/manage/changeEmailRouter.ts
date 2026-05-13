import { Request, RequestHandler, Response, Router } from 'express'
import { Services } from '../../../services'
import { UserParam } from './paramTypes'
import { FormError } from '../../../interfaces/formError'
import { validateEmail } from '../../../presentation/validation/userValidation'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../../middleware/route/formMiddleware'
import paths from '../../paths'
import { EventType, SubjectType } from '../../../services/auditService'
import emailVerificationError from '../../../presentation/errors'

interface Form {
  email: string
}

const validate = (body: Form): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateEmail(body.email))

  return errors
}

const getUser = async (token: string, username: string, { dpsUserService, userService }: Services) => {
  const [user, email] = await Promise.all([
    dpsUserService.getDpsUser(token, username),
    userService.getUserEmail(token, username),
  ])
  return { ...user, email: email.email }
}

export const changeEmailRouter = (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.get('/', async (req: Request<UserParam>, res) => {
    const { userId } = req.params
    const staffUrl = paths.dpsUser.manage.details({ userId })
    const searchTitle = 'Search for a DPS user'
    const searchUrl = paths.dpsUser.search.pattern

    const user = await getUser(res.locals.user.token, userId, services)
    const body = bodyFromFlash<Form>(req)
    const email = body.email != null && body.email.length > 0 ? body.email : user.email

    return res.render('pages/changeEmail', {
      staff: { username: user.username, name: `${user.firstName} ${user.lastName}` },
      searchTitle,
      searchUrl,
      staffUrl,
      currentEmail: email,
      errors: formErrorsFromFlash(req),
    })
  })

  router.post(
    '/',
    validateFormOrRedirect<Form, UserParam>(validate, req =>
      paths.dpsUser.manage.changeEmail({ userId: req.params.userId }),
    ),
    async (req: Request<UserParam>, res) => {
      const { auditService, dpsUserService } = services
      const { userId } = req.params
      const body = bodyFromFlash<Form>(req)
      const errors: FormError[] = []

      try {
        await dpsUserService.changeEmail(res.locals.user.token, userId, body.email)
      } catch (err) {
        if (err.responseStatus === 400 && err.data) {
          const errorDetails = { href: '#email', text: emailVerificationError(err) }
          errors.push(errorDetails)
        } else {
          throw err
        }
      }

      flashBody(req, body)
      if (errors.length) {
        flashErrors(req, errors)
        return res.redirect(paths.dpsUser.manage.changeEmail({ userId }))
      }
      await auditService.logAuditEvent({
        what: EventType.UPDATE_USER,
        who: res.locals.user.username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: body,
      })
      return res.redirect(paths.dpsUser.manage.changeEmailSuccess({ userId }))
    },
  )

  return router
}

export const changeEmailSuccessHandler =
  (services: Services): RequestHandler<UserParam> =>
  async (req: Request<UserParam>, res: Response) => {
    const { userId } = req.params
    const staffUrl = paths.dpsUser.manage.details({ userId })

    const body = bodyFromFlash<Form>(req)
    const user = await getUser(res.locals.user.token, userId, services)
    const usernameChanged = user.username.includes('@')

    return res.render('pages/changeEmailSuccess', { email: body.email, detailsLink: staffUrl, usernameChanged })
  }
