import { Router } from 'express'
import { FormError } from '../../interfaces/formError'
import paths from '../paths'
import { bodyFromFlash, formErrorsFromFlash, validateFormOrRedirect } from '../../middleware/formMiddleware'
import { userTypeItems } from '../../presentation/userType'

interface Form {
  userType: string
}

const validate = (body: Form): FormError[] => {
  const errors: FormError[] = []
  if (!body.userType) {
    errors.push({ href: '#userType', text: 'Select a user type' })
  }
  return errors
}

export default (): Router => {
  const router = Router()

  router.get('/', async (req, res) => {
    const body = bodyFromFlash<Form>(req)
    const errors = formErrorsFromFlash(req)
    return res.render('pages/dpsUser/selectUserType', {
      ...body,
      userTypeItems: userTypeItems(),
      errors,
    })
  })

  router.post('/', validateFormOrRedirect<Form>(validate, paths.dpsUser.createUser({})), async (req, res) => {
    return res.redirect(paths.dpsUser.createUserOptions({}))
  })

  return router
}
