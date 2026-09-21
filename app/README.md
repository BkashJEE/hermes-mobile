# Hermes Mobile local integration

A mobile interface connected to existing Hermes API gateways on this computer. Includes a desktop preview and a paired, full-screen phone web app. This is not a native Android/iOS release.

## Run

Requires Node 22.12+ and an existing Hermes installation whose API gateways are enabled.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4186** on this computer. The process binds only to loopback. The run commands do not change Hermes, systemd, Tailscale, or provider configuration. The preview includes an iPhone/Pixel device picker and simulated keyboard.

## Integration

- The server discovers `~/.hermes` and its ordinary `profiles/` directories. It uses each profile's connected `gateway_state.json` API listener and `API_SERVER_KEY` from that profile's `.env`.
- Only literal loopback HTTP listeners are accepted. Requests cannot specify an arbitrary upstream URL. Keys stay server-side and never enter browser storage, assets or response JSON.
- Read-only capability discovery determines availability. A running messaging gateway without its API listener is shown as offline.
- New messages use the existing Runs API, stable idempotency keys and profile-specific sessions. Existing conversation history can also be opened.
- State is polled. Final responses appear when Hermes finishes; this version does not stream tokens.
- **Track in Work** explicitly marks a sent message as a task in this app's local ledger. Ordinary chat is not added to Work. This is not Agent Dock Kanban synchronization.
- Stop shows **Stopping** until the backend confirms a terminal state. Approval actions accept only the currently pending exact request ID, with **Allow once** or **Decline**; broad grants are not exposed.
- Switching profiles preserves each profile's selected session and draft. A lost acceptance can be recovered using its exact request identity, without automatically launching another run.

Run metadata and output are kept in `~/.local/state/hermes-mobile/runs.json` (0600, in a 0700 directory). Conversations remain in Hermes. Drafts and selected session IDs use this browser tab's session storage. The page includes personal conversations; use a trusted browser profile. No runtime analytics or remote fonts.

The bridge rejects foreign origins, nonlocal Host headers, requests without the app header, and all routes outside its explicit API. These checks protect a loopback preview; they are not remote authentication. **Do not expose the Vite process or this bridge through a tunnel.** Use only the separate authenticated phone server described below.

## Validation

```sh
npm test
npm run build
npm run check:runtime
```

Unit/integration tests use isolated fixture state and never invoke a model. They cover upstream restrictions, credential redaction, repeat and concurrent submissions, lost-acceptance recovery, persistence, exact approvals, stop semantics, same-session contention, outages and the HTTP origin boundary.

A real local smoke check on September 20, 2026 discovered five connected gateways, sent a no-tools connection prompt, received the expected response, recovered after reload, and confirmed context continuity on a second turn. Only the default profile was sent test messages. Approval and stop mutations were tested against fixtures, not against live work.

Browser verification covered both device presets, search, offline messaging disablement, session history, profile draft preservation, the Work result, run detail, and keyboard/header positioning. See `design-qa.md` for visual scope and limitations.

## Scope

- Full-screen phone web app and desktop preview; no physical-device or native build verification.
- No push notifications, voice, attachments, token streaming or Dock task synchronization.
- No change to existing agent permissions, service configuration or running jobs.
- `npm run build` also emits the starter's static Sites artifacts, but those static artifacts **cannot** run this local bridge. They are not a deployable live-Hermes app.

## Private phone access

The phone server serves **built assets** on loopback port 4187. The desktop preview stays on loopback port 4186. Both share one bridge process and one durable run ledger; do not run `dev` and `start` simultaneously.

1. Build with `npm run build`.
2. Set `HERMES_PHONE_ORIGIN` to your exact Tailscale HTTPS origin (for example `https://your-host.your-tailnet.ts.net:8443`). Alternatively store `{ "origin": "https://your-host.your-tailnet.ts.net:8443" }` in `~/.local/state/hermes-mobile/phone.json` with mode 0600.
3. Start `npm start` (or `npm run dev` while developing; rebuild after phone UI edits).
4. Inspect `tailscale serve status` before changing existing routes. With an unused port, use `tailscale serve --bg --https=8443 http://127.0.0.1:4187`. Use Tailscale Serve for private tailnet access; do not enable Funnel.
5. Connect the phone to the same tailnet and open the configured HTTPS address. In the desktop preview, open Settings → Generate pairing code, then enter that code on the phone.

Pairing codes expire after ten minutes, work once, and are burned after eight failed attempts. Device sessions expire after thirty days. Only hashes are saved in the private state directory. The browser receives an HttpOnly, Secure, SameSite=Strict cookie; JavaScript never receives the token. Authenticated phones can access **all** discovered Hermes profiles, their conversations, and the app's run controls. This is for the host owner's trusted devices, not multi-user isolation.

Settings on the desktop lists devices and revokes them immediately. The phone can disconnect itself. HTTP responses are not cached, there is no service worker, static serving is allowlisted, and the phone API checks the exact Host, Origin, request header and device session. The local pairing administration API is not routed to the phone listener.

For a persistent host installation, run `server/start.mjs` under a user service with this directory as WorkingDirectory. Stop the companion before upgrading the build. Disabling phone access uses `tailscale serve --https=8443 off`; this does not cancel Hermes runs. Revoke paired devices separately if needed.

### Phone validation

Thirteen fixture tests cover the original bridge plus code expiry/reuse/guess limits, token hashing, session expiry, immediate revocation, secure cookie flags, remote authentication, local-only pairing administration, static asset boundaries and request-size bounds. A live TLS round-trip on the development host paired a temporary device, read profile availability, revoked it, and verified HTTP 401 afterward. No model requests were sent during that check.

The phone entry was browser-checked at 393 × 852 and 427 × 952. Authenticated layout/history checks used sample data. The desktop device-frame runtime remains protected and unchanged. Actual iOS/Android keyboard behavior and a physical-phone connection still need device testing.
