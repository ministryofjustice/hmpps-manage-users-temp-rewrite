import { PrisonCaseload } from 'manageUsersApiClient'
import { SelectItem } from '../interfaces/selectItem'

const caseloadDropdownValues = (caseloads: PrisonCaseload[]): SelectItem[] =>
  caseloads.map(caseload => ({
    text: caseload.name,
    value: caseload.id,
  }))
export default caseloadDropdownValues
