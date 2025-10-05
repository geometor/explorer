GEOMETOR Explorer
=================

The GEOMETOR Explorer is a web-based, interactive application for visualizing and analyzing geometric constructions created with the `geometor.model` library.

It provides a dynamic interface where geometric models are rendered as SVG, and their algebraic properties, expressed in LaTeX, are displayed in detailed tables.

Features
--------

- **Server-Side Rendering:** A Python Flask backend creates geometric models and generates all necessary rendering data.
- **SVG Visualization:** Geometric constructions are rendered as clean, scalable SVG in the browser.
- **Interactive UI:** A vanilla JavaScript frontend provides interactivity:
    - Hover cards display detailed information for each point.
    - Table rows are highlighted when the corresponding point is hovered.
- **LaTeX Display:** Symbolic coordinates and equations are beautifully rendered using the KaTeX library.
- **Dark Mode:** A clean, modern dark theme for comfortable viewing.
- **Screen-Relative Scaling:** All strokes and points maintain a consistent visual size regardless of the zoom level, thanks to the `vector-effect="non-scaling-stroke"` SVG attribute.

Architecture
------------

The Explorer uses a client-server architecture:

- **Backend (Flask):**
    1.  Uses `geometor.model` to build a geometric construction (e.g., the Vesica Pisces).
    2.  Uses logic adapted from `geometor.render` to calculate the SVG bounding box and element coordinates.
    3.  Generates a JSON payload containing:
        - The SVG `viewBox` dimensions.
        - A list of SVG elements (lines, circles, polygons, points) with all necessary attributes for rendering, including styling and non-scaling stroke effects.
        - Data for UI tables, including symbolic expressions formatted as LaTeX strings.
    4.  Serves the frontend application and the JSON data via a simple API.

- **Frontend (HTML/CSS/JS):**
    1.  Fetches the model data from the backend API.
    2.  Uses vanilla JavaScript to dynamically create SVG elements in the browser based on the fetched data.
    3.  Populates data tables with point and structure information.
    4.  Uses the KaTeX library to render all LaTeX strings.
    5.  Manages all user interactivity, such as hover effects and highlighting.

This architecture keeps all heavy computation and geometric logic on the server, allowing for a lightweight and responsive frontend.

Usage
-----

To run the Explorer application:

1.  Navigate to the source directory:
    .. code-block:: bash

       cd geometor/explorer/src

2.  Run the application as a Python module:
    .. code-block:: bash

       python -m geometor.explorer

3.  Open a web browser and go to `http://127.0.0.1:4444`.

Dependencies
------------

The Explorer depends on the following key Python packages:

- **Flask:** For the web server.
- **geometor-model:** For creating the geometric constructions.
- **sympy:** For all symbolic mathematics.

Contributing
------------

Contributions are welcome! Please see our [GitHub issues](https://github.com/geometor/explorer/issues) for ways to contribute.

License
-------

**explorer** is licensed under the MIT License. See the `LICENSE` file for more details.