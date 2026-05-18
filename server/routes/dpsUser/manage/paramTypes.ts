export interface UserParam {
  userId: string
}

export interface RoleParam extends UserParam {
  role: string
}

export interface CaseloadParam extends UserParam {
  caseload: string
}
