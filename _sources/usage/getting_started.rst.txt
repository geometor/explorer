:type: usage
:order: 2

getting started
===============

Launching the Explorer
----------------------

To start the ``explorer`` web application server, run the following command in your terminal within your activated virtual environment:

.. code-block:: bash

   explorer

Alternatively, you can start the application via Python module execution:

.. code-block:: bash

   python -m geometor.explorer

Accessing the Application
-------------------------

Once running, the Flask server starts on port **4444** by default. Open your web browser and navigate to:

.. code-block:: text

   http://127.0.0.1:4444

Starting Model Templates
------------------------

Upon initializing a new model (via the **New** button in the File panel), you can choose from three initial templates:

- **Default**: Initializes the canvas with origin point ``A (0, 0)`` and unit point ``B (1, 0)``.
- **Blank**: Starts with an empty canvas for custom point placement.
- **Equidistant**: Places symmetric given points at ``A (-1/2, 0)`` and ``B (1/2, 0)``.
