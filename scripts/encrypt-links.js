#!/usr/bin/env node
/*
  Usage:
    - Put your unencrypted links in `private-links.json` (see example file)
    - Run: PASSPHRASE=yourPassword node scripts/encrypt-links.js
      or: node scripts/encrypt-links.js --pass "yourPassword"

  This script uses PBKDF2 (SHA-256) and AES-256-GCM. It outputs
  `private-links.enc.json` which contains base64-encoded salt, iv, ciphertext and tag.

  IMPORTANT: Do NOT commit unencrypted `private-links.json` to your public repo.
*/

const fs = require('node:fs')
const crypto = require('node:crypto')
const path = require('node:path')

const inFile = path.resolve(process.cwd(), 'private-links.json')
const outFile = path.resolve(process.cwd(), 'private-links.enc.json')

if (!fs.existsSync(inFile)) {
  console.error('Missing private-links.json. Create it from private-links.json.example and DO NOT commit it.')
  process.exit(1)
}

function getPassFromArgs() {
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pass' && argv[i + 1]) return argv[i + 1]
  }
  if (process.env.PASSPHRASE) return process.env.PASSPHRASE
  return null
}

async function run() {
  const pass = getPassFromArgs()
  if (!pass) {
    console.error('Passphrase not provided. Set PASSPHRASE env or use --pass "..."')
    process.exit(1)
  }

  const plain = fs.readFileSync(inFile, 'utf8')

  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const iterations = 150000
  const key = crypto.pbkdf2Sync(pass, salt, iterations, 32, 'sha256')

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const out = {
    version: 1,
    iterations,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: tag.toString('base64')
  }

  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8')
  console.log('Wrote', outFile, "-- add this encrypted file to your repo. Keep the passphrase private.")
}

run().catch((err) => { console.error(err); process.exit(1) })

