const SVG_NS = "http://www.w3.org/2000/svg";

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
            GEOMETOR.graphicsContainer.appendChild(svgEl);
        } else {
            GEOMETOR.elementsContainer.appendChild(svgEl);
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
    GEOMETOR.pointsContainer.appendChild(circle);
}

function scaleCircles() {
    const svgRect = GEOMETOR.svg.getBoundingClientRect();
    if (svgRect.width === 0) return;

    const currentViewBox = GEOMETOR.svg.getAttribute('viewBox').split(' ').map(Number);
    const viewBoxWidth = currentViewBox[2];
    const unitsPerPixel = viewBoxWidth / svgRect.width;
    const desiredRadiusPixels = 5;
    const newRadius = desiredRadiusPixels * unitsPerPixel;

    const circles = GEOMETOR.pointsContainer.querySelectorAll('circle');
    circles.forEach(circle => {
        circle.setAttribute('r', newRadius);
    });
}

function initSvgEventListeners() {
    GEOMETOR.svg.addEventListener('wheel', (event) => {
        event.preventDefault();
        const currentViewBox = GEOMETOR.svg.getAttribute('viewBox').split(' ').map(Number);
        let [x, y, width, height] = currentViewBox;
        const scaleFactor = event.deltaY > 0 ? 1.1 : 1 / 1.1;
        const { clientX, clientY } = event;
        const svgRect = GEOMETOR.svg.getBoundingClientRect();
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
        GEOMETOR.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
        scaleCircles();
    });

    let isPanning = false;
    let startPoint = { x: 0, y: 0 };

    GEOMETOR.svg.addEventListener('mousedown', (event) => {
        isPanning = true;
        startPoint = { x: event.clientX, y: event.clientY };
        GEOMETOR.svg.style.cursor = 'grabbing';
    });

    GEOMETOR.svg.addEventListener('mousemove', (event) => {
        if (!isPanning) return;
        const svgRect = GEOMETOR.svg.getBoundingClientRect();
        const currentViewBox = GEOMETOR.svg.getAttribute('viewBox').split(' ').map(Number);
        let [x, y, width, height] = currentViewBox;
        const dx = (event.clientX - startPoint.x) * (width / svgRect.width);
        const dy = (event.clientY - startPoint.y) * (height / svgRect.height);
        x -= dx;
        y -= dy;
        GEOMETOR.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
        startPoint = { x: event.clientX, y: event.clientY };
    });

    GEOMETOR.svg.addEventListener('mouseup', () => {
        isPanning = false;
        GEOMETOR.svg.style.cursor = 'default';
    });

    GEOMETOR.svg.addEventListener('mouseleave', () => {
        isPanning = false;
        GEOMETOR.svg.style.cursor = 'default';
    });

    document.addEventListener('mouseover', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id && target.id !== 'drawing') {
            GEOMETOR.isPositionedByTable = false;
            GEOMETOR.setElementHover(target.id, true);
            const elementData = GEOMETOR.modelData.elements.find(el => el.label === target.id);
            GEOMETOR.updateHoverCard(elementData);
        }
    });

    document.addEventListener('mouseout', (event) => {
        const target = event.target;
        if (target.namespaceURI === SVG_NS && target.id) {
            GEOMETOR.setElementHover(target.id, false);
            GEOMETOR.hoverCard.style.display = 'none';
        }
    });
}
