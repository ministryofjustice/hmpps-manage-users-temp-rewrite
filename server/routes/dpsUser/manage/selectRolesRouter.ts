import { Request, Router } from 'express'
import { Role, RoleDetail } from 'manageUsersApiClient'
import { Services } from '../../../services'
import { UserParam } from './paramTypes'
import paths from '../../paths'
import { HmppsUser } from '../../../interfaces/hmppsUser'
import { EventType, SubjectType } from '../../../services/auditService'
import { roleDropdownValuesWithHint } from '../../../presentation/roles'
import { formErrorsFromFlash, validateFormOrRedirect } from '../../../middleware/route/formMiddleware'
import { FormError } from '../../../interfaces/formError'
import { toArray } from '../../../utils/utils'

interface Form {
  roles: string[]
}

const getPageData = async (user: HmppsUser, username: string, services: Services) => {
  const { dpsUserService, rolesService } = services
  const { token } = user
  const [dpsUser, userRoles, allRoles, bannerMessage] = await Promise.all([
    dpsUserService.getDpsUser(token, username),
    dpsUserService.getRoles(token, username),
    rolesService.getAssignableRoles(user),
    rolesService.getBannerMessage(token),
  ])
  const userRoleCodes = new Set(userRoles.dpsRoles.map((role: RoleDetail) => role.code))
  return [dpsUser, allRoles.filter((r: Role) => !userRoleCodes.has(r.roleCode)), bannerMessage]
}

const validate = (form: Form): FormError[] => {
  const errors: FormError[] = []

  if (!form.roles) {
    errors.push({ href: '#roles', text: 'Select at least one role' })
  }

  return errors
}

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })
  const { auditService, dpsUserService } = services

  router.get('/', async (req: Request<UserParam>, res) => {
    const { userId } = req.params
    const staffUrl = paths.dpsUser.manage.details({ userId })
    const { user } = res.locals

    const [dpsUser, assignableRoles, message] = await getPageData(user, userId, services)

    const roleDropdownValues = roleDropdownValuesWithHint(assignableRoles)

    await auditService.logAuditEvent({
      what: EventType.VIEW_USER_ROLES,
      who: user.username,
      subjectId: userId,
      subjectType: SubjectType.USER_ID,
    })

    return res.render('pages/addRole', {
      staff: { ...dpsUser, name: `${dpsUser.firstName} ${dpsUser.lastName}` },
      staffUrl,
      searchTitle: 'Search for a DPS user',
      searchUrl: paths.dpsUser.search.pattern,
      roleDropdownValues,
      message,
      errors: formErrorsFromFlash(req),
    })
  })

  router.post(
    '/',
    validateFormOrRedirect<Form, UserParam>(validate, req =>
      paths.dpsUser.manage.selectRoles({ userId: req.params.userId }),
    ),
    async (req: Request<UserParam>, res) => {
      const { userId } = req.params
      const body: Form = { roles: toArray(req.body.roles) }
      const { username, token } = res.locals.user

      await dpsUserService.addRoles(token, userId, body.roles)

      await auditService.logAuditEvent({
        what: EventType.ADD_USER_ROLES,
        who: username,
        subjectId: userId,
        subjectType: SubjectType.USER_ID,
        details: body,
      })

      return res.redirect(paths.dpsUser.manage.details({ userId }))
    },
  )

  return router
}
