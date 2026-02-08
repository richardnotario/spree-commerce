import { test as base, expect, Page } from "@playwright/test";

type Fixtures = {
  app: { page: Page };
};

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    await use({ page });
  },
});

export { expect };
