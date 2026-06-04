import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from '../abstractPage'

export default class GroupDetailsPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page, groupName: string) {
    super(page)
    this.header = page.getByRole('heading', { name: groupName })
  }

  static async verifyOnPage(page: Page, groupName: string): Promise<GroupDetailsPage> {
    const groupDetailsPage = new GroupDetailsPage(page, groupName)
    await expect(groupDetailsPage.header).toBeVisible()
    return groupDetailsPage
  }
}
