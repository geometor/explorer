// NOTE: INVERTED Y-AXIS
// The SVG coordinate system has its origin (0,0) at the top-left corner,
// with the y-axis extending downwards. To align with standard mathematical
// conventions where the y-axis extends upwards, all y-values for SVG
// attributes (e.g., y1, y2, cy) are negated.

// The viewBox attribute is also adjusted to handle this inversion.
// The third parameter of the viewBox, `y`, is set to a negative value
// to effectively flip the coordinate system vertically, ensuring that
// positive y-values are plotted above the x-axis.

const SVG_NS = "http://www.w3.org/2000/svg";

function renderHighlight(el, points) {
    let highlightEl = document.createElementNS(SVG_NS, 'polyline');
    let pt1, pt2;

    switch (el.type) {
        case 'point':
            pt1 = el;
            pt2 = el;
            break;
        case 'line':
            pt1 = points[el.pt1];
            pt2 = points[el.pt2];
            break;
        case 'circle':
            pt1 = points[el.center];
            pt2 = points[el.radius_pt];
            break;
        default:
            return;
    }

    if (pt1 && pt2) {
        highlightEl.setAttribute('points', `${pt1.x},${-pt1.y} ${pt2.x},${-pt2.y}`);
        highlightEl.id = `highlight-${el.ID}`;
        highlightEl.classList.add('highlight-segment');
        highlightEl.style.display = 'none';
        GEOMETOR.highlightsContainer.appendChild(highlightEl);
    }
}

export function renderElement(el, points) {
    let svgEl;
    let pointsStr;
    switch (el.type) {
        case 'line':
            svgEl = document.createElementNS(SVG_NS, 'line');
            const pt1 = points[el.pt1];
            const pt2 = points[el.pt2];
            svgEl.setAttribute('x1', pt1.x - 1000 * (pt2.x - pt1.x));
            svgEl.setAttribute('y1', -(pt1.y - 1000 * (pt2.y - pt1.y)));
            svgEl.setAttribute('x2', pt1.x + 1000 * (pt2.x - pt1.x));
            svgEl.setAttribute('y2', -(pt1.y + 1000 * (pt2.y - pt1.y)));
            renderHighlight(el, points);
            break;
        case 'circle':
            svgEl = document.createElementNS(SVG_NS, 'circle');
            const center = points[el.center];
            svgEl.setAttribute('cx', center.x);
            svgEl.setAttribute('cy', -center.y);
            svgEl.setAttribute('r', el.radius);
            svgEl.setAttribute('fill', 'none');
            renderHighlight(el, points);
            break;
        case 'polygon':
            svgEl = document.createElementNS(SVG_NS, 'polygon');
            pointsStr = el.points.map(p_ID => {
                const p = points[p_ID];
                return `${p.x},${-p.y}`;
            }).join(' ');
            svgEl.setAttribute('points', pointsStr);
            break;
        case 'segment':
        case 'section':
        case 'chain':
            svgEl = document.createElementNS(SVG_NS, 'polyline');
            pointsStr = el.points.map(p_ID => {
                const p = points[p_ID];
                return `${p.x},${-p.y}`;
            }).join(' ');
            svgEl.setAttribute('points', pointsStr);
            break;
        case 'polynomial':
            svgEl = renderPolynomial(el);
            break;
    }

    if (svgEl) {
        svgEl.id = el.ID;
        svgEl.classList.add(el.type);
        el.classes.forEach(c => svgEl.classList.add(c));
        if (el.guide) {
            svgEl.classList.add('guide');
        }
        if (['polygon', 'segment', 'section', 'chain'].includes(el.type)) {
            svgEl.dataset.category = 'graphics';
            GEOMETOR.graphicsContainer.appendChild(svgEl);
        } else {
            svgEl.dataset.category = 'elements';
            GEOMETOR.elementsContainer.appendChild(svgEl);
        }
    }
}

export function renderPoint(el) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.id = el.ID;
    circle.setAttribute('cx', el.x);
    circle.setAttribute('cy', -el.y);
    circle.setAttribute('r', 0.02);
    circle.dataset.category = 'points';
    circle.classList.add('point');
    el.classes.forEach(c => circle.classList.add(c));
    if (el.guide) {
        circle.classList.add('guide');
    }
    GEOMETOR.pointsContainer.appendChild(circle);
    renderHighlight(el);
}

function evaluatePolynomial(coeffs, x) {
    let result = 0;
    // Ensure coeffs are parsed as floats for calculation
    const numericCoeffs = coeffs.map(c => {
        if (typeof c === 'string' && c.includes('sqrt')) {
            // Basic parsing for sqrt(5) or similar patterns.
            // A more robust solution might be needed for complex expressions.
            const num = parseFloat(c.match(/(\d+)/)[0]);
            return Math.sqrt(num);
        }
        return parseFloat(c);
    });

    for (let i = 0; i < numericCoeffs.length; i++) {
        result += numericCoeffs[i] * Math.pow(x, numericCoeffs.length - 1 - i);
    }
    return result;
}

function generatePolynomialPointsString(el) {
    const coeffs = el.coeffs;
    const viewBox = GEOMETOR.svg.getAttribute('viewBox').split(' ').map(Number);
    const [minX, , viewWidth] = viewBox;
    const maxX = minX + viewWidth;

    const svgWidth = GEOMETOR.svg.clientWidth;
    // Calculate step size to have roughly one point per pixel
    const step = viewWidth / svgWidth;

    let points = [];
    for (let x = minX; x <= maxX; x += step) {
        const y = evaluatePolynomial(coeffs, x);
        points.push(`${x},${-y}`);
    }
    return points.join(' ');
}

function renderPolynomial(el) {
    const svgEl = document.createElementNS(SVG_NS, 'polyline');
    svgEl.setAttribute('points', generatePolynomialPointsString(el));
    svgEl.setAttribute('fill', 'none');
    return svgEl;
}

export function updatePolynomials() {
    const polys = GEOMETOR.graphicsContainer.querySelectorAll('.polynomial');
    polys.forEach(polyEl => {
        const elData = GEOMETOR.modelData.elements.find(e => e.ID === polyEl.id);
        if (elData) {
            polyEl.setAttribute('points', generatePolynomialPointsString(elData));
        }
    });
}


export function scaleCircles() {
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


export function fitConstruction() {
    const points = GEOMETOR.modelData.elements.filter(el => el.type === 'point');
    if (points.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });

    const circles = GEOMETOR.modelData.elements.filter(el => el.type === 'circle');
    circles.forEach(c => {
        const center = GEOMETOR.modelData.elements.find(p => p.ID === c.center);
        if (center) {
            minX = Math.min(minX, center.x - c.radius);
            maxX = Math.max(maxX, center.x + c.radius);
            minY = Math.min(minY, center.y - c.radius);
            maxY = Math.max(maxY, center.y + c.radius);
        }
    });

    if (minX === Infinity) {
        minX = -1;
        maxX = 1;
        minY = -1;
        maxY = 1;
    }

    const padding = 0.1;
    const width = maxX - minX;
    const height = maxY - minY;
    const paddedWidth = width * (1 + padding);
    const paddedHeight = height * (1 + padding);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    const svgAspectRatio = GEOMETOR.svg.clientWidth / GEOMETOR.svg.clientHeight;
    const constructionAspectRatio = paddedWidth / paddedHeight;

    let viewBoxWidth, viewBoxHeight;
    if (svgAspectRatio > constructionAspectRatio) {
        viewBoxHeight = paddedHeight;
        viewBoxWidth = paddedHeight * svgAspectRatio;
    } else {
        viewBoxWidth = paddedWidth;
        viewBoxHeight = paddedWidth / svgAspectRatio;
    }

    const viewBoxX = centerX - viewBoxWidth / 2;
    const viewBoxY = -centerY - viewBoxHeight / 2;

    GEOMETOR.svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    scaleCircles();
}

export function initSvgEventListeners() {
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
        updatePolynomials();
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
        updatePolynomials();
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
            if (target.parentElement) {
                target.parentElement.appendChild(target);
            }
            GEOMETOR.isPositionedByTable = false;
            GEOMETOR.setElementHover(target.id, true);
            if (GEOMETOR.modelData.elements) {
                const elementData = GEOMETOR.modelData.elements.find(el => el.ID === target.id);
                GEOMETOR.updateHoverCard(elementData);
            }
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

export async function exportSVG(options = {}) {
    // 1. Clone the SVG element
    const originalSvg = GEOMETOR.svg;
    const clonedSvg = originalSvg.cloneNode(true);

    // 2. Embed Styles
    const styleSheets = ['css/style.css', 'css/svg.css'];
    let cssContent = '';

    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
        const href = link.href;
        if (href.includes('svg.css') || href.includes('style.css')) {
            try {
                const response = await fetch(href);
                const text = await response.text();
                cssContent += `\n/* ${href} */\n${text}`;
            } catch (e) {
                console.error("Failed to fetch CSS for export:", href, e);
            }
        }
    }

    if (document.body.classList.contains('light-theme') || options.theme === 'light') {
        clonedSvg.classList.add('light-theme');
    }

    // Handle Print Output
    if (options.output === 'print') {
        const viewBox = originalSvg.getAttribute('viewBox').split(' ').map(Number);

        // Handle Sheet Size
        if (options.sheet_size) {
            const [w, h] = options.sheet_size.split('x').map(Number);
            clonedSvg.setAttribute('width', `${w}in`);
            clonedSvg.setAttribute('height', `${h}in`);

            // Adjust viewBox to center the content in the new aspect ratio
            const sheetRatio = w / h;
            const currentW = viewBox[2];
            const currentH = viewBox[3];
            const currentRatio = currentW / currentH;

            let newViewW, newViewH, newMinX, newMinY;

            if (currentRatio > sheetRatio) {
                // Drawing is wider than sheet: fit to width
                newViewW = currentW;
                newViewH = currentW / sheetRatio;
                newMinX = viewBox[0];
                newMinY = viewBox[1] - (newViewH - currentH) / 2;
            } else {
                // Drawing is taller than sheet: fit to height
                newViewH = currentH;
                newViewW = currentH * sheetRatio;
                newMinY = viewBox[1];
                newMinX = viewBox[0] - (newViewW - currentW) / 2;
            }
            clonedSvg.setAttribute('viewBox', `${newMinX} ${newMinY} ${newViewW} ${newViewH}`);
        }

        // Calculate a reasonable stroke width based on viewbox
        // We re-read viewBox in case it changed above (it didn't change the scale of content, just the window)
        // actually for stroke width we want relative to the content size, so original width is fine/safe
        // but if we zoomed out effectively by adding padding, maybe we want strokes to reference the sheet size?
        // Let's stick to the visual width of the content for now.
        const width = viewBox[2];
        const strokeWidth = width / 800; // e.g. 4 / 800 = 0.005

        cssContent += `
        /* Print Overrides */
        * { 
            vector-effect: none !important; 
        }
        line, circle, polyline, path, polygon { 
            stroke-width: ${strokeWidth}px !important; 
        }
        /* Keep points (small circles) visible but scalable */
        #points circle {
            r: ${strokeWidth * 3}px !important;
            stroke-width: ${strokeWidth}px !important;
        }
        `;
    }

    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

    // 3. Serialize
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    // Add XML declaration
    if (!source.match(/^<xml/)) {
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    }

    // 4. Download
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;

    // Use filename from status bar or default
    const filenameDisplay = document.getElementById('status-filename');
    let name = filenameDisplay ? filenameDisplay.textContent.trim() : 'model';
    if (!name || name === 'Unsaved Model') name = 'model';

    // Robust extension stripping
    try {
        const lastDotIndex = name.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            name = name.substring(0, lastDotIndex);
        }
    } catch (e) {
        console.warn('Error processing filename, using default', e);
        name = 'model';
    }

    // Append suffix if print
    if (options && options.output === 'print') name += '-print';
    if (options && options.theme === 'light') name += '-light';

    name += '.svg';

    console.log('Exporting SVG with filename:', name);

    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export async function exportAnimatedSVG() {
    // 1. Clone the SVG element
    const originalSvg = GEOMETOR.svg;
    const clonedSvg = originalSvg.cloneNode(true);

    // 2. Embed Styles
    const styleSheets = ['css/style.css', 'css/svg.css'];
    let cssContent = '';

    // Initial opacity 0 for animation elements
    cssContent += `
    /* Animation Initial State */
    #points > *, #elements > *, #graphics > * {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    `;

    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
        const href = link.href;
        if (href.includes('svg.css') || href.includes('style.css')) {
            try {
                const response = await fetch(href);
                const text = await response.text();
                cssContent += `\n/* ${href} */\n${text}`;
            } catch (e) {
                console.error("Failed to fetch CSS for export:", href, e);
            }
        }
    }

    if (document.body.classList.contains('light-theme')) {
        clonedSvg.classList.add('light-theme');
    }

    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

    // 3. Prepare Sequence
    // Extract IDs from modelData to ensure correct order
    const sequence = [];
    if (GEOMETOR.modelData && GEOMETOR.modelData.elements) {
        GEOMETOR.modelData.elements.forEach(el => {
            sequence.push(el.ID);
        });
    } else {
        // Fallback if modelData isn't available for some reason
        const allEls = originalSvg.querySelectorAll('#points > *, #elements > *, #graphics > *');
        allEls.forEach(el => sequence.push(el.id));
    }

    // 4. Embed Script
    const scriptContent = `
    const sequence = ${JSON.stringify(sequence)};
    let currentIndex = 0;
    let isPlaying = true;
    let timer = null;

    window.onload = function() {
        const svg = document.querySelector('svg');
        
        // Ensure all elements start hidden
        sequence.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.opacity = '0';
        });

        function step() {
            if (!isPlaying) return;

            if (currentIndex < sequence.length) {
                const id = sequence[currentIndex];
                const el = document.getElementById(id);
                if (el) {
                    el.style.opacity = '1';
                }
                currentIndex++;
                timer = setTimeout(step, 200);
            } else {
                isPlaying = false;
            }
        }

        // Click to toggle
        svg.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                // If finished, restart
                if (currentIndex >= sequence.length) {
                    currentIndex = 0;
                    sequence.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.opacity = '0';
                    });
                }
                step();
            } else {
                clearTimeout(timer);
            }
        });

        // Start automatically
        setTimeout(step, 1000);
    };
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent;
    clonedSvg.appendChild(scriptElement);

    // 5. Serialize
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    if (!source.match(/^<xml/)) {
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    }

    // 6. Download
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;

    const filenameDisplay = document.getElementById('status-filename');
    let name = filenameDisplay ? filenameDisplay.textContent.trim() : 'model-animated';
    if (!name || name === 'Unsaved Model') name = 'model-animated';
    if (!name.endsWith('.svg')) name += '.svg';

    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}