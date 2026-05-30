#!/usr/bin/env node
/*
  Usage:
    - Put your unencrypted links in `private-links.json` (see example file)
    - Run: PASSPHRASE=yourPassword node scripts/encrypt-links.js
      or: node scripts/encrypt-links.js --pass "yourPassword"

  This script uses PBKDF2 (SHA-256) and AES-256-GCM. It outputs
  `public/private-links.enc.json` which contains base64-encoded salt, iv, ciphertext and tag.

  IMPORTANT: Do NOT commit unencrypted `private-links.json` to your public repo.
*/

const fs = require('node:fs')
const crypto = require('node:crypto')
const path = require('node:path')

const inFile = path.resolve(process.cwd(), 'private-links.json')
const outFile = path.resolve(process.cwd(), 'public', 'private-links.enc.json')

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

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value) {
  return value === undefined || typeof value === 'string'
}

function isRequiredString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateLinksPayload(value) {
  if (!isRecord(value)) return 'Root must be an object.'
  if (!Array.isArray(value.groups)) return '"groups" must be an array.'

  for (let groupIndex = 0; groupIndex < value.groups.length; groupIndex++) {
    const group = value.groups[groupIndex]
    if (!isRecord(group)) return `groups[${groupIndex}] must be an object.`
    if (!isRequiredString(group.title)) return `groups[${groupIndex}].title must be a non-empty string.`
    if (!isOptionalString(group.icon)) return `groups[${groupIndex}].icon must be a string.`
    if (!Array.isArray(group.items)) return `groups[${groupIndex}].items must be an array.`

    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
      const item = group.items[itemIndex]
      if (!isRecord(item)) return `groups[${groupIndex}].items[${itemIndex}] must be an object.`
      if (!isRequiredString(item.url)) return `groups[${groupIndex}].items[${itemIndex}].url must be a non-empty string.`
      if (!isOptionalString(item.title)) return `groups[${groupIndex}].items[${itemIndex}].title must be a string.`
      if (!isOptionalString(item.notes)) return `groups[${groupIndex}].items[${itemIndex}].notes must be a string.`
      if (!isOptionalString(item.icon)) return `groups[${groupIndex}].items[${itemIndex}].icon must be a string.`
    }
  }

  return null
}

async function run() {
  const pass = getPassFromArgs()
  if (!pass) {
    console.error('Passphrase not provided. Set PASSPHRASE env or use --pass "..."')
    process.exit(1)
  }

  const plainText = fs.readFileSync(inFile, 'utf8')
  let payload
  try {
    payload = JSON.parse(plainText)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`private-links.json is not valid JSON: ${message}`)
    process.exit(1)
  }

  const validationError = validateLinksPayload(payload)
  if (validationError) {
    console.error(`private-links.json schema error: ${validationError}`)
    process.exit(1)
  }

  const plain = JSON.stringify(payload)

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

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8')
  console.log('Wrote', outFile, "-- add this encrypted file to your repo. Keep the passphrase private.")
}

run().catch((err) => { console.error(err); process.exit(1) })

