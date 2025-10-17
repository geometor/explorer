document.addEventListener('DOMContentLoaded', () => {
    window.GEOMETOR = {
        tables: {}
    };

    GEOMETOR.svg = document.getElementById('drawing');
    GEOMETOR.graphicsContainer = document.getElementById('graphics');
    GEOMETOR.elementsContainer = document.getElementById('elements');
    GEOMETOR.pointsContainer = document.getElementById('points');
    GEOMETOR.hoverCard = document.getElementById('hover-card');
    GEOMETOR.tables.points = document.querySelector('#points-table tbody');
    GEOMETOR.tables.structures = document.querySelector('#structures-table tbody');
    GEOMETOR.tables.graphics = document.querySelector('#graphics-table tbody');
    GEOMETOR.tables.chrono = document.querySelector('#chrono-table tbody');
    const statusFilename = document.getElementById('status-filename');
    const statusMessage = document.getElementById('status-message');
    let currentFilename = '';
    let isDirty = false;

    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.classList.toggle('error', isError);
        setTimeout(() => {
            statusMessage.textContent = 'Ready';
            statusMessage.classList.remove('error');
        }, 3000);
    }

    function updateFilenameDisplay() {
        statusFilename.textContent = currentFilename || 'Unsaved Model';
    }

    function loadConstructions() {
        fetch('/api/constructions')
            .then(response => response.json())
            .then(files => {
                // TODO: hook in the new file dialog
            });
    }




    GEOMETOR.selectedPoints = [];
    GEOMETOR.modelData = {};
    GEOMETOR.isPositionedByTable = false;

    function renderModel(data) {
        GEOMETOR.modelData = data;
        // Clear all containers
        GEOMETOR.graphicsContainer.innerHTML = '';
        GEOMETOR.elementsContainer.innerHTML = '';
        GEOMETOR.pointsContainer.innerHTML = '';
        GEOMETOR.tables.points.innerHTML = '';
        GEOMETOR.tables.structures.innerHTML = '';
        GEOMETOR.tables.graphics.innerHTML = '';
        GEOMETOR.tables.chrono.innerHTML = '';

        const points = {};

        // First pass: Process all points to populate the lookup object
        data.elements.forEach(el => {
            if (el.type === 'point') {
                points[el.ID] = el;
            }
        });

        // Second pass: Render everything in order
        data.elements.forEach(el => {
            // Render SVG and populate category tables
            if (el.type === 'point') {
                renderPoint(el);
                addPointToTable(el);
            } else {
                renderElement(el, points); // Now `points` is guaranteed to be complete
                if (['line', 'circle'].includes(el.type)) {
                    addStructureToTable(el);
                } else {
                    addGraphicToTable(el);
                }
            }
            // Populate chronological table AFTER the element is rendered
            addChronologicalRow(el);
        });
        
        // Re-apply selection visuals
        GEOMETOR.selectedPoints.forEach(ID => {
            const svgPoint = document.getElementById(ID);
            const tableRow = GEOMETOR.tables.points.querySelector(`tr[data-id="${ID}"]`);
            const chronoRow = GEOMETOR.tables.chrono.querySelector(`tr[data-id="${ID}"]`);
            if (svgPoint) svgPoint.classList.add('selected');
            if (tableRow) tableRow.classList.add('highlight');
            if (chronoRow) chronoRow.classList.add('highlight');
        });

        scaleCircles();
    }

    function addPointToTable(el) {
        const row = GEOMETOR.tables.points.insertRow();
        row.dataset.id = el.ID;
        const IDCell = row.insertCell();
        const xCell = row.insertCell();
        const yCell = row.insertCell();
        const actionCell = row.insertCell();

        IDCell.innerHTML = el.ID;
        katex.render(el.latex_x, xCell);
        xCell.title = el.x.toFixed(4);
        katex.render(el.latex_y, yCell);
        yCell.title = el.y.toFixed(4);

        actionCell.innerHTML = `<button class="delete-btn" data-id="${el.ID}">🗑️</button>`;

        const svgEl = document.getElementById(el.ID);
        if (svgEl) {
            const color = window.getComputedStyle(svgEl).getPropertyValue('fill');
            IDCell.style.color = color;
        }
    }

    function addStructureToTable(el) {
        const row = GEOMETOR.tables.structures.insertRow();
        row.dataset.id = el.ID;
        const IDCell = row.insertCell();
        const parentsCell = row.insertCell();
        const deleteCell = row.insertCell();

        IDCell.innerHTML = el.ID;
        parentsCell.innerHTML = el.parents.join(', ');
        deleteCell.innerHTML = `<button class="delete-btn" data-id="${el.ID}">🗑️</button>`;

        const svgEl = document.getElementById(el.ID);
        if (svgEl) {
            const color = window.getComputedStyle(svgEl).getPropertyValue('stroke');
            IDCell.style.color = color;
        }
    }

    function addGraphicToTable(el) {
        const row = GEOMETOR.tables.graphics.insertRow();
        row.dataset.id = el.ID;
        const IDCell = row.insertCell();
        const parentsCell = row.insertCell();
        const deleteCell = row.insertCell();

        IDCell.innerHTML = el.ID;
        parentsCell.innerHTML = el.parents.join(', ');
        deleteCell.innerHTML = `<button class="delete-btn" data-id="${el.ID}">🗑️</button>`;

        const svgEl = document.getElementById(el.ID);
        if (svgEl) {
            let color = window.getComputedStyle(svgEl).getPropertyValue('stroke');
            if (svgEl.classList.contains('golden')) {
                color = 'gold';
            }
            IDCell.style.color = color;
        }
    }

    function addChronologicalRow(el) {
        const row = GEOMETOR.tables.chrono.insertRow();
        row.dataset.id = el.ID;
        let parents = el.parents || [];
        if (el.type === 'line') {
            parents = [el.pt1, el.pt2];
        } else if (el.type === 'circle') {
            parents = [el.center, el.pt_on_rad];
        }
        // Defensively check for el.classes
        const isGiven = el.classes && el.classes.includes('given');
        
        const IDCell = row.insertCell();
        const parentsCell = row.insertCell();
        const deleteCell = row.insertCell();

        IDCell.innerHTML = el.ID;
        parentsCell.innerHTML = parents.join(', ');
        if (el.type !== 'point' && !isGiven) {
            deleteCell.innerHTML = `<button class="delete-btn" data-id="${el.ID}">🗑️</button>`;
        }

        const svgEl = document.getElementById(el.ID);
        if (svgEl) {
            let color;
            if (el.type === 'point') {
                color = window.getComputedStyle(svgEl).getPropertyValue('fill');
            } else {
                color = window.getComputedStyle(svgEl).getPropertyValue('stroke');
                if (color === 'none' || color === '') {
                    color = window.getComputedStyle(svgEl).getPropertyValue('fill');
                }
                if (svgEl.classList.contains('golden')) {
                    color = 'gold';
                }
            }
            IDCell.style.color = color;
        }
    }

    const addLineBtn = document.getElementById('add-line-btn');
    const addCircleBtn = document.getElementById('add-circle-btn');
    const addSegmentBtn = document.getElementById('add-segment-btn');
    const addSectionBtn = document.getElementById('add-section-btn');
    const addPolygonButton = document.getElementById('add-polygon-btn');

    function updateConstructionButtons() {
        const numPoints = GEOMETOR.selectedPoints.length;
        addLineBtn.disabled = numPoints !== 2;
        addCircleBtn.disabled = numPoints !== 2;
        addSegmentBtn.disabled = numPoints !== 2;
        addSectionBtn.disabled = numPoints !== 3;
        addPolygonButton.disabled = numPoints < 2;
    }

    function toggleSelection(ID) {
        const index = GEOMETOR.selectedPoints.indexOf(ID);
        if (index > -1) {
            // Deselect
            GEOMETOR.selectedPoints.splice(index, 1);
        } else {
            // Select
            GEOMETOR.selectedPoints.push(ID);
        }
        // Re-render to apply/remove selection styles consistently
        renderModel(GEOMETOR.modelData);
        updateConstructionButtons();
    }

    function clearSelection() {
        GEOMETOR.selectedPoints = [];
        renderModel(GEOMETOR.modelData);
        updateConstructionButtons();
    }

    GEOMETOR.pointsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'circle' && target.id) {
            toggleSelection(target.id);
        }
    });

    GEOMETOR.tables.points.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.id) {
            toggleSelection(row.dataset.id);
        }
    });

    addLineBtn.addEventListener('click', () => {
        if (GEOMETOR.selectedPoints.length === 2) {
            const [pt1, pt2] = GEOMETOR.selectedPoints;
            fetch('/api/construct/line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pt1, pt2 }),
            })
            .then(response => response.json())
            .then(data => {
                renderModel(data);
                clearSelection();
                isDirty = true;
            });
        }
    });

    addCircleBtn.addEventListener('click', () => {
        if (GEOMETOR.selectedPoints.length === 2) {
            const [pt1, pt2] = GEOMETOR.selectedPoints;
            fetch('/api/construct/circle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pt1, pt2 }),
            })
            .then(response => response.json())
            .then(data => {
                renderModel(data);
                clearSelection();
                isDirty = true;
            });
        }
    });

    function constructPoly(endpoint, points) {
        // console.log("constructPoly");
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: points }),
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            renderModel(data);
            clearSelection();
            isDirty = true;
        });
    }

    addSegmentBtn.addEventListener('click', () => {
        if (GEOMETOR.selectedPoints.length === 2) {
            constructPoly('/api/set/segment', GEOMETOR.selectedPoints);
        }
    });

    addSectionBtn.addEventListener('click', () => {
        if (GEOMETOR.selectedPoints.length === 3) {
            constructPoly('/api/set/section', GEOMETOR.selectedPoints);
        }
    });

    addPolygonButton.addEventListener('click', () => {
        if (GEOMETOR.selectedPoints.length >= 2) {
            constructPoly('/api/set/polygon', GEOMETOR.selectedPoints);
        }
    });

    const addPointBtn = document.getElementById('add-point-btn');
    addPointBtn.addEventListener('click', () => {
        const x = prompt('Enter x coordinate:');
        const y = prompt('Enter y coordinate:');

        if (x !== null && y !== null) {
            fetch('/api/construct/point', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x: parseFloat(x), y: parseFloat(y) }),
            })
            .then(response => response.json())
            .then(data => {
                renderModel(data);
                isDirty = true;
            });
        }
    });


    GEOMETOR.updateHoverCard = function(element) {
        if (!element) {
            GEOMETOR.hoverCard.style.display = 'none';
            return;
        }

        let content = `<p><span class="ID">${element.ID}</span> ${element.type}`;
        if (element.classes && element.classes.length > 0) {
            content += ` <span class="classes">(${element.classes.join(', ')})</span>`;
        }
        if (element.parents && element.parents.length > 0) {
            content += ` <span class="parents">[${element.parents.join(', ')}]</span>`;
        }
        content += `</p>`;

        if (element.type === 'point') {
            content += '<hr>';
            content += '<div class="coords-grid">';
            // X value
            let x_div = document.createElement('div');
            katex.render(`x = ${element.latex_x}`, x_div);
            content += `<span>${x_div.innerHTML}</span>`;
            content += `<span class="decimal">(${element.x.toFixed(4)})</span>`;
            // Y value
            let y_div = document.createElement('div');
            katex.render(`y = ${element.latex_y}`, y_div);
            content += `<span>${y_div.innerHTML}</span>`;
            content += `<span class="decimal">(${element.y.toFixed(4)})</span>`;
            content += '</div>';
        } else if (element.type === 'line' || element.type === 'circle') {
            content += '<hr>';
            if (element.type === 'circle') {
                const center = document.createElement('div');
                center.innerHTML = `center: ${element.center}`;
                content += center.innerHTML;
                content += '<br>';
                const radius = document.createElement('div');
                katex.render(`r = ${element.latex_radius}`, radius);
                content += `<span>${radius.innerHTML}</span> <span class="decimal">(${element.decimal_radius})</span>`;
                content += '<br>';
            }
            const equation = document.createElement('div');
            katex.render(element.latex_equation, equation);
            content += equation.innerHTML;
        } else if (element.type === 'segment') {
            content += '<hr>';
            const length = document.createElement('div');
            katex.render(`l = ${element.latex_length}`, length);
            content += `<span>${length.innerHTML}</span> <span class="decimal">(${element.decimal_length})</span>`;
        } else if (element.type === 'section') {
            content += '<hr>';
            const lengths = document.createElement('div');
            katex.render(`[${element.latex_lengths.join(', ')}]`, lengths);
            content += `<span>${lengths.innerHTML}</span> <span class="decimal">([${element.decimal_lengths.join(', ')}])</span>`;
            content += '<br>';
            const ratio = document.createElement('div');
            katex.render(`ratio = ${element.latex_ratio}`, ratio);
            content += `<span>${ratio.innerHTML}</span> <span class="decimal">(${element.decimal_ratio})</span>`;
        } else if (element.type === 'wedge') {
            content += '<hr>';
            const radius = document.createElement('div');
            katex.render(`r = ${element.latex_radius}`, radius);
            content += `<span>${radius.innerHTML}</span> <span class="decimal">(${element.decimal_radius})</span>`;
            const radians = document.createElement('div');
            katex.render(`rad = ${element.latex_radians}`, radians);
            content += `<span>${radians.innerHTML}</span> <span class="decimal">(${element.degrees})</span>`;
        } else if (element.type === 'polygon') {
            content += '<hr>';
            const lengths = document.createElement('div');
            lengths.innerHTML = 'Lengths:';
            element.latex_lengths.forEach((l, i) => {
                const length = document.createElement('div');
                katex.render(l, length);
                length.innerHTML = `<span>${length.innerHTML}</span> <span class="decimal">(${element.decimal_lengths[i]})</span>`;
                lengths.appendChild(length);
            });
            content += lengths.innerHTML;

            const angles = document.createElement('div');
            angles.innerHTML = 'Angles:';
            for (const [p, a] of Object.entries(element.latex_angles)) {
                const angle = document.createElement('div');
                katex.render(`${p}: ${a}`, angle);
                angle.innerHTML = `<span>${angle.innerHTML}</span> <span class="decimal">(${element.degree_angles[p]})</span>`;
                angles.appendChild(angle);
            }
            content += angles.innerHTML;

            const area = document.createElement('div');
            katex.render(`Area = ${element.latex_area}`, area);
            content += `<span>${area.innerHTML}</span> <span class="decimal">(${element.decimal_area})</span>`;
        }

        GEOMETOR.hoverCard.innerHTML = content;

        const svgEl = document.getElementById(element.ID);
        if (svgEl) {
            let color;
            if (element.type === 'point') {
                color = window.getComputedStyle(svgEl).getPropertyValue('fill');
            } else {
                color = window.getComputedStyle(svgEl).getPropertyValue('stroke');
                if (color === 'none' || color === '') {
                    color = window.getComputedStyle(svgEl).getPropertyValue('fill');
                }
                if (svgEl.classList.contains('golden')) {
                    color = 'gold';
                }
            }
            const idSpan = GEOMETOR.hoverCard.querySelector('.ID');
            idSpan.style.color = color;
            idSpan.style.fontWeight = 'bold';
        }

        GEOMETOR.hoverCard.style.display = 'block';
    }

    GEOMETOR.setElementHover = function(ID, hoverState) {
        const elementData = GEOMETOR.modelData.elements.find(el => el.ID === ID);
        if (!elementData) return;

        const svgElement = document.getElementById(ID);
        const pointsRow = GEOMETOR.tables.points.querySelector(`tr[data-id="${ID}"]`);
        const structuresRow = GEOMETOR.tables.structures.querySelector(`tr[data-id="${ID}"]`);
        const graphicsRow = GEOMETOR.tables.graphics.querySelector(`tr[data-id="${ID}"]`);
        const chronoRow = GEOMETOR.tables.chrono.querySelector(`tr[data-id="${ID}"]`);

        const action = hoverState ? 'add' : 'remove';
        if (svgElement) svgElement.classList[action]('hover');
        if (pointsRow) pointsRow.classList[action]('row-hover');
        if (structuresRow) structuresRow.classList[action]('row-hover');
        if (graphicsRow) graphicsRow.classList[action]('row-hover');
        if (chronoRow) chronoRow.classList[action]('row-hover');

        // Handle parents
        let parentIDs = [];
        if (elementData.type === 'line') {
            parentIDs = [elementData.pt1, elementData.pt2];
        } else if (elementData.type === 'circle') {
            parentIDs = [elementData.center, elementData.pt_on_rad];
        }

        parentIDs.forEach(parentID => {
            if (parentID) {
                GEOMETOR.setElementHover(parentID, hoverState);
            }
        });
    }

    // Table hovers
    Object.values(GEOMETOR.tables).forEach(tableBody => {
        tableBody.addEventListener('mouseover', (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.id) {
                const ID = row.dataset.id;
                GEOMETOR.setElementHover(ID, true);

                const elementData = GEOMETOR.modelData.elements.find(el => el.ID === ID);
                const svgElement = document.getElementById(ID);
                if (elementData && svgElement) {
                    GEOMETOR.updateHoverCard(elementData);
                    // Position card next to element in SVG
                    GEOMETOR.isPositionedByTable = true;
                    const elemRect = svgElement.getBoundingClientRect();
                    GEOMETOR.hoverCard.style.left = `${elemRect.right + 10}px`;
                    GEOMETOR.hoverCard.style.top = `${elemRect.top}px`;
                }
            }
        });

        tableBody.addEventListener('mouseout', (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.id) {
                GEOMETOR.setElementHover(row.dataset.id, false);
            }
            GEOMETOR.hoverCard.style.display = 'none';
        });

        // Handle delete button clicks
        tableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const ID = event.target.dataset.id;
                if (!ID) return;

                // First, fetch dependents
                fetch(`/api/model/dependents?ID=${ID}`)
                    .then(response => response.json())
                    .then(dependents => {
                        let message = `Are you sure you want to delete ${ID}?`;
                        if (dependents.length > 0) {
                            message += `\n\nThe following elements will also be deleted: ${dependents.join(', ')}`;
                        }

                        if (confirm(message)) {
                            fetch('/api/model/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ID: ID }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                renderModel(data);
                                isDirty = true;
                            });
                        }
                    });
            }
        });
    });

    // Chronological Table selection
    GEOMETOR.tables.chrono.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.id) {
            const elementData = GEOMETOR.modelData.elements.find(el => el.ID === row.dataset.id);
            if (elementData && elementData.type === 'point') {
                toggleSelection(row.dataset.id);
            }
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (GEOMETOR.hoverCard.style.display === 'block' && !GEOMETOR.isPositionedByTable) {
            GEOMETOR.hoverCard.style.left = `${event.clientX + 15}px`;
            GEOMETOR.hoverCard.style.top = `${event.clientY + 15}px`;
        }
    });
    
    document.addEventListener('mouseout', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id) {
            GEOMETOR.hoverCard.style.display = 'none';
        }
    });

    const resizeObserver = new ResizeObserver(scaleCircles);
    resizeObserver.observe(GEOMETOR.svg);

    // Initial fetch
    fetch('/api/model')
        .then(response => response.json())
        .then(data => {
            console.log(JSON.stringify(data, null, 2));
            renderModel(data);
        });

    const themeToggle = document.getElementById('theme-toggle');
    const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');

    themeToggle.addEventListener('click', () => {
        darkModeStylesheet.disabled = !darkModeStylesheet.disabled;
        localStorage.setItem('theme', darkModeStylesheet.disabled ? 'light' : 'dark');
    });

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        darkModeStylesheet.disabled = (savedTheme === 'light');
    } else {
        // Default to light mode if no theme is saved
        darkModeStylesheet.disabled = true;
    }

    // View Switcher
    const categoryViewBtn = document.getElementById('category-view-btn');
    const chronoViewBtn = document.getElementById('chrono-view-btn');
    const categoryView = document.getElementById('category-view');
    const chronologicalView = document.getElementById('chronological-view');

    categoryViewBtn.addEventListener('click', () => {
        categoryView.style.display = 'flex';
        chronologicalView.style.display = 'none';
        categoryViewBtn.classList.add('active');
        chronoViewBtn.classList.remove('active');
    });

    chronoViewBtn.addEventListener('click', () => {
        categoryView.style.display = 'none';
        chronologicalView.style.display = 'flex';
        chronoViewBtn.classList.add('active');
        categoryViewBtn.classList.remove('active');
    });

    // Collapsible sections
    const collapseBtns = document.querySelectorAll('.collapse-btn');
    collapseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('.collapsible-section');
            section.classList.toggle('collapsed');
            
            const isCollapsed = section.classList.contains('collapsed');
            btn.textContent = isCollapsed ? '+' : '-';
            
            const tableContainer = section.querySelector('.table-container');
            tableContainer.style.display = isCollapsed ? 'none' : '';
        });
    });

    // File management
    const newBtn = document.getElementById('new-btn');
    const openBtn = document.getElementById('open-btn');
    const saveBtn = document.getElementById('save-btn');
    const saveAsBtn = document.getElementById('save-as-btn');
    const fileInput = document.getElementById('file-input');

    newBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new construction? Any unsaved changes will be lost.')) {
            fetch('/api/model/new', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    renderModel(data);
                    clearSelection();
                    currentFilename = 'untitled.json';
                    updateFilenameDisplay();
                    isDirty = false;
                });
        }
    });

    openBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                fetch('/api/model/load', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: content }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success === false) {
                        updateStatus(`Error loading file: ${data.message}`, true);
                    } else {
                        renderModel(data);
                        clearSelection();
                        currentFilename = file.name;
                        updateFilenameDisplay();
                        isDirty = false;
                    }
                });
            };
            reader.readAsText(file);
        }
        // Reset file input so the same file can be loaded again
        event.target.value = null;
    });

    function save(filename) {
        fetch('/api/model/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStatus('File saved successfully.');
                currentFilename = filename;
                updateFilenameDisplay();
                updateCurrentFilenameDisplay();
                loadConstructions();
                isDirty = false;
            } else {
                updateStatus(`Error saving file: ${data.message}`, true);
            }
        });
    }

    function saveAs() {
        const filename = prompt('Enter filename:', currentFilename || 'construction.json');
        if (filename) {
            save(filename);
        }
    }

    saveBtn.addEventListener('click', () => {
        if (currentFilename && currentFilename !== 'untitled.json') {
            save(currentFilename);
        } else {
            saveAs();
        }
    });

    saveAsBtn.addEventListener('click', () => {
        saveAs();
    });

    initSvgEventListeners();
    loadConstructions();
    updateFilenameDisplay();
});