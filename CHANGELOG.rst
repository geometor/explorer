changelog
=========

0.2.10
------
*2025-10-23*

**added**

.. + Adds keymaps for the following actions:
.. + `l`: construct line
.. + `c`: construct circle
.. + `p`: set point (opens dialog)
.. + `s`: set segment
.. + `S`: set section
.. + `y`: set polygon
.. + Adds a center panel in the status bar to show the ID of the currently selected points.

0.2.9
-----
*2025-10-23*

**added**

.. + Added a modal dialog for creating new models with options for different templates (blank, default, equidistant).
.. + Added logging for file save and load operations.

**fixed**

.. + Fixed an issue where the initial model was loaded twice on startup.

0.2.8
-----
*2025-10-23*

**fixed**

.. + Fixed an issue where segment constructions were not being properly loaded and displayed.

0.2.7
-----
*2025-10-23*

**removed**

.. + Removed old construction files to support the updated serialization format from the model library.

0.2.5
-----
*2025-10-22*

**changed**

.. + Refactored JavaScript codebase to a modular architecture to resolve dependency issues.
.. + Implemented a dark theme for all modal dialogs.
.. + Added robust error handling for algebraic expressions in point creation.

0.2.4
-----
*2025-10-22*

**changed**

.. + Made dark theme the default style.
.. + Theme toggle now only changes the theme for the svg.

0.2.3
-----
*2025-10-22*

**added**

.. + Added a `guide` property toggle in the UI for points, lines, and circles.
.. + Added styling for guide elements to distinguish them visually.

0.2.1
-----
*2025-10-20*

**changed**

.. + Implemented a centralized logging system to provide clear, sequential feedback on construction and analysis operations.
.. + Refactored the application to use the new synchronous analysis hook from the `geometor-model` library.
.. + Added a file logger (`explorer.log`) for detailed debugging.

0.1.0
-----
*2025-10-19*

**changed**

.. + Updated point hover card to use a multi-column layout for algebraic and decimal values.
.. + Updated line hover card to display segment length.