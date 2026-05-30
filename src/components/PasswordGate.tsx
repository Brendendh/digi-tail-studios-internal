import React, { useState } from 'react'

interface EncObject {
  version?: number
  iterations?: number
  salt: string
  iv: string
  ciphertext: string
  tag: string
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64)
  const len = bin.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i)
  return buf
}

async function deriveKey(password: string, saltB64: string, iterations = 150000) {
  const encoder = new TextEncoder()
  const passKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  // Ensure we pass an ArrayBuffer (cast to satisfy TS lib differences)
  const salt = b64ToBuf(saltB64).buffer as unknown as ArrayBuffer
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' } as Pbkdf2Params, passKey, { name: 'AES-GCM', length: 256 } as AesKeyGenParams, false, ['decrypt'])
}

async function decryptPayload(password: string, encObj: EncObject) {
  const key = await deriveKey(password, encObj.salt, encObj.iterations || 150000)
  const iv = b64ToBuf(encObj.iv)
  const cipherBuf = b64ToBuf(encObj.ciphertext)
  const tagBuf = b64ToBuf(encObj.tag)

  const combined = new Uint8Array(cipherBuf.length + tagBuf.length)
  combined.set(cipherBuf, 0)
  combined.set(tagBuf, cipherBuf.length)

  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv } as AesGcmParams, key, combined.buffer as unknown as ArrayBuffer)
  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(plainBuf))
}

export default function PasswordGate({ onDecrypt }: Readonly<{ onDecrypt: (data: any) => void }>) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tryDecrypt = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const encUrl = `${import.meta.env.BASE_URL}private-links.enc.json`
      const res = await fetch(encUrl, { cache: 'no-store' })
      if (!res.ok) throw new Error('Encrypted links file not found. (Have you added public/private-links.enc.json?)')
      const encObj = (await res.json()) as EncObject
      const decrypted = await decryptPayload(password, encObj)
      onDecrypt(decrypted)
    } catch (err) {
      console.error(err)
      setError('Failed to decrypt — check password or encrypted file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-[#DAD2CA] bg-white/60 p-6 shadow-sm">
      <form className="flex gap-3 items-center" onSubmit={tryDecrypt}>
        <input
          className="flex-1 rounded-md border border-[#DAD2CA] bg-[#E5DABF] px-3 py-2 text-[#1D0D12]"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="password"
        />
        <button
          className="rounded-md bg-[#B9CCCC] px-4 py-2 font-semibold text-[#1D0D12] disabled:opacity-60"
          disabled={loading}
          onClick={() => tryDecrypt()}
        >
          {loading ? 'Decrypting...' : 'Unlock'}
        </button>
      </form>
      {error && <div className="text-red-700 mt-3">{error}</div>}
      <p className="mt-3 text-sm text-black/60">
        The encrypted file <code>public/private-links.enc.json</code> is fetched and decrypted client-side.
      </p>
    </div>
  )
}



