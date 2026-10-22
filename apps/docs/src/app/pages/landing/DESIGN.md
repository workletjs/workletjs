---
name: Workletjs Landing
description: A practical first-map workbench for Angular developers.
colors:
  accent: 'var(--ng-doc-primary, #0c6cbd)'
  success: 'var(--ng-doc-success, #15803d)'
  ink: 'var(--ng-doc-heading-color, #172b3a)'
  muted: 'var(--ng-doc-text, #586774)'
  line: 'var(--ng-doc-border-color, #dbe4eb)'
  surface: 'var(--ng-doc-base-1, #f4f7fa)'
  paper: 'var(--ng-doc-base-0, #fff)'
  primary-text: 'var(--ng-doc-primary-text, #fff)'
  dock-background: '#172b3a'
  dock-text: '#e4eef5'
  dock-muted: '#a8bbc9'
  syntax-tag: '#9bd3f3'
  syntax-value: '#b8ddbb'
  dock-scrollbar: '#6b8293'
typography:
  display:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 'clamp(40px, 4.35vw, 62px)'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  headline:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 'clamp(28px, 3vw, 38px)'
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '21px'
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: '-0.015em'
  body:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '16px'
    lineHeight: 1.65
  introduction:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '18px'
    lineHeight: 1.7
  button:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '15px'
    fontWeight: 700
    lineHeight: 1.5
  link:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '14px'
    fontWeight: 700
  preset:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '12px'
    fontWeight: 600
  install-code:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
    fontSize: '12px'
    lineHeight: 1.8
  demo-code:
    fontFamily: 'var(--ng-doc-code-font-family, ui-monospace, monospace)'
    fontSize: '13px'
    lineHeight: 1.65
  utility:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '13px'
  closing:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: '30px'
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: '-0.025em'
  mobile-display:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 'clamp(36px, 6.5vw, 54px)'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  narrow-display:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 'clamp(30px, 8.5vw, 32px)'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.035em'
rounded:
  icon: '4px'
  preset: '5px'
  status: '6px'
  control: '7px'
  container: '12px'
  step: '50%'
spacing:
  '8': '8px'
  '12': '12px'
  '16': '16px'
  '24': '24px'
  '32': '32px'
  '40': '40px'
  '52': '52px'
  '80': '80px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.primary-text}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    padding: '10px 19px'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    padding: '10px 19px'
  install-command:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.install-code}'
    rounded: '{rounded.control}'
    padding: '10px 10px 10px 16px'
  location-preset:
    backgroundColor: 'transparent'
    textColor: '{colors.muted}'
    typography: '{typography.preset}'
    rounded: '{rounded.preset}'
    padding: '5px 10px'
  location-preset-selected:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.accent}'
    typography: '{typography.preset}'
    rounded: '{rounded.preset}'
    padding: '5px 10px'
  code-dock:
    backgroundColor: '{colors.dock-background}'
    textColor: '{colors.dock-text}'
    typography: '{typography.demo-code}'
  step-number:
    textColor: '{colors.accent}'
    rounded: '{rounded.step}'
    size: '30px'
---

# Design System: Workletjs Landing

## Overview

**Creative North Star: "First Map"**

This local system describes the Landing components in this directory. It inherits the NgDoc theme
through the custom properties recorded above. The visual character is clear, practical developer
documentation: Nunito Sans, paper surfaces, quiet rules, a blue action color, and a deep ink-blue
code dock.

The working OpenStreetMap preview and its synchronized Angular template provide the visual evidence.
Type and spacing make installation and the First Map path easy to scan. The map is live content; the
implementation adds no decorative raster imagery.

**Key Characteristics:**

- Theme-aware paper and blue controls.
- Strong, compact headings with readable supporting copy.
- Flat sections, fine dividers, and modestly rounded controls.
- A live map connected to readable Angular code.

## Colors

The page uses one action accent over inherited neutral surfaces. Frontmatter records the actual
NgDoc custom property and fallback for each theme-aware color; fixed code colors remain fixed.

### Primary

- **Documentation Blue** (`accent`): primary actions, links, the second display line, selected
  location labels, step numbers, and focus outlines.
- **Action Text** (`primary-text`): text and arrow icons on the primary button.
- **Copy Success** (`success`): the copied-state check and its 12% tinted background.

### Neutral

- **Heading Ink** (`ink`): headings, primary copy controls, and unselected control hover text.
- **Quiet Text** (`muted`): descriptions, notes, captions, and secondary control labels.
- **Paper** (`paper`): page and map toolbar surfaces.
- **Raised Paper** (`surface`): capabilities band, install command, selected location backing, and
  closing panel. This is a tonal layer rather than a shadow.
- **Quiet Rule** (`line`): dividers, command outline, map outline, and step outlines.
- **Code Ink**, **Code Text**, and **Code Caption** (`dock-background`, `dock-text`, `dock-muted`):
  the stable dark dock and its text hierarchy across site themes.
- **Code Tag Blue** and **Code Value Green** (`syntax-tag`, `syntax-value`): Angular syntax roles.
- **Code Scrollbar** (`dock-scrollbar`): the horizontally scrolling code region.

**The Theme Inheritance Rule.** Use the existing NgDoc property with its recorded fallback for
Landing surfaces and controls. Keep the dock's implemented syntax palette intact.

## Typography

**Display and Body Font:** Nunito Sans with a sans-serif fallback. **Install Code Font:** the local
system monospace stack in `install-code`. **Live Template Font:** NgDoc's code font with the
`demo-code` fallback.

Heavy, tightly tracked headings establish hierarchy; body copy stays open and readable. Display and
headline sizes are fluid. At the single-column breakpoint the display uses
`clamp(36px, 6.5vw, 54px)`; at 380px it uses `clamp(30px, 8.5vw, 32px)`. The closing heading uses a
smaller fixed size (30px).

Feature and step descriptions use compact body copy (15px). Small utility text and captions use the
implemented sizes (11–13px). The live template uses 13px type with preserved indentation and soft
wrapping; retain selection, keyboard focus, and overflow scrolling as a fallback. The installation
command wraps within its container.

## Layout

The desktop content width is capped (1200px) with page gutters (40px). The hero and capability
sections share a slightly wider demonstration column (`0.94fr / 1.06fr`). The hero gap (58px),
section padding (roughly 80–96px), and open text measure distinguish the major sections.

At the intermediate breakpoint (1100px), the hero gap becomes tighter (32px) and its top padding
reduces (72px). At the single-column breakpoint (800px), page gutters reduce (24px), copy stacks
above the map, capabilities stack, and the three ordered steps become one column. The composition
tree is hidden in that layout. Section padding becomes compact (about 52px), and the closing panel
stacks its action beneath its text.

The map stage has a fixed desktop height (220px). At the narrow demo breakpoint (640px), it grows
slightly (240px); toolbar and code padding tighten, the location controls have larger minimum
targets (44px wide and high), and the secondary code caption is hidden. The map inherits a 32px font
at this breakpoint so OpenLayers' native 1.375em zoom buttons measure 44px; attribution keeps its
own 12px text. The copy control is 44px square below 800px. Below 380px, the hero gap reduces to
28px and its top padding to 36px, bringing the map earlier in the scroll.

## Elevation & Depth

The Landing implementation uses no box shadows. Paper, the softly tinted capabilities band, thin
rules, and the dark code dock establish depth. Map controls sit in a paper toolbar above the live
map. Tile-loading feedback sits directly over the map as a small paper notice.

## Shapes

Controls have gently curved corners (`control`); the map preview and closing panel share the larger
`container` curve. Location presets use the smaller `preset` curve. Step numerals use circular
outlines. Fine borders and section rules carry separation, while the map preview clips its contents
to its outer shape.

## Components

### Buttons and Text Links

Primary and secondary actions share their size, type, and spacing. The primary has an accent fill;
its hover mixes the accent with heading ink. The secondary has a quiet border and gains a tinted
surface on hover. Both have a minimum height (46px). Text links use blue, bold compact labels and
gain an underline on hover.

Landing links and buttons have an outside focus outline (3px with a 5px offset). Primary and
secondary button color transitions are brief (180ms, ease-out); reduced motion disables them.

### Installation Command

A tinted, outlined command row holds the terminal prompt, Angular CLI setup command
`ng add @workletjs/ngx-openlayers`, and a compact copy button. The static note below keeps the
version compatibility link visible. The copy button becomes blue on paper when hovered; its pending
state reduces opacity and uses the wait cursor. After a successful copy, the button shows a green
check using `success`, a 12% tinted background, and a 2.4px stroke.

The root `NgDocNotifyService` presents success or failure feedback in a bottom-of-viewport overlay
that closes after two seconds. The separate polite live status region remains absolutely positioned
and visually clipped for screen readers. Neither feedback mechanism participates in page layout, so
copying causes no layout shift. Preserve the live announcement and the mobile 44px copy target.

### Location Controls

Three text buttons sit in a labelled group. The selected preset uses a tinted surface and blue text,
with `aria-pressed` carrying its state. Selection is derived from the actual view's center and zoom;
panning or zooming away clears it, and choosing a location restores that view. Hover uses the same
surface with ink text. Their color transitions are brief (160ms, ease), and reduced motion disables
them. The controls, map, and template region use an inset focus outline (2px with a −2px offset).

### Map and Code Dock

The outlined, rounded preview joins a paper toolbar, a real OSM map, and a dark template dock. Alps,
London, and Tokyo presets update the map and visible center/zoom values. The initial view shows the
Alps at zoom 9. Map interaction also updates those code values. The caption explains this
relationship explicitly. Preserve map attribution, keyboard focus, selectable code, and the
tile-loading retry feedback. Use the actual map runtime for this signature component.

### Capability Rows and Ordered Steps

Capability content is separated by fine rules in a tinted section. The ordered steps remain open
columns on desktop, each with a circular number, heading, description, ruled code example, and
documentation link. The Compose step includes the required container height before the Make it yours
step introduces optional view binding and controls. These are informational sequences with clear
reading order.

## Do's and Don'ts

### Do:

- **Do** preserve NgDoc color inheritance and the recorded fallbacks.
- **Do** keep the map, location presets, and displayed Angular values synchronized.
- **Do** retain keyboard outlines, selectable code, and copy-status feedback.
- **Do** preserve the single-column reading order on narrow screens.

### Don't:

- **Don't** add decorative gradients or a card grid to this Landing surface.
- **Don't** substitute a static image for the working map demonstration.
- **Don't** add entrance animation; honor reduced motion for existing control transitions.
- **Don't** treat this local document as a design contract for the surrounding app shell.
