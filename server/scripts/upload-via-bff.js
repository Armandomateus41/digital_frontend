/*
  Upload demo PDF via BFF so it mirrors the browser flow.
  Usage: node server/scripts/upload-via-bff.js
*/
(async () => {
  const BFF = process.env.BFF_ORIGIN || 'http://localhost:8787'
  const requestId = `bff-upload-${Date.now()}`
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@local.test'
  const adminPass = process.env.DEMO_ADMIN_PASS || 'Admin@123'
  try {
    console.log('REQUEST_ID', requestId)
    // 1) Login via BFF
    const loginRes = await fetch(`${BFF}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': requestId },
      body: JSON.stringify({ identifier: adminEmail, password: adminPass }),
      redirect: 'manual',
    })
    const loginText = await loginRes.text()
    if (!loginRes.ok) {
      console.error('BFF LOGIN FAILED', loginRes.status, loginText)
      process.exit(1)
    }
    const setCookie = loginRes.headers.get('set-cookie') || ''
    if (!setCookie.includes('auth=')) {
      console.error('No auth cookie returned by BFF')
      process.exit(1)
    }

    // 2) Fetch sample PDF
    const pdfUrl = process.env.DEMO_PDF_URL || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    const pdfRes = await fetch(pdfUrl)
    const pdfBuf = Buffer.from(await pdfRes.arrayBuffer())

    // 3) Build multipart and call BFF upload
    const form = new FormData()
    form.set('title', `Contrato Demo BFF ${new Date().toISOString()}`)
    form.set('file', new Blob([pdfBuf], { type: 'application/pdf' }), 'demo.pdf')
    // Inspect content-type with boundary before request
    const probe = new Request('http://localhost/', { method: 'POST', body: form })
    const contentType = probe.headers.get('content-type') || ''
    console.log('BFF REQUEST HEADERS', { 'Content-Type': contentType })
    console.log('BFF FILE META', { filename: 'demo.pdf', mimeType: 'application/pdf', size: pdfBuf.length })
    const upRes = await fetch(`${BFF}/api/admin/documents`, {
      method: 'POST',
      headers: { Cookie: setCookie, 'x-request-id': requestId },
      body: form,
    })
    const upText = await upRes.text()
    console.log('BFF UPLOAD STATUS', upRes.status)
    console.log(upText)
    console.log('REQUEST_ID', requestId)
  } catch (e) {
    console.error('ERROR', e)
    process.exit(1)
  }
})()


