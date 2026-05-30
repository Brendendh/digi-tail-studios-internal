import React, { useState } from 'react'
import PasswordGate from './components/PasswordGate'
import LinksView from './components/LinksView'

type LinkItem = { title?: string; url: string; notes?: string }
type LinksPayload = { items?: LinkItem[] } | null

export default function App() {
  const [links, setLinks] = useState<LinksPayload>(null)

  return (
    <div className="min-h-screen bg-[#E5DABF] text-[#1D0D12]">
      <header className="mx-auto w-full max-w-3xl px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Private Links</h1>
        <p className="mt-2 text-sm text-black/70">Enter your password to decrypt private links (client-side)</p>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-8">
        {links ? (
          <LinksView links={links} />
        ) : (
          <PasswordGate onDecrypt={(decrypted) => setLinks(decrypted)} />
        )}
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10 text-xs text-black/60">
        <small>Built for GitHub Pages — client-side decryption model</small>
      </footer>
    </div>
  )
}

