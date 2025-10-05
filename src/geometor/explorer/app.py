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
    "point_outer": {"stroke": "white", "stroke-width": 7, "fill": "none", "vector-effect": "non-scaling-stroke"},
    "point_inner": {"stroke": "black", "stroke-width": 3, "fill": "none", "vector-effect": "non-scaling-stroke"},
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


def add_margin_to_limits(x_limits, y_limits, margin_ratio=0.1, default_margin=0.5):
    """Replicates the bounding box margin logic from the Plotter class."""
    x_range = x_limits[1] - x_limits[0]
    y_range = y_limits[1] - y_limits[0]

    if x_range:
        x_margin = x_range * margin_ratio
        y_margin = y_range * margin_ratio if y_range else x_margin
    elif y_range:
        y_margin = y_range * margin_ratio
        x_margin = y_margin
    else:
        x_margin = y_margin = default_margin

    x_limits = [x_limits[0] - x_margin, x_limits[1] + x_margin]
    y_limits = [y_limits[0] - y_margin, y_limits[1] + y_margin]
    
    return x_limits, y_limits

@app.route('/')
def index():
    return render_template('index.html')

def get_model_data():
    """Serializes the current model state into a dictionary."""
    x_limits, y_limits = model.limits()
    if not all(x_limits) or not all(y_limits):
        x_limits, y_limits = [-2, 2], [-2, 2]
    else:
        x_limits, y_limits = add_margin_to_limits(x_limits, y_limits)
    
    viewBox = f"{x_limits[0]} {y_limits[0]} {x_limits[1] - x_limits[0]} {y_limits[1] - y_limits[0]}"
    
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
            
            outer = {'type': 'circle', 'cx': x, 'cy': y, 'r': 0.005, 'id': f'svg-outer-{point_id}', 'data-label': point_id}
            apply_styles(outer, 'point_outer', details.classes)
            points_svg.append(outer)

            inner = {'type': 'circle', 'cx': x, 'cy': y, 'r': 0.005, 'id': f'svg-inner-{point_id}', 'data-label': point_id}
            apply_styles(inner, 'point_inner', details.classes)
            points_svg.append(inner)
            
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



def run():
    app.run(debug=True, port=4445)

if __name__ == '__main__':
    run()
