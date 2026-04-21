import { Request, Response, RequestHandler, NextFunction } from 'express'
import { FormError } from '../../interfaces/formError'

export type Validator<T> = {
  (form: T): FormError[]
}

export const validateFormOrRedirect =
  <Body>(validator: Validator<Body>, redirectPath: string): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const { _csrf, ...form } = body // remove the _csrf from the flashed body
    const errors: FormError[] = validator(form)
    flashBody(req, form)
    if (errors.length > 0) {
      flashErrors(req, errors)
      return res.redirect(redirectPath)
    }
    return next()
  }

export const flashErrors = (req: Request, errors: FormError[]) => {
  req.flash('errors', errors)
}

export const formErrorsFromFlash = (req: Request): FormError[] => {
  const errors = req.flash('errors')
  return errors.length > 0 ? (errors as unknown as FormError[]) : []
}

export const flashBody = (req: Request, body: object) => {
  req.flash('requestBody', JSON.stringify(body))
}

export const bodyFromFlash = <T>(req: Request): T => {
  const requestBodyFlash = req.flash('requestBody')
  return requestBodyFlash.length > 0 ? (JSON.parse(requestBodyFlash[0]) as T) : ({} as T)
}
