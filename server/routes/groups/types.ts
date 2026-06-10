import { Request } from 'express'
import { ChildGroup, Group, UpdateGroupNameRequest } from 'manageUsersApiClient'

export type GroupRequest = Request & {
  groupDetails: Group
}

export type ChildGroupRequest = GroupRequest & {
  childGroupDetails: ChildGroup
}

export type StringFromRequestProvider<GroupRequestType extends Request, Body = unknown> = (
  req: GroupRequestType,
  body?: Body,
) => string

export type AuditDetailsProvider<GroupRequestType extends Request, Body = unknown> = (
  req: GroupRequestType,
  body?: Body,
) => object

export const bodyWithoutCsrf = (body: UpdateGroupNameRequest) => {
  const { _csrf, ...withoutCsrf } = body
  return withoutCsrf
}
