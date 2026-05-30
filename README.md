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

Tailwind

This project uses the `@tailwindcss/vite` plugin and imports `src/tailwind-input.css` directly from `src/main.tsx`.

There is no `style.css`/`styles.css` build artifact used by the app.

Encrypting your links

1. Create `private-links.json` locally (do not commit it). You can copy `private-links.json.example`.
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


