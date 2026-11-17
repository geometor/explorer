GEOMETOR • explorer
===================

**Visit the Online Archive:** https://geometor.github.io/explorer/

.. image:: docsrc/_static/hero.svg
   :alt: GEOMETOR • explorer featured geometric construction
   :target: https://geometor.github.io/explorer/
   :align: center

**Geometry Explorer • Interactive SVG workbench and symbolic construction CLI**

Mission
-------

``geometor/explorer`` is part of the interconnected `GEOMETOR <https://geometor.com>`_ semantic digital archive. It provides a real-time interactive vector workbench and symbolic construction environment, bridging the exact algebraic engine of ``geometor.model`` with live golden-ratio harmonic analysis. Through hotkey-driven navigation, timeline animation, and publication-ready SVG rendering, it liberates abstract geometric models into exploratory visual workspaces across the GEOMETOR corpus.

Capabilities & Interactive Docs
-------------------------------

- **`Interactive Geometry Explorer <https://geometor.github.io/explorer/>`_** — Real-time SVG workbench, Cartesian navigation, and hotkey controls for geometric modeling.
- **`Usage & Getting Started <https://geometor.github.io/explorer/usage/>`_** — Guides for canvas navigation, point-and-click construction, and live CLI overlay (``[ A B ]``, ``( A B )``, ``/ A B /``).
- **`Divine Harmonic Analysis <https://geometor.github.io/explorer/usage/analysis/>`_** — Real-time detection and visual grouping of golden sections, golden chains, and harmonic ranges.
- **`Animation & Timeline Playback <https://geometor.github.io/explorer/usage/animation/>`_** — Scrubbable step-by-step construction playback and ancestor lineage tracing.
- **`SVG & Print Exports <https://geometor.github.io/explorer/usage/export/>`_** — Export publication-ready static and animated SVGs calibrated for the Book Codex theme.

Repository Contents
-------------------

- ``docsrc/`` — RST documentation, guides, and UI reference compiled by `PHOTON publish <https://github.com/photon-platform/publish>`_.
- ``src/geometor/explorer/`` — Flask backend, interactive SVG canvas templates, and CLI integration.

Local Build & Verification
--------------------------

.. code-block:: bash

   publish build
   uv run --no-sync pytest

Part of the GEOMETOR Knowledge Archive
--------------------------------------

Explore all **74 Book Codices** and **11 Mathematical Catalogs** at https://geometor.com/books/.
