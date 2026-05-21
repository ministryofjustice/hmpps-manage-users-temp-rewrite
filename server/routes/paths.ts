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
const roleRoot = path('/roles/:role')
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
}

export default paths
