---
name: DeathCulture.co
description: A contemporary publication that treats death as an editorial subject. Teal-charcoal gravity, a single warm ember accent, duotone photography.
colors:
  verdigris: "oklch(0.4646 0.0189 197.03)"
  verdigris-deep: "oklch(0.3891 0.0154 197.74)"
  ember: "oklch(0.5648 0.1224 53.29)"
  ember-glow: "oklch(0.6548 0.1374 55.39)"
  ember-pale: "oklch(0.8552 0.0989 62.61)"
  ink: "oklch(0.2759 0.0032 202.42)"
  bone: "oklch(0.9273 0.0029 197.56)"
  ash-charcoal: "oklch(0.134 0.0027 203.77)"
  void: "oklch(0.0847 0.0025 204.15)"
  paper: "oklch(1 0 0)"
  muted-surface-light: "oklch(0.9843 0.001 196)"
  muted-surface-dark: "oklch(0.2102 0.0029 203.59)"
  border-light: "oklch(0.9273 0.0029 197.56)"
  border-dark: "oklch(0.2759 0.0032 202.42)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Days One, sans-serif"
    fontSize: "clamp(1.8rem, 0.9rem + 3.9vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "normal"
  headline:
    fontFamily: "Days One, sans-serif"
    fontSize: "clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Days One, sans-serif"
    fontSize: "clamp(1.4rem, 1.1rem + 1.4vw, 2.1rem)"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Questrial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Days One, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.75rem"
  xl: "1rem"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.6rem"
  md: "1.1rem"
  lg: "2rem"
  section: "clamp(2.5rem, 2rem + 2.5vw, 4.5rem)"
components:
  button-pill:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1.1rem"
  button-pill-hover:
    backgroundColor: "{colors.ember-glow}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1.1rem"
  button-primary:
    backgroundColor: "{colors.verdigris}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.verdigris-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1rem"
  button-light-cta:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.void}"
    rounded: "{rounded.sm}"
    padding: "0.55rem 1.3rem"
  input:
    backgroundColor: "{colors.muted-surface-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 0.85rem"
---

# Design System: DeathCulture.co

## 1. Overview

**Creative North Star: "The Modern Memento Mori"**

DeathCulture.co is a contemporary publication that treats death as an editorial subject, not a taboo. The system runs on teal-charcoal gravity: a cold, mineral neutral field that recalls slate, ash, and oxidized metal, lit by a single warm ember accent. Photography is always duotone, drained to grayscale at rest and warming toward color only on interaction, so imagery reads as archival and considered rather than stock. The voice of the interface matches the brand's voice: unflinching, witty, literate. It confronts the subject directly and assumes the reader is a capable adult.

The register is bold and provocative, but the boldness lives in composition, scale, and restraint, not in loud chrome. Type is set in a single-weight geometric display face against a clean geometric body, held apart by dramatic size jumps rather than a busy weight ladder. Latin mottos ("Memento mori", "Mors certa, hora incerta") appear as quiet, wide-tracked labels: gravity delivered with a straight face. Serious, not solemn; dark, not dead.

This system explicitly rejects two things named in PRODUCT.md. It is the opposite of **funeral-industry corporate**: no soft-focus stock photography, no doves, no sympathy-card pastels, no sanitized mortuary gloss. And it refuses the **generic SaaS / startup** look: no rounded-card grids, no gradient blobs, no hero-metric templates, no cheerful mascots. Every surface should read as authored, composed by an editor, never assembled from a component kit.

**Key Characteristics:**
- Cold teal-charcoal neutrals warmed by one ember accent used sparingly.
- Duotone / grayscale photography that lifts toward color on hover.
- Single-weight geometric display type at heroic scale; hierarchy through size, not weight.
- Flat surfaces, rare and soft ambient depth.
- Editorial rhythm: full-bleed image bands, two-column article rows, wide-tracked Latin labels.

## 2. Colors

A cold, mineral neutral spine (teal-tinted charcoals and ashes) carrying exactly one warm accent, with a desaturated teal-green as a secondary structural color. The warmth is rare on purpose.

### Primary
- **Verdigris** (`oklch(0.4646 0.0189 197.03)`): The desaturated teal-green of aged bronze patina, decay rendered beautiful. Used for the primary action button in authenticated and form surfaces (sign-in, editor), for focus rings, and for the faint tinted glow behind image placeholders. Deepens to **Verdigris Deep** (`oklch(0.3891 0.0154 197.74)`) on hover.

### Secondary
- **Ember** (`oklch(0.5648 0.1224 53.29)`): The single warm coal in a cold field, an amber-copper that reads as living heat. Reserved for the primary marketing call to action (the Subscribe pill), navigation underline reveals, prose links, and hover accents. Brightens to **Ember Glow** (`oklch(0.6548 0.1374 55.39)`) on hover.
- **Ember Pale** (`oklch(0.8552 0.0989 62.61)`): The soft, high-lightness ember used for text selection background, the light-CTA hover fill, and emphasized inline words on dark heroes.

### Neutral
- **Ink** (`oklch(0.2759 0.0032 202.42)`, base-800): Default body text on light surfaces; also the border color in dark mode.
- **Bone** (`oklch(0.9273 0.0029 197.56)`, base-200): Body text on dark surfaces; also the light-mode border and divider color, and the fill of the light CTA button.
- **Ash Charcoal** (`oklch(0.134 0.0027 203.77)`, base-950): The dark-theme page background.
- **Void** (`oklch(0.0847 0.0025 204.15)`, base-1000): The deepest surface, used for hero and full-bleed image-band backgrounds and for scrim gradients.
- **Paper** (`oklch(1 0 0)`): The light-theme page background and card surface.
- **Muted Surface** (`oklch(0.9843 0.001 196)` light / `oklch(0.2102 0.0029 203.59)` dark): Input fills, code chips, quiet panels.

### Named Rules
**The One Ember Rule.** Ember (the warm secondary) is the only warm color in the system, and it appears on no more than roughly 10% of any screen: one CTA, one underline, a link. Its scarcity against the cold field is the entire effect. Never flood a surface with it, never use it as a large background, never pair it with a second warm hue.

**The Duotone Rule.** Every photograph enters grayscale (`filter: grayscale(1)` to `grayscale(0.85)`), often with a Verdigris or Void multiply overlay. Color, if it returns at all, returns only on hover and only partway. Full-saturation stock photography is forbidden.

## 3. Typography

**Display Font:** Days One (with `sans-serif` fallback)
**Body Font:** Questrial (with `sans-serif` fallback)

**Character:** Two single-weight geometric faces. Days One is a heavy, blunt, almost monumental geometric sans that carries all headings with tombstone-like solidity; Questrial is a light, open, humanist-geometric sans that keeps long-form reading calm and unfussy underneath it. The contrast between the two weights is the pairing's whole personality, so hierarchy is built from size, not from a weight ladder (both faces ship at 400).

Root font size is fluid: `clamp(112.5%, 16px + 6 * ((100vw - 375px) / 825), 132%)`.

### Hierarchy
- **Display** (400, `clamp(1.8rem, 0.9rem + 3.9vw, 4rem)`, line-height 1.08): The hero H1 and page-defining headlines. Days One. Balanced wrapping (`text-wrap: balance`).
- **Headline** (400, `clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem)`, line-height 1.2): Feature-band H2s. Days One.
- **Title** (400, `clamp(1.4rem, 1.1rem + 1.4vw, 2.1rem)`, line-height 1.2): Article-row H3s (post titles in the editorial list). Days One.
- **Body** (400, `1.05rem`, line-height 1.75): Long-form post text (`.dc-prose`). Questrial. Reading measure held to roughly 30rem in excerpts and full prose width in articles; keep to 65–75ch.
- **Label** (400, `0.8rem`, letter-spacing 0.08em, UPPERCASE): Navigation links, meta rows, Latin mottos. Days One or Questrial. Kickers push tracking to 0.45em.

### Named Rules
**The Size-Not-Weight Rule.** Both faces are 400. Never fake a bold by reaching for 600–700 on Days One or Questrial (the web fonts are loaded single-weight; synthesis is disabled via `font-synthesis: none`). Escalate emphasis with size, letter-spacing, and case instead. The one exception is `strong` inside prose, which is 700.

**The Latin Label Rule.** Latin phrases are set as wide-tracked (0.35em–0.45em) uppercase labels in a muted neutral, never as decorative script. Gravity, delivered deadpan.

## 4. Elevation

Surfaces are flat by default. Depth is conveyed first through tonal layering (Void and Ash Charcoal bands sitting beneath lighter Paper content) and through the duotone imagery itself. Shadows are rare and, when present, deliberately soft, deep, and low-opacity: an ambient lift, never a hard drop shadow and never a 2014-era gray box glow. If a shadow reads as a crisp dark edge rather than a diffuse pool of near-black, it is wrong.

### Shadow Vocabulary
- **Ambient Lift** (`box-shadow: 0 20px 40px -24px oklch(from var(--base-950) l c h / 0.35)`): Article-row images and gently lifted media. Large blur, large negative spread, so only a soft pool shows.
- **Floating Panel** (`box-shadow: 0 12px 32px -12px oklch(from var(--base-1000) l c h / 0.5)`): Editor bubble menus and small floating surfaces.
- **Deep Modal** (`box-shadow: 0 30px 60px -30px oklch(from var(--base-1000) l c h / 0.8)`): The auth card, the single most-lifted surface in the system.
- **Lateral Drawer** (`box-shadow: -24px 0 48px -32px oklch(from var(--base-950) l c h / 0.25)`): Editor side panels.

### Named Rules
**The Flat-By-Default Rule.** A surface earns a shadow only by floating above the reading plane (a lifted image, a menu, a modal). Static content sections use tonal bands and dashed 1px hairline rules, never a shadow, to separate themselves.

## 5. Components

Components are restrained and editorial at rest, with personality reserved for hover: underline growth, image desaturation lifting toward color, subtle 1–2px rises. Chrome recedes so the words and images lead.

### Buttons
- **Shape:** Two families. Pills are fully round (`999px`); all other buttons use the small radius (`0.5rem`).
- **Subscribe Pill (marketing CTA):** Ember fill, Paper text, `0.45rem 1.1rem` padding. Hover shifts to Ember Glow and rises 1px. This is the one confident flourish; it carries the brand's single warm note.
- **Primary (forms / app):** Verdigris fill, Paper text, small radius, `0.7rem 1rem` padding. Hover deepens to Verdigris Deep and rises 1px.
- **Light CTA (on dark image bands):** Bone fill, Void text, small radius. Distinctive behavior: the internal `gap` between label and arrow icon grows from `0.5rem` to `0.8rem` on hover (the arrow steps forward); fill warms to Ember Pale.
- **Ghost / quiet link:** No fill; muted neutral text that lifts to the brightest neutral on hover. Used for secondary header actions (Sign in, Studio).

### Inputs / Fields
- **Style:** Muted Surface fill, 1px solid input-border, small radius (`0.5rem`), `0.6rem 0.85rem` padding. Uppercase wide-tracked label above.
- **Focus:** Border shifts to the Verdigris ring; no glow, no scale.
- **Error:** Border shifts to Destructive; `aria-invalid="true"` drives it. Error text is small Destructive below the field.
- **Dark hero variant:** On the hero, the subscribe field is a translucent pill (`oklch(from base-50 l c h / 0.08)` fill, translucent border, `backdrop-filter: blur(8px)`) with the button nested inside. This is the one sanctioned glass surface; it is purposeful, not decorative.

### Navigation
- **Style:** Uppercase, `0.8rem`, letter-spacing 0.08em, muted neutral text. Underline reveal: a 1px Ember rule scales in from the center (`transform: scaleX`) over 300ms on hover/focus, while text brightens to the lightest neutral.
- **Header:** Absolutely positioned over the hero with a top-down Void gradient scrim; a light-surface variant (`.on-light`) swaps to dark text and a Paper-tinted scrim for interior pages.
- **Mobile:** Nav links wrap and center; the three-column brand row collapses gracefully.

### Article Row (signature)
The editorial post listing. A two-column row (`md:grid-cols-2`): copy on one side (Title link, excerpt, uppercase meta), a lifted duotone image on the other. On row hover, the Title link's Ember underline grows from 0 to full width (`background-size: 0% 2px` to `100% 2px`), and the image lifts from `grayscale(0.85)` to `grayscale(0.2)` while scaling from 1.01 to 1.05. Rows are separated by generous vertical rhythm (`clamp(2.5rem, 2rem + 2.5vw, 4.5rem)`), not by cards or borders.

### Feature Band (signature)
A full-bleed alternating content band on Void. One half is an edge-to-edge duotone image with a Verdigris multiply overlay; the other is a text panel bearing a giant outlined **ghost number** (`-webkit-text-stroke: 1px` at ~7–14rem, Days One, transparent fill) sitting behind the heading. Alternating `.flip` reverses the column order down the page. This is how the site sequences its pillars, in place of an identical card grid.

## 6. Do's and Don'ts

### Do:
- **Do** treat Ember as precious: one warm accent per screen (a CTA, a link, an underline), never more. Enforce The One Ember Rule.
- **Do** run every photograph through the duotone treatment (`grayscale(0.85)`–`grayscale(1)`), and only let color partially return on hover. Enforce The Duotone Rule.
- **Do** build heading hierarchy from size and scale (both fonts are 400). Escalate with size, letter-spacing, and uppercase, not weight.
- **Do** keep surfaces flat; separate sections with tonal bands (Void / Ash Charcoal) and dashed 1px hairlines. Reserve soft ambient shadows for genuinely floating objects.
- **Do** set Latin mottos as wide-tracked (0.35em+) uppercase labels in a muted neutral. Deadpan gravity.
- **Do** hold body reading measure to 65–75ch and use the `.dc-prose` scale so posts and the editor match exactly.
- **Do** honor `prefers-reduced-motion`: disable reveal animations and scroll hints, as the hero already does.

### Don't:
- **Don't** drift toward **funeral-industry corporate**: no soft-focus stock photos, doves, sympathy-card pastels, or sanitized mortuary gloss.
- **Don't** ship the **generic SaaS / startup** look: no rounded-card grids, no gradient blobs, no hero-metric templates (big-number-plus-label), no cheerful mascot illustration, no interchangeable component-kit landing page.
- **Don't** slip into goth/horror kitsch (blackletter, dripping blood, edgelord skulls) or wellness beige minimalism. The subject is handled with intelligence, not costume and not therapy-speak.
- **Don't** use `background-clip: text` gradient text, or a colored `border-left`/`border-right` stripe as an accent. Both are forbidden.
- **Don't** use glassmorphism decoratively. The one sanctioned blur is the hero subscribe field; everything else is flat.
- **Don't** flood any surface with Ember or introduce a second warm hue. The cold field is the point.
- **Don't** fake bold weights on Days One or Questrial; `font-synthesis` is off and the web fonts ship single-weight, so it will simply not render.
