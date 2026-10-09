:order: 3

cli panel
=========

The integrated Command-Line Interface (CLI) provides a keyboard-driven environment for rapid scriptable geometric construction.

Accessing the CLI
-----------------

Press the tilde key (``~`` or `` ` ``) or click the terminal icon (``terminal``) in the left sidebar to toggle the semi-transparent CLI overlay at the bottom of the screen.

Command Syntax
--------------

The CLI supports concise text syntax for defining all geometric primitives and derived structures:

Point Assignment
~~~~~~~~~~~~~~~~

- **Explicit Label**: Define a point with an explicit identifier:

  .. code-block:: text

     A = 0, 0
     B = 1, 0
     C = 0.5, 0.866025

- **Auto-Label**: Create a point with auto-generated ID:

  .. code-block:: text

     * 0, 0

Line Construction
~~~~~~~~~~~~~~~~~

- **Line Through Points**: Construct an infinite line passing through points `A` and `B`:

  .. code-block:: text

     [ A B ]

Circle Construction
~~~~~~~~~~~~~~~~~~~

- **Circle Center-Radius**: Construct a circle centered at `A` passing through `B`:

  .. code-block:: text

     ( A B )

Polygon Construction
~~~~~~~~~~~~~~~~~~~~

- **Polygon Bounds**: Define a polygon bounded by vertices `A`, `B`, and `C`:

  .. code-block:: text

     < A B C >

Linear Divisions & Sections
~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **Segment**: Define a segment between `A` and `B`:

  .. code-block:: text

     / A B /

- **Section**: Define a collinear section through points `A`, `B`, and `C`:

  .. code-block:: text

     / A B C /

Wedges
~~~~~~

- **Wedge Angle**: Define a wedge bounded by points `A`, `B`, and `C`:

  .. code-block:: text

     < A B C )

Features & Navigation
---------------------

- **Command History**: Use **Up** and **Down** arrow keys inside the CLI input prompt to navigate through previous command execution history.
- **Feedback Log**: Success messages or parse errors are instantly reported in the CLI output window.
