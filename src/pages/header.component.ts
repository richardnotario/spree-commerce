import { Page, Locator, expect } from "@playwright/test";

export class HeaderComponent {
  constructor(private page: Page) {}

  private accountTrigger(): Locator {
    return this.page.getByLabel("Open account panel").first();
  }

  private loginFrame(): Locator {
    return this.page.locator("turbo-frame#login");
  }

  /**
   * Guest path: opens the account side panel and waits for Login UI.
   */
  async openAccountPanelExpectLogin() {
    const trigger = this.accountTrigger();

    await expect(trigger, "Account trigger should be visible").toBeVisible({ timeout: 15_000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ trial: true });
    await trigger.click();

    const frame = this.loginFrame();

    await expect(
      frame.getByRole("heading", { name: /login/i }),
      "Login heading should be visible in the account panel"
    ).toBeVisible({ timeout: 15_000 });

    await expect(frame.getByLabel(/email/i), "Email should be visible").toBeVisible({ timeout: 15_000 });
    await expect(frame.getByLabel(/^password$/i), "Password should be visible").toBeVisible({ timeout: 15_000 });
  }

  /**
   * Logged-in path: navigates to /account and waits for My Account page.
   */
  async openAccountPageExpectAccount() {
    const trigger = this.accountTrigger();

    await expect(trigger, "Account trigger should be visible").toBeVisible({ timeout: 15_000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ trial: true });
    await trigger.click();

    await expect(this.page, "Should navigate to /account").toHaveURL(/\/account/i, { timeout: 15_000 });
    await expect(
      this.page.getByRole("heading", { name: /my account/i }),
      "My Account heading should be visible"
    ).toBeVisible({ timeout: 15_000 });
  }
}
