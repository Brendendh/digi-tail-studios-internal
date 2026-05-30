# Private Links site (React + Vite)

This repository is a lightweight React + Vite site intended to be hosted on GitHub Pages. It implements a client-side password gate that decrypts an encrypted `public/private-links.enc.json` file in the browser.

High-level workflow
- Keep a local `private-links.json` (not committed).
- Run the encryption script locally with your passphrase to generate `public/private-links.enc.json` and commit that encrypted file to the public repo.
- The website fetches `private-links.enc.json` from the app base URL and decrypts it client-side when the user enters the correct passphrase.

Security notes (important)
- Do NOT commit unencrypted secrets to the public repo. `private-links.json` is included as an example only.
- The passphrase is never stored in the repo. You MUST keep it secret (for example, in a password manager).
- Client-side encryption helps protect casual viewers, but a truly private server-side solution is needed for high-security requirements. GitHub Pages is static and will expose any content that ends up in the final built assets.

Local dev

1. Install dependencies (uses npm):

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
# open http://localhost:5173
```
Encrypting your links

1. Create `private-links.json` locally (do not commit it). You can copy `private-links.json.example`.
   - Use grouped structure: each group has a `title`, optional `icon`, and an `items` array of links.
   - Each link supports `url` (required), plus optional `title`, `notes`, and `icon`.
   - The encryption script validates this schema and will fail fast on invalid payloads.

Example structure:

```json
{
  "groups": [
    {
      "title": "Work",
      "icon": "/icons/work-group.svg",
      "items": [
        {
          "title": "Example Private Link",
          "url": "https://example.com/login",
          "notes": "Description or notes about this link.",
          "icon": "/icons/work-link.svg"
        }
      ]
    }
  ]
}
```
2. Encrypt with a passphrase (do not put passphrase in the repo):

```bash
# Provide passphrase with environment variable (recommended)
PASSPHRASE="YourSecretPassphrase" npm run encrypt-links

# or use the script flag (beware shell history)
node scripts/encrypt-links.js --pass "YourSecretPassphrase"
```

3. Commit `public/private-links.enc.json` (the encrypted file) to the public repo. The encrypted file is safe to store in the public repo.

Deploy to GitHub Pages

Option A — Local deploy using gh-pages (quick)

1. Ensure `homepage` is configured in package.json if you want a custom path (optional).
2. Build and deploy locally:

```bash
npm run deploy
```

Option B — GitHub Actions (recommended for automatic deploys)

This repo includes a GitHub Actions workflow that builds the site and publishes to GitHub Pages when you push to `main`.

Notes about secrets and automation
- The encryption passphrase must remain secret. This README does not and should not contain the passphrase. The repo only stores the encrypted payload.


