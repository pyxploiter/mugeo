import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

function rotationMatrixToEulerZYX(R) {
    // const sy = Math.sqrt(R[0][0] * R[0][0] + R[1][0] * R[1][0]);
    const sy = Math.sqrt(R[0][0] * R[0][0] + R[1][0] * R[1][0]);
    const singular = sy < 1e-6;

    let x, y, z;

    if (!singular) {
        x = Math.atan2(R[2][1], R[2][2]);
        y = Math.atan2(-R[2][0], sy);
        z = Math.atan2(R[1][0], R[0][0]);
    } else {
        x = Math.atan2(-R[1][2], R[1][1]);
        y = Math.atan2(-R[2][0], sy);
        z = 0;
    }

    return [x, y, z]
}

// Basic Three.js setup
let scene = new THREE.Scene();
scene.background = new THREE.Color('#eee');

const ww = window.innerWidth;
const wh = window.innerHeight;

let camera = new THREE.PerspectiveCamera(75, ww/wh, 0.1, 1000);
// Set camera position
camera.position.set(1, 1, 2);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
});

renderer.setSize(ww, wh);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

// Camera controls
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
// controls.target = new THREE.Vector3(0, 0.75, 0);
controls.update()

// 100x100 grid 
let gridHelper = new THREE.GridHelper(10, 100);
gridHelper.position.set(0, 0, 0);
scene.add(gridHelper);

// // Adding origin axes
// let axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// Lights setup
scene.add(new THREE.AmbientLight(0xffffff, 1));
// const keylight = new THREE.DirectionalLight(0xffffff, 0.6);
// keylight.position.set(1, 1, 2);
// keylight.lookAt(0, 0, 0);
// scene.add(keylight);

// Function to add 3D points
function addPoint(x, y, z, color = 0xff0000, size = 0.05) {
    let geometry = new THREE.SphereGeometry(size, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let point = new THREE.Mesh(geometry, material);
    point.position.set(x, y, z);
    scene.add(point);
}

// Function to add lines between points
function addLine(point1, point2, color = 0x0000ff) {
    let material = new THREE.LineBasicMaterial({ color: color });
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
function addImageAsPlane(imagePath, position = {x: 0, y: 0, z: 0}, rotation = {x: 0, y: 0, z: 0}, pixelsPerCell = 100) {
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
                side: THREE.DoubleSide // Render both sides of the plane
            });

            // Create a plane geometry with the converted dimensions
            const geometry = new THREE.PlaneGeometry(widthInMeters, heightInMeters);
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

// Function to load points and lines from JSON file
function loadFromJSON(data) {
    const points = data.points;
    const lines = data.lines;

    // Add points
    points.forEach(p => {
        addPoint(p.x, p.y, p.z, p.color || 0xff0000, p.size || 0.05);
    });

    // Add lines
    lines.forEach(l => {
        addLine({x: l.start.x, y: l.start.y, z: l.start.z},
                {x: l.end.x, y: l.end.y, z: l.end.z},
                l.color || 0x0000ff);
    });
}

// // File input handling
// document.getElementById('fileInput').addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const data = JSON.parse(e.target.result);
//             loadFromJSON(data);
//         };
//         reader.readAsText(file);
//     }
// });

// document.getElementById('addCameraBtn').addEventListener('click', function() {
//     // Example: Add a camera at a random position
//     const randomX = Math.random() * 10 - 5;
//     const randomY = Math.random() * 10 - 5;
//     const randomZ = Math.random() * 10 - 5;
    
//     addCameraModel({x: randomX, y: randomY, z: randomZ});
// });

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
}

// Example points and line
// addPoint(0, 0, 0); // Point at origin
// addPoint(5, 0.5, 1); // Another point
// addPoint(2, 3, 2, 0x00ff00, 0.1)
// addLine({x: 0, y: 0, z: 0}, {x: 1, y: 0.5, z: 1}); // Line between the points
// addCameraModel({x: 2, y: 3, z: 2}, {x: 0, y: 0, z: 0});
// addImageAsPlane('assets/hand.jpg', {x: 0, y: 0, z: 2}, {x: 0, y: 0, z: 0}, 500);

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

            const worldMatrix = new THREE.Matrix4();
            worldMatrix.copy(matrix).invert();

            // Create a new Euler object
            const euler = new THREE.Euler();

            // The order parameter defines the order of rotations, e.g., 'XYZ', 'YXZ', etc.
            euler.setFromRotationMatrix(matrix, 'XYZ');

            // euler.x = euler.x;
            
            // Extract the angles in radians
            const rot_x = euler.x; // Rotation around X axis
            const rot_y = euler.y; // Rotation around Y axis
            const rot_z = euler.z; // Rotation around Z axis

            // Convert radians to degrees if needed
            const rot_x_deg = THREE.MathUtils.radToDeg(rot_x);
            const rot_y_deg = THREE.MathUtils.radToDeg(rot_y);
            const rot_z_deg = THREE.MathUtils.radToDeg(rot_z);
            // console.log(rot_x_deg, rot_z_deg, rot_y_deg);

            const unit_scale = 0.001; 
            const cameraPosition = new THREE.Vector3(extrinsics[0][3]*unit_scale, extrinsics[1][3]*unit_scale, extrinsics[2][3]*unit_scale);
            addCameraModel(
                { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z }, 
                { x: rot_x, y: rot_y, z: rot_z },  
                color
            );

            // Add axes helper to visualize the local axes of the camera
            const axesHelper = new THREE.AxesHelper(0.3); // Size of the axes helper
            axesHelper.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            axesHelper.setRotationFromEuler(euler);
            scene.add(axesHelper);

            // Calculate focal length in the correct scale
            const focal_length = intrinsics[0] * unit_scale;
            // Position the image plane directly in front of the camera
            const planePosition = new THREE.Vector3(0, 0, focal_length); // Place on the negative Z-axis (camera looks along -Z by default)
            // Rotate the plane position according to the camera's rotation
            planePosition.applyEuler(euler);
            // Translate the plane position to be in front of the camera
            planePosition.add(cameraPosition);

            // // Add the image plane
            // addImagePlan(
            //     { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
            //     { x: rot_x, y: rot_y, z: rot_z },
            //     { w: image.width, h: image.height },
            //     1000,
            //     color
            // );

            // addImageAsPlane(
            //     "images/00001_"+cam_id+".jpg",
            //     { x: planePosition.x, y: planePosition.y, z: planePosition.z }, 
            //     { x: rot_x, y: rot_y, z: rot_z },
            //     1000
            // );

            let points3d = points.map(point => {
                const localPoint = new THREE.Vector3(point[0], point[1], point[2]).multiplyScalar(unit_scale);
                return localPoint.applyEuler(euler).add(cameraPosition);; // Transform to world coordinates
            });
            
            points3d.forEach(point => {
                addPoint(point.x, point.y, point.z, color, 0.005);
            });

            // let points3d = points.map(subArray => subArray.map(value => value / 1000));
            // // Visualize the joints using the addPoint function
            // points3d.forEach(point => {
            //     addPoint(point[0], point[1], point[2], color, 0.005);
            // });

            // addTextLabel(points3d[0][0], points3d[0][1], points3d[0][2], 
            //     `(${points3d[0][0]/unit_scale}, ${points3d[0][1]/unit_scale}, ${points3d[0][2]/unit_scale})`,
            //     color);

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
                    { x: start[0], y: start[1], z: start[2] },
                    { x: end[0], y: end[1], z: end[2] },
                    color
                );
            });
            
        });

        // data.joints3d.forEach(j3d => {
        //     const unit_scale = 0.001;
        //     const { cam_id, color, points } = j3d;
        //     let points3d = points.map(subArray => subArray.map(value => value / 1000));
        //     // Visualize the joints using the addPoint function
        //     points3d.forEach(point => {
        //         addPoint(point[0], point[1], point[2], color, 0.005);
        //     });

        //     // addTextLabel(points3d[0][0], points3d[0][1], points3d[0][2], 
        //     //     `(${points3d[0][0]/unit_scale}, ${points3d[0][1]/unit_scale}, ${points3d[0][2]/unit_scale})`,
        //     //     color);

        //     // Visualize the edges between joints
        //     const HAND_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4],
        //     [0, 5], [5, 6], [6, 7], [7, 8],
        //     [0, 9], [9, 10], [10, 11], [11, 12],
        //     [0, 13], [13, 14], [14, 15], [15, 16],
        //     [0, 17], [17, 18], [18, 19], [19, 20]];

        //     HAND_EDGES.forEach(edge => {
        //         const start = points3d[edge[0]];
        //         const end = points3d[edge[1]];
        //         addLine(
        //             { x: start[0], y: start[1], z: start[2] },
        //             { x: end[0], y: end[1], z: end[2] },
        //             color
        //         );
        //     });
        // });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    })
    .catch(error => console.error('Error loading JSON file:', error));

animate();