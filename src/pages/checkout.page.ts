import { Page, Locator, FrameLocator, expect } from "@playwright/test";

export type ShippingAddress = {
  country?: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
};

export type CardDetails = {
  number: string;
  expiry: string;
  cvc: string;
};

export class CheckoutPage {
  constructor(private page: Page) {}

  // --- Common / Navigation ---
  checkoutPathRe(): RegExp {
    return /\/checkout\/[A-Za-z0-9]+/i;
  }

  breadcrumb(step: "Cart" | "Address" | "Delivery" | "Payment"): Locator {
    return this.page.getByRole("link", { name: new RegExp(`^${step}$`, "i") });
  }

  async assertOnCheckout() {
    await expect(this.page, "Should be on checkout page").toHaveURL(this.checkoutPathRe(), { timeout: 15_000 });
    await expect(this.page.getByRole("heading", { name: /address/i })).toBeVisible({ timeout: 15_000 });
  }

  // --- Address Step ---
  addressHeading(): Locator {
    return this.page.getByRole("heading", { name: /address/i });
  }

  countrySelect(): Locator {
    return this.page.getByLabel(/^country$/i);
  }

  firstName(): Locator {
    return this.page.getByLabel(/^first name$/i);
  }

  lastName(): Locator {
    return this.page.getByLabel(/^last name$/i);
  }

  address1(): Locator {
    return this.page.getByLabel(/street and house number/i);
  }

  address2(): Locator {
    return this.page.getByLabel(/apartment, suite/i);
  }

  city(): Locator {
    return this.page.getByLabel(/^city$/i);
  }

  stateSelect(): Locator {
    return this.page.locator("#order_ship_address_attributes_state_id");
  }

  stateText(): Locator {
    return this.page.locator("#order_ship_address_attributes_state_name");
  }

  zip(): Locator {
    return this.page.getByLabel(/postal code/i);
  }

  phone(): Locator {
    return this.page.getByLabel(/^phone/i);
  }

  saveAndContinue(): Locator {
    return this.page.getByRole("button", { name: /save and continue/i });
  }

  // Order summary (right panel) - useful for assertions
  summary(): Locator {
    return this.page.locator("text=Subtotal").first().locator("..").locator("..");
  }

  async fillShippingAddress(addr: ShippingAddress) {
    await expect(this.addressHeading(), "Address step heading should be visible").toBeVisible({ timeout: 15_000 });

    if (addr.country) {
      await this.countrySelect().selectOption({ label: addr.country });
    }

    await this.firstName().fill(addr.firstName);
    await this.lastName().fill(addr.lastName);
    await this.address1().fill(addr.address1);

    if (addr.address2) await this.address2().fill(addr.address2);

    await this.city().fill(addr.city);

    const stateSelect = this.stateSelect();
    const stateText = this.stateText();

    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption({ label: addr.state });
    } else {
      await expect(stateText, "State textbox should be visible when dropdown isn't").toBeVisible({ timeout: 15_000 });
      await stateText.fill(addr.state);
    }

    await this.zip().fill(addr.zip);

    if (addr.phone) await this.phone().fill(addr.phone);
  }

  async continueToDelivery() {
    const btn = this.saveAndContinue();
    await expect(btn, "Save and Continue should be visible").toBeVisible({ timeout: 15_000 });
    await expect(btn, "Save and Continue should be enabled").toBeEnabled({ timeout: 15_000 });

    await Promise.all([this.page.waitForLoadState("domcontentloaded"), btn.click()]);

    await expect(this.page.getByRole("heading", { name: /delivery/i }), "Should reach Delivery step").toBeVisible({
      timeout: 15_000,
    });
  }

  // --- Delivery Step ---
  deliveryHeading(): Locator {
    return this.page.getByRole("heading", { name: /delivery/i });
  }

  shippingRateRadios(): Locator {
    return this.page.locator(
      'input[type="radio"][name^="order[shipments_attributes]"][name$="[selected_shipping_rate_id]"]'
    );
  }

  shippingMethodCardByLabel(label: string): Locator {
    return this.page.locator("label").filter({ hasText: new RegExp(label, "i") }).first();
  }

  async assertDeliveryOptionsAndPrices() {
    const deliveryBox = this.page.locator("text=Delivery method").first().locator("..").locator("..");
    await expect(deliveryBox, "Delivery methods section should be visible").toBeVisible({ timeout: 15_000 });

    await expect(this.page.getByText(/test shipping/i)).toBeVisible();
    await expect(this.page.getByText(/standard/i)).toBeVisible();
    await expect(this.page.getByText(/premium/i)).toBeVisible();
    await expect(this.page.getByText(/next day/i)).toBeVisible();

    await expect(this.page.getByText(/^free$/i).first(), "Should show a Free option").toBeVisible();
    await expect(this.page.getByText(/\$5\.00/), "Should show $5.00 option").toBeVisible();
    await expect(this.page.getByText(/\$10\.00/), "Should show $10.00 option").toBeVisible();
    await expect(this.page.getByText(/\$15\.00/), "Should show $15.00 option").toBeVisible();
  }

  async selectShippingMethod(label: "test Shipping" | "Standard" | "Premium" | "Next Day" = "test Shipping") {
    await expect(this.deliveryHeading()).toBeVisible({ timeout: 15_000 });

    const row = this.shippingMethodCardByLabel(label);
    await expect(row, `Shipping method "${label}" should be visible`).toBeVisible({ timeout: 15_000 });

    const radioInRow = row.locator('input[type="radio"]').first();

    if (await radioInRow.count()) {
      await radioInRow.check({ force: true });
      await expect(radioInRow, `Shipping radio for "${label}" should be checked`).toBeChecked({ timeout: 10_000 });
    } else {
      await row.click();

      const checked = this.page.locator(
        'input[type="radio"][name^="order[shipments_attributes]"][name$="[selected_shipping_rate_id]"]:checked'
      );
      await expect(checked, `A shipping rate radio should be checked after selecting "${label}"`).toHaveCount(1, {
        timeout: 10_000,
      });
    }
  }

  async continueToPayment() {
    const btn = this.saveAndContinue();
    await expect(btn).toBeVisible({ timeout: 15_000 });
    await expect(btn).toBeEnabled({ timeout: 15_000 });

    await Promise.all([this.page.waitForLoadState("domcontentloaded"), btn.click()]);

    await expect(this.page.getByRole("heading", { name: /payment/i }), "Should reach Payment step").toBeVisible({
      timeout: 20_000,
    });
  }

  // --- Payment Step ---
  paymentHeading(): Locator {
    return this.page.getByRole("heading", { name: /payment/i });
  }

  private paymentFrame(): FrameLocator {
    const paymentSection = this.paymentHeading().locator("..");

    return paymentSection.frameLocator('iframe[title="Secure payment input frame"]');
  }

  paymentMethodCardTab(): Locator {
    return this.paymentFrame().getByRole("tab", { name: /^card$/i });
  }

  cardNumber(): Locator {
    return this.paymentFrame().getByLabel(/card number/i);
  }

  expiry(): Locator {
    return this.paymentFrame().getByLabel(/expiration/i);
  }

  cvc(): Locator {
    return this.paymentFrame().getByLabel(/security code/i);
  }

  payNow(): Locator {
    return this.page.getByRole("button", { name: /pay now/i });
  }

  async selectPaymentMethodCard() {
    await expect(this.paymentHeading()).toBeVisible({ timeout: 20_000 });
  
    const iframe = this.page.locator(
      'iframe[title="Secure payment input frame"]:not([aria-hidden="true"])'
    );
  
    await expect(iframe, "Stripe payment iframe should be present (non-hidden)").toHaveCount(1, { timeout: 20_000 });
    await expect(iframe.first(), "Stripe payment iframe should be visible").toBeVisible({ timeout: 20_000 });
  
    const frame = this.page.frameLocator(
      'iframe[title="Secure payment input frame"]:not([aria-hidden="true"])'
    );
  
    // Wait for Card tab inside the iframe (condition-based wait, no sleeps)
    const cardTab = frame.getByRole("tab", { name: /^card$/i });
    await expect(cardTab, "Card payment tab should be visible").toBeVisible({ timeout: 20_000 });
    await cardTab.click();
  
    await expect(frame.getByLabel(/card number/i), "Card number should be visible").toBeVisible({ timeout: 20_000 });
    await expect(frame.getByLabel(/expiration/i), "Expiration should be visible").toBeVisible({ timeout: 20_000 });
    await expect(frame.getByLabel(/security code/i), "CVC should be visible").toBeVisible({ timeout: 20_000 });
  }

  async enterCard(details: CardDetails) {
    const expiry = details.expiry.replace(/\s+/g, " ").trim();

    await this.cardNumber().fill(details.number);
    await this.expiry().fill(expiry);
    await this.cvc().fill(details.cvc);

    await expect(this.cardNumber()).toHaveValue(/4242/);
  }

  async payAndConfirmOrder() {
    const pay = this.payNow();
  
    await expect(pay, "Pay now button should be visible").toBeVisible({ timeout: 20_000 });
    await expect(pay, "Pay now button should be enabled").toBeEnabled({ timeout: 20_000 });
  
    await pay.scrollIntoViewIfNeeded();
  
    // Capture current URL so we can confirm it changed (debug-friendly)
    const beforeUrl = this.page.url();
  
    await Promise.all([
      // Wait for URL to become /complete (no need to wait for full 'load')
      this.page.waitForURL(/\/checkout\/[A-Za-z0-9]+\/complete$/i, { timeout: 90_000, waitUntil: "domcontentloaded" }),
      pay.click(),
    ]);
  
    const afterUrl = this.page.url();
    if (afterUrl === beforeUrl) {
      throw new Error(`Pay now click did not navigate. URL stayed: ${afterUrl}`);
    }
  
    await this.assertOrderConfirmation();
  }

  // --- Confirmation ---
  orderNumber(): Locator {
    return this.page.getByText(/order\s+r\d+/i);
  }

  successMessage(): Locator {
    return this.page.getByText(/your order is confirmed/i);
  }

  async assertOrderConfirmation() {
    // Ensure we really are on the completion page
    await expect(this.page, "Should be on checkout complete page").toHaveURL(
      /\/checkout\/[A-Za-z0-9]+\/complete$/i,
      { timeout: 90_000 }
    );
  
    await expect(this.orderNumber(), "Order number should be visible").toBeVisible({ timeout: 30_000 });
    await expect(this.successMessage(), "Success message should be visible").toBeVisible({ timeout: 30_000 });
  }
}
