document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/model')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderModel(data);
        })
        .catch(error => console.error('Error fetching model:', error));
});

function renderModel(data) {
    const drawing = document.getElementById('drawing');
    const svgNS = "http://www.w3.org/2000/svg";
    const pointsData = new Map(data.tables.points.map(p => [p.label, p]));

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
            drawing.appendChild(shape);
        });
    }

    // 3. Populate tables
    if (data.tables) {
        populateTable('pointList', data.tables.points, ['label', 'x', 'y']);
        populateTable('structList', data.tables.structures, ['label', 'eq']);
    }

    // 4. Add event listeners
    setupHoverListeners(pointsData);
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

function setupHoverListeners(pointsData) {
    const hoverCard = document.getElementById('hover-card');
    
    document.querySelectorAll('[data-label]').forEach(el => {
        const label = el.getAttribute('data-label');
        const row = document.getElementById(`row-${label}`);
        const pointInfo = pointsData.get(label);

        el.addEventListener('mouseover', (e) => {
            // Highlight row
            if (row) {
                row.classList.add('highlight');
            }

            // Show and position hover card
            if (pointInfo) {
                hoverCard.innerHTML = `<b>Point ${pointInfo.label}</b><br>x: ${katex.renderToString(pointInfo.x)}<br>y: ${katex.renderToString(pointInfo.y)}`;
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
