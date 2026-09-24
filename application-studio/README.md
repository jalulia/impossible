# Application Studio

Open **Application Studio.html**. No server or account is needed.

- **Templates:** 12 starting compositions in five formats. Each has sparse, standard, and detailed content sets.
- **Components:** 11 reusable parts, plus iPhone, social, and browser frames. Add, move, remove, or export a part.
- **Editor:** change copy, row data, format, arrangement, surface, and density. Click native text directly or use Content. Material windows can share settings or use independent materials and palettes.
- **Save project:** portable JSON that reopens in this editor. Browser storage is only a convenience.
- **Export HTML:** a standalone composition with embedded fonts, exact mark, live text, diagram geometry, and material rendering. The exported file can save its edited HTML and project JSON.

`examples/` contains all 12 default templates as editable HTML and project JSON. `components/` contains standalone exports of all 11 components. `project.schema.json` describes the project format. For multi-page brief documents and PDF export, use the adjacent Brief Studio.

## Composition contract

A template supplies a starting structure. A component carries content. A frame wraps the composition. A material paints a separate canvas. Do not rasterize the complete composition to combine these layers.

Fixed: exact mark asset, canonical fonts, palette values, and palette roles. Open: approved copy, data, component order, content density, format, and material settings. Black is the reading ink; White is the paper. Ember and Sky carry the material. Pale, soft, and navy remain material transitions.

Chart components start without values. Add verified figures and their source before sharing an export.

## Editing boundaries

Diagrams use native HTML labels and SVG/CSS geometry. Their node positions follow the component layout; this is not a freeform node editor. Charts derive their geometry from editable row data. The phone is a generic iPhone presentation frame, not a hardware production drawing. Templates are single compositions; oversized custom copy or an unsuitable component combination produces a fit warning. Keep the final artifact readable at its intended size.

## Source

- `registry.js`: templates, component defaults, and formats.
- `studio.js`: composition rendering, native editing, import, and export.
- `studio.css`: editor and composition styles.
- `build.py`: embeds the shared brand assets into the portable Studio file. The parent toolkit build calls it.
- Shared renderer, exact marks, tokens, and fonts are bundled locally.

When changing rendering code, regenerate the HTML examples and component exports with `IOStudio.exported(...)` in the browser after the build, then rebuild the toolkit ZIP. Source and outputs must agree. Reopen the final files offline and inspect them.
