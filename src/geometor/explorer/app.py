from geometor.explorer.serialize import to_browser_dict
from flask import Flask, render_template, jsonify, request
from geometor.model import Model, save_model, load_model
from geometor.divine import analyze_model
from geometor.divine.golden.groups import group_sections_by_size, group_sections_by_points
from geometor.divine.golden.chains import find_chains_in_sections, unpack_chains
from geometor.model.sections import Section
from geometor.model.chains import Chain
import sympy as sp
import sympy.geometry as spg
from sympy.polys.specialpolys import w_polys
import os
import tempfile

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
model = None

# CONSTRUCTIONS_DIR = os.path.join(os.path.dirname(__file__), 'constructions')
CONSTRUCTIONS_DIR = './constructions'
os.makedirs(CONSTRUCTIONS_DIR, exist_ok=True)

def new_model():
    global model
    model = Model("new")
    analyze_model(model)
    A = model.set_point(0, 0, classes=["given"])
    B = model.set_point(1, 0, classes=["given"])

new_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/model', methods=['GET'])
def get_model():
    """Returns the complete model data using the new to_browser_dict method."""
    return jsonify(to_browser_dict(model))

@app.route('/api/model/save', methods=['POST'])
def save_model_endpoint():
    """Saves the current model to a file in the constructions directory."""
    data = request.get_json()
    filename = data.get('filename')
    if filename:
        if ".." in filename or "/" in filename:
            return jsonify({"success": False, "message": "Invalid filename."}), 400
        
        file_path = os.path.join(CONSTRUCTIONS_DIR, filename)
        save_model(model, file_path)
        return jsonify({"success": True, "message": f"Model saved to {file_path}"})
    return jsonify({"success": False, "message": "No filename provided."}), 400

@app.route('/api/model/load', methods=['POST'])
def load_model_endpoint():
    """Loads a model from file content."""
    global model
    data = request.get_json()
    
    if 'content' in data:
        content = data.get('content')
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".json", dir=CONSTRUCTIONS_DIR) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            model = load_model(tmp_path)
            analyze_model(model)
        finally:
            os.remove(tmp_path)
        
        return jsonify(to_browser_dict(model))

    elif 'filename' in data:
        filename = data.get('filename')
        if ".." in filename or "/" in filename:
            return jsonify({"success": False, "message": "Invalid filename."}), 400
        
        file_path = os.path.join(CONSTRUCTIONS_DIR, filename)
        if os.path.exists(file_path):
            model = load_model(file_path)
            analyze_model(model)
            return jsonify(to_browser_dict(model))
        else:
            return jsonify({"success": False, "message": "File not found."}), 404
            
    return jsonify({"success": False, "message": "No content or filename provided."}), 400
    
@app.route('/api/constructions', methods=['GET'])
def list_constructions():
    """Lists available construction files."""
    files = [f for f in os.listdir(CONSTRUCTIONS_DIR) if f.endswith('.json')]
    return jsonify(files)

@app.route('/api/model/new', methods=['POST'])
def new_model_endpoint():
    new_model()
    return jsonify(to_browser_dict(model))


@app.route('/api/construct/line', methods=['POST'])
def construct_line():
    data = request.get_json()
    pt1_ID = data.get('pt1')
    pt2_ID = data.get('pt2')

    pt1 = model.get_element_by_ID(pt1_ID)
    pt2 = model.get_element_by_ID(pt2_ID)

    if pt1 and pt2:
        model.construct_line(pt1, pt2)

    return jsonify(to_browser_dict(model))

@app.route('/api/construct/circle', methods=['POST'])
def construct_circle():
    data = request.get_json()
    pt1_ID = data.get('pt1')
    pt2_ID = data.get('pt2')

    pt1 = model.get_element_by_ID(pt1_ID)
    pt2 = model.get_element_by_ID(pt2_ID)

    if pt1 and pt2:
        model.construct_circle(pt1, pt2)

    return jsonify(to_browser_dict(model))


@app.route('/api/construct/point', methods=['POST'])
def construct_point():
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')

    if x is not None and y is not None:
        model.set_point(x, y, classes=["given"])

    return jsonify(to_browser_dict(model))


@app.route('/api/model/delete', methods=['POST'])
def delete_element():
    """Deletes an element and its dependents from the model."""
    data = request.get_json()
    ID = data.get('ID')
    
    if not ID:
        return jsonify({"error": "Element ID is required."}), 400

    # Call the delete_element method on the model
    model.delete_element(ID)
    
    # Return the updated model to the browser
    return jsonify(to_browser_dict(model))


@app.route('/api/model/dependents', methods=['GET'])
def get_dependents_endpoint():
    """Returns a list of dependent elements for a given element ID."""
    ID = request.args.get('ID')
    if not ID:
        return jsonify({"error": "Element ID is required."}), 400

    dependents = model.get_dependents(ID)
    dependent_IDs = [model[el].ID for el in dependents]
    
    return jsonify(dependent_IDs)


@app.route('/api/model/edit', methods=['POST'])
def edit_element():
    """Updates the class of an element in the model."""
    data = request.get_json()
    ID = data.get('ID')
    new_class = data.get('class')
    
    if not ID or not new_class:
        return jsonify({"error": "Element ID and class are required."}), 400

    element = model.get_element_by_ID(ID)
    
    if element:
        model[element].classes = {new_class: ""}
    
    return jsonify(to_browser_dict(model))


@app.route('/api/set/segment', methods=['POST'])
def set_segment():
    data = request.get_json()
    points = [model.get_element_by_ID(ID) for ID in data.get('points', [])]
    if len(points) == 2:
        segment = model.set_segment(*points)
    return jsonify(to_browser_dict(model))

@app.route('/api/set/section', methods=['POST'])
def set_section():
    data = request.get_json()
    points = [model.get_element_by_ID(ID) for ID in data.get('points', [])]
    if len(points) == 3:
        section = model.set_section(points)
    return jsonify(to_browser_dict(model))


@app.route('/api/set/polygon', methods=['POST'])
def set_polygon():
    data = request.get_json()
    points = [model.get_element_by_ID(ID) for ID in data.get('points', [])]
    if len(points) >= 3:
        polygon = model.set_polygon(points)
    return jsonify(to_browser_dict(model))


def run():
    app.run(debug=True, port=4444)

def get_golden_sections():
    """Helper function to retrieve golden sections from the model."""
    golden_sections = []
    for key, val in model.items():
        if isinstance(key, sp.FiniteSet) and len(key.args) == 3 and 'golden' in val.classes:
            # Reconstruct the Section object to pass to divine functions
            points = list(key.args)
            section = Section(points)
            # Attach the ID from the element sidecar to the temporary section object
            section.ID = val.ID
            golden_sections.append(section)
    return golden_sections

@app.route('/api/groups/by_size', methods=['GET'])
def get_groups_by_size():
    sections = get_golden_sections()
    groups = group_sections_by_size(sections)
    print(f"Found {len(groups)} groups by size")
    
    result = {}
    for size, section_list in groups.items():
        # Convert sympy expression to string for JSON compatibility
        size_str = str(size.evalf(6))
        result[size_str] = [section.ID for section in section_list]
        
    return jsonify(result)

@app.route('/api/groups/by_point', methods=['GET'])
def get_groups_by_point():
    sections = get_golden_sections()
    groups = group_sections_by_points(sections)
    print(f"Found {len(groups)} groups by point")
    
    result = {}
    for point, section_list in groups.items():
        # Use point ID as the key
        point_id = model[point].ID
        result[point_id] = [section.ID for section in section_list]
        
    return jsonify(result)

@app.route('/api/groups/by_chain', methods=['GET'])
def get_groups_by_chain():
    sections = get_golden_sections()
    chain_tree = find_chains_in_sections(sections)
    chains = unpack_chains(chain_tree)
    print(f"Found {len(chains)} chains")
    
    result = []
    for i, chain in enumerate(chains):
        result.append({
            "name": f"Chain {i+1}",
            "sections": [section.ID for section in chain.sections]
        })
        
    return jsonify(result)


if __name__ == '__main__':
    run()
