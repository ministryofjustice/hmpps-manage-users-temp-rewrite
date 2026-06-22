import { Router } from 'express'
import { RoleAdminType } from 'manageUsersApiClient'
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
import { validateRoleAdminType } from '../../presentation/validation/roleValidation'
import { EventType, SubjectType } from '../../services/auditService'
import { HttpStatusCode, toArray } from '../../utils/utils'
import { RoleRequest } from './types'
import { adminTypeItemsDisablingImmutable } from '../../presentation/roles'

interface Form {
  adminType: string[]
}

const validate = (body: Form): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateRoleAdminType(toArray(body.adminType)))

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
    const adminType =
      body.adminType !== undefined
        ? body.adminType
        : roleDetails.adminType.map((aType: RoleAdminType) => aType.adminTypeCode)

    return res.render('pages/roles/changeAdminType', {
      ...body,
      title: `Change role admin type for ${roleDetails.roleName}`,
      adminTypeValues: adminTypeItemsDisablingImmutable(adminType),
      adminType,
      roleUrl,
      errors,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, (req: RoleRequest) =>
      paths.roles.changeRoleAdminType({ role: req.roleDetails.roleCode }),
    ),
    async (req: RoleRequest, res) => {
      const { auditService, rolesService } = services
      const body = bodyFromFlash<Form>(req)
      const { username, token } = res.locals.user
      const { roleDetails } = req
      const adminType = toArray(body.adminType)
      const errors: FormError[] = []
      try {
        await rolesService.changeRoleAdminType(token, roleDetails.roleCode, { adminType })
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
        return res.redirect(paths.roles.changeRoleAdminType({ role: roleDetails.roleCode }))
      }
      await auditService.logAuditEvent({
        what: EventType.UPDATE_ROLE,
        who: username,
        subjectId: roleDetails.roleCode,
        subjectType: SubjectType.ROLE_CODE,
        details: { newAdminType: adminType },
      })
      return res.redirect(paths.roles.details({ role: roleDetails.roleCode }))
    },
  )

  return router
}
