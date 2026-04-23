import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import paths from '../routes/paths'
import AuthRole from '../interfaces/authRole'

const pathRolesMap = new Map<string, AuthRole[]>([
  [paths.dpsUser.createUser({}), [AuthRole.CREATE_USER]],
  [paths.dpsUser.createUserOptions({}), [AuthRole.CREATE_USER]],
  [paths.dpsUser.createDpsUser({}), [AuthRole.CREATE_USER]],
  [paths.dpsUser.createLinkedDpsUser({}), [AuthRole.CREATE_USER]],
  [paths.dpsUser.searchDpsUser({}), [AuthRole.MAINTAIN_ACCESS_ROLES, AuthRole.MAINTAIN_ACCESS_ROLES_ADMIN]],
])

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
      const authorisedRoles: AuthRole[] = pathRolesMap.has(req.path) ? pathRolesMap.get(req.path) : []

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
