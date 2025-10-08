document.addEventListener('DOMContentLoaded', function() {
    // basic setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#three-canvas')
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    fetch('/api/model')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderModel(data);
        })
        .catch(error => console.error('Error fetching model:', error));

    function renderModel(data) {
        // Clear existing objects from the scene
        while(scene.children.length > 0){
            scene.remove(scene.children[0]);
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 0, 1);
        scene.add(directionalLight);

        // Render points
        if (data.tables && data.tables.points) {
            const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            data.tables.points.forEach(point => {
                // The model data is in LaTeX format, so we need to parse it.
                // This is a simplification and might not work for complex expressions.
                const x = parseFloat(eval(point.x.replace(/\\frac/g, '')));
                const y = parseFloat(eval(point.y.replace(/\\frac/g, '')));
                const z = 0; // For now, we are in 2D

                const sphere = new THREE.Mesh(pointGeometry, pointMaterial);
                sphere.position.set(x, y, z);
                scene.add(sphere);
            });
        }

        // Render lines
        if (data.svg_elements) {
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            data.svg_elements.forEach(el => {
                if (el.type === 'line') {
                    const points = [];
                    points.push(new THREE.Vector3(el.x1, el.y1, 0));
                    points.push(new THREE.Vector3(el.x2, el.y2, 0));
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    scene.add(line);
                }
            });
        }
        
        // Adjust camera
        camera.position.z = 5;
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    // dark mode
    const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
    const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');

    toggleDarkModeBtn.addEventListener('click', () => {
        darkModeStylesheet.disabled = !darkModeStylesheet.disabled;
    });
});