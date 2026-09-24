# Impossible Outcomes — Brand System

Render each artifact in a browser. Review it at its intended size and at a 390px viewport.

## Brand assets

`tokens.json` defines color, type, and motion. Use the artwork in `assets/marks/` and the bundled Poppins and Proxima Nova fonts. The toolkit HTML and application exports open locally in a browser.

## Fixed anchors

- Poppins 900 for display: tracking −0.04em; leading 0.92. Poppins 300 for voice: tracking −0.015em. Poppins 500 for smaller headings.
- Proxima Nova 400 for body; 700 for emphasis, navigation, and labels. Source label settings: 11px, 700, +0.17em. Scale for large fixed-format artwork rather than leaving labels microscopic.
- Palette: Black #000000; Navy #0D1C43; Blue Sky #2C9FF4; Blue Violet #3D6DF4; Sky Pale #A3C1DC; Ember Soft #ED876B; Solar Ember #F46138; White #FFFFFF. Ember, Sky, and Violet are the spec's active colors. Navy, Sky Pale, and Ember Soft are connective stops for field ramps, listed as supporting colors; use them only as connective field values, never as page surfaces, reading ink, or headline colors.
- Use the exact SVG mark, registered SVG mark, or full lockup. Never type an Ø as a substitute, stretch the artwork, close its counter, or reconstruct it with new shapes.
- Use Black for reading text on White (21:1). Blue Violet / White is 4.476:1, below the 4.5:1 normal-text threshold; reserve that pair for large text. Blue Sky / White is 2.848:1, below even the 3:1 large-text threshold: use it for marks, decorative fields, or with a tested dark text pair. Do not round a failing contrast ratio up to a pass. Source: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- White is the primary page surface. Black carries ink and dark surfaces. Broad fields are built from full-strength Blue Sky and Solar Ember, with continuous shaded transitions. Navy, Sky Pale, and Ember Soft never occupy broad plateaus. Do not make every application a full black canvas. Flat colors use full opacity. Field interpolation does not create new palette tokens. Fine texture can change local pixel values; it must not wash out the color identity.
- Copy uses US English. Write directly. Do not invent clients, performance metrics, dates, contact details, awards, testimonials, or attribution.

## Composition

Showcase: one central statement, one primary material, restrained context, a clear signature.
Workshop: visible hierarchy, evidence and decisions, comparable groups, deliberate white space.

Start with a 12-column grid, 4 on small screens. Adapt margins to the format. Keep aligned edges and protect reading space. Use rules and labels to structure information; avoid decorating every gap. Type should remain readable when the composition becomes a thumbnail. Check long replacements and maintain usable line breaks.

Inspect small reproductions and allow enough space to preserve the mark’s silhouette and counter. Set trim, bleed, color profile, and output specifications for each print application.

## Material families

Eleven computed materials share one renderer: the primary field (`source/field.frag`) and ten families in one program (`source/materials.frag`) with related causes: the field’s warped phase for ridges and screens, explicit curves for the ribbon and the edge light, polar and diagonal axes for light, and distance geometry for bodies. Color is interpolated in light: a plain OKLab mix with no hue shoulder, converted once to sRGB. Light materials (Prism, Burst, Edge light) add in linear light so the glow keeps the token hues. Grain is single-pixel, from an integer-quality hash, added to lightness and gated to each material’s body: it never forms a pattern and never washes out a color. Surfaces are matte; there are no specular highlights. Choose one primary family per composition and state its read before tuning parameters.

- Primary field — the hero ramp: Black, Navy, Blue Sky, Solar Ember, Black in five equal segments with a 0.75 handover, warped slowly by fbm at rates +0.020 and −0.017; film grain 0.14 at 12fps. The ramp opens and closes on black, so the ember reads as a flare and black covers close to half the frame. Every field preset keeps this shape. Covers, hero, everything.
- Applied — the exact mark, white, centered over the primary field. Social, stamps, signatures.
- Folded field — a pressed surface: Ember faces, Navy valleys, one raking light. The profile is a slow rise and a steep rounded return, continuous across the crest and the wrap, so edges never alias. A key light shades the faces from deep red to Ember; a cool back light lifts the return faces from Navy through Violet to a Sky-lit crest; troughs close through Navy into Black. Covers, full-bleed dividers. `data-scale` sets ridge count.
- Grain ribbon — two bands of one surface twisting through the whole ramp; heavy grain gated to density. Posters, key visuals.
- Eclipse — dark reserve, one luminous limb, directional corona on a Sky-to-Ember limb and a localized white flare. Focus slides, social. The center stays black.
- Orbs — six flat disks, each a shaped gradient of one color: the token at the lit edge falls through its own dark relative (Ember → deep red, Sky → Violet, Violet → Navy), with fbm mottle in the coverage. No sphere shading. Concept systems, OOH. `data-seed` jitters the arrangement.
- Prism — a long exposure of light through a prism: seven parallel bands along one diagonal (Navy, Violet, Sky, Pale-to-White, Ember, Ember Soft, Navy), adding in linear light, brightening to white where they overlap, exposure stepping faintly along the streak. Hero frames, titles. `data-offset` moves the streak.
- Thermal body — a warm mass and two satellites on paper, read through the edge: Ember lifting toward Ember Soft at the center, then a Navy hairline, Violet, Sky, Sky Pale, paper. The grain lives in the halo, like a thermal print. Light layouts, editorial.
- Burst — rays of light converging on a black axis: angular noise makes the rays, a soft cross through the center stays void, color turns from Ember above through White to Sky below. Focus frames, social. `data-seed` turns the rays.
- Line screen — one ink, one fine pitch; a body appears only as line weight, near solid at its center, hairline at its edge, gone in the reserve. Editorial, reports.
- Edge light — one luminous line; everything else is reserve. A one-pixel core, Ember glow below, Sky above, and thin displaced hairs of the palette where the light splits. Title frames, dividers, app headers.

Typographic treatment (CSS, always live text): Type diffusion — one statement, four copies of the same live text masked along one diagonal: sharp Ember at the source, blurring through Violet into Sky.

All materials support palette and grain. Geometry controls are material-specific and exposed in the application inspector; the spec export lists only the parameters implemented for that material. `data-live` animates a non-field material. The material spec export (`Impossible-materials.json`) lists the seven-layer chain for each family. Do not stack materials; do not add a second grain pass; do not place small type across a valley, a rim, or the tube.

## Motion and rendering

The field uses rates +0.020 and −0.017, a 12fps grain cadence, and slow continuous deformation. Reveal timing is 1.1s with 0.11s line delays. Text stays live in the DOM; material renders behind it, and cursor movement refracts only the field.

The toolkit shares one WebGL context across visible material canvases, caps resolution, and pauses offscreen animation. Reduced motion freezes the field. Pause must remain available. Static gradient fallback is provided when WebGL is unavailable; that fallback is not the full field renderer.

`source/site-field.frag` preserves the original site shader. `source/field.frag` is the live field: the hero ramp, a quieter lens rim, and film grain. `engine.js` contains material extensions and presets.

## Editability and delivery

- Keep type as native HTML or SVG text. Use raster layers only for procedural fields, imagery, or effects that require them.
- Preserve SVG marks and diagram geometry. Do not flatten an entire composition to claim editability.
- Each application export embeds fonts, marks, its live text, styling, and the renderer. Native text edits stay editable. Double-click SVG text in the standalone export to edit its content.
- Save edited application HTML before sharing. The toolkit also stores application edits in local browser storage; this is a convenience, not a backup.
- Supply local files. Do not publish unless explicitly requested.
- Check actual rendering, text overflow, mobile navigation, color contrast, reduced motion, offline opening, editing, and export reopening. Report remaining limitations plainly.

## Content

Use approved brand copy. Keep example content clearly separate from client work. Do not imply client results or claim that device frames reproduce current platform interfaces.

## Color transitions

Treat swatches as endpoints, not broad bands of flat color. Color is interpolated in light, never in pigment: every ramp is a plain OKLab mix between adjacent stops, with the handover width set by `size` (0.75 in the hero). The intermediate colors are renderer behavior, not new brand swatches.

The hero ramp is Black, Navy, Blue Sky, Solar Ember, Black. It opens and closes on black, so a field enters and leaves through the void instead of wrapping color onto color; that is what makes the ember read as a flare and the blue sit deep rather than royal. Do not replace a field with flat blue/orange stripes or a navy-and-peach wash.

Brief Studio, Application Studio, and their HTML exports embed this renderer. Brief PDF output uses a rendered field image only for the material band; copy and the exact mark remain text/vector. The static fallback samples the same color path, with simplified geometry.
