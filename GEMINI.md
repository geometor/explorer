# GEOMETOR Explorer

A web-based UI for the GEOMETOR model, allowing for interactive creation, visualization, and analysis of geometric constructions.

## Components

### Backend (Flask)

-   **`src/geometor/explorer/app.py`**: The main Flask application, serving the frontend and providing an API to the `geometor.model` library. It also integrates with `geometor.divine` for analysis.
-   **`templates/`**: HTML templates.
-   **`static/`**: Frontend assets (JS, CSS, images).

### Frontend (JavaScript/SVG)

-   **`static/js/`**: JavaScript files for rendering and user interaction.
-   **`static/css/`**: CSS stylesheets.
-   **`static/svg/`**: SVG assets.

### Constructions

-   **`constructions/`**: JSON files of saved constructions.

## Development Plan

See `ROADMAP.md`.
