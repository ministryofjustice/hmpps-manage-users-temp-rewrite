import { Router } from 'express'
import MenuService from '../services/menuService'

export default function menuRouter(menuService: MenuService): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const { userRoles } = res.locals.user
    const message = await menuService.getBannerMessage(res.locals.user.token, userRoles)
    const menuTiles = menuService.getTiles(userRoles)
    return res.render('pages/menu', { message, menuTiles })
  })

  return router
}
