import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class UserPage extends AbstractPage {
  readonly header: Locator

  readonly userRows: Locator

  readonly roleRows: Locator

  readonly groupRows: Locator

  readonly activeCaseloadRow: Locator

  readonly caseloadRows: Locator

  readonly administeredUserGroupsRows: Locator

  readonly addCaseloadButton: Locator

  readonly changeEmailLink: Locator

  readonly addRoleButton: Locator

  readonly activateLink: Locator

  readonly deactivateLink: Locator

  readonly statusTag: Locator

  private constructor(page: Page, name: string) {
    super(page)
    this.header = page.getByRole('heading', { name })
    this.userRows = page.getByTestId('user-details').getByRole('row')
    this.roleRows = page.getByTestId('user-roles').getByRole('row')
    this.groupRows = page.getByTestId('user-groups').getByRole('row')
    this.activeCaseloadRow = page.getByTestId('user-active-caseload').getByRole('row')
    this.caseloadRows = page.getByTestId('user-caseloads').getByRole('row')
    this.administeredUserGroupsRows = page.getByTestId('prison-user-admin-caseloads').getByRole('row')
    this.addCaseloadButton = page.getByRole('button', { name: 'Add another caseload' })
    this.changeEmailLink = page.getByRole('link', { name: 'Change email' })
    this.addRoleButton = page.getByRole('button', { name: 'Add another role' })
    this.activateLink = page.getByRole('button', { name: 'Activate account', exact: true })
    this.deactivateLink = page.getByRole('button', { name: 'Deactivate account' })
    this.statusTag = page.getByTestId('enabled')
  }

  removeRole = (roleCode: string): Locator => {
    return this.removeButton(roleCode)
  }

  removeCaseload = (caseload: string): Locator => {
    return this.removeButton(caseload)
  }

  private removeButton = (suffix: string): Locator => {
    return this.page.getByTestId(`remove-button-${suffix}`)
  }

  requestRoleRemoval = (roleCode: string): Locator => {
    return this.page.getByTestId(`request-removal-${roleCode}`)
  }

  static async verifyOnPage(page: Page, name: string): Promise<UserPage> {
    const createPage = new UserPage(page, name)
    await expect(createPage.header).toBeVisible()
    return createPage
  }
}
