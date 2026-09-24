# Impossible Brief Studio

Open **Impossible Brief Studio.html**. It is a self-contained local application. `index.html` is the modular source entry point.

1. Paste a brief from Google Docs, or open a `.docx`, `.html`, `.md`, `.txt`, or saved `.json` project.
2. Review the document. Text is editable directly in the preview. Change the title, client, document label in the sidebar.
3. Download a standalone HTML document or a searchable, paginated PDF.
4. Review the deck outline, revise headlines/content/notes, rearrange slides, and download an HTML presentation.
5. Copy or download a build handoff containing the full brief, current outline, brand rules, exact logo geometry, and a project schema.

Save a `.brief.json` file to keep all source content, document edits, and slide edits. Browser storage is a convenience, not the portable project file. Exported HTML contains its project payload and can be reopened here; visible text edits are recovered when it is imported.

## Content model

Project files contain `meta`, `palette`, `source`, `blocks`, and `slides`.

- `source` retains the imported content independently of the output. Import does not execute document scripts, event handlers, or unsafe links. Embedded PNG/JPEG/WebP images are supported; remote images are not fetched automatically.
- `blocks` hold stable IDs, semantic type, and sanitized HTML. Headings, paragraphs, lists, tables, quotes, and images remain distinct.
- `slides` hold a title, body, speaker notes, layout, and source block IDs. The initial outline follows the source headings and uses source excerpts. Long detail is retained in notes. Use the build handoff to develop the narrative further.
- Slide edits do not silently change the full brief. Rebuilding the outline explicitly replaces slide edits.

## Importing from Google Docs

Copy from the signed-in document or download it as Word, then open it here. Private documents require Google authentication.

## Color and type

The eight brand tokens define the palette. Solar Ember #F46138 and Blue Sky #2C9FF4 are the accents; White carries document surfaces; Black carries reading text and dark surfaces. Navy, Sky Pale, and Ember Soft appear only inside short material transitions. Blue Violet / White is 4.476:1 and is restricted to large text; Blue Sky / White is 2.848:1 and is restricted to marks and decorative fields.

The mark is the supplied SVG, intact. Poppins Black and Medium, Poppins Light, and Proxima Nova Regular/Bold retain their type roles. The bundled fonts and Noto Sans fallback cover document punctuation. PDF body and heading text is native searchable text. The logo remains vector artwork. PDF layout is authored for US Letter; HTML has responsive and print styles.

Most Latin, Greek, and Cyrillic text is supported by the bundled fallback. If a character is unsupported by the PDF fonts, the app reports it instead of silently dropping it; HTML’s Print / Save PDF can use system font fallback. DOCX text boxes and complex page-positioned Word art are outside the semantic importer. Review import notes and the preview for those documents.

## Local dependencies

- Mammoth: semantic DOCX import. https://github.com/mwilliamson/mammoth.js
- jsPDF: native text PDF generation. https://github.com/parallax/jsPDF
- Poppins: https://github.com/google/fonts/tree/main/ofl/poppins
- Noto Sans: https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSans

Libraries, fonts, and their open-source licenses are bundled in `vendor/`. Brand assets retain their existing ownership. No network calls, API keys, hosting, or account connection are required to use the local app.

After editing source files, run `python3 build.py` to update `Impossible Brief Studio.html`.
