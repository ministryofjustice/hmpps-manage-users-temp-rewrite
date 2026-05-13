import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import paths from '../routes/paths'
import AuthRole from '../interfaces/authRole'

const pathRolesMap = new Map<string, AuthRole[]>([
  [paths.dpsUser.createUser.pattern, [AuthRole.CREATE_USER]],
  [paths.dpsUser.createUserOptions.pattern, [AuthRole.CREATE_USER]],
  [paths.dpsUser.createDpsUser.pattern, [AuthRole.CREATE_USER]],
  [paths.dpsUser.createLinkedDpsUser.pattern, [AuthRole.CREATE_USER]],
  [paths.dpsUser.search.pattern, [AuthRole.MAINTAIN_ACCESS_ROLES, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN]],
  [paths.dpsUser.manage.relative.selectCaseloads.pattern, [AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN]],
])

function findPathRoles(path: string): AuthRole[] {
  for (const [key, value] of pathRolesMap) {
    if (path.includes(key)) return value
  }
  return []
}

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
      const authorisedRoles: AuthRole[] = findPathRoles(req.path)

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role as AuthRole))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}
