from geometor.explorer.serialize import to_browser_dict
from flask import Flask, render_template, jsonify, request
from geometor.model import Model, save_model, load_model
from geometor.divine import analyze_model
import sympy as sp
import sympy.geometry as spg
from sympy.polys.specialpolys import w_polys
import os
import tempfile

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
model = Model()
analyze_model(model)

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
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_line(pt1, pt2)

    return jsonify(to_browser_dict(model))

@app.route('/api/construct/circle', methods=['POST'])
def construct_circle():
    data = request.get_json()
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_circle(pt1, pt2)

    return jsonify(to_browser_dict(model))


@app.route('/api/construct/point', methods=['POST'])
def construct_point():
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')

    if x is not None and y is not None:
        model.set_point(x, y)

    return jsonify(to_browser_dict(model))


@app.route('/api/model/delete', methods=['POST'])
def delete_element():
    """Deletes an element and its dependents from the model."""
    data = request.get_json()
    label = data.get('label')
    
    if not label:
        return jsonify({"error": "Element label is required."}), 400

    # Call the delete_element method on the model
    model.delete_element(label)
    
    # Return the updated model to the browser
    return jsonify(to_browser_dict(model))


@app.route('/api/set/segment', methods=['POST'])
def set_segment():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) == 2:
        segment = model.set_segment(*points)
        print(to_browser_dict(model))
    return jsonify(to_browser_dict(model))

@app.route('/api/set/section', methods=['POST'])
def set_section():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) == 3:
        section = model.set_section(points)
        print(to_browser_dict(model))
    return jsonify(to_browser_dict(model))


@app.route('/api/set/polygon', methods=['POST'])
def set_polygon():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) >= 3:
        polygon = model.set_polygon(points)
        print(to_browser_dict(model))
    return jsonify(to_browser_dict(model))


def run():
    app.run(debug=True, port=4445)

if __name__ == '__main__':
    run()
