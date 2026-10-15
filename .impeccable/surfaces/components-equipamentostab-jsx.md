---
version: 1
slug: "components-equipamentostab-jsx"
primary_target: "components/EquipamentosTab.jsx"
related_targets: ["components/equipamentos/NovaEntradaModal.jsx"]
---

# Equipamentos

Mode: Operate. Extension of the incumbent Berlim world (no new visual identity).

Audience and job: Produção, standing next to the printer with a phone, often one hand free. Logs a refill (which inks, page counter, date) or a maintenance (page counter, what was done, date). Later, anyone checks how long since each ink was refilled and how many pages a load yielded.

Constraints: mobile-first, thumb reach, numeric keypad for the counter, the project's CustomDatePicker for the date. Machines live in the database (table `equipamentos`, supabase/equipamentos_migration.sql), created by administrators: internal name, optional model, type (inkjet pigment/dye, laser, eco solvent, latex, UV), colour or monochrome, and the inks from the fixed list in lib/equipamentos/catalogo.js. No machine photos — the team tells identical machines apart by the internal name. Grouped on screen by type; administrators reorder by dragging the card and archive instead of deleting.

Open: nothing pending; shipped 2026-10-14.

## Direction contract

Revised 2026-10-14: the team dropped machine photos for named cards grouped by type. Photo clauses below are replaced by the name.

THESIS: The paper sheet that hangs on each machine, moved to the phone. Pick the printer by its internal name, log in seconds, read each ink's age at a glance. Refuses the generic CRUD table with a "+ Novo" button.

OWN-WORLD: The incumbent system — Montserrat, brand orange, light and dark tokens. The one product-native element is ink in true process colours (cyan, magenta, yellow, black, plus each machine's extras), always carrying data, never ornament.

STORY: The operator finds the machine by its internal name inside its type group, taps it, records what was done, and sees the yield of the last load per ink.

FIRST VIEWPORT: Mobile: title, then the type groups, each a single column of cards; on each card the internal name, the model and an ink strip (swatch, short code, days since the last refill). The primary action is tapping the card; "Nova máquina" sits in the bottom action bar for administrators.

FORM: Operate, extension of the incumbent world, position 1 of 1. Seed key: none — concept-seed exempt under new-work §3: "Never run the script for a local extension or a precisely specified narrow request; shape those directly." The request named the layout (machine photos to pick from), the modal, the type choice, per-machine colours with CMYK default, and the house date picker.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
