# ezoi.me /admin — Security Model

## What this is

`/admin` is a **static-only** admin console for editing ezoi.me content directly from the
browser. There is **no server and no backend**. Edits are committed to the GitHub repo via the
REST API, which then auto-redeploys GitHub Pages.

## What the login actually protects

The login (`admin` / `ezoi`) is verified **entirely in the browser** using PBKDF2-SHA256. The
password hash lives in `admin.js`, which is publicly fetchable.

> **This is obfuscation, not authentication.** Anyone who can request `/admin/admin.js` can read
> the hash and brute-force the password offline. Do not treat the login as a real gate.

## What IS genuinely protective

1. **Token hygiene.** The GitHub PAT lives only in the current tab's memory and is sent only to
   `api.github.com`. It is cleared on logout, tab close (`pagehide`), and after a 30-min idle
   timeout.
2. **Strict CSP** (in `index.html`): `script-src 'self'`, `connect-src https://api.github.com`,
   `frame-ancestors 'none'`. This blocks injected scripts (e.g. via a compromised dependency) from
   exfiltrating the token to an attacker domain and prevents clickjacking.
3. **Client throttling:** 5 failed attempts → 15-minute lockout (best-effort; trivially bypassed
   by clearing `localStorage`, so it only slows casual guessing).
4. **No username enumeration:** a single generic "Invalid username or password." message.

## Recommended real protection (edge gate)

Because the site sits behind an **APISIX + Varnish** edge (not Cloudflare), add a real gate there:

- **APISIX:** protect the `/admin/` route with the `basic-auth` plugin (or `openid-connect` /
  `cas-auth` / `key-auth`) — see https://apisix.apache.org/docs/apisix/plugins/basic-auth/.
- Or front ezoi.me with **Cloudflare Access** (Zero Trust) and require Google/OTP login for
  `/admin/*`.
- If you keep it static-only: use a **strong, unique password** (replace the hash in `admin.js`
  with `pbkdf2(sha256, password, salt, 150000)`), a **fine-grained, repo-scoped PAT** that can
  only write this one repo, and rotate the PAT regularly.

## Changing the password

1. Compute `base64( pbkdf2_hmac_sha256(password, <salt>, 150000, 32) )`.
2. Replace `saltB64` / `hashB64` in `admin.js` `CONFIG`.

## Reporting

If you find a real issue, rotate the GitHub token first, then fix.
