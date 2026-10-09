:order: 6

exporting
=========

``geometor.explorer`` offers customizable export workflows for high-resolution print output, presentations, web embedding, and self-playing vector animations.

Static SVG & HTML Export Modal
------------------------------

Click the **Export SVG** button (`file_download`) in the left sidebar to open the Export Settings modal:

Output Formats
~~~~~~~~~~~~~~

- **SVG File**: Standalone vector graphics file with embedded CSS styles, suitable for vector editors (Inkscape, Illustrator) or web embedding.
- **HTML Page**: Full HTML wrapper page featuring a clean white background, optimized for high-quality printing, browser PDF saving, and poster printing.

Output Target Overrides
~~~~~~~~~~~~~~~~~~~~~~~

- **Screen**: Retains non-scaling vector strokes optimized for monitor display.
- **Print**: Wraps stroke definitions in `@media print` rules for vector line width overrides during printing.
- **Sheet Sizes**: Choose target page dimensions for print layouts:
  - **Letter**: 11" x 8.5"
  - **Super B**: 19" x 13"
- **Force Light Mode**: Ensures light background and dark contrast lines regardless of active browser dark mode settings.

Animated SVG Export
-------------------

Click the **Export Animated SVG** button (`animation`) in the left sidebar to download an interactive self-contained SVG file.

When opened in any modern web browser, the exported SVG automatically animates the step-by-step construction of the geometric model. Clicking anywhere on the animated SVG canvas pauses and resumes playback.
