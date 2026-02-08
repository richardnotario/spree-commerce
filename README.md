# Playwright E2E – Spree Commerce Demo (Coding Challenge)

End-to-end UI automation for the **Spree Commerce demo store** using **Playwright + TypeScript**.

This project was created as part of a **QA / Test Automation coding challenge**, focusing on:
- clean architecture
- reliability over speed
- realistic end-to-end coverage
- CI-readiness

---

## 🚀 Scenarios Covered

The automated suite validates the **happy-path checkout flow**:

1. Navigate to Spree Commerce demo site
2. Register a new user account
3. Log out and log back in with the new user
4. Browse products and open a product detail page (PDP)
5. Add product to cart
6. Verify cart contents (product name, quantity, price)
7. Checkout flow:
   - Address
   - Delivery (verify options and prices)
   - Payment (Stripe Card test flow)
8. Place order
9. Verify order confirmation (order number + success message)

Assertions are placed at every critical step to ensure stability and correctness.

---

## 🧱 Tech Stack

- **Playwright**
- **TypeScript**
- **Page Object Model (POM)**
- **GitHub Actions (CI)**

---

## 📦 Requirements

- Node.js **18+** (recommended: Node 20)
- npm

---

## ⚙️ Setup

Install dependencies:

```bash
npm ci
```

Install Playwright browsers:

```bash
npx playwright install
```

---

## ▶️ Running Tests

Run all tests:

```bash
npm run test:e2e
```

Run the main checkout spec only:

```bash
npx playwright test tests/e2e/spree.e2e.checkout.spec.ts
```

Run headed (debug mode):

```bash
npx playwright test --headed
```

Open Playwright HTML report:

```bash
npm run report
```

---

## 🔧 Configuration

The suite uses a configurable `BASE_URL`.

Default:
```
https://demo.spreecommerce.org
```

Override via environment variable:

```bash
export BASE_URL="https://demo.spreecommerce.org"
```

---

## 📊 Reports & Artifacts

Generated locally or in CI:

- **HTML Report:** `playwright-report/`
- **JUnit Report:** `test-results/junit.xml`
- **Screenshots / Videos / Traces:** `test-results/`

Artifacts are uploaded automatically in CI for failed runs.

---

## 📁 Project Structure

```
src/
  core/
    fixtures.ts
  pages/
    home.page.ts
    auth.page.ts
    products.page.ts
    productDetail.page.ts
    cart.page.ts
    checkout.page.ts
  utils/
    testData.ts

tests/
  e2e/
    spree.e2e.checkout.spec.ts

.github/
  workflows/
    e2e.yml

playwright.config.ts
README.md
```

---

## 🤖 CI – GitHub Actions

The project includes a GitHub Actions workflow that runs Playwright tests on:

- Push to `main` / `master`
- Pull requests
- Manual trigger (`workflow_dispatch`)

CI uploads:
- Playwright HTML report
- Screenshots, videos, traces, and JUnit results

---

## 📝 Design Notes

- Page Objects encapsulate UI behavior and selectors
- Test data is centralized in `testData.ts`
- Deterministic waits (URL transitions, iframe readiness) are used to reduce flakiness
- Stripe payment iframe handling is hardened against intermittent rendering behavior
- The test favors **stability and clarity** over aggressive parallelization

---

## 🧪 Test Card Details (Stripe Demo)

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3-digit number
```

---

## ✅ Summary

This repository demonstrates:
- practical end-to-end automation
- real-world flakiness handling (iframes, async payment)
- clean, maintainable test architecture
- CI-ready execution

