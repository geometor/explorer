===================
GEOMETOR • explorer
===================

.. image:: https://img.shields.io/pypi/v/geometor-explorer.svg
   :target: https://pypi.python.org/pypi/geometor-explorer
.. image:: https://img.shields.io/github/license/geometor/explorer.svg
   :target: https://github.com/geometor/explorer/blob/main/LICENSE

A web-based UI for the GEOMETOR model.

Overview
--------

The `explorer` provides an interactive environment for creating, visualizing, and analyzing geometric constructions. It uses Flask for the backend and SVG for rendering, integrating with `geometor.model` for core geometry and `geometor.divine` for analysis.

Key Features
------------

- **Interactive UI:** A vanilla JavaScript frontend provides interactivity, including hover cards and table highlighting.
- **SVG Visualization:** Geometric constructions are rendered as clean, scalable SVG in the browser.
- **Analysis Engine:** Integrates with `geometor.divine` to analyze constructions and identify key relationships.
- **LaTeX Display:** Symbolic coordinates and equations are rendered using the KaTeX library.
- **Server-Side Logic:** A Python Flask backend manages geometric models and serves data to the frontend.

Key Files
---------

-   `app.py`: The main Flask application, handling routing and backend logic.
-   `static/`: Frontend assets, including JavaScript, CSS, and images.
-   `templates/`: HTML templates for the web interface.
-   `serialize.py`: Handles the serialization of construction data.

Usage
-----

To run the Explorer application:

.. code-block:: bash

   python -m geometor.explorer

Then, open a web browser and go to `http://127.0.0.1:4444`.

Dependencies
------------

- Flask
- geometor-model
- geometor-divine
- sympy

Contributing
------------

Contributions are welcome! Please see our `GitHub issues <https://github.com/geometor/explorer/issues>`_ for ways to contribute.

License
-------

**geometor-explorer** is licensed under the MIT License. See the `LICENSE` file for more details.
