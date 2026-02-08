import { Page, Locator, expect } from "@playwright/test";
import { FlashBannerComponent } from "./components/flashBanner.component";

export class AccountPage {
  constructor(private page: Page) {}

  logoutButton(): Locator {
    return this.page.locator('form.button_to[action="/user/sign_out"] >> button[type="submit"]', {
        hasText: "Log out",
      });  
  }

  async logoutAndAssert() {
    await expect(
      this.page,
      "Precondition: should be on account page before logout"
    ).toHaveURL(/\/account(\/|$)/i, { timeout: 15_000 });

    await expect(
      this.page,
      "Precondition: should be on /account/orders before logout"
    ).toHaveURL(/\/account\/orders/i, { timeout: 15_000 });

    const logout = this.logoutButton();

    await expect(logout, "Log out link should be visible").toBeVisible({ timeout: 15_000 });
    await logout.scrollIntoViewIfNeeded();

    await Promise.all([
      this.page.waitForLoadState("domcontentloaded"),
      logout.click({ force: true }),
    ]);

    const flash = new FlashBannerComponent(this.page);
    await flash.expectNotice(/signed out successfully\./i);

    await expect(
      this.page,
      "Postcondition: should leave /account after logout"
    ).not.toHaveURL(/\/account(\/|$)/i, { timeout: 15_000 });
  }
}
