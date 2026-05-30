import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { parseLinksPayload } from '../lib/links-schema'
import type { LinksPayload } from '../lib/links-schema'

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

async function decryptPayload(password: string, encObj: EncObject): Promise<unknown> {
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

export default function PasswordGate({ onDecrypt }: Readonly<{ onDecrypt: (data: LinksPayload) => void }>) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tryDecrypt = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // @ts-ignore
      const encUrl = `${import.meta.env.BASE_URL}private-links.enc.json`
      const res = await fetch(encUrl, { cache: 'no-store' })
      if (!res.ok) throw new Error('Encrypted links file not found. (Have you added public/private-links.enc.json?)')
      const encObj = (await res.json()) as EncObject
      const decrypted = parseLinksPayload(await decryptPayload(password, encObj))
      onDecrypt(decrypted)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        if (err.name === 'OperationError' || err.message.includes('operation-specific reason')) {
          setError('Incorrect password. Please try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to decrypt — check password or encrypted file.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="animate-[fade-up_500ms_ease-out]">
      <CardHeader>
        <CardTitle>Enter Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center" onSubmit={tryDecrypt}>
          <Input
            className="flex-1"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="password"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Decrypting...' : 'Unlock'}
          </Button>
        </form>
        {error && <div className="mt-3 rounded-md border border-red-300/70 bg-red-100/55 px-3 py-2 text-sm text-red-700">{error}</div>}
      </CardContent>
    </Card>
  )
}



