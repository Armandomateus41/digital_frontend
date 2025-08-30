/*
  Usage: node server/scripts/upload-demo.js
  Logs status and response of /v1/admin/documents
*/
(async () => {
  const BASE = process.env.BACKEND_BASE_URL || 'https://digisign-flow-backend-42cn.onrender.com'
  const API = `${BASE}/v1`
  const requestId = `upload-${Date.now()}`
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@local.test'
  const adminPass = process.env.DEMO_ADMIN_PASS || 'Admin@123'

  try {
    // 1) Login admin
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': requestId },
      body: JSON.stringify({ identifier: adminEmail, password: adminPass }),
    })
    const loginText = await loginRes.text()
    if (!loginRes.ok) {
      console.error('LOGIN FAILED', loginRes.status, loginText)
      process.exit(1)
    }
    const { accessToken } = JSON.parse(loginText)

    // 2) Fetch sample PDF
    const pdfUrl = process.env.DEMO_PDF_URL || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    const pdfRes = await fetch(pdfUrl)
    const pdfBuf = Buffer.from(await pdfRes.arrayBuffer())

    // 3) Build multipart form
    const form = new FormData()
    form.set('title', `Contrato Demo ${new Date().toISOString()}`)
    form.set('file', new Blob([pdfBuf], { type: 'application/pdf' }), 'demo.pdf')

    // 4) Upload
    // tenta com /v1 primeiro e fallback sem versão
    let upRes = await fetch(`${API}/admin/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'x-request-id': requestId },
      body: form,
    })
    if (upRes.status === 404) {
      upRes = await fetch(`${BASE}/admin/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'x-request-id': requestId },
        body: form,
      })
    }
    const upText = await upRes.text()
    console.log('UPLOAD STATUS', upRes.status)
    console.log(upText)
  } catch (e) {
    console.error('ERROR', e)
    process.exit(1)
  }
})()


