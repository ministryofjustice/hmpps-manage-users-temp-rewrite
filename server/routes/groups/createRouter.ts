import { Router } from 'express'
import { CreateGroupRequest } from 'manageUsersApiClient'
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
import AuthRole from '../../interfaces/authRole'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import { validateGroupCode, validateGroupName } from '../../presentation/validation/groupValidation'
import { EventType, SubjectType } from '../../services/auditService'
import { HttpStatusCode } from '../../utils/utils'

const validate = (body: CreateGroupRequest): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateGroupName(body.groupName))
  errors.push(...validateGroupCode(body.groupCode))

  return errors
}

export default (services: Services): Router => {
  const router = Router()

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_OAUTH_USERS]))

  router.get('/', async (req, res) => {
    const body = bodyFromFlash<CreateGroupRequest>(req)
    const errors = formErrorsFromFlash(req)

    const groupsUrl = paths.groups.list.pattern

    return res.render('pages/groups/create', {
      ...body,
      errors,
      groupsUrl,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, _req => paths.groups.create.pattern),
    async (req, res) => {
      const { auditService, groupsService } = services
      const body = bodyFromFlash<CreateGroupRequest>(req)
      const { _csrf, ...bodyWithoutCsrf } = body
      const { username } = res.locals.user
      const errors: FormError[] = []
      try {
        await groupsService.createGroup(res.locals.user.token, body)
      } catch (err) {
        if (err.responseStatus === HttpStatusCode.CONFLICT && err.data) {
          errors.push({ href: '#groupCode', text: 'Group code already exists' })
        } else {
          throw err
        }
      }
      if (errors.length) {
        flashBody(req, body)
        flashErrors(req, errors)
        return res.redirect(paths.groups.create.pattern)
      }
      await auditService.logAuditEvent({
        what: EventType.CREATE_GROUP,
        who: username,
        subjectId: body.groupCode,
        subjectType: SubjectType.GROUP_CODE,
        details: bodyWithoutCsrf,
      })
      return res.redirect(paths.groups.details({ group: body.groupCode }))
    },
  )

  return router
}
