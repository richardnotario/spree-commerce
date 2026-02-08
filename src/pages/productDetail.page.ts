import { Page, Locator, expect } from "@playwright/test";
import { CartDrawerComponent } from "./components/cartDrawer.component";

export class ProductDetailPage {
  constructor(private page: Page) {}

  addToCartButton(): Locator {
    return this.page.getByRole("button", { name: /add to cart/i });
  }

  productTitle(): Locator {
    return this.page.getByRole("heading").first();
  }

  private sizeFieldset(): Locator {
    return this.page.locator('fieldset[data-option-id] [role="group"][aria-label="Size"]').first();
  }

  private sizeDropdownButton(): Locator {
    return this.sizeFieldset().locator('button[data-dropdown-target="button"]').first();
  }

  private sizeDropdownMenu(): Locator {
    return this.sizeFieldset().locator('[data-dropdown-target="menu"][role="menu"]').first();
  }

  private sizeOptions(): Locator {
    return this.sizeFieldset().locator('label[role="menuitem"]');
  }

  async selectSizeIfPresent(preferred: string[] = ["S", "M", "L"]) {
    // If product doesn't have Size, do nothing
    if ((await this.sizeFieldset().count()) === 0) return;

    const btn = this.sizeDropdownButton();
    await expect(btn, "Size dropdown trigger should exist").toHaveCount(1, { timeout: 15_000 });

    // Open dropdown only if menu isn't visible yet
    const menu = this.sizeDropdownMenu();
    if (!(await menu.isVisible().catch(() => false))) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click({ force: true });
    }

    await expect(menu, "Size dropdown menu should be visible").toBeVisible({ timeout: 15_000 });

    for (const size of preferred) {
      const opt = this.sizeOptions().filter({ has: this.page.locator("p", { hasText: size }) }).first();

      if ((await opt.count()) > 0) {
        await opt.click({ force: true });
        await expect(btn, "Size should be selected (not 'Please choose')").not.toContainText(/please choose/i, {
          timeout: 15_000,
        });
        return;
      }

      const optByAria = this.sizeOptions().filter({ hasText: new RegExp(`^${size}$`, "i") }).first();
      if ((await optByAria.count()) > 0) {
        await optByAria.click({ force: true });
        await expect(btn).not.toContainText(/please choose/i, { timeout: 15_000 });
        return;
      }
    }

    const first = this.sizeOptions().first();
    await expect(first, "At least one size option should exist").toBeVisible({ timeout: 15_000 });
    await first.click({ force: true });
    await expect(btn).not.toContainText(/please choose/i, { timeout: 15_000 });
  }

  async addToCartAndWaitForMiniCart(productName: string) {
    await this.selectSizeIfPresent();

    const btn = this.addToCartButton();
    await expect(btn, "Add to cart should be visible").toBeVisible({ timeout: 15_000 });
    await expect(btn, "Add to cart should be enabled").toBeEnabled({ timeout: 15_000 });

    await btn.click();

    const drawer = new CartDrawerComponent(this.page);
    await drawer.waitForProduct(productName);

    await drawer.close();
  }

  async getDisplayedProductName(): Promise<string> {
    await expect(this.productTitle(), "PDP product title should be visible").toBeVisible({ timeout: 15_000 });
    return (await this.productTitle().innerText()).trim();
  }
}
