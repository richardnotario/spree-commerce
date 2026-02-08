import { Page, Locator, expect } from "@playwright/test";

export class FlashBannerComponent {
  constructor(private page: Page) {}

  noticeMessage(): Locator {
    return this.page.locator(".alert-notice .flash-message");
  }

  errorMessage(): Locator {
    return this.page.locator(".alert-error .flash-message");
  }

  async expectNotice(text: RegExp | string) {
    const msg = this.noticeMessage();
    await expect(msg, "Notice flash message should be visible").toBeVisible({ timeout: 15_000 });
    await expect(msg, "Notice flash message text mismatch").toHaveText(text);
  }
}
