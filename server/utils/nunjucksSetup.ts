/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { PrisonCaseload, Role } from 'manageUsersApiClient'
import { initialiseName } from './utils'
import config from '../config'
import logger from '../../logger'
import { FormError } from '../interfaces/formError'
import { SelectItem } from '../interfaces/selectItem'
import {
  caseloadText,
  showCaseloadDropdown,
  userTypeDisplay,
  userTypeExistingUsernameHint,
  userTypeExistingUsernameLabel,
  UserTypeKey,
  userTypeShorthand,
} from '../presentation/userType'
import caseloadDropdownValues from '../presentation/caseloads'
import paths from '../routes/paths'
import roleDropdownValues from '../presentation/roles'
import { Filter, filterCategories } from '../presentation/searchDpsUser'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS Manage Users Temp Rewrite'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ],
    {
      autoescape: true,
      express: app,
      noCache: process.env.NODE_ENV !== 'production',
    },
  )
  njkEnv.addGlobal('homeUrl', config.apis.hmppsAuth.externalUrl)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('findError', (array: FormError[], formFieldId: string) => {
    if (!array) return null
    const item = array.find(error => error.href === `#${formFieldId}`)
    return item || null
  })
  njkEnv.addFilter('userTypeDisplay', (userType: string) => userTypeDisplay(userType as UserTypeKey))
  njkEnv.addFilter('userTypeShorthand', (userType: string) => userTypeShorthand(userType as UserTypeKey))
  njkEnv.addFilter('userTypeExistingUsernameLabel', (userType: string) =>
    userTypeExistingUsernameLabel(userType as UserTypeKey),
  )
  njkEnv.addFilter('userTypeExistingUsernameHint', (userType: string) =>
    userTypeExistingUsernameHint(userType as UserTypeKey),
  )
  njkEnv.addFilter('showCaseloadDropdown', (userType: string) => showCaseloadDropdown(userType as UserTypeKey))
  njkEnv.addFilter('caseloadTitle', (userType: string) => caseloadText(userType as UserTypeKey))
  njkEnv.addFilter('caseloadDropdownValues', (caseloads: PrisonCaseload[]) => caseloadDropdownValues(caseloads))
  njkEnv.addFilter('roleDropdownValues', (roles: Role[]) => roleDropdownValues(roles))
  njkEnv.addFilter('manageUserDetailsLink', (username: string) => paths.dpsUser.manage.userDetails({ username }))

  njkEnv.addFilter(
    'setSelected',
    (items: SelectItem[], selected: string): SelectItem[] =>
      items &&
      items.map(entry => ({
        ...entry,
        selected: entry && entry.value === selected,
      })),
  )

  njkEnv.addFilter(
    'setChecked',
    (items: SelectItem[], selectedList): SelectItem[] =>
      items &&
      items.map(entry => ({
        ...entry,
        checked: entry && selectedList && selectedList.includes(entry.value),
      })),
  )
  njkEnv.addFilter('addBlankOptions', (values, text): SelectItem[] =>
    [
      { text: '', value: '' },
      { text, value: '' },
    ].concat(values),
  )
  njkEnv.addFilter(
    'toUserSearchFilter',
    (
      currentFilter: Filter,
      prisons: PrisonCaseload[],
      roles: Role[],
      filterOptionsHtml: string,
      showGroupOrPrisonFilter: boolean,
    ) => {
      const categories = filterCategories(currentFilter, roles, prisons, showGroupOrPrisonFilter)

      return {
        heading: {
          text: 'Filters',
        },
        selectedFilters: {
          heading: {
            html: '<div class="moj-action-bar__filter"></div>',
          },
          clearLink: {
            text: 'Clear filters',
            href: `${paths.dpsUser.searchDpsUser({})}`,
          },
          categories: categories.filter(category => category.items),
        },
        optionsHtml: filterOptionsHtml,
      }
    },
  )
}
