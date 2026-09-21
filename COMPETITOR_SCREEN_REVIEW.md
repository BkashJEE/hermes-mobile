# Hermes Mobile: screen comparison

Reviewed 2026-09-20. This is a visual comparison of published screenshots and design documentation, not a hands-on usability test. The layout below is a recommendation, not a user-approved implementation.

## References inspected

- [OpenMausBot desktop hero](https://github.com/milind-soni/OpenMausBot/blob/main/docs/screenshots/hero.png): dark contact roster, colored character avatars, compact conversation toolbar, message-focused center, bottom composer.
- [OpenMausBot iOS composer screenshot](https://github.com/milind-soni/OpenMausBot/blob/main/docs/screenshots/composer-corners-ios-after.jpg): black chat canvas, blue outgoing bubbles, gray incoming bubbles, top profile/thread controls, composer immediately above keyboard. This is a repository development screenshot and may not represent every released version.
- [Grok Bot design article](https://x.ai/news/designing-grok-bot): roster organized around persistent bots, simple distinct character shapes, state animation, optional computer panel and inline action widgets. The article includes design explorations as well as final-design explanations.
- [Grok Bot App Store](https://apps.apple.com/app/id6794501026): mobile promotional screens show light roster with favorite avatars above the list, restrained conversation chrome, inline email action, and separate dark computer view.
- [Grok Bot mobile documentation](https://docs.x.ai/grok-bot/mobile): home search, bot profiles, computer access from conversation, routines in profiles.

## Recommendation

Keep Hermes' charcoal, silver and cyan identity. Use the architectural engraving on connection/onboarding and quiet empty states. Remove architecture from the active conversation surface. The existing engraved mockup spends approximately its top third on branding, profile badges and task context before conversation starts; reduce this substantially.

1. **Home / Agents:** compact Hermes title, connection indicator, search and add action. One conditional attention row, then a vertical agent list. Each row has a 40–44 logical-pixel avatar, name, latest meaningful update, timestamp and textual state. Avoid a permanent duplicate avatar carousel above the list.
2. **Agent conversation:** back button, 32-pixel avatar, name/state and overflow in a roughly 56-pixel toolbar, excluding system safe areas. A compact active-task row appears only when needed and opens details. The transcript gets the remaining space. Attachment, composer, microphone and send controls stay above the keyboard.
3. **Work:** mobile task list with Active / Needs you / Done filters. Each item shows owner, task and latest outcome. Task details contain activity and files. Include only states and actions supported by the connected Hermes/Dock backend; don't suggest unsupported pause/resume or computer control.
4. **Agent profile:** larger original icon, role, model, capabilities and relevant configuration. Move configuration out of the daily chat surface.
5. **Approval detail:** open from an inline request or attention badge; show the exact requested action, scope and separate approve/decline actions.

Top-level navigation: Agents, Work, Settings. A conversation is a focused drill-down with a back action; hide the root tab bar there. Files are available from their conversation/task rather than needing a fourth root destination initially.

## Visual rules

- Base #090D12; raised surface #151B20; main text #EDF2F5; secondary text #A5B0BD; cyan accent #83DEE2. Use amber for a request needing attention and text alongside all status colors.
- Reserve a subtle charcoal-to-deep-teal gradient for onboarding or the top of the home screen. Keep messages on flat surfaces.
- Native system sans-serif or Inter: page title 22/28, agent name 17/24, body 16/24, secondary label 14/20, supplementary timestamp 12/16. Respect platform text scaling.
- 20-pixel page margins, 8-pixel spacing base, 48-pixel minimum touch areas. Icon size and hit area are different.
- Create a coherent original silver emblem family: winged messenger for Hermes, lens for Researcher, hammer for Builder, shield for Reviewer. Use broad shapes and one identifying detail so icons survive at 32 pixels; avoid tiny rivets, heavy bevels and high-frequency engraving. Larger profile art can hold more detail.
- Keep connection status distinct from agent activity. Use meaningful short text such as “Reviewing 3 files”; open full activity on tap. No hover-only information on mobile. Respect reduced-motion preferences.

The desired result is a calm mobile messaging app with clear task controls and a restrained Hermes identity. The dramatic artwork belongs at entry points; the working screens prioritize reading, responding and reviewing.
