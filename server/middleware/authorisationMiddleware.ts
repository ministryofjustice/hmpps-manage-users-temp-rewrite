import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import paths from '../routes/paths'

enum Role {
  CREATE_USER = 'ROLE_CREATE_USER',
}

const pathRolesMap = new Map<string, Role[]>([
  [paths.dpsUser.createUser({}), [Role.CREATE_USER]],
  [paths.dpsUser.createUserOptions({}), [Role.CREATE_USER]],
  [paths.dpsUser.createDpsUser({}), [Role.CREATE_USER]],
  [paths.dpsUser.createLinkedDpsUser({}), [Role.CREATE_USER]],
])

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
      const authorisedRoles: Role[] = pathRolesMap.has(req.path) ? pathRolesMap.get(req.path) : []

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role as Role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}
