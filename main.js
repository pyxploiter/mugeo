import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const ww = window.innerWidth;
const wh = window.innerHeight;

function setupScene(){
    // Basic Three.js setup
    let scene = new THREE.Scene();
    scene.background = new THREE.Color('#eee');

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
    // let camera = new THREE.OrthographicCamera( ww / - 2, ww / 2, wh / 2, wh / - 2, 1, 1000 );
    // Set camera position
    camera.position.set(1, 1, 2);
    camera.lookAt(0, 0, 0);
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
    let gridHelper = new THREE.GridHelper(10, 100);
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);

    // // Adding origin axes
    let axesHelper = new THREE.AxesHelper(5);
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
    scene.add(point);
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
    scene.add(line);
}

// Function to add a text label at a 3D position
function addTextLabel(x, y, z, text, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '16px Arial';
    context.fillStyle = color;
    context.fillText(text, 0, 24);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.scale.set(0.5, 0.25, 1); // Adjust based on your scene scale
    sprite.position.set(x, y, z);

    scene.add(sprite);
}

// Function to add a 2D image as a plane in 3D space with pixel-to-cell conversion
function addImageAsPlane(imagePath, position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, pixelsPerCell = 100, opacity = 0.5) {
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
        });
    };

    image.onerror = function() {
        console.error('An error occurred while loading the image.');
    };
}

function addImagePlan(position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, image_shape = {w: 0, h: 0}, pixelsPerCell = 1000, color = 0x000000) {
    // Get image dimensions in pixels
    const pixelWidth = image_shape.w;
    const pixelHeight = image_shape.h;

    // Convert pixels to cells using the pixelsPerCell ratio
    const widthInCells = pixelWidth / pixelsPerCell;
    const heightInCells = pixelHeight / pixelsPerCell;

    // Create a plane geometry with the converted dimensions
    const geometry = new THREE.PlaneGeometry(widthInCells, heightInCells);
    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        
    const plane = new THREE.Mesh(geometry, material);

    // Set position and rotation
    plane.position.set(position.x, position.y, position.z);
    plane.rotation.set(rotation.x, rotation.y, rotation.z); // Rotation in radians

    // Add the plane to the scene
    scene.add(plane);
}

function addCameraModel(position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, color = "rgb(255, 0, 0)") {
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function CameraDevice(
    intrinsics,
    extrinsics,  
    points3d, 
    image_dim, 
    color, 
    scale = { trans: 1, points: 1 },
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

    this.points3d_world = this.points3d_local.map(point => {
        const localPoint = new THREE.Vector3(point[0], point[1], point[2]).multiplyScalar(scale.points);
        return localPoint.applyEuler(extrinsics.rot).add(extrinsics.trans); // Transform to world coordinates
    });
    
    this.points3d_world.forEach(point => {
        // addPoint(point.x, point.y, point.z, color, 0.005);
        // addLine(extrinsics.trans, point, color, 0.3);
    });
}

function loadDataFromJson(filepath) {
    return new Promise((resolve, reject) => {
        fetch(filepath)
            .then(response => response.json())
            .then(data => {
                const cameraPromises = data.cameras.map(cam => {
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

                    return addCameraModel(translation, rotation, color).then(cameraModel => {
                        // let cam_center_local = new THREE.Vector4(0, 0, 0, 1.0);
                        // const cam_center = cam_center_local.applyMatrix4(ext_matrix).multiplyScalar(trans_scale);
                        // let axesHelper = new THREE.AxesHelper(0.5); // Size of the axes helper
                        // axesHelper.position.set(cam_center.x, cam_center.y, cam_center.z);

                        // Add axes helper to visualize the local axes of the camera
                        let axesHelper = new THREE.AxesHelper(1.0); // Size of the axes helper
                        axesHelper.position.set(translation.x, translation.y, translation.z);
                        axesHelper.rotation.set(rotation.x, rotation.y, rotation.z);

                        camera_devices.push(new CameraDevice(intr, extr, points, image, color, {trans_scale, points_scale}, cameraModel, axesHelper, cam_id, cam_label));
                    })
                    .catch(error => {
                        console.error("Failed to load the camera model:", error);
                    });
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

function projectPoint(point3D, intrinsics, extrinsics) {
    // Convert the 3D point to homogeneous coordinates (4D)
    const point3DHomogeneous = new THREE.Vector4(point3D.x, point3D.y, point3D.z, 1.0);
    
    // Apply the extrinsics matrix to transform the point to camera coordinates
    const cameraCoords = point3DHomogeneous.applyMatrix4(extrinsics);

    // Apply the intrinsic matrix to project the point onto the 2D image plane
    const fx = intrinsics[0];
    const fy = intrinsics[1];
    const cx = intrinsics[2];
    const cy = intrinsics[3];

    const x2D = (cameraCoords.x / cameraCoords.z) * fx + cx;
    const y2D = (cameraCoords.y / cameraCoords.z) * fy + cy;

    return { x: x2D, y: y2D };
}

function updateCameraPosition(cam) {
    cam.cam_params.extrinsics.trans = {
        "x": parseFloat(document.getElementById(`pos-${cam.cam_id}-x`).value),
        "y": parseFloat(document.getElementById(`pos-${cam.cam_id}-y`).value),
        "z": parseFloat(document.getElementById(`pos-${cam.cam_id}-z`).value)
    };

    cam.cam_params.extrinsics.rot = {
        "x": THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-x`).value)),
        "y": THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-y`).value)),
        "z": THREE.MathUtils.degToRad(parseFloat(document.getElementById(`rot-${cam.cam_id}-z`).value))
    }
    
    if (cam) {
        let trans = cam.cam_params.extrinsics.trans;
        let rot = cam.cam_params.extrinsics.rot;

        cam.camera_model.position.set(trans.x, trans.y, trans.z);
        cam.axes_helper.position.set(trans.x, trans.y, trans.z);
        cam.camera_model.rotation.set(rot.x, rot.y, rot.z);
        cam.axes_helper.rotation.set(rot.x, rot.y, rot.z);
    } else {
        console.error(`Camera not found.`);
    }
}

function updateJointPosition(x, y, z){

}

function createCameraControlsUI(cam){
    let trans = cam.cam_params.extrinsics.trans;
    let rot = cam.cam_params.extrinsics.rot;
    // Create UI for camera controls
    const cameraGroup = document.createElement('div');
    cameraGroup.className = 'control-group';
    cameraGroup.innerHTML = `<p>Camera ${cam.cam_id}</p>
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
        </div>`;

    cameraControlsContainer.appendChild(cameraGroup);

    // Add event listeners to update the camera position in Three.js
    document.getElementById(`pos-${cam.cam_id}-x`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`pos-${cam.cam_id}-y`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`pos-${cam.cam_id}-z`).addEventListener('input', (e) => updateCameraPosition(cam));

    // Add event listeners to update the camera rotation in Three.js
    document.getElementById(`rot-${cam.cam_id}-x`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`rot-${cam.cam_id}-y`).addEventListener('input', (e) => updateCameraPosition(cam));
    document.getElementById(`rot-${cam.cam_id}-z`).addEventListener('input', (e) => updateCameraPosition(cam));
}

function createJointsUI(points, cam_id){
    // Create UI for joint controls
    points.forEach((point, pointIndex) => {
        const jointGroup = document.createElement('div');
        jointGroup.className = 'control-group';
        jointGroup.innerHTML = `<p>Joint ${pointIndex + 1} - Cam ${cam_id}</p>
            <div class="input-group input-group-sm mb-3">
                <span class="input-group-text" id="inputGroup-sizing-sm">X</span>
                <input id="joint-${cam_id}-${pointIndex}-x" type="number" class="form-control" value="${point.x}" step="0.01">
                <span class="input-group-text" id="inputGroup-sizing-sm">Y</span>
                <input id="joint-${cam_id}-${pointIndex}-y" type="number" class="form-control" value="${point.y}" step="0.01">
                <span class="input-group-text" id="inputGroup-sizing-sm">Z</span>
                <input id="joint-${cam_id}-${pointIndex}-z" type="number" class="form-control" value="${point.z}" step="0.01">
            </div>`;

        jointControlsContainer.appendChild(jointGroup);

        // Add event listeners to update the joint position in Three.js
        document.getElementById(`joint-${cam_id}-${pointIndex}-x`).addEventListener('input', (e) => updateJointPosition(cam_id, pointIndex, e, 'x'));
        document.getElementById(`joint-${cam_id}-${pointIndex}-y`).addEventListener('input', (e) => updateJointPosition(cam_id, pointIndex, e, 'y'));
        document.getElementById(`joint-${cam_id}-${pointIndex}-z`).addEventListener('input', (e) => updateJointPosition(cam_id, pointIndex, e, 'z'));
    });
}

function getUnitScale(){
    let unit_scale = parseFloat(document.getElementById("unit_scale").value);
    // add an event listener to update `unit_scale` when the value changes
    document.getElementById("unit_scale").addEventListener('input', function() {
        unit_scale = parseFloat(this.value);
        console.log('Unit scale updated to:', unit_scale);
    });
    return unit_scale;
}

window.addEventListener('resize', () => {
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
});

let scene = setupScene(); 
let camera = setupCamera();
let renderer = setupRenderer();
let controls = setupControls();
let camera_devices = [];  // for storing camera informations
addHelpers(scene);
addLights(scene);

document.body.appendChild(renderer.domElement);

const cameraControlsContainer = document.getElementById('camera-controls');
const jointControlsContainer = document.getElementById('joint-controls');

loadDataFromJson('data.json')
    .then(cameras => {
        cameras.forEach(cam => {
            console.log("camera:", cam);
            // console.log(cam.camera_model);
            scene.add(cam.camera_model);
            scene.add(cam.axes_helper);

            createCameraControlsUI(cam);
        });
        
    })
    .catch(error => {
        console.error('Error:', error);
    });


// console.log(cameras);
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Process cameras
        data.cameras.forEach(cam => {
            const { cam_id, intrinsics, extrinsics, color, image, points } = cam;
            
            // Convert extrinsics matrix from 4x4 to 3x4 matrix
            const matrix = new THREE.Matrix4();
            matrix.set(
                extrinsics[0][0], extrinsics[0][1], extrinsics[0][2], extrinsics[0][3],
                extrinsics[1][0], extrinsics[1][1], extrinsics[1][2], extrinsics[1][3],
                extrinsics[2][0], extrinsics[2][1], extrinsics[2][2], extrinsics[2][3],
                extrinsics[3][0], extrinsics[3][1], extrinsics[3][2], extrinsics[3][3]
            );

            // Create a new Euler object
            const euler = new THREE.Euler();

            // The order parameter defines the order of rotations, e.g., 'XYZ', 'YXZ', etc.
            euler.setFromRotationMatrix(matrix, 'XYZ');

            // createCameraControlsUI(cam, euler);
            const extr_unit_scale = getUnitScale();

            const cam_center_local = new THREE.Vector4(0, 0, 0, 1.0);
            const cam_center = cam_center_local.applyMatrix4(matrix).multiplyScalar(extr_unit_scale);

            // console.log(cam_center, extrinsics[0][3]*extr_unit_scale, extrinsics[1][3]*extr_unit_scale, extrinsics[2][3]*extr_unit_scale );

            // let cameraModel = addCameraModel(
            //     { x: cam_center.x, y: cam_center.y, z: cam_center.z}, 
            //     { x: euler.x, y: euler.y, z: euler.z },  // only  for rotating the camera object (not it's axis)
            //     color
            // );

            // console.log(cameraModel);

            // // Add axes helper to visualize the local axes of the camera
            // const axesHelper = new THREE.AxesHelper(0.5); // Size of the axes helper
            // axesHelper.position.set(cam_center.x, cam_center.y, cam_center.z);
            // // axesHelper.setRotationFromEuler(euler);
            // axesHelper.rotation.set(euler.x, euler.y, euler.z);
            // scene.add(axesHelper);

            const intr_unit_scale = 0.001;
            // Calculate focal length in the correct scale
            const focal_length = intrinsics[0] * intr_unit_scale;
            // Position the image plane directly in front of the camera
            const planePosition = new THREE.Vector3(0, 0, focal_length); // Place on the negative Z-axis (camera looks along -Z by default)
            // Rotate the plane position according to the camera's rotation and Translate the plane position to be in front of the camera
            planePosition.applyEuler(euler).add(cam_center);

            // // Add the image plane
            // addImagePlan(
            //     { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
            //     { x: euler.x, y: euler.y, z: euler.z },
            //     { w: image.width, h: image.height },
            //     1000,
            //     color
            // );
            
            // if (cam_id === "0"){
            //     addImageAsPlane(
            //         "images/00001_"+cam_id+".jpg",
            //         { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
            //         { x: euler.x, y: euler.y, z: euler.z },
            //         1000,
            //         0.6
            //     );
            // }

            let points3d = points.map(point => {
                const localPoint = new THREE.Vector3(point[0], point[1], point[2]).multiplyScalar(intr_unit_scale);
                // Flip the y-axis
                // localPoint.y *= -1;

                return localPoint.applyEuler(euler).add(cam_center); // Transform to world coordinates
                // return localPoint;  // Return camera coordinates
            });

            // createJointsUI(points3d, cam_id);
            
            // points3d.forEach(point => {
            //     addPoint(point.x, point.y, point.z, color, 0.005);
            //     addLine(cam_center, point, color, 0.3);
            // });

            // // Project 3D points to 2D image coordinates
            // let points2d = points3d.map(point => projectPoint(point, intrinsics, matrix));
            
            // Visualize the edges between joints
            const HAND_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20]];

            HAND_EDGES.forEach(edge => {
                const start = points3d[edge[0]];
                const end = points3d[edge[1]];
                // addLine(
                //     { x: start.x, y: start.y, z: start.z },
                //     { x: end.x, y: end.y, z: end.z },
                //     color
                // );
            });
        });
    })
    .catch(error => console.error('Error loading JSON file:', error));

document.getElementById(`x-axis`).addEventListener('click', (e) => {
    camera.position.set(0, 0, 1.5);
});
document.getElementById(`y-axis`).addEventListener('click', (e) => {
    camera.position.set(0, 1.5, 0);
});
document.getElementById(`z-axis`).addEventListener('click', (e) => {
    camera.position.set(1.5, 0, 0);
});

animate();