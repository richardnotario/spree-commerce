import { Page, Locator, expect } from "@playwright/test";

export class CartDrawerComponent {
  constructor(private page: Page) {}

  overlay(): Locator {
    return this.page.locator("#cart-pane");
  }

  drawer(): Locator {
    return this.page.locator("#slideover-cart");
  }

  title(): Locator {
    return this.drawer().getByText(/^cart$/i);
  }

  lineItemsList(): Locator {
    return this.drawer().locator("#line-items");
  }

  lineItemByName(name: string): Locator {
    return this.drawer().locator('#line-items a.font-semibold.text-text', { hasText: name }).first();
  }

  closeButton(): Locator {
    return this.drawer().getByRole("button", { name: /close sidebar/i });
  }

  async waitForOpen() {
    await expect(this.overlay(), "Cart drawer overlay should be visible").toBeVisible({ timeout: 15_000 });
    await expect(this.drawer(), "Cart drawer should be visible").toBeVisible({ timeout: 15_000 });
    await expect(this.title(), "Cart drawer title should be visible").toBeVisible({ timeout: 15_000 });
  }

  async waitForItemsLoaded() {
    await this.waitForOpen();
    await expect(this.lineItemsList(), "Cart line items list should be visible").toBeVisible({ timeout: 15_000 });
  
    const items = this.lineItemsList().locator("li.cart-line-item");
    await expect.poll(async () => await items.count(), {
      message: "At least one cart line item should appear",
      timeout: 15_000,
    }).toBeGreaterThan(0);
  }

  async waitForProduct(name: string) {
    await this.waitForItemsLoaded();
    await expect(this.lineItemByName(name), `Mini cart should contain product: ${name}`).toBeVisible({
      timeout: 15_000,
    });
  }

  async close() {
    if (await this.closeButton().count()) {
      await this.closeButton().click({ force: true });
      await expect(this.overlay(), "Cart drawer overlay should be hidden after close").toBeHidden({ timeout: 15_000 });
    }
  }
}
