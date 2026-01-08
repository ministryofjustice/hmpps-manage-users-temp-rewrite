import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import MenuService from '../services/menuService'

jest.mock('../services/menuService')

const menuService = new MenuService(null) as jest.Mocked<MenuService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      menuService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Manage user accounts')
      })
  })
})
