import { Request, Router } from 'express'
import { Response } from 'superagent'
import { UpdateGroupNameRequest } from 'manageUsersApiClient'
import { Services } from '../../services'
import {
  bodyFromFlash,
  flashBody,
  flashErrors,
  formErrorsFromFlash,
  validateFormOrRedirect,
} from '../../middleware/route/formMiddleware'
import AuthRole from '../../interfaces/authRole'
import authRoleGuardMiddleware from '../../middleware/route/authRoleGuardMiddleware'
import { FormError } from '../../interfaces/formError'
import { validateGroupName } from '../../presentation/validation/groupValidation'
import { EventType, SubjectType } from '../../services/auditService'
import { HttpStatusCode } from '../../utils/utils'
import GroupsService from '../../services/groupsService'
import { AuditDetailsProvider, ChildGroupRequest, GroupRequest, StringFromRequestProvider } from './types'
import paths from '../paths'

type GroupNameUpdater = (
  groupsService: GroupsService,
  token: string,
  groupCode: string,
  body: UpdateGroupNameRequest,
) => Promise<Response>

const validate = (body: UpdateGroupNameRequest): FormError[] => {
  const errors: FormError[] = []

  errors.push(...validateGroupName(body.groupName))

  return errors
}

const templateChangeGroupNameRouter = <GroupRequestType extends Request>(
  services: Services,
  title: string,
  currentGroupNameProvider: StringFromRequestProvider<GroupRequestType>,
  groupUrlProvider: StringFromRequestProvider<GroupRequestType>,
  failureRedirectProvider: StringFromRequestProvider<GroupRequestType>,
  groupCodeProvider: StringFromRequestProvider<GroupRequestType>,
  groupNameUpdater: GroupNameUpdater,
  auditDetailsProvider: AuditDetailsProvider<GroupRequestType, UpdateGroupNameRequest>,
): Router => {
  const router = Router({ mergeParams: true })

  router.use(authRoleGuardMiddleware([AuthRole.MAINTAIN_OAUTH_USERS]))

  router.get('/', async (req: GroupRequestType, res) => {
    const body = bodyFromFlash<UpdateGroupNameRequest>(req)
    const errors = formErrorsFromFlash(req)
    const groupUrl = groupUrlProvider(req)
    const groupName = body.groupName !== undefined ? body.groupName : currentGroupNameProvider(req)

    return res.render('pages/groups/changeName', {
      title,
      groupName,
      groupUrl,
      errors,
    })
  })

  router.post(
    '/',
    validateFormOrRedirect(validate, (req: GroupRequestType) => failureRedirectProvider(req)),
    async (req: GroupRequestType, res) => {
      const { auditService, groupsService } = services
      const body = bodyFromFlash<UpdateGroupNameRequest>(req)
      const groupCode = groupCodeProvider(req)
      const { username, token } = res.locals.user
      const errors: FormError[] = []
      try {
        await groupNameUpdater(groupsService, token, groupCode, body)
      } catch (err) {
        if (err.responseStatus === HttpStatusCode.BAD_REQUEST && err.data) {
          const { userMessage } = err.data
          const errorDetails = { text: userMessage }
          errors.push(errorDetails)
        } else {
          throw err
        }
      }
      if (errors.length) {
        flashBody(req, body)
        flashErrors(req, errors)
        return res.redirect(failureRedirectProvider(req))
      }
      await auditService.logAuditEvent({
        what: EventType.CHANGE_GROUP_NAME,
        who: username,
        subjectId: groupCode,
        subjectType: SubjectType.GROUP_CODE,
        details: auditDetailsProvider(req, body),
      })
      return res.redirect(groupUrlProvider(req))
    },
  )

  return router
}

export const changeGroupNameRouter = (services: Services): Router => {
  return templateChangeGroupNameRouter<GroupRequest>(
    services,
    'Change group name',
    req => req.groupDetails.groupName,
    req => paths.groups.details({ group: req.groupDetails.groupCode }),
    req =>
      paths.groups.changeGroupName({
        group: req.groupDetails.groupCode,
      }),
    req => req.groupDetails.groupCode,
    (groupsService, token, groupCode, body) => groupsService.changeGroupName(token, groupCode, body),
    (_req, body) => {
      return body
    },
  )
}

export const changeChildGroupNameRouter = (services: Services): Router => {
  return templateChangeGroupNameRouter<ChildGroupRequest>(
    services,
    'Change child group name',
    req => req.childGroupDetails.groupName,
    req => paths.groups.details({ group: req.groupDetails.groupCode }),
    req =>
      paths.groups.changeChildGroupName({
        group: req.groupDetails.groupCode,
        childGroup: req.childGroupDetails.groupCode,
      }),
    req => req.childGroupDetails.groupCode,
    (groupsService, token, groupCode, body) => groupsService.changeChildGroupName(token, groupCode, body),
    (req, body) => {
      const parentGroupCode = req.groupDetails.groupCode
      return { body, parentGroupCode }
    },
  )
}
