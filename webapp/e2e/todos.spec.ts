import { test, expect } from "@playwright/test";

test.describe("todo list", () => {
  test("shows the todos returned by the backend", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Todos" })).toBeVisible();
    await expect(page.getByRole("listitem").first()).toBeVisible();
    await expect(page.getByText("Sample Todo")).toBeVisible();
  });

  test("shows a loading state while the request is pending", async ({ page }) => {
    await page.route("**/todos", async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    await page.goto("/");

    await expect(page.getByText("Loading...")).toBeVisible();
    await expect(page.getByText("Loading...")).toBeHidden();
  });

  test("renders todos from a mocked API response", async ({ page }) => {
    await page.route("**/todos", route =>
      route.fulfill({
        json: [
          { id: 1, text: "First mocked todo", done: false },
          { id: 2, text: "Second mocked todo", done: true },
        ],
      })
    );
    await page.goto("/");

    await expect(page.getByRole("listitem")).toHaveText([
      "First mocked todo",
      "Second mocked todo",
    ]);
  });
});
