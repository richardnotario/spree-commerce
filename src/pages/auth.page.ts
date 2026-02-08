import { Page, Locator, expect } from "@playwright/test";
import { FlashBannerComponent } from "./components/flashBanner.component";

export class AuthPage {
  constructor(private page: Page) {}

  private loginFrame(): Locator {
    return this.page.locator("turbo-frame#login");
  }

  email(): Locator {
    return this.loginFrame().getByLabel(/email/i);
  }

  password(): Locator {
    return this.loginFrame().getByLabel(/^password$/i);
  }

  rememberMeCheckbox(): Locator {
    return this.loginFrame().getByLabel(/remember me/i);
  }

  loginButton(): Locator {
    return this.loginFrame().getByRole("button", { name: /^login$/i });
  }

  signUpLink(): Locator {
    return this.loginFrame().getByRole("link", { name: /sign up/i });
  }

  forgotPasswordLink(): Locator {
    return this.loginFrame().getByRole("link", { name: /forgot password/i });
  }

  logoutLink(): Locator {
    return this.page.getByRole("link", { name: /log out|logout/i }).first();
  }

  // --- Assertions
  async assertLoginFormReady() {
    await expect(this.email(), "Email field should be visible").toBeVisible({ timeout: 15_000 });
    await expect(this.password(), "Password field should be visible").toBeVisible({ timeout: 15_000 });

    await expect(this.rememberMeCheckbox(), "Remember me checkbox should be visible").toBeVisible();
    await expect(this.loginButton(), "Login button should be visible").toBeVisible();
    await expect(this.loginButton(), "Login button should be enabled").toBeEnabled();

    await expect(this.signUpLink(), "Sign Up link should be visible").toBeVisible();
    await expect(this.forgotPasswordLink(), "Forgot password link should be visible").toBeVisible();
  }

  async goToSignUpFromPanel() {
    await this.assertLoginFormReady();
    await this.signUpLink().click();
  
    const frame = this.loginFrame();
  
    await expect(
      frame.getByRole("heading", { name: /^sign up$/i }),
      "Sign Up heading should appear in account panel"
    ).toBeVisible({ timeout: 15_000 });
  
    await expect(
      frame.getByLabel(/^email$/i),
      "Sign Up email should be visible"
    ).toBeVisible({ timeout: 15_000 });
  
    await expect(
      frame.getByLabel(/^password$/i),
      "Sign Up password should be visible"
    ).toBeVisible({ timeout: 15_000 });
  
    await expect(
      frame.getByLabel(/^password confirmation$/i),
      "Sign Up password confirmation should be visible"
    ).toBeVisible({ timeout: 15_000 });
  
    await expect(
      frame.getByRole("button", { name: /^sign up$/i }),
      "Sign Up submit button should be visible"
    ).toBeVisible({ timeout: 15_000 });
  }

  async login(email: string, password: string) {
    await this.assertLoginFormReady();
    await this.email().fill(email);
    await this.password().fill(password);
    await this.loginButton().click();

    const flash = new FlashBannerComponent(this.page);
    await flash.expectNotice(/signed in successfully\./i);
  }

  async assertLoggedIn() {
    await expect(this.logoutLink(), "Logout should be visible for authenticated user").toBeVisible({
      timeout: 15_000,
    });
  }

  async signUp(email: string, password: string) {
    const frame = this.loginFrame();
  
    // Ensure sign-up form is visible (call goToSignUpFromPanel first)
    await expect(frame.getByRole("heading", { name: /^sign up$/i })).toBeVisible({ timeout: 15_000 });
  
    await frame.getByLabel(/^email$/i).fill(email);
    await frame.getByLabel(/^password$/i).fill(password);
    await frame.getByLabel(/^password confirmation$/i).fill(password);
  
    await frame.getByRole("button", { name: /^sign up$/i }).click();
  }

  async assertSignUpSuccess() {
    // After submit, it redirects to home and shows a notice flash message.
    const flash = new FlashBannerComponent(this.page);
    await flash.expectNotice(/welcome! you have signed up successfully\./i);
  }

  async signUpAndAssertSuccess(email: string, password: string) {
    await this.signUp(email, password);
    await this.assertSignUpSuccess();
  }

  async logoutAndAssert() {
    const flash = new FlashBannerComponent(this.page);

    await expect(this.logoutLink(), "Log out link should be visible").toBeVisible({ timeout: 15_000 });
    await this.logoutLink().click();

    await flash.expectNotice(/signed out successfully\./i);
  }

  async logoutIfNeeded() {
    const logout = this.page.getByRole("link", { name: /^log out$/i }).first();
  
    if ((await logout.count()) === 0) return;
  
    await expect(logout, "Log out link should be visible").toBeVisible({ timeout: 15_000 });
    await logout.scrollIntoViewIfNeeded();
    await logout.click({ force: true });
  
    const flash = new FlashBannerComponent(this.page);
    await flash.expectNotice(/signed out successfully\./i);
  }
}
