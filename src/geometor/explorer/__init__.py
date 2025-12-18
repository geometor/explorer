"""Web-based interface for visualizing and interacting with geometric models.

The :mod:`geometor.explorer` provides a Flask-based server and API for creating,
analyzing, and visualizing geometric constructions.

**Key Components**

- **App**: The main Flask application (:mod:`~geometor.explorer.app`) that handles API requests and serves the frontend.
- **Serialization**: Tools (:mod:`~geometor.explorer.serialize`) to convert model data into JSON format for the browser.
- **Logging**: Configuration (:mod:`~geometor.explorer.log`) for application logging.

"""

from __future__ import annotations

__version__ = "0.4.9"
