import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test('login USER redireciona para /document', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('CPF').fill('11122233344')
  await page.getByLabel('Senha').fill('User@123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/.*\/document/)
})


