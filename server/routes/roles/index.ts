import { Router } from 'express'
import { Services } from '../../services'
import paths from '../paths'
import createRouter from './createRouter'
import detailsRouter from './detailsRouter'
import logger from '../../../logger'
import { RoleRequest } from './types'

export default function index(services: Services): Router {
  const router = Router()

  router.param('role', async (req: RoleRequest, res, next, role: string) => {
    const { rolesService } = services
    try {
      req.roleDetails = await rolesService.getRoleDetails(res.locals.user.token, role)
    } catch (err) {
      logger.info(`An error occurred while fetching role details for ${role}`, err)
      return res.redirect(paths.roles.list.pattern)
    }
    return next()
  })

  router.use(paths.roles.create.pattern, createRouter(services))
  router.use(paths.roles.details.pattern, detailsRouter(services))

  return router
}
