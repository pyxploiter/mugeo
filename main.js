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
    const loader = new GLTFLoader();

    loader.load("assets/camera.glb", function(gltf) {
        // Access the camera model
        const cameraModel = gltf.scene;
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

        // Add the camera model to the scene
        scene.add(cameraModel);
    }, undefined, function(error) {
        console.error('An error happened while loading the model:', error);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
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

function updateCameraPosition(x, y, z){

}

function createCameraControlsUI(cam){
    const { cam_id, intrinsics, extrinsics, color, image, points } = cam;
    // Create UI for camera controls
    const cameraGroup = document.createElement('div');
    cameraGroup.className = 'control-group';
    cameraGroup.innerHTML = `<p>Camera ${cam_id}</p>
        <div class="input-group input-group-sm mb-3">
            <span class="input-group-text" id="inputGroup-sizing-sm">X</span>
            <input id="cam-${cam_id}-x" type="number" class="form-control" value="${extrinsics[0][3]}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Y</span>
            <input id="cam-${cam_id}-y" type="number" class="form-control" value="${extrinsics[0][3]}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Z</span>
            <input id="cam-${cam_id}-z" type="number" class="form-control" value="${extrinsics[0][3]}">
        </div>`;

    cameraControlsContainer.appendChild(cameraGroup);

    // Add event listeners to update the camera position in Three.js
    document.getElementById(`cam-${cam_id}-x`).addEventListener('input', (e) => updateCameraPosition(cam_id, e, 'x'));
    document.getElementById(`cam-${cam_id}-y`).addEventListener('input', (e) => updateCameraPosition(cam_id, e, 'y'));
    document.getElementById(`cam-${cam_id}-z`).addEventListener('input', (e) => updateCameraPosition(cam_id, e, 'z'));
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
addHelpers(scene);
addLights(scene);

document.body.appendChild(renderer.domElement);

const cameraControlsContainer = document.getElementById('camera-controls');
const jointControlsContainer = document.getElementById('joint-controls');

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Process cameras
        data.cameras.forEach(cam => {
            const { cam_id, intrinsics, extrinsics, color, image, points } = cam;
            
            createCameraControlsUI(cam);
            
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

            // Extract the angles in radians
            const rot_x = euler.x; // Rotation around X axis
            const rot_y = euler.y; // Rotation around Y axis
            const rot_z = euler.z; // Rotation around Z axis

            // Convert radians to degrees if needed
            const rot_x_deg = THREE.MathUtils.radToDeg(rot_x);
            const rot_y_deg = THREE.MathUtils.radToDeg(rot_y);
            const rot_z_deg = THREE.MathUtils.radToDeg(rot_z);
            // console.log(rot_x_deg, rot_z_deg, rot_y_deg);

            const unit_scale = getUnitScale();

            const cam_center_local = new THREE.Vector4(0, 0, 0, 1.0);
            const cam_center = cam_center_local.applyMatrix4(matrix).multiplyScalar(unit_scale);

            addCameraModel(
                { x: cam_center.x, y: cam_center.y, z: cam_center.z}, 
                { x: rot_x, y: rot_y, z: rot_z },  // only  for rotating the camera object (not it's axis)
                color
            );

            // Add axes helper to visualize the local axes of the camera
            const axesHelper = new THREE.AxesHelper(1); // Size of the axes helper
            axesHelper.position.set(cam_center.x, cam_center.y, cam_center.z);
            // axesHelper.setRotationFromEuler(euler);
            axesHelper.rotation.set(rot_x, rot_y, rot_z);
            scene.add(axesHelper);

            // Calculate focal length in the correct scale
            const focal_length = intrinsics[0] * unit_scale;
            // Position the image plane directly in front of the camera
            const planePosition = new THREE.Vector3(0, 0, focal_length); // Place on the negative Z-axis (camera looks along -Z by default)
            // Rotate the plane position according to the camera's rotation and Translate the plane position to be in front of the camera
            planePosition.applyEuler(euler).add(cam_center);

            // // Add the image plane
            // addImagePlan(
            //     { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
            //     { x: rot_x, y: rot_y, z: rot_z },
            //     { w: image.width, h: image.height },
            //     1000,
            //     color
            // );
            
            if (cam_id === "3"){
                addImageAsPlane(
                    "images/00001_"+cam_id+".jpg",
                    { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
                    { x: rot_x, y: rot_y, z: rot_z },
                    1000,
                    0.6
                );
            }

            let points3d = points.map(point => {
                const localPoint = new THREE.Vector3(point[0], point[1], point[2]).multiplyScalar(unit_scale);
                // Flip the y-axis
                // localPoint.y *= -1;

                return localPoint.applyEuler(euler).add(cam_center); // Transform to world coordinates
                // return localPoint;  // Return camera coordinates
            });
            
            points3d.forEach(point => {
                addPoint(point.x, point.y, point.z, color, 0.005);
                // addLine(cam_center, point, color, 0.5);
            });

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
                addLine(
                    { x: start.x, y: start.y, z: start.z },
                    { x: end.x, y: end.y, z: end.z },
                    color
                );
            });
        });
    })
    .catch(error => console.error('Error loading JSON file:', error));

animate();