GEOMETOR • explorer
====================

.. image:: https://img.shields.io/pypi/v/geometor-explorer.svg
   :target: https://pypi.python.org/pypi/geometor-explorer
.. image:: https://img.shields.io/github/license/geometor/explorer.svg
   :target: https://github.com/geometor/explorer/blob/main/LICENSE

**An interactive interface for visualizing and analyzing geometric models.**

Overview
--------

``geometor.explorer`` is the interactive workbench for the GEOMETOR initiative. It brings the symbolic models of ``geometor.model`` to life, providing a real-time visual interface for constructing, observing, and analyzing geometric systems.

While ``geometor.model`` provides the "algebra" and ``geometor.divine`` provides the "analysis", ``explorer`` provides the "intuition".

Key Features
------------

- **Interactive Canvas**: Build constructions step-by-step using a point-and-click interface.
- **Symbolic Visualization**: Click on any element to see its exact algebraic definition (using LaTeX/KaTeX).
- **Real-Time Analysis**: Watch as golden sections and harmonic ranges are automatically highlighted by ``geometor.divine`` as you build.
- **Precise Rendering**: SVG-based rendering ensures infinite scalability and crisp visuals.

Installation
------------

.. code-block:: bash

    pip install geometor-explorer

Usage
-----

Start the explorer server:

.. code-block:: bash

    explorer

Then open your browser to `http://127.0.0.1:9000`.

Dependencies
------------

- **Flask**: Web server backend.
- **geometor.model**: Core geometry engine.
- **geometor.divine**: Analysis engine.

Resources
---------

- **Source Code**: https://github.com/geometor/explorer
- **Issues**: https://github.com/geometor/explorer/issues
