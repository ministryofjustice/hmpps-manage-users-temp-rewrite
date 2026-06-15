import { path } from 'static-path'

const createUser = path('/create-user')
const createUserOptions = path('/create-user-options')
const createDpsUser = path('/create-dps-user')
const createLinkedDpsUser = path('/create-linked-dps-user')
const searchDpsUser = path('/search-with-filter-dps-users')
const searchDpsUserDownload = searchDpsUser.path('user-download')
const searchDpsUserLsaDownload = searchDpsUser.path('lsa-download')
const manageDpsUser = path('/manage-dps-users/:userId')
const details = path('/details')
const selectRoles = path('/select-roles')
const role = path('/:role')
const roleRoot = path('/roles').path(role.pattern)
const remove = path('/remove')
const requestRemoval = path('/request-removal')
const selectCaseloads = path('/select-caseloads')
const removeCaseload = path('/caseloads/:caseload/remove')
const changeEmail = path('/change-email')
const changeEmailSuccess = path('/change-email-success')
const activate = path('/activate')
const deactivate = path('/deactivate')
const emailDomains = path('/email-domains')
const createEmailDomain = path('/create-email-domain')
const deleteEmailDomain = path('/delete-email-domain')
const manageGroups = path('/manage-groups')
const createGroup = path('/create-group')
const group = path('/:group')
const changeGroupName = path('/change-group-name')
const childGroup = path('/:childGroup')
const changeChildGroupName = path('/change-child-group-name')
const createChildGroup = path('/create-child-group')
const deletePath = path('/delete')
const deleteChildGroup = path('/delete-child-group')
const manageRoles = path('/manage-roles')
const createRole = path('/create-role')

const roleRootAbsolute = manageDpsUser.path(roleRoot.pattern)
const paths = {
  dpsUser: {
    createUser,
    createUserOptions,
    createDpsUser,
    createLinkedDpsUser,
    search: searchDpsUser,
    download: searchDpsUserDownload,
    downloadLsa: searchDpsUserLsaDownload,
    manage: {
      root: manageDpsUser,
      details: manageDpsUser.path(details.pattern),
      selectRoles: manageDpsUser.path(selectRoles.pattern),
      roles: {
        root: roleRootAbsolute,
        remove: roleRootAbsolute.path(remove.pattern),
        requestRemoval: roleRootAbsolute.path(requestRemoval.pattern),
        relative: {
          remove,
          requestRemoval,
        },
      },
      selectCaseloads: manageDpsUser.path(selectCaseloads.pattern),
      removeCaseload: manageDpsUser.path(removeCaseload.pattern),
      changeEmail: manageDpsUser.path(changeEmail.pattern),
      changeEmailSuccess: manageDpsUser.path(changeEmailSuccess.pattern),
      activate: manageDpsUser.path(activate.pattern),
      deactivate: manageDpsUser.path(deactivate.pattern),
      relative: {
        details,
        selectRoles,
        roleRoot,
        selectCaseloads,
        removeCaseload,
        changeEmail,
        changeEmailSuccess,
        activate,
        deactivate,
      },
    },
  },
  emailDomains: {
    list: emailDomains,
    create: createEmailDomain,
    delete: deleteEmailDomain,
    deleteWithId: deleteEmailDomain.path('/:id'),
  },
  groups: {
    create: manageGroups.path(createGroup.pattern),
    list: manageGroups,
    details: manageGroups.path(group.pattern),
    changeGroupName: manageGroups.path(group.pattern).path(changeGroupName.pattern),
    delete: manageGroups.path(group.pattern).path(deletePath.pattern),
    createChildGroup: manageGroups.path(group.pattern).path(createChildGroup.pattern),
    changeChildGroupName: manageGroups.path(group.pattern).path(changeChildGroupName.pattern).path(childGroup.pattern),
    deleteChildGroup: manageGroups.path(group.pattern).path(deleteChildGroup.pattern).path(childGroup.pattern),
  },
  roles: {
    list: manageRoles,
    create: manageRoles.path(createRole.pattern),
    details: manageRoles.path(role.pattern),
  },
}

export default paths
