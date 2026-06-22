import { Router } from 'express'
import { Services } from '../../services'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import AuthRole from '../../interfaces/authRole'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../middleware/route/formMiddleware'
import paths from '../paths'
import { FormError } from '../../interfaces/formError'
import { validateRoleName } from '../../presentation/validation/roleValidation'
import { EventType, SubjectType } from '../../services/auditService'
import { HttpStatusCode } from '../../utils/utils'
import { RoleRequest } from './types'

interface Form {
  roleName: string
}

const validate = (body: Form): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateRoleName(body.roleName))

  return errors
}

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })

  router.use(authRoleGuardMiddleware([AuthRole.ROLES_ADMIN]))

  router.get('/', async (req: RoleRequest, res) => {
    const body = bodyFromFlash<Form>(req)
    const errors = formErrorsFromFlash(req)
    const { roleDetails } = req
    const roleUrl = paths.roles.details({ role: roleDetails.roleCode })
    const roleName = body.roleName !== undefined ? body.roleName : roleDetails.roleName

    return res.render('pages/roles/changeName', {
      ...body,
      title: `Change role name for ${roleDetails.roleName}`,
      roleName,
      roleUrl,
      errors,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, (req: RoleRequest) =>
      paths.roles.changeRoleName({ role: req.roleDetails.roleCode }),
    ),
    async (req: RoleRequest, res) => {
      const { auditService, rolesService } = services
      const body = bodyFromFlash<Form>(req)
      const { username, token } = res.locals.user
      const { roleDetails } = req
      const errors: FormError[] = []
      try {
        await rolesService.changeRoleName(token, roleDetails.roleCode, { roleName: body.roleName })
      } catch (err) {
        if (err.responseStatus === HttpStatusCode.BAD_REQUEST && err.data) {
          const { userMessage } = err.data
          const errorDetails = { text: userMessage }
          errors.push(errorDetails)
        } else {
          throw err
        }
      }
      if (errors.length) {
        flashBody(req, body)
        flashErrors(req, errors)
        return res.redirect(paths.roles.changeRoleName({ role: roleDetails.roleCode }))
      }
      await auditService.logAuditEvent({
        what: EventType.UPDATE_ROLE,
        who: username,
        subjectId: roleDetails.roleCode,
        subjectType: SubjectType.ROLE_CODE,
        details: { newRoleName: body.roleName },
      })
      return res.redirect(paths.roles.details({ role: roleDetails.roleCode }))
    },
  )

  return router
}
