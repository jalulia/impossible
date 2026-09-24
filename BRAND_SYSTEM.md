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

Nine computed materials share one program (`source/materials.frag`) and related causes: the site field’s warped phase for ridges and screens, explicit curves for ribbons, the band and edge light, and distance geometry for bodies. Color is mixed in Oklab and converted to sRGB with the standard piecewise transfer; emitted light (Edge light) adds in linear light so the glow keeps the token hues. Grain is single-pixel, from an integer-quality hash, added to lightness and gated to each material’s body: it never forms a pattern and never washes out a color. Surfaces are matte; there are no specular highlights. Choose one primary family per composition and state its read before tuning parameters.

- Folded field — a pressed surface: Ember faces, Violet valleys, one raking light. The profile is a slow rise and a steep rounded return, continuous across the crest and the wrap, so edges never alias. A key light shades the faces from deep red to Ember; a cool back light lifts the return faces from Navy through Violet to a Sky-lit crest; troughs close through Navy into Black. Covers, full-bleed dividers. `data-scale` sets ridge count.
- Grain ribbon — two bands of one surface twisting through the whole ramp; heavy grain gated to density. Posters, key visuals.
- Eclipse — dark reserve, one luminous limb, directional corona on a Sky-to-Ember limb and a localized white flare. Focus slides, social. The center stays black.
- Orbs — six flat disks, each a shaped gradient of one color: the token at the lit edge falls through its own dark relative (Ember → deep red, Sky → Violet, Violet → Navy), with fbm mottle in the coverage. No sphere shading. Concept systems, OOH. `data-seed` jitters the arrangement.
- Chromatic fold — one matte band crossing the frame, Violet → Sky → a dark crease → Ember Soft → Ember across its width; at one point it twists to a line and the run flips sides. Hero frames, deck openings. `data-offset` moves the band.
- Thermal body — a warm mass and two satellites on paper, read through the edge: Ember lifting toward Ember Soft at the center, then a Navy hairline, Violet, Sky, Sky Pale, paper. The grain lives in the halo, like a thermal print. Light layouts, editorial.
- Two-plate screen — an Ember plate and a Violet plate at 15° and 75°, each a soft form dissolving into paper; the Violet plate is a hair out of register and the overprint darkens. Print, covers, stamps.
- Line screen — one ink, one fine pitch; a body appears only as line weight, near solid at its center, hairline at its edge, gone in the reserve. Editorial, reports.
- Edge light — one luminous line; everything else is reserve. A one-pixel core, Ember glow below, Sky above, and thin displaced hairs of the palette where the light splits. Title frames, dividers, app headers.

Typographic treatments (CSS/SVG, always live text), each one word set as a composition:

- Type diffusion — one statement, four copies of the same live text masked along one diagonal: sharp Ember at the source, blurring through Violet into Sky.
- Ink type — one word in one Ember plate: a fine dot screen masks pinholes of paper into the letter, turbulence grain varies the coverage, and the outline is displaced. The principle it names is set small beneath it.
- Line-screen type — three copies of the same live text on one 6px pitch, 1.8, 3.3 and 4.7px lines, handed from one weight to the next by vertical masks: hairline at the top, solid at the foot.

All materials support palette and grain. Geometry controls are material-specific and exposed in the application inspector; the spec export lists only the parameters implemented for that material. `data-live` animates a non-field material. The material spec export (`Impossible-materials.json`) lists the seven-layer chain for each family. Do not stack materials; do not add a second grain pass; do not place small type across a valley, a rim, or the tube.

## Motion and rendering

The field uses rates +0.020 and −0.017, a 12fps grain cadence, and slow continuous deformation. Reveal timing is 1.1s with 0.11s line delays. Text stays live in the DOM; material renders behind it, and cursor movement refracts only the field.

The toolkit shares one WebGL context across visible material canvases, caps resolution, and pauses offscreen animation. Reduced motion freezes the field. Pause must remain available. Static gradient fallback is provided when WebGL is unavailable; that fallback is not the full field renderer.

`source/site-field.frag` contains the field shader. `source/field.frag` renders live type over a quieter lens rim, finer grain, and continuous color shoulders. `engine.js` contains material extensions and presets.

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

Treat swatches as endpoints, not broad bands of flat color. Dark cool transitions bend toward teal before reaching Sky; dark warm transitions bend toward red before reaching Ember. These intermediate hues are renderer behavior, not new brand swatches.

The shared OKLab interpolation rotates intermediate hue only when the two endpoints differ sufficiently in lightness. It preserves the endpoints. Pale contributes a 12% lift to the cool bridge and has no independent plateau. The warm shoulder has more room than the cool-to-warm crossover. Do not replace these fields with flat blue/orange stripes or a navy-and-peach wash.

Brief Studio, Application Studio, and their HTML exports embed this renderer. Brief PDF output uses a rendered field image only for the material band; copy and the exact mark remain text/vector. The static fallback samples the same color path, with simplified geometry.
