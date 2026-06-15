'use client'

export async function renderPdf(html: string, filename: string): Promise<void> {
  // Hidden iframe approach — Steve's HTML never appears in chat UI
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;visibility:hidden;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  doc.open()
  doc.write(html)
  doc.close()

  // Wait for images/fonts to settle
  await new Promise(r => setTimeout(r, 1000))

  try {
    const html2pdf = (await import('html2pdf.js')).default

    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 4,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: false,
          precision: 16,
        },
      })
      .from(doc.body)
      .save()
  } catch (err) {
    console.error('[v0] PDF render failed:', err)
    throw err
  } finally {
    document.body.removeChild(iframe)
  }
}
