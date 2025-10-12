document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('drawing');
    const graphicsContainer = document.getElementById('graphics');
    const elementsContainer = document.getElementById('elements');
    const pointsContainer = document.getElementById('points');
    const hoverCard = document.getElementById('hover-card');
    const pointsTableBody = document.querySelector('#points-table tbody');
    const structuresTableBody = document.querySelector('#structures-table tbody');
    const graphicsTableBody = document.querySelector('#graphics-table tbody');
    const chronoTableBody = document.querySelector('#chrono-table tbody');

    let selectedPoints = [];
    let modelData = {};

    const SVG_NS = "http://www.w3.org/2000/svg";

    function renderModel(data) {
        modelData = data;
        // Clear all containers
        graphicsContainer.innerHTML = '';
        elementsContainer.innerHTML = '';
        pointsContainer.innerHTML = '';
        pointsTableBody.innerHTML = '';
        structuresTableBody.innerHTML = '';
        graphicsTableBody.innerHTML = '';
        chronoTableBody.innerHTML = '';

        const points = {};

        // First pass: Process all points to populate the lookup object
        data.elements.forEach(el => {
            if (el.type === 'point') {
                points[el.label] = el;
            }
        });

        // Second pass: Render everything in order
        data.elements.forEach(el => {
            // Populate chronological table
            addChronologicalRow(el);

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
        });
        
        // Re-apply selection visuals
        selectedPoints.forEach(label => {
            const svgPoint = document.getElementById(label);
            const tableRow = pointsTableBody.querySelector(`tr[data-label="${label}"]`);
            const chronoRow = chronoTableBody.querySelector(`tr[data-label="${label}"]`);
            if (svgPoint) svgPoint.classList.add('selected');
            if (tableRow) tableRow.classList.add('highlight');
            if (chronoRow) chronoRow.classList.add('highlight');
        });

        scaleCircles();
    }

    function renderElement(el, points) {
        let svgEl;
        let pointsStr;
        switch (el.type) {
            case 'line':
                svgEl = document.createElementNS(SVG_NS, 'line');
                const pt1 = points[el.pt1];
                const pt2 = points[el.pt2];
                // Approximate line drawing for now, needs proper calculation
                svgEl.setAttribute('x1', pt1.x - 1000 * (pt2.x - pt1.x));
                svgEl.setAttribute('y1', pt1.y - 1000 * (pt2.y - pt1.y));
                svgEl.setAttribute('x2', pt1.x + 1000 * (pt2.x - pt1.x));
                svgEl.setAttribute('y2', pt1.y + 1000 * (pt2.y - pt1.y));
                break;
            case 'circle':
                svgEl = document.createElementNS(SVG_NS, 'circle');
                const center = points[el.center];
                svgEl.setAttribute('cx', center.x);
                svgEl.setAttribute('cy', center.y);
                svgEl.setAttribute('r', el.radius);
                svgEl.setAttribute('fill', 'none');
                break;
            case 'polygon':
                svgEl = document.createElementNS(SVG_NS, 'polygon');
                pointsStr = el.points.map(p_label => {
                    const p = points[p_label];
                    return `${p.x},${p.y}`;
                }).join(' ');
                svgEl.setAttribute('points', pointsStr);
                break;
            case 'segment':
            case 'section':
            case 'chain':
                svgEl = document.createElementNS(SVG_NS, 'polyline');
                pointsStr = el.points.map(p_label => {
                    const p = points[p_label];
                    return `${p.x},${p.y}`;
                }).join(' ');
                svgEl.setAttribute('points', pointsStr);
                break;
        }

        if (svgEl) {
            svgEl.id = el.label;
            el.classes.forEach(c => svgEl.classList.add(c));
            if (['polygon', 'segment', 'section', 'chain'].includes(el.type)) {
                graphicsContainer.appendChild(svgEl);
            } else {
                elementsContainer.appendChild(svgEl);
            }
        }
    }

    function renderPoint(el) {
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.id = el.label;
        circle.setAttribute('cx', el.x);
        circle.setAttribute('cy', el.y);
        circle.setAttribute('r', 0.02); // Initial radius, will be scaled
        el.classes.forEach(c => circle.classList.add(c));
        pointsContainer.appendChild(circle);
    }

    function addPointToTable(el) {
        const row = pointsTableBody.insertRow();
        row.dataset.label = el.label;
        const labelCell = row.insertCell();
        const xCell = row.insertCell();
        const yCell = row.insertCell();

        labelCell.innerHTML = el.label;
        katex.render(el.latex_x, xCell);
        katex.render(el.latex_y, yCell);
    }

    function addStructureToTable(el) {
        const row = structuresTableBody.insertRow();
        row.dataset.label = el.label;
        row.innerHTML = `<td>${el.label}</td><td>${el.type}</td><td>${el.parents.join(', ')}</td><td><button class="delete-btn">🗑️</button></td>`;
    }

    function addGraphicToTable(el) {
        const row = graphicsTableBody.insertRow();
        row.dataset.label = el.label;
        row.innerHTML = `<td>${el.label}</td><td>${el.type}</td><td>${el.parents.join(', ')}</td><td><button class="delete-btn">🗑️</button></td>`;
    }

    function addChronologicalRow(el) {
        const row = chronoTableBody.insertRow();
        row.dataset.label = el.label;
        let parents = el.parents || [];
        if (el.type === 'line') {
            parents = [el.pt1, el.pt2];
        } else if (el.type === 'circle') {
            parents = [el.center, el.pt_on_rad];
        }
        // Defensively check for el.classes
        const isGiven = el.classes && el.classes.includes('given');
        let deleteBtnHtml = (el.type !== 'point' && !isGiven) ? `<td><button class="delete-btn" data-label="${el.label}">🗑️</button></td>` : '<td></td>';
        row.innerHTML = `<td>${el.label}</td><td>${el.type}</td><td>${parents.join(', ')}</td>${deleteBtnHtml}`;
    }

    const addLineBtn = document.getElementById('add-line-btn');
    const addCircleBtn = document.getElementById('add-circle-btn');
    const addSegmentBtn = document.getElementById('add-segment-btn');
    const addSectionBtn = document.getElementById('add-section-btn');
    const addPolygonButton = document.getElementById('add-polygon-btn');

    function updateConstructionButtons() {
        const numPoints = selectedPoints.length;
        addLineBtn.disabled = numPoints !== 2;
        addCircleBtn.disabled = numPoints !== 2;
        addSegmentBtn.disabled = numPoints !== 2;
        addSectionBtn.disabled = numPoints !== 3;
        addPolygonButton.disabled = numPoints < 2;
    }

    function toggleSelection(label) {
        const index = selectedPoints.indexOf(label);
        if (index > -1) {
            // Deselect
            selectedPoints.splice(index, 1);
        } else {
            // Select
            selectedPoints.push(label);
        }
        // Re-render to apply/remove selection styles consistently
        renderModel(modelData);
        updateConstructionButtons();
    }

    function clearSelection() {
        selectedPoints = [];
        renderModel(modelData);
        updateConstructionButtons();
    }

    pointsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'circle' && target.id) {
            toggleSelection(target.id);
        }
    });

    pointsTableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.label) {
            toggleSelection(row.dataset.label);
        }
    });

    addLineBtn.addEventListener('click', () => {
        if (selectedPoints.length === 2) {
            const [pt1, pt2] = selectedPoints;
            fetch('/api/construct/line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pt1, pt2 }),
            })
            .then(response => response.json())
            .then(data => {
                renderModel(data);
                clearSelection();
            });
        }
    });

    addCircleBtn.addEventListener('click', () => {
        if (selectedPoints.length === 2) {
            const [pt1, pt2] = selectedPoints;
            fetch('/api/construct/circle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pt1, pt2 }),
            })
            .then(response => response.json())
            .then(data => {
                renderModel(data);
                clearSelection();
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
        });
    }

    addSegmentBtn.addEventListener('click', () => {
        if (selectedPoints.length === 2) {
            constructPoly('/api/set/segment', selectedPoints);
        }
    });

    addSectionBtn.addEventListener('click', () => {
        if (selectedPoints.length === 3) {
            constructPoly('/api/set/section', selectedPoints);
        }
    });

    addPolygonButton.addEventListener('click', () => {
        if (selectedPoints.length >= 2) {
            constructPoly('/api/set/polygon', selectedPoints);
        }
    });


    function scaleCircles() {
        const svgRect = svg.getBoundingClientRect();
        if (svgRect.width === 0) return;

        const currentViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const viewBoxWidth = currentViewBox[2];
        const unitsPerPixel = viewBoxWidth / svgRect.width;
        const desiredRadiusPixels = 5; 
        const newRadius = desiredRadiusPixels * unitsPerPixel;

        const circles = pointsContainer.querySelectorAll('circle');
        circles.forEach(circle => {
            circle.setAttribute('r', newRadius);
        });
    }

    svg.addEventListener('wheel', (event) => {
        event.preventDefault();
        const currentViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        let [x, y, width, height] = currentViewBox;
        const scaleFactor = event.deltaY > 0 ? 1.1 : 1 / 1.1;
        const { clientX, clientY } = event;
        const svgRect = svg.getBoundingClientRect();
        const svgX = clientX - svgRect.left;
        const svgY = clientY - svgRect.top;
        const mousePoint = {
            x: x + (svgX / svgRect.width) * width,
            y: y + (svgY / svgRect.height) * height
        };
        width *= scaleFactor;
        height *= scaleFactor;
        x = mousePoint.x - (svgX / svgRect.width) * width;
        y = mousePoint.y - (svgY / svgRect.height) * height;
        svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
        scaleCircles();
    });

    let isPanning = false;
    let startPoint = { x: 0, y: 0 };

    svg.addEventListener('mousedown', (event) => {
        isPanning = true;
        startPoint = { x: event.clientX, y: event.clientY };
        svg.style.cursor = 'grabbing';
    });

    svg.addEventListener('mousemove', (event) => {
        if (!isPanning) return;
        const svgRect = svg.getBoundingClientRect();
        const currentViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        let [x, y, width, height] = currentViewBox;
        const dx = (event.clientX - startPoint.x) * (width / svgRect.width);
        const dy = (event.clientY - startPoint.y) * (height / svgRect.height);
        x -= dx;
        y -= dy;
        svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
        startPoint = { x: event.clientX, y: event.clientY };
    });

    svg.addEventListener('mouseup', () => {
        isPanning = false;
        svg.style.cursor = 'default';
    });

    svg.addEventListener('mouseleave', () => {
        isPanning = false;
        svg.style.cursor = 'default';
    });

    function updateHoverCard(element) {
        if (!element) {
            hoverCard.style.display = 'none';
            return;
        }

        let content = `<p><span class="label">${element.label}</span> ${element.type}`;
        if (element.classes && element.classes.length > 0) {
            content += ` <span class="classes">(${element.classes.join(', ')})</span>`;
        }
        content += `</p>`;

        if (element.type === 'point') {
            content += '<hr>';
            content += '<div class="coords-grid">';
            // Algebraic X
            content += `<span>X:</span>`;
            const xAlg = document.createElement('span');
            katex.render(element.latex_x, xAlg);
            content += `<span>${xAlg.innerHTML}</span>`;
            // Algebraic Y
            content += `<span>Y:</span>`;
            const yAlg = document.createElement('span');
            katex.render(element.latex_y, yAlg);
            content += `<span>${yAlg.innerHTML}</span>`;
            
            // Floating point X
            content += `<span> </span><span>(${element.x.toFixed(4)})</span>`;
            // Floating point Y
            content += `<span> </span><span>(${element.y.toFixed(4)})</span>`;

            content += '</div>';
        }

        hoverCard.innerHTML = content;
        hoverCard.style.display = 'block';
    }

    let isPositionedByTable = false;

    function setElementHover(label, hoverState) {
        const elementData = modelData.elements.find(el => el.label === label);
        if (!elementData) return;

        const svgElement = document.getElementById(label);
        const pointsRow = pointsTableBody.querySelector(`tr[data-label="${label}"]`);
        const structuresRow = structuresTableBody.querySelector(`tr[data-label="${label}"]`);
        const graphicsRow = graphicsTableBody.querySelector(`tr[data-label="${label}"]`);
        const chronoRow = chronoTableBody.querySelector(`tr[data-label="${label}"]`);

        const action = hoverState ? 'add' : 'remove';
        if (svgElement) svgElement.classList[action]('hover');
        if (pointsRow) pointsRow.classList[action]('row-hover');
        if (structuresRow) structuresRow.classList[action]('row-hover');
        if (graphicsRow) graphicsRow.classList[action]('row-hover');
        if (chronoRow) chronoRow.classList[action]('row-hover');

        // Handle parents
        let parentLabels = [];
        if (elementData.type === 'line') {
            parentLabels = [elementData.pt1, elementData.pt2];
        } else if (elementData.type === 'circle') {
            parentLabels = [elementData.center, elementData.pt_on_rad];
        }

        parentLabels.forEach(parentLabel => {
            if (parentLabel) {
                setElementHover(parentLabel, hoverState);
            }
        });
    }

    // SVG hover
    document.addEventListener('mouseover', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id && target.id !== 'drawing') {
            isPositionedByTable = false;
            setElementHover(target.id, true);
            const elementData = modelData.elements.find(el => el.label === target.id);
            updateHoverCard(elementData);
        }
    });

    document.addEventListener('mouseout', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id) {
            setElementHover(target.id, false);
            hoverCard.style.display = 'none';
        }
    });

    // Table hovers
    [pointsTableBody, structuresTableBody, graphicsTableBody, chronoTableBody].forEach(tableBody => {
        tableBody.addEventListener('mouseover', (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.label) {
                const label = row.dataset.label;
                setElementHover(label, true);

                const elementData = modelData.elements.find(el => el.label === label);
                const svgElement = document.getElementById(label);
                if (elementData && svgElement) {
                    updateHoverCard(elementData);
                    // Position card next to element in SVG
                    isPositionedByTable = true;
                    const elemRect = svgElement.getBoundingClientRect();
                    hoverCard.style.left = `${elemRect.right + 10}px`;
                    hoverCard.style.top = `${elemRect.top}px`;
                }
            }
        });

        tableBody.addEventListener('mouseout', (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.label) {
                setElementHover(row.dataset.label, false);
            }
            hoverCard.style.display = 'none';
        });

        // Handle delete button clicks
        tableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const row = event.target.closest('tr');
                const label = row.dataset.label;
                if (confirm(`Are you sure you want to delete ${label} and all its dependents?`)) {
                    fetch('/api/model/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ label: label }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        renderModel(data);
                    });
                }
            }
        });
    });

    // Chronological Table selection
    chronoTableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.label) {
            const elementData = modelData.elements.find(el => el.label === row.dataset.label);
            if (elementData && elementData.type === 'point') {
                toggleSelection(row.dataset.label);
            }
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (hoverCard.style.display === 'block' && !isPositionedByTable) {
            hoverCard.style.left = `${event.clientX + 15}px`;
            hoverCard.style.top = `${event.clientY + 15}px`;
        }
    });
    
    document.addEventListener('mouseout', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id) {
            hoverCard.style.display = 'none';
        }
    });

    const resizeObserver = new ResizeObserver(scaleCircles);
    resizeObserver.observe(svg);

    // Initial fetch
    fetch('/api/model')
        .then(response => response.json())
        .then(data => {
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
                        alert(`Error loading file: ${data.message}`);
                    } else {
                        renderModel(data);
                        clearSelection();
                    }
                });
            };
            reader.readAsText(file);
        }
        // Reset file input so the same file can be loaded again
        event.target.value = null;
    });

    function saveModel(defaultFilename = 'construction.json') {
        const filename = prompt('Enter filename:', defaultFilename);
        if (filename) {
            fetch('/api/model/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                } else {
                    alert(`Error saving file: ${data.message}`);
                }
            });
        }
    }

    saveBtn.addEventListener('click', () => {
        // For now, save and save as are the same.
        // Later, we can store the current filename in a variable.
        saveModel();
    });

    saveAsBtn.addEventListener('click', () => {
        saveModel();
    });
});