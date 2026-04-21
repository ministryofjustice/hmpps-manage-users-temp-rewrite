import { path } from 'static-path'

const createUser = path('/create-user')
const createUserOptions = path('/create-user-options')
const createDpsUser = path('/create-dps-user')
const createLinkedDpsUser = path('/create-linked-dps-user')
const searchDpsUser = path('/search-with-filter-dps-users')
const searchDpsUserDownload = searchDpsUser.path('user-download')
const searchDpsUserLsaDownload = searchDpsUser.path('lsa-download')
const manageDpsUsers = path('/manage-dps-users')
const userDetails = manageDpsUsers.path(':username/details')

const paths = {
  dpsUser: {
    createUser,
    createUserOptions,
    createDpsUser,
    createLinkedDpsUser,
    searchDpsUser,
    searchDpsUserDownload,
    searchDpsUserLsaDownload,
    manage: {
      userDetails,
    },
  },
}

export default paths
