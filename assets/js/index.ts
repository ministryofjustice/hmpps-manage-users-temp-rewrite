import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupAutocomplete from './autocomplete'
import makeCardsClickable from './card'

govukFrontend.initAll()
mojFrontend.initAll()
setupAutocomplete()
makeCardsClickable()
