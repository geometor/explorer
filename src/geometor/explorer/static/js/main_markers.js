document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/model_markers')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderModel(data);
        })
        .catch(error => console.error('Error fetching model:', error));
});

function renderModel(data) {
    const drawing = document.getElementById('drawing');
    const defs = drawing.querySelector('defs'); // Save the defs
    drawing.innerHTML = ''; // Clear existing SVG content
    if (defs) {
        drawing.appendChild(defs); // Restore the defs
    }
    const svgNS = "http://www.w3.org/2000/svg";
    const pointsData = new Map(data.tables.points.map(p => [p.label, p]));
    const structuresData = new Map(data.tables.structures.map(s => [s.label, s]));

    // 1. Set the viewBox
    if (data.viewBox) {
        drawing.setAttribute('viewBox', data.viewBox);
    }

    // 2. Render SVG elements
    if (data.svg_elements) {
        data.svg_elements.forEach(elData => {
            const shape = document.createElementNS(svgNS, elData.type);
            for (const [attr, value] of Object.entries(elData)) {
                if (attr !== 'type') {
                    shape.setAttribute(attr, value);
                }
            }
            if (elData.type === 'line') {
                shape.setAttribute('marker-start', 'url(#point-marker)');
                shape.setAttribute('marker-end', 'url(#point-marker)');
            }
            drawing.appendChild(shape);
        });
    }

    // 3. Populate tables
    if (data.tables) {
        populateTable('pointList', data.tables.points, ['label', 'x', 'y']);
        populateTable('structList', data.tables.structures, ['label', 'eq']);
    }

    // 4. Add event listeners
    setupHoverListeners(pointsData, structuresData);
    setupControls();
    setupDarkModeToggle();
}

function setupDarkModeToggle() {
    const toggleBtn = document.getElementById('toggleDarkModeBtn');
    const stylesheet = document.getElementById('dark-mode-stylesheet');

    toggleBtn.addEventListener('click', () => {
        stylesheet.disabled = !stylesheet.disabled;
    });
}


function setupControls() {
    const drawing = document.getElementById('drawing');
    const addPointBtn = document.getElementById('addPointBtn');
    const addLineBtn = document.getElementById('addLineBtn');
    const addCircleBtn = document.getElementById('addCircleBtn');
    const status = document.getElementById('status');

    let state = {
        mode: null,
        selectedPoints: []
    };

    function updateStatus() {
        switch (state.mode) {
            case 'addLine':
                status.textContent = `Select point 1 for line.`;
                if (state.selectedPoints.length === 1) {
                    status.textContent = `Select point 2 for line.`;
                }
                break;
            case 'addCircle':
                status.textContent = `Select center point for circle.`;
                if (state.selectedPoints.length === 1) {
                    status.textContent = `Select point on radius for circle.`;
                }
                break;
            default:
                status.textContent = '';
        }
    }

    function updateSelectionHighlight() {
        // Clear existing selections
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

        // Apply selection to the currently selected points
        state.selectedPoints.forEach(label => {
            document.querySelectorAll(`[data-label="${label}"]`).forEach(el => {
                el.classList.add('selected');
            });
        });
    }

    addPointBtn.addEventListener('click', () => {
        drawing.classList.toggle('add-point-mode');
        state.mode = 'addPoint';
        updateStatus();
    });

    addLineBtn.addEventListener('click', () => {
        state.mode = 'addLine';
        state.selectedPoints = [];
        drawing.classList.add('select-points-mode');
        updateStatus();
    });

    addCircleBtn.addEventListener('click', () => {
        state.mode = 'addCircle';
        state.selectedPoints = [];
        drawing.classList.add('select-points-mode');
        updateStatus();
    });

    drawing.addEventListener('click', (e) => {
        if (drawing.classList.contains('add-point-mode')) {
            const pt = drawing.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(drawing.getScreenCTM().inverse());
            console.log(`Clicked at: (${svgP.x}, ${svgP.y})`);
            // TODO: Send these coordinates to the backend
            drawing.classList.remove('add-point-mode');
            state.mode = null;
            updateStatus();
        }

        if (state.mode === 'addLine' || state.mode === 'addCircle') {
            const target = e.target.closest('[data-label]');
            if (target) {
                const label = target.getAttribute('data-label');
                state.selectedPoints.push(label);
                updateSelectionHighlight();
                updateStatus();

                if (state.selectedPoints.length === 2) {
                    const endpoint = state.mode === 'addLine' ? '/api/construct/line' : '/api/construct/circle';
                    fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pt1: state.selectedPoints[0],
                            pt2: state.selectedPoints[1],
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        renderModel(data);
                    })
                    .catch(error => console.error('Error constructing element:', error));

                    state.mode = null;
                    state.selectedPoints = [];
                    drawing.classList.remove('select-points-mode');
                    updateStatus();
                    // Defer clearing highlights until after the new SVG is rendered
                    setTimeout(updateSelectionHighlight, 100);
                }
            }
        }
    });
}


function populateTable(tableId, data, columns) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach(rowData => {
        const row = tableBody.insertRow();
        // Use the ID from the data to set the row's ID
        row.id = rowData.id || ''; 
        columns.forEach(colName => {
            const cell = row.insertCell();
            let content = rowData[colName] || '';
            if (window.katex) {
                try {
                    content = katex.renderToString(content, { throwOnError: false });
                } catch (e) { /* Ignore katex errors */ }
            }
            cell.innerHTML = content;
        });
    });
}

function setupHoverListeners(pointsData, structuresData) {
    const hoverCard = document.getElementById('hover-card');
    
    document.querySelectorAll('[data-label]').forEach(el => {
        const label = el.getAttribute('data-label');
        const row = document.getElementById(`row-${label}`);
        const pointInfo = pointsData.get(label);
        const structInfo = structuresData.get(label);

        el.addEventListener('mouseover', (e) => {
            // Highlight row
            if (row) {
                row.classList.add('highlight');
            }

            // Show and position hover card
            let content = '';
            if (pointInfo) {
                content = `<b>${pointInfo.label}</b><br>x: ${katex.renderToString(pointInfo.x)}<br>y: ${katex.renderToString(pointInfo.y)}`;
            } else if (structInfo) {
                content = `<b>${structInfo.label}</b><br>${katex.renderToString(structInfo.eq)}`;
            }

            if (content) {
                hoverCard.innerHTML = content;
                hoverCard.style.display = 'block';
                hoverCard.style.left = `${e.pageX + 15}px`;
                hoverCard.style.top = `${e.pageY + 15}px`;
            }
        });

        el.addEventListener('mouseout', () => {
            // Unhighlight row
            if (row) {
                row.classList.remove('highlight');
            }
            // Hide hover card
            hoverCard.style.display = 'none';
        });

        // Move card with mouse
        el.addEventListener('mousemove', (e) => {
            hoverCard.style.left = `${e.pageX + 15}px`;
            hoverCard.style.top = `${e.pageY + 15}px`;
        });
    });
}
