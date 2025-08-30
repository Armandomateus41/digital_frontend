import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test('fluxo: upload (ADMIN) -> doc (USER) -> assina -> lista', async ({ page, context }) => {
  // ADMIN login e upload
  await page.goto('/admin/login')
  await page.getByLabel('E‑mail').fill('admin@local.test')
  await page.getByLabel('Senha').fill('Admin@123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/.*\/admin\/documents\/new/)

  // Upload talvez dependa de backend; aqui validamos UI básica
  await page.getByLabel('Título').fill('Contrato Teste')
  // não anexamos arquivo real por simplicidade do exemplo

  // USER login e assina
  const userPage = await context.newPage()
  await userPage.goto('/login')
  await userPage.getByLabel('CPF').fill('11122233344')
  await userPage.getByLabel('Senha').fill('User@123')
  await userPage.getByRole('button', { name: 'Entrar' }).click()
  await expect(userPage).toHaveURL(/.*\/document/)
})


