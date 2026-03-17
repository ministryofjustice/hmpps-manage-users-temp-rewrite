import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'
import paths from '../routes/paths'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('authorisationMiddleware', () => {
  let req: Request
  const next = jest.fn()

  function createResWithToken({ authorities }: { authorities: string[] }): Response {
    return {
      locals: {
        user: {
          token: createToken(authorities),
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect to sign-in if no user token', () => {
    req = { originalUrl: '/', session: { returnTo: '' } } as Request
    const res = { redirect: jest.fn() } as unknown as Response

    authorisationMiddleware()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    expect(req.session.returnTo).toEqual('/')
  })

  it('should return next when no required roles', () => {
    req = { path: '/' } as Request
    const res = createResWithToken({ authorities: [] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user tries to access create user without create user role', () => {
    req = { path: paths.dpsUser.createUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_NOT_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user tries to access create user with create user role', () => {
    req = { path: paths.dpsUser.createUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user tries to access create user options without create user role', () => {
    req = { path: paths.dpsUser.createUserOptions({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_NOT_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user tries to access create user options with create user role', () => {
    req = { path: paths.dpsUser.createUserOptions({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user tries to access create dps user without create user role', () => {
    req = { path: paths.dpsUser.createDpsUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_NOT_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user tries to access create dps user with create user role', () => {
    req = { path: paths.dpsUser.createDpsUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user tries to access create linked dps user without create user role', () => {
    req = { path: paths.dpsUser.createLinkedDpsUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_NOT_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user tries to access create linked dps user with create user role', () => {
    req = { path: paths.dpsUser.createLinkedDpsUser({}) } as Request
    const res = createResWithToken({ authorities: ['ROLE_CREATE_USER'] })

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
