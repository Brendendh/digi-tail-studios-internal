import React from 'react'

type LinkItem = { title?: string; url: string; notes?: string }
type LinksPayload = { items?: LinkItem[] } | null

export default function LinksView({ links }: Readonly<{ links: LinksPayload }>) {
  const items = links?.items || []

  return (
    <div>
      <div className="mb-4 rounded-lg border border-[#DAD2CA] bg-white/60 p-4">
        <h2 className="text-lg font-semibold">Private Links</h2>
        <p className="mt-1 text-sm text-black/60">These were decrypted client-side — keep secrets safe.</p>
      </div>

      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="rounded-md border border-[#DAD2CA] bg-white/60 p-3">No links found in decrypted payload.</li>
        )}
        {items.map((it, idx) => (
          <li key={idx} className="rounded-md bg-gradient-to-r from-[#D2FBFA]/60 to-[#B9CCCC]/10 p-3">
            <a href={it.url} target="_blank" rel="noreferrer" className="font-semibold text-[#1D0D12]">
              {it.title || it.url}
            </a>
            {it.notes && <div className="opacity-80">{it.notes}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}


