import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test('login ADMIN vai para /admin/documents/new', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('E‑mail').fill('admin@local.test')
  await page.getByLabel('Senha').fill('Admin@123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/.*\/admin\/documents\/new/)
})


