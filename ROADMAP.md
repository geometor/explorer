# GEOMETOR Explorer: Development Roadmap

### 1. Real-Time UI with Server-Sent Events (SSE)

-   **Objective:** Decouple the frontend from blocking backend processes to create a fully responsive, real-time user experience.
-   **Strategy:** Implement a Server-Sent Events (SSE) architecture to push incremental updates from the server to the UI.
-   **Plan:** See the detailed implementation plan in `SSE_INTEGRATION.md`.

### 2. Enhanced File Handling

-   **Objective:** Create a more professional and seamless file handling experience with persistent filenames and non-disruptive status updates.
-   **Plan:** See the detailed implementation plan in `FILE_HANDLING_IMPROVEMENTS.md`.

### 3. Construction Animation

-   **Objective:** Animate the step-by-step creation of the geometric construction.
-   **Strategy:**
    -   **Backend:** The construction data will need to be ordered chronologically. The backend should provide the elements in the order they were created.
    -   **Frontend:** Implement a "Play" button and a slider to control the animation. Use JavaScript to incrementally add and animate the SVG elements.

### 4. UI/UX Overhaul for Complex Models

-   **Objective:** Redesign the user interface to efficiently display complex models, provide real-time process feedback, and improve data interaction.
-   **Plan:** See the detailed implementation plan in `UI_UX_IMPROVEMENTS.md`.

### 5. Element Properties and Visibility

-   **Objective:** Give users more control over the appearance and behavior of elements in the construction.
-   **Features:**
    -   **Dynamic Styling:** Add the ability to assign a CSS class to any element at any time, allowing for dynamic style changes.
    -   **Visibility Toggles:** Implement controls to toggle the visibility of individual elements and groups of elements (e.g., hide all points, lines, or circles).
    -   **Guide Elements:** Introduce a "guide" property for lines and circles. Guide elements will be visually distinct (e.g., dashed lines) and will be excluded from intersection checks, preventing them from creating new points. This is useful for construction lines that are not part of the a final figure.

### 6. Interactive Point Placement

-   **Objective:** Allow users to place points directly in the UI.
-   **Phased Implementation:**
    -   **Phase 1: Manual Input:** Create a dialog box that allows users to enter `x` and `y` coordinates to define a new point.
    -   **Phase 2: Mouse and Grid:** Implement point placement using the mouse, with a "snap-to-grid" feature for precision.

### 7. Robust Element Deletion and Debugging

-   **Objective:** Safely handle element deletion without breaking the model and provide better debugging tools.
-   **Challenges:** Deleting an element that other elements depend on can lead to an invalid model state.
-   **Plan:**
    -   **Dependency Graph:** Implement a dependency graph in the backend to track relationships between elements. Before deleting an element, analyze the graph to determine the impact. This will allow for either preventing the deletion or performing a cascading delete of all dependent elements.
    -   **Testing:** Develop a comprehensive test suite specifically for element deletion scenarios, covering various dependency situations to ensure model integrity.
