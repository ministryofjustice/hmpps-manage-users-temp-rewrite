import { Request, Router } from 'express'
import { PrisonCaseload, RoleDetail } from 'manageUsersApiClient'
import { Services } from '../../../services'
import { UserParam } from './paramTypes'
import setupRestrictedRoles from '../../../middleware/route/restrictedRolesMiddleware'
import paths from '../../paths'
import { Page, SubjectType } from '../../../services/auditService'
import { hasRole } from '../../../interfaces/hmppsUser'
import AuthRole from '../../../interfaces/authRole'

const getPageData = async (token: string, username: string, { dpsUserService, userService }: Services) => {
  const [user, roles, email, caseloads] = await Promise.all([
    dpsUserService.getDpsUser(token, username, true),
    dpsUserService.getRoles(token, username),
    userService.getUserEmail(token, username),
    dpsUserService.getUserCaseloads(token, username),
  ])
  return [
    {
      ...user,
      email: user.primaryEmail,
      emailToVerify: email.email,
      verified: email.verified,
      activeCaseload: roles.activeCaseload,
    },
    roles.dpsRoles.map((r: RoleDetail) => ({ roleCode: r.code, roleName: r.name })),
    caseloads.caseloads,
  ]
}

const sortAlphabetically = (caseload1: PrisonCaseload, caseload2: PrisonCaseload): number => {
  if (caseload1.name < caseload2.name) {
    return -1
  }
  if (caseload1.name > caseload2.name) {
    return 1
  }
  return 0
}

export default (services: Services): Router => {
  const router = Router({ mergeParams: true })
  const { auditService } = services

  router.get('/', setupRestrictedRoles<UserParam>(services), async (req: Request<UserParam>, res) => {
    const { userId } = req.params
    const { user } = res.locals
    await auditService.logPageView(Page.VIEW_DPS_USER, {
      who: user.username,
      subjectId: userId,
      subjectType: SubjectType.USER_ID,
    })

    const staffUrl = `${paths.dpsUser.manage.root({ userId })}`
    const hasMaintainDpsUsersAdmin = hasRole(user, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN)
    const hasManageDPSUserAccount = hasRole(user, AuthRole.MANAGE_NOMIS_USER_ACCOUNT)

    const searchTitle = 'Search for a DPS user'
    const searchUrl = paths.dpsUser.search.pattern
    const restrictedRoles = res.locals?.restrictedRoles ? res.locals.restrictedRoles : []

    const [dpsUser, roles, caseloads] = await getPageData(user.token, userId, services)
    return res.render('pages/userDetails', {
      searchTitle,
      searchUrl,
      staff: { ...dpsUser, name: `${dpsUser.firstName} ${dpsUser.lastName}` },
      staffUrl,
      roles,
      caseloads: caseloads?.sort(sortAlphabetically),
      hasMaintainDpsUsersAdmin,
      errors: req.flash('deleteGroupErrors'),
      canAutoEnableDisableUser: false,
      showEnableDisable: hasManageDPSUserAccount,
      showGroups: false,
      showExtraUserDetails: false,
      showUsername: dpsUser.email !== dpsUser.username.toLowerCase(),
      displayEmailChangeInProgress:
        !dpsUser.verified && dpsUser.emailToVerify && dpsUser.emailToVerify !== dpsUser.email,
      restrictedRoles,
    })
  })

  return router
}
