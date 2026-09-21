# Hermes Mobile local-integration QA

Date: 2026-09-20

final result: blocked

Scope: the user's request to wire the current design to local Omarchy Hermes. This is an integration preview, not a pixel-identical reproduction of fictional data or a native-device certification.

## Visual truth and evidence

Source images were generated locally during the design session; the file IDs below identify the selected references.

- Agents: `exec-d113c29a-95ab-49d7-b66d-d91b267ff677.png`
- Conversation: `exec-5b6097c0-cd4d-4768-9b40-9ffa703b28ce.png`
- Work: `exec-5d0c3c6c-f0f1-4d53-b1c7-61e5ae7c47a0.png`

Implementation: `http://127.0.0.1:4186`, inspected in the Codex in-app browser.

Local evidence (not bundled or published):

- `/tmp/hermes-mobile-qa/agents.png`
- `/tmp/hermes-mobile-qa/chat.png`
- `/tmp/hermes-mobile-qa/final-chat.png`
- `/tmp/hermes-mobile-qa/pixel-agents.png`
- `/tmp/hermes-mobile-qa/pixel-chat.png`
- `/tmp/hermes-mobile-qa/pixel-work.png`
- `/tmp/hermes-mobile-qa/pixel-detail.png`

Browser viewport during capture: 1100 × 1250. Device-screen captures are approximately 393 × 852 pixels for iPhone and 427 × 952 for Pixel, with 1:1 CSS/device-screen scale verified using bounding rectangles. Device chrome is template-owned. Sources are 853 × 1844, representing approximately 390 × 844 logical pixels; visual judgment normalizes that scale and excludes the added device status/navigation regions. The source and implementation images were opened together in the same comparison inputs for Agents/Chat and Work. Full content remains readable at the normalized size, so separate magnified crops were unnecessary; header, message and composer regions were explicitly inspected.

State difference: sources contain fictional working agents, a pending file-edit request and sample files. Captures contain actual connected profiles and a completed two-turn smoke check. No fake tasks, attachments, approvals, percentages or activity are inserted to resemble a mock. The Work capture is the Done filter; the source illustrates Active, so item counts and card proportions are not asserted to match.

## Findings and correction history

- Fixed P2: dark UI initially inherited dark paragraph text and black status assets. App-specific text and contrast overrides now keep message text, live status icons and the home indicator readable. Existing runtime assets and geometry remain intact.
- Fixed P2: the first run-detail sheet used a white header around a dark body. App-specific sheet styling now uses one charcoal surface and readable text. Post-fix evidence: `pixel-detail.png`.
- Fixed P1: browser focus scrolling could scroll the outer device screen after keyboard/sheet transitions, moving fixed chrome off-screen. The app's screen scope now uses overflow clipping; only MobileScroll owns scrolling. After reload, input, navigation and sheet dismissal, the screen reports `scrollTop: 0`; `final-chat.png` and `pixel-chat.png` show fixed header/composer placement.
- No remaining actionable P0/P1/P2 issue in the tested local slice.

## Required visual surfaces

- Typography: system sans fallback, 22px titles, 17px agent names, 16px/24px messages, 14px supporting text. Source hierarchy is retained. Compact connection metadata is smaller; it is not a sole indicator or primary action.
- Spacing/layout: 20px content margins, grouped rows, compact header, fixed navigation/composer, separate scroll area. Full captions and action buttons remain reachable on both presets. Actual profile count replaces the source's decorative lower vignette.
- Color: near-black base, charcoal surfaces, silver foregrounds, cyan active accents, amber decision states. No background artwork under messages. Dark sheet and system-chrome contrast corrected.
- Image quality: generated silver Hermes emblem at 512px displays sharply at 32–48px. Other real profiles use deterministic Radix icon assignments, not fictional role identities. Full engraved avatar customization and home vignette remain optional polish, not simulated live functionality.
- Copy/content: actual profile IDs, truthful API availability, host-reported run states, separate gateway/agent status, and explicit local-only connection and Work scope. Unsupported voice, attachment and network-pairing buttons are omitted.

## Interaction and integration checks

- Nine isolated bridge tests pass: loopback restrictions, credential exclusion, lost acceptance, changed request identity, concurrent same-key sends, exact approvals, stop state, HTTP origin/host boundary, same-session contention, and outage preservation (some tests cover multiple cases).
- TypeScript and production build pass. All 28 protected runtime files pass integrity checks.
- Five gateways were discovered live. Only the default profile received test prompts.
- First no-tools prompt returned `HERMES_MOBILE_OK`; conversation recovered after page reload. A second prompt requested the previous token without supplying it and received `HERMES_MOBILE_OK` in the same session.
- The explicitly tracked first check appears under Work → Done and opens its conversation through run detail.
- Search, unavailable profile send-disablement, 30-entry recent session picker, agent navigation and per-profile unsent draft retention verified. Clearing the draft through keyboard deletion persisted across navigation.
- Keyboard transitions and sheet dismissal checked on both iPhone and Pixel presets.
- Browser console warning/error query returned an empty list after the final changes.

## Boundaries and follow-up polish

- Live approvals and stop were not exercised against real work; their contracts and recovery behavior are tested with isolated fixtures.
- No physical phone, native app build, push, remote pairing, streaming token display, attachment transport or Dock board synchronization was tested or claimed.
- Decorative gateway imagery and richer user-selected avatars can be added later. Placeholder roles and decorative task progress were deliberately excluded from live data.
- Evidence paths are temporary local artifacts. Re-capture after any later behavioral or layout change.


## Private phone pairing update — September 20, 2026

Added a separate full-screen phone entry without changing protected mobile runtime files. Pairing uses the existing charcoal, silver and cyan palette, a clear two-field form, visible connection errors and large touch targets. Desktop Settings provides code generation, expiry, paired-device listing and revocation. Native phone sheets use Radix Dialog with a visible Close control.

Verified the real HTTPS pairing page at 393 × 852. Verified authenticated agent/chat/history/sheet layouts with read-only fixtures at 393 × 852 and Work at 427 × 952. No console warnings or errors in the layout fixture. Live HTTPS authentication and immediate revocation passed through the API; no new model run was needed. Thirteen backend tests and both production builds passed; all 28 protected runtime hashes remain intact. Physical iOS/Android keyboards have not been verified.


## New-session history race fix

Confirmed the reported message completed and its history became available without resubmission. Added backend regression checks for pending new transcripts, later persistence, unrelated 404s, and bounded completion grace. Browser fixture verification observed the preparing state automatically become the saved transcript. Reloaded the paired app and confirmed the original conversation and reply remained visible. Fifteen tests, both builds, and all protected runtime checks passed.

## Agent profile icon update — September 21, 2026

Source visual truth: `/tmp/codex-clipboard-660a54fd-c470-4ef8-9d3e-78e1d2e91e7c.png` (153 × 685 pixels), showing the reported repeated generic profile symbols. Implementation evidence: `/tmp/hermes-icons-after.png` (381 × 824 pixels) and normalized focused crop `/tmp/hermes-icons-after-focus.png` (153 × 685 pixels). Combined comparison: `/tmp/hermes-icons-comparison.png` (306 × 685 pixels). Browser CSS viewport was set to 390 × 844 at device scale 1; the in-app content capture was 381 × 824 because of browser viewport insets. The focused crop was normalized to the source dimensions before comparison.

State: authenticated Agents list with the same live profiles and dark theme. The source is a focused crop rather than a complete screen, so full-view evidence is used only to confirm the surrounding layout stayed unchanged. The focused side-by-side comparison is the authoritative icon evidence.

**Findings**

- No actionable P0/P1/P2 differences remain in the requested icon scope. CEO, Gary, Sabiska, Sanju, and Nova now have distinct briefcase, terminal, stack, binoculars, and four-point-star symbols. The default profile retains the supplied Hermes emblem.
- P3: Sabiska retains the familiar stack concept from the source because it was already distinct; it now uses the same duotone family and rendering treatment as the other profiles.

**Required fidelity surfaces**

- Fonts and typography: unchanged; agent names, previews, and statuses retain their existing size, weight, wrapping, and hierarchy.
- Spacing and layout rhythm: unchanged; avatar circles remain 48 × 48 with the original row alignment and touch targets. New glyphs fit at 27 × 27 without clipping.
- Colors and visual tokens: silver duotone glyphs use the existing charcoal surface, border, and restrained cyan shadow treatment. Status colors remain text-backed.
- Image quality and asset fidelity: the raster Hermes emblem remains sharp. Other profiles use the official Phosphor React icon library rather than handcrafted SVG or CSS drawings.
- Copy and content: unchanged; no roles or capabilities were invented to justify the icons.

**Interaction and verification**

- Opened Gary from the Agents list and returned successfully; no message was sent.
- Browser console warnings/errors: none.
- Fifteen backend tests, both production builds, and all 28 protected runtime checks passed.

Comparison history: initial evidence showed repeated chat symbols for CEO/Gary plus generic search/person symbols for Sanju/Nova. The post-fix normalized comparison shows five visually distinct glyphs with consistent stroke weight, scale, circle treatment, and baseline alignment.

Section result: passed

## Navigation and action icon update — September 21, 2026

Source visual truth: `/tmp/hermes-icons-after.png` (381 × 824 pixels), the immediately preceding live Agents screen with the approved profile icons and the older navigation/action icon set. Implementation: `http://127.0.0.1:4186/`, opened and exercised in the Codex in-app browser at a temporary 390 × 844 CSS viewport and then returned to the default viewport.

Implementation screenshot path: unavailable. The in-app browser rendered the updated application and exposed its accessibility tree and DOM, but both its standard and full-page screenshot operations returned `Unable to capture screenshot`. Because no browser-rendered image could be captured, a normalized side-by-side visual comparison could not be created.

**Verified rendered state**

- Bottom navigation renders Agents, Work, and Settings with Phosphor SVGs at 24 × 24 CSS pixels. The selected Agents icon renders the duotone form; inactive icons render the regular form.
- Refresh, back, conversation history, new conversation, search, send, alert, approval, stop, and row-detail controls render Phosphor SVGs from the same icon family.
- Navigated Agents → Work → Settings, opened CEO, verified back/history/new/send controls, then returned to Agents.
- Browser console warnings/errors: none.
- Fifteen bridge/phone tests and four Sites-worker tests pass. Both production builds pass, and all 28 protected runtime files pass integrity checks.

**Required fidelity surfaces**

- Fonts and typography: source code and DOM structure remain unchanged, but fresh pixel evidence is unavailable.
- Spacing and layout rhythm: app-owned layout values remain unchanged; bottom-tab SVGs are explicitly 24 × 24. Fresh pixel evidence is unavailable.
- Colors and visual tokens: existing charcoal, silver, and cyan tokens remain unchanged; selected navigation adds only a restrained cyan icon shadow. Fresh pixel evidence is unavailable.
- Image quality and asset fidelity: the Hermes emblem and agent-profile assets are unchanged. New controls use the official Phosphor React library rather than handcrafted artwork.
- Copy and content: unchanged.

**Findings**

- No functional, console, build, runtime-integrity, or DOM-size regression was found.
- Visual QA is blocked because the selected browser could not produce the required implementation screenshot. This prevents a valid full-view and focused side-by-side comparison.

Comparison history: the previous profile-icon pass remains valid for the agent avatars. The current navigation/action pass has no acceptable post-fix screenshot evidence.

final result: blocked
