:type: usage
:order: 1

installation
============

PyPI releases for ``geometor-explorer`` may be out of date. We recommend installing ``geometor.explorer`` locally alongside its sibling packages ``geometor.model`` and ``geometor.divine`` using `uv <https://github.com/astral-sh/uv>`_.

Prerequisites
-------------

- **Python**: 3.13 or higher
- **uv**: Fast Python package installer and virtual environment manager

Local Editable Setup
--------------------

1. **Clone the Repositories**:

   Clone the required packages side-by-side:

   .. code-block:: bash

      git clone https://github.com/geometor/model.git
      git clone https://github.com/geometor/divine.git
      git clone https://github.com/geometor/explorer.git

2. **Create Virtual Environment with `uv`**:

   Navigate into the ``explorer`` directory and create a virtual environment:

   .. code-block:: bash

      cd explorer
      uv venv
      source .venv/bin/activate

3. **Install Local Editable Packages**:

   Install ``geometor-model``, ``geometor-divine``, and ``geometor-explorer`` in editable mode:

   .. code-block:: bash

      uv pip install -e ../model -e ../divine -e .

Dependencies
------------

- ``geometor-model``: Core symbolic geometry engine
- ``geometor-divine``: Golden section and harmonic analysis engine
- ``flask``: Web application framework backend
- ``rich``: Terminal formatting and CLI logging
