GEOMETOR • explorer
====================

.. image:: https://img.shields.io/github/license/geometor/explorer.svg
   :target: https://github.com/geometor/explorer/blob/main/LICENSE

**An interactive interface for visualizing and analyzing geometric models.**

Overview
--------

``geometor.explorer`` is the interactive workbench for the GEOMETOR initiative. It brings the symbolic models of ``geometor.model`` to life, providing a real-time visual interface for constructing, observing, and analyzing geometric systems.

While ``geometor.model`` provides the "algebra" and ``geometor.divine`` provides the "analysis", ``explorer`` provides the "intuition".

Key Capabilities
----------------

- **Interactive SVG Canvas**: Precise vector canvas with standard Cartesian coordinates (flipped Y-axis), zoom/pan navigation, and fit-to-view (hotkey ``f``).
- **Point-and-Click Construction**: Construct Points, Lines, Circles, Perpendicular Bisectors, Angle Bisectors, and Polynomial curves.
- **Derived Geometric Structures**: Define Segments, Sections (collinear sequences of points), and Polygons (multi-point bounds).
- **Live Divine Analysis**: Automatic detection and visual highlighting of golden sections, golden chains, and harmonic ranges via ``geometor.divine``.
- **Data & Analysis Views**:
  - **SEQ**: Chronological sequential step-by-step history table with visibility and guide element controls.
  - **CAT**: Categorized tables for Points, Structures (Lines, Circles, Polynomials), and Graphics.
  - **GRP**: Live Divine Analysis groupings sorted by Size (ratio), Chain (connected sequences), and Point.
- **Integrated CLI Panel**: Built-in command overlay (hotkey ``~`` / ```` ` ````) supporting scriptable point assignments, lines `[ A B ]`, circles `( A B )`, polygons `< A B C >`, linear divisions `/ A B /`, and wedges `< A B C )`.
- **Animation Timeline**: Interactive timeline with play/pause, scrubbable slider, step forward/backward, and arrow key navigation.
- **Symbolic LaTeX Hover Cards**: Rich hover popups rendering exact algebraic expressions via KaTeX, decimal coordinates, radii, line equations, and polygon spreads.
- **Ancestor Highlighting**: Trace construction dependency lineages on hover.
- **Flexible Exporting Options**:
  - **Static SVG & HTML Pages**: Choose between Screen display and Print targets with sheet sizes (Letter 11"x8.5", Super B 19"x13") and Force Light Mode.
  - **Animated SVG**: Export self-playing interactive SVG files with click-to-pause controls.
- **Zen Mode**: Distraction-free view toggling off all side panels (hotkey ``v``).

Installation (Local / Editable)
-------------------------------

PyPI releases may be out of date. We recommend installing ``geometor.explorer`` locally along with its core dependencies ``geometor.model`` and ``geometor.divine`` using `uv <https://github.com/astral-sh/uv>`_.

1. **Clone the Repositories**:

   .. code-block:: bash

       git clone https://github.com/geometor/model.git
       git clone https://github.com/geometor/divine.git
       git clone https://github.com/geometor/explorer.git

2. **Set Up Environment with `uv`**:

   Navigate into the ``explorer`` directory, create a virtual environment, and install all three repositories in editable mode:

   .. code-block:: bash

       cd explorer
       uv venv
       source .venv/bin/activate
       uv pip install -e ../model -e ../divine -e .

Usage
-----

Start the explorer server:

.. code-block:: bash

    explorer

Then open your browser to `http://127.0.0.1:4444 <http://127.0.0.1:4444>`_.

On startup, you can choose a starting model template:
- **Default**: Origin ``(0, 0)`` and unit point ``(1, 0)``.
- **Blank**: Clean canvas.
- **Equidistant**: Symmetric points at ``(-1/2, 0)`` and ``(1/2, 0)``.

Keyboard Shortcuts
------------------

- ``p`` : Construct Point
- ``P`` : Construct Polynomial
- ``l`` : Construct Line
- ``c`` : Construct Circle
- ``s`` : Set Segment
- ``S`` : Set Section
- ``y`` : Set Polygon
- ``f`` : Fit construction in viewport
- ``v`` : Toggle Zen Mode (hide sidebars)
- ``~`` / ```` ` ```` : Toggle CLI Panel
- **Arrow Keys** : Animation timeline step controls

Visual Guide & Screenshots
--------------------------

*(Screenshots coming soon)*

- **Main Workbench**: Interactive SVG canvas surrounded by file tools, construction actions, and history sidebars.
  *(Placeholder: `docsrc/_static/img/screenshot_workbench.png`)*
- **Integrated CLI Panel**: Command overlay for fast scriptable construction building.
  *(Placeholder: `docsrc/_static/img/screenshot_cli.png`)*
- **Divine Analysis & Grouping Views**: Golden section highlighting and grouping tables (Size, Chain, Point).
  *(Placeholder: `docsrc/_static/img/screenshot_analysis.png`)*
- **Animation Timeline**: Step-by-step playback bar and timeline slider.
  *(Placeholder: `docsrc/_static/img/screenshot_animation.png`)*
- **Export Modal**: Custom SVG and HTML page export dialog with print settings.
  *(Placeholder: `docsrc/_static/img/screenshot_export.png`)*

Dependencies
------------

- **Flask**: Web server backend.
- **geometor.model**: Symbolic geometric engine.
- **geometor.divine**: Divine proportion and harmonic analysis engine.
- **Rich**: Terminal output formatting.

Resources
---------

- **Source Code**: https://github.com/geometor/explorer
- **Documentation**: https://geometor.github.io/explorer
- **Issues**: https://github.com/geometor/explorer/issues
