import { Page, Locator, expect } from "@playwright/test";
import { escapeRegex } from "../utils/text";

export class CartPage {
  constructor(private page: Page) {}

  async goToCart() {
    await this.page.goto("/cart");
    await expect(this.page).toHaveURL(/\/cart/i, { timeout: 15_000 });
  }

  lineItems(): Locator {
    return this.page.locator("#line-items li.cart-line-item");
  }

  lineItemByName(name: string): Locator {
    const safe = escapeRegex(name.trim());
    const re = new RegExp(safe, "i"); // case-insensitive
    return this.lineItems()
      .filter({
        has: this.page.locator("a", { hasText: re }),
      })
      .first();
  }

  async assertItemPresentByName(name: string) {
    const item = this.lineItemByName(name);

    try {
      await expect(item, `Cart should contain product: ${name}`).toBeVisible({ timeout: 15_000 });
    } catch (e) {
      const titles = await this.page.locator("#line-items a.font-semibold.text-text").allInnerTexts().catch(() => []);
      console.log("[debug] cart titles:", titles.map(t => t.trim()));
      throw e;
    }
  }

  async assertQuantityForProduct(name: string, expected: number) {
    const item = this.lineItemByName(name);
    const qty = item.locator('input[aria-label="Quantity"]');
    await expect(qty, "Quantity input should be visible").toBeVisible({ timeout: 15_000 });
    await expect(qty, "Quantity should match").toHaveValue(String(expected));
  }

  async assertPriceVisibleForProduct(name: string) {
    const item = this.lineItemByName(name);
    
    const priceBlock = item.locator("div.mb-2.text-sm").first();
    await expect(priceBlock, "Price block should be visible").toBeVisible({ timeout: 15_000 });
    await expect(priceBlock, "Price block should contain a dollar amount").toContainText(/\$\d+/);
  }
}
