# File Handling Improvement Plan

## 1. Objective

To create a more professional and seamless file handling experience in the GEOMETOR Explorer. The user should be able to save changes to a file without being prompted for a name every time, and receive clear, non-disruptive feedback on the status of file operations.

## 2. Core Logic: Client-Side State Management

The key is to introduce a client-side variable to track the current state of the file.

-   **`currentFilename` variable:**
    -   Initialize `let currentFilename = null;` at the top of the script.
    -   This variable will store the name of the file the user is currently working on.

-   **`isDirty` flag:**
    -   Initialize `let isDirty = false;`
    -   This flag will be set to `true` any time a construction action is successfully completed (line, circle, point added, element deleted).
    -   It will be set to `false` after a successful save, new, or open operation.
    -   This can be used later to prompt the user "You have unsaved changes" if they try to navigate away.

## 3. Improving the "Save" Workflow

### `saveBtn` Logic:

The event listener for `saveBtn` will be changed to:

1.  Check if `currentFilename` is set.
2.  **If `currentFilename` exists:** Call a new function `saveModel(currentFilename)` directly, without a prompt.
3.  **If `currentFilename` is `null`:** The file has never been saved. In this case, call the existing `saveAs()` function (which will be the old `saveModel` function that prompts for a name).

### `saveAsBtn` Logic:

-   This will always call the `saveAs()` function, which prompts for a new filename. This allows the user to save a copy of the current work.

### Updating `currentFilename`:

-   The `currentFilename` variable must be updated in two places:
    1.  After a successful **"Save As"** operation.
    2.  After a file is successfully **opened** via the "Open" button. The `file.name` from the file input should be stored in `currentFilename`.

## 4. Improving the "Open" Workflow

-   The `'change'` event listener for the `fileInput` will be modified.
-   After the file is successfully loaded and rendered, set `currentFilename = file.name;`.

## 5. Status Updates (No More Alerts)

-   **HTML:** A new status bar element needs to be added to `index.html`. It should be structured to hold both the filename and status messages separately.
    ```html
    <div id="status-bar">
        <span id="status-filename">Unsaved Model</span>
        <span id="status-message">Ready</span>
    </div>
    ```
-   **JavaScript:**
    -   Create a helper function: `updateStatus(message, isError = false)`. This function will update the `textContent` of the `#status-message` element.
    -   Create a second helper function, `updateFilenameDisplay()`, that updates the `#status-filename` element. It should be called after any open or save operation. It will display the `currentFilename` or "Unsaved Model" if it's `null`.
    -   Replace all instances of `alert()` in the file handling functions with calls to `updateStatus()`.
    -   For example: `updateStatus('File saved successfully.')` or `updateStatus('Error: Invalid filename.', true)`.

## 6. Development Steps

1.  **Phase 1 (State Variables):** Add the `currentFilename` and `isDirty` variables to `main.js`.
2.  **Phase 2 (HTML):** Add the `<div id="status-bar">` to the `index.html` template.
3.  **Phase 3 (JS Logic):**
    -   Refactor the existing `saveModel()` into a new `saveAs()` function.
    -   Implement the new `saveBtn` logic that checks `currentFilename`.
    -   Update the "Open" button's listener to set `currentFilename`.
    -   Implement the `updateStatus()` helper function.
4.  **Phase 4 (Integration):** Replace all `alert()` calls with `updateStatus()` and set the `isDirty` flag after every construction action.
