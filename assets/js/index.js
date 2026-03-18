import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupAutocomplete from './autocomplete'

govukFrontend.initAll()
mojFrontend.initAll()
setupAutocomplete()
