# GEOMETOR Explorer

A web-based UI for the GEOMETOR model.

## Overview

The `explorer` provides an interactive environment for creating, visualizing, and analyzing geometric constructions. It delivers a rich frontend experience using HTML5, CSS3, and Vanilla JavaScript, ensuring high performance and a polished look and feel.

The backend (Flask) manages the `geometor.model` state, while the frontend renders the construction as a scalable SVG, allowing for infinite precision and smooth interactions.

## Architecture

-   **Backend (Flask)**: Handles API requests, model state, and analysis integration via SSE (Server-Sent Events).
-   **Frontend (HTML/JS/CSS)**:
    -   **Libraries**: Includes GreenSock Animation Platform (GSAP) for advanced animations.
    -   `templates/`: Jinja2 templates for the application structure.
    -   `static/js/`: Vanilla JavaScript modules for UI logic, event handling, and SVG manipulation.
    -   `static/css/`: Custom CSS for styling, layout, and animations.
-   **Rendering**: The connection between math and visuals. The model's algebraic data is converted into SVG elements, which are then rendered and manipulated by the frontend.

## Index

-   `app.py`: The main Flask application entry point.
-   `src/geometor/explorer/static/`: Frontend assets.
-   `src/geometor/explorer/templates/`: HTML templates.
-   `serialize.py`: Handles serialization of the model for the frontend.

## Getting Started

### Installation

```bash
git clone https://github.com/geometor/explorer
cd explorer
pip install -e .
```

### Running the Application

```bash
# Run the explorer server
python -m geometor.explorer
```

Open your browser to [http://127.0.0.1:9000](http://127.0.0.1:9000).

### API Endpoints

-   `GET /api/model`: Get current model state.
-   `GET /api/constructions`: List available demo constructions.
-   `POST /api/model/new`: Reset to a new model.
-   `POST /api/construct/...`: Create geometric elements (lines, circles, etc.).
