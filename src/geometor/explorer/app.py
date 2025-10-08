from flask import Flask, render_template, jsonify, request
from geometor.model import Model
import sympy as sp
import sympy.geometry as spg

app = Flask(__name__)
model = Model()

def new_model():
    global model
    model = Model("new")
    A = model.set_point(0, 0, classes=["given"])
    B = model.set_point(1, 0, classes=["given"])

new_model()

# Style definitions adapted from geometor.render
STYLES = {
    "point_outer": {"stroke": "none", "fill": "none"},
    "point_inner": {"stroke-width": 1, "fill": "none"}, # stroke-width will be overwritten
    "line": {"stroke": "#999", "stroke-width": 1, "fill": "none", "vector-effect": "non-scaling-stroke"},
    "circle": {"stroke": "#C09", "stroke-width": 1.5, "fill": "none", "vector-effect": "non-scaling-stroke"},
    "polygon": {"stroke": "#36c9", "stroke-width": 1, "fill": "#36c3", "vector-effect": "non-scaling-stroke"},
}

def apply_styles(svg_element, element_type, classes=None):
    """Applies styles to an SVG element dictionary."""
    if classes is None:
        classes = []
    
    # Start with default styles for the element type
    style = STYLES.get(element_type, {}).copy()
    
    # Here you could add more complex logic to override styles based on classes
    # For now, we'll just use the defaults.
    
    svg_element.update(style)
    
    # Combine original class with style class
    original_class = svg_element.get('class', '')
    svg_element['class'] = f"{element_type} {original_class}".strip()


def add_margin_to_limits(x_limits, y_limits, margin_ratio=0.2, default_span=1.0):
    """Calculates viewBox limits to be square and centered on the geometry."""
    x_range = x_limits[1] - x_limits[0]
    y_range = y_limits[1] - y_limits[0]

    x_center = (x_limits[0] + x_limits[1]) / 2
    y_center = (y_limits[0] + y_limits[1]) / 2

    # The span of the square viewbox will be the max of the geometry's ranges
    span = max(x_range, y_range)
    if span == 0:
        span = default_span

    # Add margin to the span
    span *= (1 + margin_ratio * 2) # Add margin to both sides

    half_span = span / 2
    
    final_x_limits = [x_center - half_span, x_center + half_span]
    final_y_limits = [y_center - half_span, y_center + half_span]
    
    return final_x_limits, final_y_limits

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/three')
def three():
    return render_template('index_three.html')

@app.route('/markers')
def markers():
    return render_template('index_markers.html')

def get_model_data_markers():
    """Serializes the current model state into a dictionary for marker-based rendering."""
    # Manually calculate the bounding box to include full circles
    x_min, x_max, y_min, y_max = None, None, None, None

    for el, details in model.items():
        if isinstance(el, spg.Point):
            x, y = float(el.x.evalf()), float(el.y.evalf())
            if x_min is None or x < x_min: x_min = x
            if x_max is None or x > x_max: x_max = x
            if y_min is None or y < y_min: y_min = y
            if y_max is None or y > y_max: y_max = y

        elif isinstance(el, spg.Circle):
            center = el.center
            radius = float(el.radius.evalf())
            cx, cy = float(center.x.evalf()), float(center.y.evalf())
            
            # Update bounds to include the full circle
            if x_min is None or (cx - radius) < x_min: x_min = cx - radius
            if x_max is None or (cx + radius) > x_max: x_max = cx + radius
            if y_min is None or (cy - radius) < y_min: y_min = cy - radius
            if y_max is None or (cy + radius) > y_max: y_max = cy + radius

    if x_min is None:
        x_limits, y_limits = [-2, 2], [-2, 2]
    else:
        x_limits, y_limits = add_margin_to_limits([x_min, x_max], [y_min, y_max])
    
    viewBox_width = x_limits[1] - x_limits[0]
    viewBox_height = y_limits[1] - y_limits[0]

    viewBox = f"{x_limits[0]} {y_limits[0]} {viewBox_width} {viewBox_height}"
    
    bounds_poly = spg.Polygon(
        spg.Point(x_limits[0], y_limits[1]),
        spg.Point(x_limits[0], y_limits[0]),
        spg.Point(x_limits[1], y_limits[0]),
        spg.Point(x_limits[1], y_limits[1]),
    )

    svg_elements = []
    points_svg = [] # Separate list to hold points
    points_table = []
    structures_table = []

    for el, details in model.items():
        if isinstance(el, spg.Point):
            x, y = float(el.x.evalf()), float(el.y.evalf())
            point_id = details.label
            
            # Use a zero-length path with a marker for non-scaling points
            path = {
                'type': 'path',
                'd': f'M {x},{y} L {x},{y}',
                'marker-start': 'url(#point-marker)',
                'stroke': 'transparent',
                'data-label': point_id
            }
            points_svg.append(path)
            
            points_table.append({
                'id': f'row-{point_id}',
                'label': details.label,
                'x': sp.latex(el.x),
                'y': sp.latex(el.y)
            })

        elif isinstance(el, spg.Line):
            ends = bounds_poly.intersection(el)
            if len(ends) == 2:
                p1, p2 = ends
                line = {
                    'type': 'line',
                    'x1': float(p1.x.evalf()), 'y1': float(p1.y.evalf()),
                    'x2': float(p2.x.evalf()), 'y2': float(p2.y.evalf()),
                    'class': ' '.join(details.classes),
                    'data-label': details.label
                }
                apply_styles(line, 'line', details.classes)
                svg_elements.append(line)
            structures_table.append({
                'id': f'row-{details.label}',
                'label': details.label, 
                'eq': sp.latex(el.equation())
            })

        elif isinstance(el, spg.Circle):
            center = el.center
            radius = float(el.radius.evalf())
            circle = {
                'type': 'circle',
                'cx': float(center.x.evalf()), 'cy': float(center.y.evalf()),
                'r': radius,
                'class': ' '.join(details.classes),
                'data-label': details.label
            }
            apply_styles(circle, 'circle', details.classes)
            svg_elements.append(circle)
            structures_table.append({
                'id': f'row-{details.label}',
                'label': details.label, 
                'eq': sp.latex(el.equation())
            })
            
        elif isinstance(el, spg.Polygon):
            points_str = " ".join([f"{float(p.x.evalf())},{float(p.y.evalf())}" for p in el.vertices])
            polygon = {
                'type': 'polygon',
                'points': points_str,
                'class': ' '.join(details.classes)
            }
            apply_styles(polygon, 'polygon', details.classes)
            svg_elements.append(polygon)

    # Add points last to ensure they are rendered on top
    svg_elements.extend(points_svg)

    return {
        'name': model.name,
        'viewBox': viewBox,
        'svg_elements': svg_elements,
        'tables': {
            'points': points_table,
            'structures': structures_table,
        }
    }

@app.route('/api/model', methods=['GET', 'POST'])
def api_model():
    if request.method == 'POST':
        new_model()
    
    return jsonify(get_model_data())


@app.route('/api/model_markers', methods=['GET'])
def api_model_markers():
    return jsonify(get_model_data_markers())


@app.route('/api/construct/line', methods=['POST'])
def construct_line():
    data = request.get_json()
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_line(pt1, pt2)

    return jsonify(get_model_data())

@app.route('/api/construct/circle', methods=['POST'])
def construct_circle():
    data = request.get_json()
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_circle(pt1, pt2)

    return jsonify(get_model_data())


@app.route('/api/construct/point', methods=['POST'])
def construct_point():
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')

    if x is not None and y is not None:
        model.set_point(x, y)

    return jsonify(get_model_data())


def run():
    app.run(debug=True, port=4445)

if __name__ == '__main__':
    run()
