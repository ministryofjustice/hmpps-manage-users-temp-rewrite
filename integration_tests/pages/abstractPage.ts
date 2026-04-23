import { type Locator, type Page } from '@playwright/test'

export default class AbstractPage {
  readonly page: Page

  /** user name that appear in header */
  readonly usersName: Locator

  /** phase banner that appear in header */
  readonly phaseBanner: Locator

  /** link to sign out */
  readonly signoutLink: Locator

  /** link to manage user details */
  readonly manageUserDetails: Locator

  protected constructor(page: Page) {
    this.page = page
    this.phaseBanner = page.getByTestId('header-phase-banner')
    this.usersName = page.getByTestId('header-user-name')
    this.signoutLink = page.getByText('Sign out')
    this.manageUserDetails = page.getByTestId('manageDetails')
  }

  async signOut() {
    await this.signoutLink.first().click()
  }

  async clickManageUserDetails() {
    await this.manageUserDetails.first().click()
  }

  button(text: string): Locator {
    return this.page.getByRole('button', { name: text })
  }

  radioButton(text: string, exact: boolean = false): Locator {
    return this.page.getByRole('radio', { name: text, exact })
  }

  checkbox(text: string, exact: boolean = false): Locator {
    return this.page.getByRole('checkbox', { name: text, exact })
  }

  textBox(text: string): Locator {
    return this.page.getByRole('textbox', { name: text })
  }

  link(text: string, exact: boolean = false): Locator {
    return this.page.getByRole('link', { name: text, exact })
  }

  select(text: string): Locator {
    return this.page.getByLabel(text)
  }
}
