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
    },
  },
}

export default paths
