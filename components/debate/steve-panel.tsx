'use client'
import { useState, useRef, useEffect } from 'react'

type SteveState = 'idle' | 'generating' | 'done' | 'error'

export function StevePanel({
  isVisible,
  approvedResume,
  chosenTemplate,
  photoBase64,
  onPdfGenerated,
}: {
  isVisible: boolean
  approvedResume: any
  chosenTemplate: string
  photoBase64?: string
  onPdfGenerated: (htmlContent: string) => void
}) {
  const [steveState, setSteveState] = useState<SteveState>('idle')
  const [progress, setProgress] = useState(0)
  const [htmlContent, setHtmlContent] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [progress])

  async function generatePdf() {
    setSteveState('generating')
    setProgress(0)
    setError('')

    try {
      const response = await fetch('/api/agents/steve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedResume, chosenTemplate, photoBase64 }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let allContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') break

          try {
            const event = JSON.parse(data)

            if (event.type === 'steve_token') {
              allContent += event.token
              setProgress(prev => Math.min(prev + 0.5, 95))
            }

            if (event.type === 'steve_done') {
              setHtmlContent(event.htmlContent)
              setProgress(100)
              setSteveState('done')
              onPdfGenerated(event.htmlContent)
            }

            if (event.type === 'steve_error') {
              setError(event.error)
              setSteveState('error')
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSteveState('error')
    }
  }

  function downloadPdf() {
    if (!htmlContent) return

    // Create a blob from HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'resume.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!isVisible) return null

  return (
    <div className="border-t border-[#38BDF830] mt-4 pt-4">
      {/* Steve Header */}
      <div className="flex items-center gap-3 mb-4 px-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
          style={{ background: '#38BDF815', border: '1px solid #38BDF8', color: '#38BDF8' }}
        >
          S
        </div>
        <div className="flex-1">
          <div className="text-xs font-mono" style={{ color: '#38BDF8' }}>STEVE — PDF ARCHITECT</div>
          <div className="text-xs font-mono text-muted-foreground">Print-ready PDF · High quality · Auto-download</div>
        </div>
        {steveState === 'idle' && (
          <button
            onClick={generatePdf}
            className="text-xs font-mono px-3 py-1.5 rounded-md transition-all"
            style={{
              background: '#38BDF820',
              border: '1px solid #38BDF8',
              color: '#38BDF8',
            }}
          >
            📄 Generate PDF
          </button>
        )}
        {steveState === 'done' && (
          <button
            onClick={downloadPdf}
            className="text-xs font-mono px-3 py-1.5 rounded-md transition-all"
            style={{
              background: '#22C55E20',
              border: '1px solid #22C55E',
              color: '#22C55E',
            }}
          >
            ↓ Download
          </button>
        )}
      </div>

      {/* Progress */}
      {steveState === 'generating' && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">Rendering PDF...</span>
            <span className="text-xs font-mono text-foreground ml-auto">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {steveState === 'error' && (
        <div className="mx-4 mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
          <div className="text-xs font-mono text-red-500">Error: {error}</div>
          <button
            onClick={generatePdf}
            className="text-xs font-mono px-2 py-1 mt-2 rounded border border-red-500/30 hover:border-red-500 text-red-500 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Done */}
      {steveState === 'done' && (
        <div className="mx-4 p-3 rounded-lg border border-blue-400/30 bg-blue-400/5">
          <div className="text-xs font-mono text-blue-400">
            ✓ PDF ready. Download or review above.
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
