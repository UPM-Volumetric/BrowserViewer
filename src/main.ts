import * as THREE from "three";
import CameraControls from "camera-controls";
import Stats from "three/addons/libs/stats.module.js";
import { PointCloud } from "./pointCloud";

// Setup the scene
const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

// Setup the camera
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 10000000000);

camera.position.set(0, 10, 0);

// Setup the renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// Setup the camera controls
CameraControls.install({THREE: THREE});
const cameraControls = new CameraControls(camera, renderer.domElement);

const cameraState = localStorage.getItem("camera-state");

if (cameraState)
	cameraControls.fromJSON(JSON.parse(cameraState));

// Add the grid
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

// Setup the stats
const stats = new Stats();

stats.showPanel(0);
document.body.appendChild(stats.dom);

// Camera position
const cameraPosition = document.getElementById("camera-position");

cameraPosition!.addEventListener("click", () =>
{
	const jsonData = JSON.stringify(cameraControls.toJSON());

	localStorage.setItem("camera-state", jsonData);
});

// Load the point cloud
new PointCloud("data/redandblackdraco/manifest.json", 2500000, scene, cameraControls);

// Animate
function animate ()
{
	const delta = clock.getDelta();
	cameraControls.update(delta);

	requestAnimationFrame(animate);

    renderer.render(scene, camera);

    stats.update();
}

animate();
