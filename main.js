import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';

const scene_window = document.getElementById('main');
const ww = scene_window.clientWidth;
const wh = scene_window.clientHeight;

// const ww = window.innerWidth;
// const wh = window.innerHeight;

function setupScene(){
    // Basic Three.js setup
    let scene = new THREE.Scene();
    scene.background = new THREE.Color('#eee');
    // scene.background = new THREE.Color(0x121212);

    // flip x and y axes, 
    scene.scale.set(-1, -1, 1); 
    return scene;
}

function setupRenderer(){
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    
    renderer.setSize(ww, wh);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
}

function setupCamera(){
    let camera = new THREE.PerspectiveCamera(75, ww/wh, 0.1, 1000);
    // Set camera position
    camera.position.set(0.4, 0.4, -0.7);
    // camera.lookAt(0, 0, 0);
    return camera
}

function setupControls(){
    // Camera controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    // controls.target = new THREE.Vector3(0, 0.75, 0);
    controls.update()
    return controls
}

function addHelpers(scene){
    // 100x100 grid 
    let cells = 10;
    let divisions = 100;
    let gridHelper = new THREE.GridHelper(cells, divisions, '#aaa', '#aaa');
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);

    // Adding origin axes
    let axesHelper = new THREE.AxesHelper(cells/2);
    scene.add(axesHelper);
}

function addLights(scene){
    // Lights setup
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    // const keylight = new THREE.DirectionalLight(0xffffff, 0.6);
    // keylight.position.set(1, 1, 2);
    // keylight.lookAt(0, 0, 0);
    // scene.add(keylight);
}

// Function to add 3D points
function addPoint(x, y, z, color = 0xff0000, size = 0.05, opacity = 1.0) {
    let geometry = new THREE.SphereGeometry(size, 32, 32);
    let material = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: opacity 
    });
    let point = new THREE.Mesh(geometry, material);
    point.position.set(x, y, z);
    // scene.add(point);
    return point;
}

// Function to add lines between points
function addLine(point1, point2, color = 0x0000ff, opacity = 1.0) {
    let material = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true,
        opacity: opacity 
    });

    let geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(point1.x, point1.y, point1.z),
        new THREE.Vector3(point2.x, point2.y, point2.z)
    ]);
    let line = new THREE.Line(geometry, material);
    // scene.add(line);
    return line;
}

// Function to add a text label at a 3D position
function addTextLabel(x, y, z, text, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '20px Arial';
    context.fillStyle = color;
    context.fillText(text, 0, 24);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.scale.set(0.5, 0.25, 1); // Adjust based on your scene scale
    sprite.position.set(x, y, z);

    // scene.add(sprite);
    return sprite
}

// Function to add a 2D image as a plane in 3D space with pixel-to-cell conversion
function addImageAsPlane(imagePath, position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, pixelsPerCell = 100, opacity = 0.5, onLoadCallback) {
    // Load the image to get its dimensions
    const image = new Image();
    image.src = imagePath;

    // Wait until the image is loaded to get its dimensions
    image.onload = function() {
        // Get image dimensions in pixels
        const pixelWidth = image.width;
        const pixelHeight = image.height;

        // Convert pixels to meters using the pixelsPerCell ratio
        const widthInMeters = pixelWidth / pixelsPerCell;
        const heightInMeters = pixelHeight / pixelsPerCell;

        // Create a texture from the image
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imagePath, function(texture) {
            // Create a material with the loaded texture
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide, // Render both sides of the plane
                transparent: true, 
                opacity: opacity,
            });

            // Create a plane geometry with the converted dimensions
            const geometry = new THREE.PlaneGeometry(widthInMeters, heightInMeters);
            // Flip the plane along the Y-axis
            geometry.scale(1, -1, 1);
            const plane = new THREE.Mesh(geometry, material);

            // Set position and rotation
            plane.position.set(position.x, position.y, position.z);
            plane.rotation.set(rotation.x, rotation.y, rotation.z); // Rotation in radians

            // Add the plane to the scene
            scene.add(plane);
            // invisible by default
            plane.visible = false;
            // Call the onLoadCallback and pass the created plane
            if (onLoadCallback) {
                onLoadCallback(plane);
            }
        });
    };

    image.onerror = function() {
        console.error('An error occurred while loading the image.');
    };
}

function addPlane(position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, image_shape = {w: 0, h: 0}, pixelsPerCell = 1000, color = 0x000000, opacity = 0.2) {
    // Get image dimensions in pixels
    const pixelWidth = image_shape.w;
    const pixelHeight = image_shape.h;

    // Convert pixels to cells using the pixelsPerCell ratio
    const widthInCells = pixelWidth / pixelsPerCell;
    const heightInCells = pixelHeight / pixelsPerCell;

    // Create a plane geometry with the converted dimensions
    const geometry = new THREE.PlaneGeometry(widthInCells, heightInCells);
    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide });
        
    const plane = new THREE.Mesh(geometry, material);

    // Set position and rotation
    plane.position.set(position.x, position.y, position.z);
    plane.rotation.set(rotation.x, rotation.y, rotation.z); // Rotation in radians

    // // Add the plane to the scene
    // scene.add(plane);
    return plane;
}

function addCameraModel(cam_id, position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, color = "rgb(255, 0, 0)") {
    let cameraModel;
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
        loader.load("assets/camera.glb", function(gltf) {
            // Access the camera model
            cameraModel = gltf.scene;
            const scale = 0.2;
            cameraModel.scale.set(scale, scale, scale);

            // Set the position of the camera model
            cameraModel.position.set(position.x, position.y, position.z);

            // Set the rotation of the camera model (in radians)
            cameraModel.rotation.set(rotation.x, rotation.y, rotation.z);

            // Traverse the model to change its material color
            cameraModel.traverse((node) => {
                node.material = new THREE.MeshStandardMaterial({ color: color });
                if (node.isMesh) {
                    node.material.transparent = true;
                    node.material.opacity = 0.2; 

                    // Create a wireframe material
                    const wireframeMaterial = new THREE.MeshBasicMaterial({
                        color: color,
                        wireframe: true
                    });

                    // Create a wireframe geometry
                    const wireframeGeometry = new THREE.WireframeGeometry(node.geometry);
                    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

                    // Add the wireframe to the scene
                    node.add(wireframe);
                }
            });
            resolve(cameraModel);
        }, undefined, function(error) {
            console.error('An error happened while loading the model:', error);
        });
    });
}

function CameraDevice(
    intrinsics,
    extrinsics,  
    points3d, 
    image_dim, 
    color, 
    scale = { trans_scale: 1, points_scale: 1 },
    camera_model,
    axes_helper,
    cam_id, 
    cam_label = "Camera"
) {
    this.image_dim = image_dim;
    this.cam_params = {intrinsics, extrinsics};  
    this.points3d_local = points3d; 
    this.color = color;
    this.scale = scale;
    this.camera_model = camera_model;
    this.axes_helper = axes_helper;
    this.cam_id = cam_id;
    this.cam_label = cam_label;
    this.points3d_world_elem = [];
    this.proj_lines_elem = [];
    this.hand_edges_elem = [];
    this.camera_model_label = addTextLabel(extrinsics.trans.x, extrinsics.trans.y, extrinsics.trans.z, "camera-"+cam_id, color);

    this.points3d_world = this.points3d_local.map(point => {
        const localPoint = new THREE.Vector3(point[0], point[1], point[2]).multiplyScalar(scale.points_scale);
        return localPoint.applyEuler(extrinsics.rot).add(extrinsics.trans); // Transform to world coordinates
    });
    
    this.points3d_world.forEach(point => {
        let pt = addPoint(point.x, point.y, point.z, color, 0.005);
        this.points3d_world_elem.push(pt);
        let line = addLine(extrinsics.trans, point, color, 0.3);
        this.proj_lines_elem.push(line);
    });

    // Visualize the edges between joints
    HAND_EDGES.forEach(edge => {
        const start = this.points3d_world[edge[0]];
        const end = this.points3d_world[edge[1]];
        let line = addLine(
            { x: start.x, y: start.y, z: start.z },
            { x: end.x, y: end.y, z: end.z },
            color
        );
        this.hand_edges_elem.push(line);
    });

    this.scale.focal_scale = 0.001;
    // Calculate focal length in the correct scale
    const focal_length = intrinsics.fx * this.scale.focal_scale;
    // Position the image plane directly in front of the camera
    this.planePosition = new THREE.Vector3(0, 0, focal_length); // Place on the negative Z-axis (camera looks along -Z by default)
    // Rotate the plane position according to the camera's rotation and Translate the plane position to be in front of the camera
    this.planePosition.applyEuler(extrinsics.rot).add(extrinsics.trans);
    // Add the image plane
    this.image_plane = addPlane(
                        { x: this.planePosition.x, y: this.planePosition.y, z: this.planePosition.z }, 
                        { x: extrinsics.rot.x, y: extrinsics.rot.y, z: extrinsics.rot.z },
                        { w: image_dim.width, h: image_dim.height },
                        1000,
                        color,
                        0.2
                    );

    const image_dir = FILE_PATH.split('.')[0];
    // Add the image itself
    addImageAsPlane(
        image_dir+"/cam"+cam_id+".png",
        { x: this.planePosition.x, y: this.planePosition.y, z: this.planePosition.z }, 
        { x: extrinsics.rot.x, y: extrinsics.rot.y, z: extrinsics.rot.z },
        1000,
        0.5,
        function(plane) {
            // This callback is called once the plane has been created
            this.image = plane;
        }.bind(this)
    );
}

function processEachCamera(cam){
    const { cam_id, cam_label, intrinsics, extrinsics, color, image, points, trans_scale, points_scale } = cam;
                    
    // Convert extrinsics matrix from 4x4 to 3x4 matrix
    const ext_matrix = new THREE.Matrix4();
    ext_matrix.set(
        extrinsics[0][0], extrinsics[0][1], extrinsics[0][2], extrinsics[0][3],
        extrinsics[1][0], extrinsics[1][1], extrinsics[1][2], extrinsics[1][3],
        extrinsics[2][0], extrinsics[2][1], extrinsics[2][2], extrinsics[2][3],
        extrinsics[3][0], extrinsics[3][1], extrinsics[3][2], extrinsics[3][3]
    );

    // Create a new Euler object
    const rotation = new THREE.Euler();
    rotation.setFromRotationMatrix(ext_matrix, 'XYZ');

    const translation = {
        "x": extrinsics[0][3] * trans_scale,
        "y": extrinsics[1][3] * trans_scale,
        "z": extrinsics[2][3] * trans_scale
    };
    
    const intr = {
        "fx": intrinsics[0],
        "fy": intrinsics[1],
        "cx": intrinsics[2],
        "cy": intrinsics[3]
    }

    const extr = {
        "matrix": ext_matrix,
        "rot": rotation,
        "trans": translation
    }

    return addCameraModel(cam_id, translation, rotation, color).then(cameraModel => {
        // Add axes helper to visualize the local axes of the camera
        let axesHelper = new THREE.AxesHelper(1.0); // Size of the axes helper
        axesHelper.position.set(translation.x, translation.y, translation.z);
        axesHelper.rotation.set(rotation.x, rotation.y, rotation.z);

        camera_devices.push(new CameraDevice(intr, extr, points, image, color, {trans_scale, points_scale}, cameraModel, axesHelper, cam_id, cam_label));
    })
    .catch(error => {
        console.error("Failed to load the camera model:", error);
    });
}

function loadDataFromJsonFile(filepath) {
    return new Promise((resolve, reject) => {
        fetch(filepath)
            .then(response => response.json())
            .then(data => {
                const cameraPromises = data.cameras.map(cam => {
                    return processEachCamera(cam);
                });

                // Wait for all promises to resolve
                Promise.all(cameraPromises)
                    .then(() => {
                        // console.log(cameras);
                        resolve(camera_devices);
                    })
                    .catch(error => {
                        console.error('Error resolving camera promises:', error);
                        reject(error);
                    });
            })
            .catch(error => {
                console.error('Error loading JSON file:', error);
                reject(error);
            });
    });
}

function loadDataFromJsonData(jsonData) {
    return new Promise((resolve, reject) => {
        try {
            const cameraPromises = jsonData.cameras.map(cam => {
                return processEachCamera(cam); // Assuming processEachCamera handles each camera
            });

            // Wait for all promises to resolve
            Promise.all(cameraPromises)
                .then(() => {
                    // console.log(cameras);
                    resolve(camera_devices); // Assuming camera_devices is defined globally or elsewhere
                })
                .catch(error => {
                    console.error('Error resolving camera promises:', error);
                    reject(error);
                });
        } catch (error) {
            console.error('Error processing JSON data:', error);
            reject(error);
        }
    });
}


function updateCameraPosition(cam) {
    cam.cam_params.extrinsics.trans = {
        "x": parseFloat(document.getElementById(`pos-${cam.cam_id}-x`).value),
        "y": parseFloat(document.getElementById(`pos-${cam.cam_id}-y`).value),
        "z": parseFloat(document.getElementById(`pos-${cam.cam_id}-z`).value)
    };

    cam.cam_params.extrinsics.rot = new THREE.Euler(
        THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-x`).value)),
        THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-y`).value)),
        THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-z`).value))
    );
    
    if (cam) {
        let trans = cam.cam_params.extrinsics.trans;
        let rot = cam.cam_params.extrinsics.rot;

        cam.camera_model.position.set(trans.x, trans.y, trans.z);
        cam.axes_helper.position.set(trans.x, trans.y, trans.z);
        cam.camera_model.rotation.set(rot.x, rot.y, rot.z);
        cam.axes_helper.rotation.set(rot.x, rot.y, rot.z);

        cam.camera_model_label.position.set(trans.x, trans.y, trans.z);
        cam.camera_model_label.rotation.set(rot.x, rot.y, rot.z);

        cam.proj_lines_elem.forEach(function(line) {
            line.geometry.attributes.position.array[0] = trans.x;
            line.geometry.attributes.position.array[1] = trans.y;
            line.geometry.attributes.position.array[2] = trans.z;
            
            // Notify Three.js of the geometry change
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Calculate focal length in the correct scale
        let focal_length = cam.cam_params.intrinsics.fx * cam.scale.focal_scale;
        // Position the image plane directly in front of the camera
        const planePosition = new THREE.Vector3(0, 0, focal_length).applyEuler(rot).add(trans); 

        cam.image_plane.position.set(planePosition.x, planePosition.y, planePosition.z);
        cam.image_plane.rotation.set(rot.x, rot.y, rot.z);

        cam.image.position.set(planePosition.x, planePosition.y, planePosition.z);
        cam.image.rotation.set(rot.x, rot.y, rot.z);

    } else {
        console.error(`Camera not found.`);
    }
}

function createCameraControlsUI(cam){
    let trans = cam.cam_params.extrinsics.trans;
    let rot = cam.cam_params.extrinsics.rot;
    // Create an accordion item for the camera
    const cameraItem = document.createElement('div');
    cameraItem.className = 'accordion-item';
    cameraItem.innerHTML = `
        <h2 class="accordion-header">
            <button class="accordion-button ${cam.cam_id == 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${cam.cam_id}" aria-expanded="${cam.cam_id == 0 ? 'true' : 'false'}" aria-controls="collapse-${cam.cam_id}">
                Camera-${cam.cam_id}
                <span style="margin-left: 10px; background-color: ${cam.color}; opacity:0.5; width: 40px; height: 20px;"></span>
            </button>
        </h2>
        <div id="collapse-${cam.cam_id}" class="accordion-collapse collapse ${cam.cam_id == 0 ? 'show' : ''}">
            <div class="accordion-body">
                <div class="input-group input-group-sm mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-sm">PX</span>
                    <input id="pos-${cam.cam_id}-x" type="number" class="form-control" value="${trans.x}" step="0.01">
                    <span class="input-group-text" id="inputGroup-sizing-sm">PY</span>
                    <input id="pos-${cam.cam_id}-y" type="number" class="form-control" value="${trans.y}" step="0.01">
                    <span class="input-group-text" id="inputGroup-sizing-sm">PZ</span>
                    <input id="pos-${cam.cam_id}-z" type="number" class="form-control" value="${trans.z}" step="0.01">
                </div>
                <div class="input-group input-group-sm mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-sm">RX</span>
                    <input id="rot-${cam.cam_id}-x" type="number" class="form-control" value="${THREE.MathUtils.radToDeg(rot.x)}">
                    <span class="input-group-text" id="inputGroup-sizing-sm">RY</span>
                    <input id="rot-${cam.cam_id}-y" type="number" class="form-control" value="${THREE.MathUtils.radToDeg(rot.y)}">
                    <span class="input-group-text" id="inputGroup-sizing-sm">RZ</span>
                    <input id="rot-${cam.cam_id}-z" type="number" class="form-control" value="${THREE.MathUtils.radToDeg(rot.z)}">
                </div>
                <div class="cam-checkboxes-div">
                    <input type="checkbox" id="show-img-cb-${cam.cam_id}" class="cam-checkbox cam-checkbox-img">
                    <label for="show-img-cb-${cam.cam_id}">Image</label>
                    <input type="checkbox" id="show-plane-cb-${cam.cam_id}" class="cam-checkbox cam-checkbox-plane">
                    <label for="show-plane-cb-${cam.cam_id}">Plane</label>
                    <input type="checkbox" id="show-lines-cb-${cam.cam_id}" class="cam-checkbox cam-checkbox-lines">
                    <label for="show-lines-cb-${cam.cam_id}">Projection</label>
                    <input type="checkbox" id="show-axes-cb-${cam.cam_id}" class="cam-checkbox  cam-checkbox-axes">
                    <label for="show-axes-cb-${cam.cam_id}">Axes</label>
                </div>
            </div>
        </div>
    `;

    // Append the camera item to the accordion container
    cameraControlsContainer.appendChild(cameraItem);

    // Add event listeners to update the camera position in Three.js
    document.getElementById(`pos-${cam.cam_id}-x`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`pos-${cam.cam_id}-y`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`pos-${cam.cam_id}-z`).addEventListener('input', (e) => updateCameraPosition(cam));

    // Add event listeners to update the camera rotation in Three.js
    document.getElementById(`rot-${cam.cam_id}-x`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`rot-${cam.cam_id}-y`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`rot-${cam.cam_id}-z`).addEventListener('input', (e) => updateCameraPosition(cam));

    document.getElementById(`show-img-cb-${cam.cam_id}`).addEventListener('change', event => cam.image.visible = event.target.checked);
    document.getElementById(`show-plane-cb-${cam.cam_id}`).addEventListener('change', event => cam.image_plane.visible = event.target.checked);
    document.getElementById(`show-lines-cb-${cam.cam_id}`).addEventListener('change', event => cam.proj_lines_elem.forEach(line => line.visible = event.target.checked));
    document.getElementById(`show-axes-cb-${cam.cam_id}`).addEventListener('change', event => cam.axes_helper.visible = event.target.checked);
}

function clearCameraControlsContainer() {
    while (cameraControlsContainer.firstChild) {
        cameraControlsContainer.removeChild(cameraControlsContainer.firstChild);
    }
}

function clearSceneObjects() {
    sceneObjects.forEach(obj => {
        scene.remove(obj); // Remove object from the scene
    });
    sceneObjects.length = 0; // Clear the array
}

function resetCheckboxes() {
    document.getElementById('toggle-axes-helper').checked = false;
    document.getElementById('toggle-proj-lines').checked = false;
    document.getElementById('toggle-img-planes').checked = false;
    document.getElementById('toggle-imgs').checked = false;
}

window.addEventListener('resize', () => {
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    renderer.autoClear = false;
    helper.render( renderer );
}

let scene = setupScene(); 
let camera = setupCamera();
let renderer = setupRenderer();
let controls = setupControls();
let camera_devices = [];  // for storing camera informations
const sceneObjects = []; // Array to keep track of scene objects
addHelpers(scene);
addLights(scene);

const helper = new ViewHelper( camera, document.getElementById("gizmo") );
helper.scale.set(-1, -1, 1);

const HAND_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20]];

// document.body.appendChild(renderer.domElement);
scene_window.appendChild(renderer.domElement);

const cameraControlsContainer = document.getElementById('camera-controls');

// const FILE_PATH = "mvhand.json";
// const FILE_PATH = "dexycb.json";
// const FILE_PATH = "ho3d.json";
// Retrieve the file path from localStorage
const FILE_PATH = localStorage.getItem('FILE_PATH') || 'mvhand.json';  // Default to "dexycb.json" if no input

loadDataFromJsonFile(FILE_PATH)
    .then(cameras => {
        cameras.forEach(cam => {
            // console.log(cam)
            // camera model
            scene.add(cam.camera_model);
            sceneObjects.push(cam.camera_model);
            // camera label
            scene.add(cam.camera_model_label);
            sceneObjects.push(cam.camera_model_label);
            // cameras axes helper
            scene.add(cam.axes_helper);            
            cam.axes_helper.visible = false; // invisible by default
            sceneObjects.push(cam.axes_helper);
            // hand points
            cam.points3d_world_elem.forEach(pt => {
                scene.add(pt);
                sceneObjects.push(pt); // Keep track of each point
            });
            // hand edges
            cam.hand_edges_elem.forEach(edge => {
                scene.add(edge);
                sceneObjects.push(edge); // Keep track of each edge
            });
            // projection lines from points to camera
            cam.proj_lines_elem.forEach(proj_line => {
                scene.add(proj_line);
                proj_line.visible = false; // invisible by default
                sceneObjects.push(proj_line); // Keep track of each projection line
            });;
            // empty image plane
            scene.add(cam.image_plane);
            cam.image_plane.visible = false; // invisible by default
            sceneObjects.push(cam.image_plane);

            createCameraControlsUI(cam);
        });
        
    })
    .catch(error => {
        console.error('Error:', error);
    });


document.getElementById(`x-axis`).addEventListener('click', (e) => {
    camera.position.set(-2.5, 0, 0);
});
document.getElementById(`y-axis`).addEventListener('click', (e) => {
    camera.position.set(0, -2.5, 0);
});
document.getElementById(`z-axis`).addEventListener('click', (e) => {
    camera.position.set(0, 0, 2.5);
});

document.getElementById('toggle-axes-helper').addEventListener('change', function(event) {
    const isChecked = event.target.checked;
    camera_devices.forEach(cam => {
        // Toggle visibility
        cam.axes_helper.visible = isChecked;
    });
    document.querySelectorAll('.cam-checkbox-axes').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

document.getElementById('toggle-proj-lines').addEventListener('change', function(event) {
    const isChecked = event.target.checked;
    camera_devices.forEach(cam => {
        // Toggle visibility
        cam.proj_lines_elem.forEach(line => {
            line.visible = isChecked;
        });
    });
    document.querySelectorAll('.cam-checkbox-lines').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

document.getElementById('toggle-img-planes').addEventListener('change', function(event) {
    const isChecked = event.target.checked;
    camera_devices.forEach(cam => {
        // Toggle visibility
        cam.image_plane.visible = isChecked;
    });
    document.querySelectorAll('.cam-checkbox-plane').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

document.getElementById('toggle-imgs').addEventListener('change', function(event) {
    const isChecked = event.target.checked;
    camera_devices.forEach(cam => {
        // Toggle visibility
        cam.image.visible = isChecked;
    });
    document.querySelectorAll('.cam-checkbox-img').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

// Add event listener for the button click to load the JSON file
document.getElementById('loadJsonButton').addEventListener('click', function() {
    // Get the file name from the input field
    const filePath = document.getElementById('jsonFileInput').value;

    if (filePath) {
        // Save the file path to local storage
        localStorage.setItem('FILE_PATH', filePath);
        // Clear the scene before loading new file content
        clearSceneObjects();
        clearCameraControlsContainer();
        resetCheckboxes();
        camera_devices = [];
        location.reload();
    } else {
        alert('Please enter or select a valid file name!');
    }
});

animate();