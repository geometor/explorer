GEOMETOR • explorer
====================

.. image:: https://img.shields.io/github/license/geometor/explorer.svg
   :target: https://github.com/geometor/explorer/blob/main/LICENSE

**Interactive web workbench for constructing, visualizing, and analyzing symbolic geometric models.**

Overview
--------

``geometor.explorer`` is the interactive visual workbench for the GEOMETOR initiative. Combining a Flask backend with a high-precision SVG/GSAP frontend, it brings the exact algebraic constructions of `geometor/model <https://github.com/geometor/model>`_ and the golden-ratio analysis of `geometor/divine <https://github.com/geometor/divine>`_ into a real-time graphical and scriptable environment.

SVG styling, primitive class conventions, and symbolic indications in ``geometor.explorer`` coordinate directly with `photon-platform/publish <https://github.com/photon-platform/publish>`_, enabling models constructed or exported in ``explorer`` (including G-Index propositions in `geometor/elements <https://github.com/geometor/elements>`_ and triangle centers in `geometor/etc <https://github.com/geometor/etc>`_) to render as interactive, theme-aware diagrams in Book Codex documentation.

Key Capabilities
----------------

- **Interactive SVG Canvas**: Vector canvas with standard Cartesian coordinates, zoom/pan navigation, and fit-to-view (hotkey ``f``).
- **Point-and-Click & Scripted Construction**: Construct Points, Lines, Circles, Perpendicular Bisectors, Angle Bisectors, Segments, Sections, and Polygons either graphically or via the integrated CLI overlay (hotkey ``~`` / ```` ` ````) using GEOMETOR symbolic syntax (`[ A B ]`, `( A B )`, `/ A B /`, `< A B C >`, `< B A C )`).
- **Live Divine Analysis**: Automatic detection and visual highlighting of golden sections, golden chains, and harmonic ranges via ``geometor.divine``.
- **Data & Analysis Views**:
  - **SEQ**: Chronological step-by-step construction history with visibility and guide toggles.
  - **CAT**: Categorized tables for Points, Structures (Lines, Circles), and Graphics.
  - **GRP**: Live Divine Analysis groupings sorted by Size, Chain, and Point.
- **Animation Timeline & Ancestor Highlighting**: Scrubbable step-by-step playback bar and hover lineage tracing.
- **Symbolic KaTeX Hover Cards**: Inspect exact SymPy algebraic coordinates, radii, line equations, and spreads on hover.
- **Publication-Ready Exports**: Export static SVGs, animated self-playing SVGs, and print-ready HTML sheets (Letter, Super B) compatible with `photon-platform/publish`.

Installation & Usage
--------------------

Install with ``uv`` alongside ``geometor.model`` and ``geometor.divine``:

.. code-block:: bash

   uv venv --python 3.13
   uv pip install -e ../model -e ../divine -e .
   explorer

Then open `http://127.0.0.1:4444 <http://127.0.0.1:4444>`_.

Documentation & Coordination with ``publish``
---------------------------------------------

Project documentation in ``docsrc/`` is built and styled with `photon-platform/publish <https://github.com/photon-platform/publish>`_ in the unified Book Codex theme:

.. code-block:: bash

   publish test

Resources & Related Projects
----------------------------

- **Documentation**: https://geometor.github.io/explorer
- **Source Code**: https://github.com/geometor/explorer
- `GEOMETOR • model <https://github.com/geometor/model>`_: Symbolic geometric construction engine.
- `GEOMETOR • elements <https://github.com/geometor/elements>`_: G-Index (`G.1`–`G.525`) constructions and 3-track Book Codex.
- `GEOMETOR • etc <https://github.com/geometor/etc>`_: *Encyclopedia of Triangle Centers* (`x-NNNNN.json` models and SVGs).
- `PHOTON • publish <https://github.com/photon-platform/publish>`_: Sphinx Book Codex publishing engine and theme.
