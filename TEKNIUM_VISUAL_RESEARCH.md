# Teknium reference study

Reviewed September 20, 2026. Scope: Teknium's public X profile header, photo gallery, and four individual image posts opened and visually inspected in the browser. This is a small, directly observed sample, not a claim about every post or an official Nous design system. Authorship of the posted artwork was not established.

## Observed references

| Post | Observed artwork | Useful for Hermes Mobile |
| --- | --- | --- |
| [September 10: Deepseek model announcement](https://x.com/Teknium/status/2098088984383725725/photo/1) | Chrome beveled title, starfield, scanline/pixel texture, mint terminal lettering, cyan/magenta/amber panels, illustrated chip and shield, rainbow lettering | Metallic icon accents, dark backdrop, small controlled color variation |
| [September 13: image-model announcement](https://x.com/Teknium/status/2099327677648015365/photo/1) | Comic-book panels, yellow starburst, strong magenta/blue, halftone texture, a glowing portal, shield, checklist and stacked-image symbols | Concrete pictorial symbols, a recognizable portal motif, energetic artwork for a launch graphic |
| [September 15: Telegram rich CJK messages](https://x.com/Teknium/status/2099822984018182337/photo/1) | Navy blueprint background, fine cyan/white outlines, square drafting panels, monospace lettering, wireframe shield and mechanical valve | Precise icon geometry, technical metadata treatment, subtle grid on large artwork only |
| [September 13: dashboard session refresh explanation](https://x.com/Teknium/status/2099195032674902461/photo/1) | Grayscale architectural engraving, mechanical gates/keys, strong perspective, thin cyan light beams | Graphite/silver materials, restrained cyan illumination, technical processes represented as tangible objects |

The profile header also uses intricate mechanical/circular illustration with muted coral, teal and purple. It is additional mood context, not evidence that all product graphics share one palette.

## Interpretation

The shared character is retro-computer imagery and physical metaphors: portals, chips, shields, keys, gates and instruments. The palette varies considerably across posts. The sample does not support calling flat teal cards his signature style or attributing one exact font or color token to him.

For this mobile app, my recommendation is a restrained dark instrument-panel direction: professional layout, recognizable miniature instruments for agent identities, cool-metal highlights, and very low-intensity cyan/violet background light. Keep the visual energy concentrated in the icon family and launch artwork.

## Proposed icon family

These are original adaptation ideas, not symbols extracted from the posts:

- Researcher: an astrolabe or scanning lens with a cyan center. Keep the recognizable circular search motif from our selected radar icon.
- Builder: a beveled metal forge hammer with one small amber spark.
- Reviewer: a silver shield with a sharply drawn mint check.
- Optional coordinator identity: a simple winged compass or portal ring, only if the product exposes a real coordinator profile.

Use a consistent front or slight three-quarter view, light direction and stroke weight. At 24 px use a flat silhouette with minimal internal detail. At 32–40 px allow one subtle bevel and colored inset. Reserve richer illustration for 64 px or larger splash/onboarding art. Keep app navigation icons in a simpler consistent line family.

Do not place every profile inside a bright teal disc. Inactive profiles use graphite containers and quiet silver symbols; selection can use a fine cyan outline, subtle fill and a clear underline. Status must also have a text label. An illustrated profile's accent color is identity, not a substitute for state.

## Proposed colors and gradients

The following values are chosen for our app; they were not sampled or presented as official Teknium/Nous tokens.

| Role | Proposed value |
| --- | --- |
| Main canvas | `#080C12` |
| Upper header navy | `#101B2A` |
| Lower canvas | `#070A0F` |
| Opaque content surface | `#131B25` |
| Primary text | `#EAF0F6` |
| Secondary text | `#A7B3C2` |
| Primary cyan | `#72DCD6` |
| Secondary violet accent | `#9688E8` |
| Warm accent | `#DBAD6A` |
| Metal highlight | `#DCE5EE` |
| Metal midtone | `#91A0B2` |

Background proposal: a base 160-degree linear gradient from `#101B2A` through `#080C12` at 52% to `#070A0F`, with a cyan radial light at the upper left (8% opacity) and violet light at the upper right (6% opacity). Fade the light before the long-form chat region. This should read as dark depth, not a rainbow wallpaper.

Keep body text on stable opaque surfaces. Do not apply chrome, gradients or scanlines to readable text. Use a cyan-to-soft-mint gradient only on a large onboarding emblem or a restrained primary button if it survives contrast checks in the implemented app. Avoid continuous animated backgrounds; use a small event-driven loading indicator and respect reduced motion.

## Typography and layout

Keep the professional layout sizing already defined in DESIGN_SYSTEM.md: 22 px screen headings, 16/24 body text, 14/20 labels, minimum 48 px touch areas. Inter/native sans for the application; optionally a monospace family for short technical status or code. Do not import the promotional graphics' huge chrome/condensed headlines into every screen.

Next visual step: apply this material and background treatment to one existing main-screen composition and a matching loading screen, keeping the selected information structure intact. The prior three structural layout studies remain undecided; this research should not silently choose a new navigation model.

## User-selected visual reference

The user subsequently attached the September 13 dashboard-session illustration and said it looked cool. Prioritize that specific reference: grayscale architectural engraving, dark metal, silver details and thin cyan beams. The broader violet/rainbow exploration above remains research history, not the active visual recommendation.

Apply original architectural artwork to the loading screen. On the main interface, limit engraving to agent emblems and faint edge decoration, with solid quiet surfaces under messages and controls. Use silver lens/hammer/shield emblems on graphite, with a cyan outline and underline for selection. Suggested working palette: canvas `#090D12`, surfaces `#151B20`, silver `#D4DDE3`, text `#EDF2F5`, cyan `#83DEE2`. Preserve the established readable typography and minimum touch areas. These values are proposed adaptations, not source-image samples.

The next two mockups explore this treatment on loading and focused chat. They do not settle the still-open structural navigation choice or claim a functioning app.
