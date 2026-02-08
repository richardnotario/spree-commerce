import { Page, Locator, expect } from "@playwright/test";

export class ProductsPage {
  constructor(private page: Page) {}

  async goToAllProducts() {
    await this.page.goto("/products");
    await expect(this.page, "Should be on products listing").toHaveURL(/\/products/i, { timeout: 15_000 });
  }

  productLinks(): Locator {
    // All product detail links in listing
    return this.page.locator('a[href*="/products/"]');
  }

  async openFirstProduct(): Promise<{ name: string; priceText: string }> {
    await expect(this.productLinks().first(), "At least one product should be listed").toBeVisible({ timeout: 15_000 });
    await this.productLinks().first().click();

    await expect(this.page, "Should open product detail page").toHaveURL(/\/products\//i, { timeout: 15_000 });

    const name = this.page.getByRole("heading").first();
    await expect(name, "Product name should be visible").toBeVisible({ timeout: 15_000 });

    const price = this.page.locator('[data-hook="product-price"], .price, [class*="price"]').first();
    await expect(price, "Product price should be visible").toBeVisible({ timeout: 15_000 });

    return {
      name: (await name.innerText()).trim(),
      priceText: (await price.innerText()).trim(),
    };
  }
}
