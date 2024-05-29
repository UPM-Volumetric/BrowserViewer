import * as THREE from "three";
import CameraControls from "camera-controls";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader.js";

// Create the scene
CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 10000000000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

renderer.setSize(innerWidth, innerHeight);

const cameraControls = new CameraControls(camera, canvas);

// Load the manifest
const response = await fetch("data/redandblack/manifest.json");
const manifest = await response.json();

for (var i = 0; i < manifest.tiles.length; i++)
{
    var tile = manifest.tiles[i]

    // Make an invisible cube in the viewport for each tile
    const geometry = new THREE.BoxGeometry(tile.width, tile.height, tile.depth);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0});
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(tile.x, tile.y, tile.z);

    scene.add(cube);

    geometry.userData.tile = tile;

    // Load the tile if the invisible cube is in the viewport
    cube.onBeforeRender = function (renderer, scene, camera, geometry, material, group)
    {
        if (!geometry.userData.loaded)
        {
            // Load the tile
            const loader = new PLYLoader();

            loader.load(geometry.userData.tile.segment, (data) => {
                const material = new THREE.PointsMaterial({size: 0.1, vertexColors: true});
                const points = new THREE.Points(data, material);
                
                scene.add(points);
            });

            geometry.userData.loaded = true;
        }
    }
}

// Add the grid
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
