import React, { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import LinksView from './components/LinksView'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import type { LinksPayload } from './lib/links-schema'

export default function App() {
  const [links, setLinks] = useState<LinksPayload | null>(null)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(210,251,250,0.65),var(--flat-white))] text-(--long-black)">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
        <Card className="animate-[fade-in_500ms_ease-out] overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-(--winter-coat)/70 blur-2xl animate-[float_8s_ease-in-out_infinite]" />
          <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-(--extra-foam) bg-white/70 p-1">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-3xl">Private Links</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <main className="animate-[fade-up_500ms_ease-out]">
              {links ? <LinksView links={links} /> : <PasswordGate onDecrypt={(decrypted) => setLinks(decrypted)} />}
            </main>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
