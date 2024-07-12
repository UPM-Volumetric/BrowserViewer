import * as THREE from "three";
import CameraControls from "camera-controls";
import Stats from "three/addons/libs/stats.module.js";
import { PointCloud } from "./pointCloud";

// Create the scene
CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 10000000000);
camera.position.set(799, 1100, 500);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const cameraControls = new CameraControls(camera, renderer.domElement);
cameraControls.addEventListener("update", () =>
{
	showCameraPosition();
});

var cameraPosition = document.getElementById("camera-position");

function showCameraPosition()
{
	cameraPosition!.innerHTML = `
		<p>Camera Position :</p>
		<p>x: ${camera.position.x.toFixed(0)}</p>
		<p>y: ${camera.position.y.toFixed(0)}</p>
		<p>z: ${camera.position.z.toFixed(0)}</p>
	`;
}

showCameraPosition();

// Add the grid
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

// Stats
var stats = new Stats();

stats.showPanel(0);
document.body.appendChild(stats.dom);

// Load the point cloud
new PointCloud("data/redandblack/manifest.json", 1000000, scene);

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
