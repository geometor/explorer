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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/model', methods=['GET'])
def get_model():
    """Returns the complete model data using the new to_browser_dict method."""
    return jsonify(model.to_browser_dict())

@app.route('/api/model/save', methods=['POST'])
def save_model():
    """Saves the current model to a file."""
    data = request.get_json()
    file_path = data.get('path')
    if file_path:
        model.save(file_path)
        return jsonify({"success": True, "message": f"Model saved to {file_path}"})
    return jsonify({"success": False, "message": "No file path provided."}), 400

@app.route('/api/model/load', methods=['POST'])
def load_model():
    """Loads a model from a file."""
    data = request.get_json()
    file_path = data.get('path')
    if file_path:
        model.load(file_path)
        return jsonify(model.to_browser_dict())
    return jsonify({"success": False, "message": "No file path provided."}), 400
    
@app.route('/api/model/new', methods=['POST'])
def new_model_endpoint():
    new_model()
    return jsonify(model.to_browser_dict())


@app.route('/api/construct/line', methods=['POST'])
def construct_line():
    data = request.get_json()
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_line(pt1, pt2)

    return jsonify(model.to_browser_dict())

@app.route('/api/construct/circle', methods=['POST'])
def construct_circle():
    data = request.get_json()
    pt1_label = data.get('pt1')
    pt2_label = data.get('pt2')

    pt1 = model.get_element_by_label(pt1_label)
    pt2 = model.get_element_by_label(pt2_label)

    if pt1 and pt2:
        model.construct_circle(pt1, pt2)

    return jsonify(model.to_browser_dict())


@app.route('/api/construct/point', methods=['POST'])
def construct_point():
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')

    if x is not None and y is not None:
        model.set_point(x, y)

    return jsonify(model.to_browser_dict())


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
    return jsonify(model.to_browser_dict())


@app.route('/api/construct/segment', methods=['POST'])
def construct_segment():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) == 2:
        model.construct_segment(*points)
    return jsonify(model.to_browser_dict())

@app.route('/api/construct/section', methods=['POST'])
def construct_section():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) == 3:
        model.construct_section(*points)
    return jsonify(model.to_browser_dict())

@app.route('/api/construct/chain', methods=['POST'])
def construct_chain():
    data = request.get_json()
    points = [model.get_element_by_label(label) for label in data.get('points', [])]
    if len(points) >= 2:
        model.construct_chain(*points)
    return jsonify(model.to_browser_dict())


def run():
    app.run(debug=True, port=4445)

if __name__ == '__main__':
    run()
