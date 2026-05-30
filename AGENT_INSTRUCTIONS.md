Agent instructions (for automated content agents)

Purpose
- This file describes how an agent (or developer) should update the repository content while keeping secrets out of source control.

When updating private links
1. Edit `private-links.json` locally. Do NOT commit it to the repo.
2. Run the encryption script locally to produce `private-links.enc.json`:

```bash
PASSPHRASE="<your-passphrase>" npm run encrypt-links
# or: node scripts/encrypt-links.js --pass "<your-passphrase>"
```

3. Commit only `private-links.enc.json` and push. The passphrase must NOT be written to any file, logs, or code.

Deployment
- The repo contains a GitHub Actions workflow that builds the site and deploys to GitHub Pages on push to `main`.

Security guidance (do NOT store secrets here)
- Never place an actual passphrase or other secrets in this file, repo, or workflow files. Keep passphrases in a secrets manager or a password manager.
- If an automated agent needs to perform encryption, it must obtain the passphrase from a secure secret store that is not part of this repo.

Notes
- This project uses client-side decryption: the encrypted payload is stored in `private-links.enc.json`, fetched by the browser, and decrypted there with the user-supplied passphrase.
- For stronger protections, consider moving to a server-backed solution that requires authenticated access.

