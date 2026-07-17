import { Request, Router } from 'express'
import { Services } from '../../../services'
import { UserParam } from '../../userCommon/paramTypes'
import paths from '../../paths'
import { EventType, SubjectType } from '../../../services/auditService'
import { FormError } from '../../../interfaces/formError'
import { HttpStatusCode } from '../../../utils/utils'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../../middleware/route/formMiddleware'

interface Form {
  reason: string
}

const validate = (body: Form): FormError[] => {
  if (!body.reason || body.reason.trim().length < 3) {
    return [{ href: '#reason', text: 'Enter the reason for deactivating the account (minimum 3 characters)' }]
  }
  return []
}

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })
  const { auditService, externalUserService } = services

  router.get('/', async (req: Request<UserParam>, res) => {
    const { userId } = req.params
    const { token } = res.locals.user

    const externalUser = await externalUserService.getUser(token, userId)
    const body = bodyFromFlash<Form>(req)

    return res.render('pages/externalUser/deactivateReason', {
      staff: {
        name: `${externalUser.firstName} ${externalUser.lastName}`,
      },
      staffUrl: paths.externalUser.manage.details({ userId }),
      searchUrl: paths.externalUser.search.pattern,
      ...body,
      errors: formErrorsFromFlash(req),
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, (req: Request<UserParam>) =>
      paths.externalUser.manage.deactivateReason({ userId: req.params.userId }),
    ),
    async (req: Request<UserParam>, res) => {
      const { userId } = req.params
      const { username, token } = res.locals.user
      const body = bodyFromFlash<Form>(req)
      const errors: FormError[] = []

      try {
        await externalUserService.deactivateUser(token, userId, body.reason)
      } catch (err) {
        if (err.responseStatus === HttpStatusCode.FORBIDDEN) {
          errors.push({
            href: '#reason',
            text: 'You are not able to maintain this user, user does not belong to any groups you manage',
          })
        } else {
          throw err
        }
      }

      flashBody(req, body)
      if (errors.length) {
        flashErrors(req, errors)
        return res.redirect(paths.externalUser.manage.deactivateReason({ userId }))
      }

      await auditService.logAuditEvent({
        what: EventType.DEACTIVATE_USER,
        who: username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: body,
      })
      return res.redirect(paths.externalUser.manage.details({ userId }))
    },
  )

  return router
}
