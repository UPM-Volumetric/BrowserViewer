import * as THREE from "three";
import CameraControls from "camera-controls";
import Stats from "three/addons/libs/stats.module.js";
import { PointCloud } from "./pointCloud";

var canvas = document.getElementById("canvas");

// Create the scene
CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 10000000000);
camera.position.set(60, 80, 60);

const renderer = new THREE.WebGLRenderer({canvas: canvas!, antialias: true});

renderer.setSize(innerWidth, innerHeight);

const cameraControls = new CameraControls(camera, canvas!);

// Add the grid
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

// Stats
var stats = new Stats();

stats.showPanel(0);
document.body.appendChild(stats.dom);

// Load the point cloud
new PointCloud("data/redandblack/manifest.json", scene);

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
