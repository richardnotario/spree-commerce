import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  header(): Locator {
    return this.page.locator("header");
  }

  spreeLogo(): Locator {
    return this.header().getByText("spree", { exact: false });
  }

  shopAllLink(): Locator {
    return this.header().getByRole("link", { name: /shop all/i });
  }

  async assertLoaded() {
    await expect(this.header(), "Header should be visible").toBeVisible();
    await expect(this.shopAllLink(), "Shop All link should be visible").toBeVisible();
  }
}
