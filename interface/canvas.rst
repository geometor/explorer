:order: 1

canvas
======

The central drawing canvas renders the active geometric model as an interactive scalable vector graphic (SVG).

Cartesian Coordinate System
---------------------------

- **Flipped Y-Axis**: The canvas uses standard Cartesian coordinates where positive Y extends upwards and positive X extends rightwards.
- **Infinite Vector Precision**: Crisp vector rendering ensures elements remain sharp at any zoom scale.

Navigation & Viewport Controls
------------------------------

- **Pan & Zoom**: Click and drag to pan across the model space; use mouse scroll wheel to zoom in and out.
- **Fit Viewport**: Press the ``f`` hotkey at any time to automatically calculate the bounding volume of all active elements and fit the construction within your viewport.

Hover Cards & Symbolic Math
---------------------------

Hovering your cursor over any geometric element triggers a dynamic hover card displaying symbolic algebraic and numerical properties powered by `KaTeX <https://katex.org/>`_:

- **Points**: Exact SymPy algebraic expressions for X and Y coordinates alongside 6-decimal approximations.
- **Lines**: Exact polynomial equations, line coefficients, and defining point references.
- **Circles**: Exact center point ``(h, k)`` coordinates and radius ``r``.
- **Segments & Sections**: Length ratios, Golden ratio indicators, and endpoint definitions.
- **Polygons**: Vertex sequences, area metrics, and angular spreads.

Ancestor Dependency Highlighting
--------------------------------

Toggle the Ancestor Highlighting feature via the sidebar button (`account_tree` icon) or Settings. When enabled, hovering over any constructed element highlights all parent elements (points, lines, circles) that were used to construct it, rendering a visual lineage tree directly on the canvas.
