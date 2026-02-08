import { test, expect } from "../../src/core/fixtures";

import { HomePage } from "../../src/pages/home.page";
import { HeaderComponent } from "../../src/pages/header.component";
import { AuthPage } from "../../src/pages/auth.page";
import { AccountPage } from "../../src/pages/account.page";
import { ProductsPage } from "../../src/pages/products.page";
import { ProductDetailPage } from "../../src/pages/productDetail.page";
import { CartPage } from "../../src/pages/cart.page";
import { CheckoutPage } from "../../src/pages/checkout.page";

import {
  defaultPassword,
  uniqueEmail,
  demoShippingAddress,
  demoCardDetails,
} from "../../src/utils/testData";

test.describe("E2E · Checkout flow", () => {
  test("registers a user, adds a product to cart, and completes checkout", async ({ app }) => {
    test.setTimeout(120_000);

    const { page } = app;

    // Page objects / components
    const home = new HomePage(page);
    const header = new HeaderComponent(page);
    const auth = new AuthPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    const evidence = async (name: string) => {
      await page.screenshot({
        path: `test-results/evidence/${name}.png`,
        fullPage: true,
      });
    };

    // Test user
    const email = uniqueEmail("spree");
    const password = defaultPassword();
    test.info().annotations.push({ type: "e2e_user", description: email });
    console.log(`[e2e] signing up user: ${email}`);

    await test.step("Open demo storefront", async () => {
      await page.goto("/");
      await expect(page).toHaveURL(/demo\.spreecommerce\.org/i);
      await home.assertLoaded();
    });

    await test.step("Register a new customer account", async () => {
      await header.openAccountPanelExpectLogin();
      await auth.goToSignUpFromPanel();
      await auth.signUpAndAssertSuccess(email, password);
      await evidence("01-signup-success");
    });

    await test.step("Re-login with newly created user", async () => {
      // user is typically auto-logged-in after signup; we explicitly validate logout/login works
      await header.openAccountPageExpectAccount();
      await new AccountPage(page).logoutAndAssert();

      await header.openAccountPanelExpectLogin();
      await auth.login(email, password);
      await evidence("02-login-success");
    });

    const product = await test.step("Select a product", async () => {
      const products = new ProductsPage(page);
      await products.goToAllProducts();
      const picked = await products.openFirstProduct();
      await evidence("03-product-detail");
      return picked;
    });

    await test.step("Add product to cart", async () => {
      const pdp = new ProductDetailPage(page);
      await pdp.addToCartAndWaitForMiniCart(product.name);
      await evidence("04-added-to-cart");
    });

    await test.step("Validate cart contents", async () => {
      await cart.goToCart();
      await cart.assertItemPresentByName(product.name);
      await cart.assertQuantityForProduct(product.name, 1);
      await cart.assertPriceVisibleForProduct(product.name);
      await evidence("05-cart-verified");
    });

    await test.step("Complete checkout (address → delivery → payment → place order)", async () => {
      // Click checkout on cart and wait for checkout to start
      const checkoutBtn = page.getByRole("link", { name: /^checkout$/i }).first();
      await expect(checkoutBtn, "Checkout button should be visible on cart").toBeVisible({ timeout: 15_000 });

      await Promise.all([
        page.waitForURL(/\/checkout\/[A-Za-z0-9]+\/address$/i, { timeout: 20_000 }),
        checkoutBtn.click(),
      ]);

      await checkout.assertOnCheckout();

      // Address
      await checkout.fillShippingAddress(demoShippingAddress());
      await evidence("06-checkout-address-filled");
      await checkout.continueToDelivery();

      // Delivery
      await checkout.assertDeliveryOptionsAndPrices();
      await checkout.selectShippingMethod("test Shipping");
      await evidence("07-checkout-delivery-selected");
      await checkout.continueToPayment();

      // Payment
      await checkout.selectPaymentMethodCard();
      await checkout.enterCard(demoCardDetails());
      await evidence("08-checkout-payment-entered");

      // Place order and confirm
      await checkout.payAndConfirmOrder();
      await evidence("09-order-complete");
    });

    await test.step("Verify order confirmation", async () => {
      await checkout.assertOrderConfirmation();
    });
  });
});
