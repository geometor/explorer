# GEOMETOR Explorer: Development Roadmap

The following is a list of features and improvements planned for the GEOMETOR Explorer:

### 1. "Divine" Golden Section Analysis

-   **Objective:** Integrate real-time analysis of golden sections as new points are added to the construction.
-   **Strategy:**
    -   **Backend:** Create a new API endpoint that, given a new point, analyzes all sections it participates in and returns any golden sections found. This will require adapting the logic from the `divine` project to work with the `geometor.model` objects.
    -   **Frontend:** After a new point is created, the frontend will call the analysis endpoint. The results will be displayed in a dedicated "Analysis" or "Divine" panel in the UI.

### 2. Construction Animation

-   **Objective:** Animate the step-by-step creation of the geometric construction.
-   **Strategy:**
    -   **Backend:** The construction data will need to be ordered chronologically. The backend should provide the elements in the order they were created.
    -   **Frontend:** Implement a "Play" button and a slider to control the animation. Use JavaScript to incrementally add and animate the SVG elements.

### 3. UI Enhancements

-   **Objective:** Improve the overall user experience with a more sophisticated and organized interface.
-   **Strategy:**
    -   **Toolbar:** Replace the simple buttons with a more organized toolbar, using icons for different tools (Add Point, Line, Circle, etc.).
    -   **Scrollable Lists:** The point and structure lists will be placed in containers with `overflow-y: auto` to make them scrollable.
    -   **Recomposable Lists:** Implement sorting and filtering options for the lists.
