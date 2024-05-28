import * as THREE from "three";
import CameraControls from "camera-controls";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader.js";

CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 10000000000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

renderer.setSize(innerWidth, innerHeight);

const cameraControls = new CameraControls(camera, canvas);

// Load the model
const loader = new PLYLoader();

loader.load("data/redandblack_vox10_1450.ply", (geometry) => {
    const material = new THREE.PointsMaterial({size: 0.1, vertexColors: true});
    const points = new THREE.Points(geometry, material);

    scene.add(points);
},
(xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
},
(error) => {
    console.log(error)
});

// Grid
const gridHelper = new THREE.GridHelper(50, 50);
gridHelper.position.y = -1;
scene.add(gridHelper);

// Animate
function animate ()
{
	const delta = clock.getDelta();
	cameraControls.update(delta);

	requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();
