# GEOMETOR Explorer: Gemini Development Plan

This document outlines a strategic plan for the development of the GEOMETOR Explorer, leveraging the capabilities of a Gemini-powered AI assistant. The goal is to evolve the Explorer into a more powerful and interactive tool for geometric construction and analysis.

## Core Principles

- **Component-Based UI:** Transition to a more modular and reusable UI architecture. This will be crucial for managing the increasing complexity of the interface.
- **State Management:** Implement a robust state management system on the frontend to handle the application's state, including constructions, selections, and UI settings.
- **API-Driven:** Continue to develop the Flask backend as a powerful API that serves data and performs complex calculations, leaving the rendering and user interaction to the frontend.

## Feature Roadmap

### 1. Construction Management (Save, Load, Copy)

**Objective:** Enable users to save their work, load existing constructions, and duplicate them.

**Strategy:**

-   **Backend:**
    -   Develop API endpoints for `GET`, `POST`, `PUT`, and `DELETE` operations on construction files.
    -   Define a clear JSON schema for saving and loading constructions, ensuring all necessary data (points, lines, circles, classes) is included.
-   **Frontend:**
    -   Implement a menu with "Save," "Save As," "Load," and "New" actions.
    -   Create dialog boxes to handle file naming and selection.
    -   The "Copy" functionality will be a "Save As" operation, creating a new file with a different name.

### 2. "Divine" Golden Section Analysis

**Objective:** Integrate real-time analysis of golden sections as new points are added to the construction.

**Strategy:**

-   **Backend:**
    -   Create a new API endpoint that, given a new point, analyzes all sections it participates in and returns any golden sections found.
    -   This will require adapting the logic from the `divine` project to work with the `geometor.model` objects.
-   **Frontend:**
    -   After a new point is created, the frontend will call the analysis endpoint.
    -   The results will be displayed in a dedicated "Analysis" or "Divine" panel in the UI, highlighting the relevant points and sections.

### 3. Construction Animation

**Objective:** Animate the step-by-step creation of the geometric construction.

**Strategy:**

-   **Data Structure:** The construction data will need to be ordered chronologically. The backend should provide the elements in the order they were created.
-   **Frontend:**
    -   Implement a "Play" button and a slider to control the animation.
    -   Use JavaScript to incrementally add and animate the SVG elements.
    -   For lines, animate the drawing from one point to another.
    -   For circles, animate the radius sweeping around the center point.
    -   When an element is animated, its founding points will be highlighted.

### 4. Element Classes and Styling

**Objective:** Allow users to assign classes to elements for styling and organization.

**Strategy:**

-   **Backend:**
    -   The `geometor.model` already supports classes. The API will be extended to allow updating the classes of an element.
-   **Frontend:**
    -   Develop a UI panel that allows users to:
        -   Create and name new classes.
        -   Assign a color or style to each class.
        -   Select elements and assign them to a class.
        -   Toggle the visibility of elements based on their class.
    -   The frontend will dynamically generate CSS rules to apply the user-defined styles.

### 5. UI Enhancements

**Objective:** Improve the overall user experience with a more sophisticated and organized interface.

**Strategy:**

-   **Toolbar:** Replace the simple buttons with a more organized toolbar, using icons for different tools (Add Point, Line, Circle, etc.).
-   **Scrollable Lists:** The point and structure lists will be placed in containers with `overflow-y: auto` to make them scrollable.
-   **Recomposable Lists:** Implement sorting and filtering options for the lists. For example, users could sort elements by creation time, label, or type. This will require the backend to provide the necessary data (e.g., creation timestamps).

## Next Steps

The immediate focus will be on establishing the foundation for these features:

1.  **Refactor the UI:** Begin breaking down the UI into smaller, more manageable components.
2.  **Implement State Management:** Introduce a simple state management solution to handle the application's data.
3.  **Develop the Save/Load API:** Create the backend endpoints and frontend UI for basic construction management.

By following this plan, we can systematically enhance the GEOMETOR Explorer, transforming it into a rich and interactive platform for geometric exploration.
