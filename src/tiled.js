import * as THREE from "three";
import CameraControls from "camera-controls";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader.js";

// Create the scene
CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 10000000000);
camera.position.set(10000, 0, 10000);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

renderer.setSize(innerWidth, innerHeight);

const cameraControls = new CameraControls(camera, canvas);

// Load the manifest
const response = await fetch("data/redandblack/manifest.json");
const manifest = await response.json();
var tiles = [];

// Sets the max memory to use in the app in bytes
// This is a suggestion and not a hard limit. The app will still download at least the worst LOD for each tile that lies in the user's viewport
var maxMemory = 1000000;
var currentMemory = 0;

for (var i = 0; i < manifest.tiles.length; i++)
{
    var tile = manifest.tiles[i]

    // Make an invisible cube in the viewport for each tile
    const geometry = new THREE.BoxGeometry(tile.width, tile.height, tile.depth);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.0});
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(tile.x, tile.y, tile.z);
    cube.userData.tile = tile;
    cube.userData.tile.lod = Infinity;

    tiles.push(cube);
    
    scene.add(cube);

    // Load the proper LOD if the tile is in the viewport
    cube.onBeforeRender = function (renderer, scene, camera, geometry, material, group)
    {
        // Get the distance between this object and the camera
        var distanceWithCamera = camera.position.distanceTo(this.position);

        // Determine the LOD to load
        var lodIndex = chooseLod(distanceWithCamera, 1000, this.userData.tile.representations);
        var lod = this.userData.tile.representations[lodIndex].segment

        // Load the LOD if it has not been done yet or if we need a better LOD
        if (lodIndex < this.userData.tile.lod)
        {
            this.userData.tile.lod = lodIndex;
            
            const loader = new PLYLoader();

            loader.load(lod, (data) =>
            {
                const material = new THREE.PointsMaterial({size: 0.1, vertexColors: true});
                const points = new THREE.Points(data, material);

                points.name = lod;

                scene.add(points);

                // Remove the old LOD
                if (this.userData.tile.pointsName != undefined)
                {
                    var selectedObject = scene.getObjectByName(this.userData.tile.pointsName);
                    currentMemory -= selectedObject.size;
                    scene.remove(selectedObject);
                }

                this.userData.tile.lodIndex = lodIndex;
                this.userData.tile.pointsName = points.name;

                currentMemory += data.size
            }, null, (error) => {
                console.log(error);
            });
        }
    }

    cube.addEventListener("update", function()
    {
        // Manage memory
        if (currentMemory <= maxMemory)
            return;

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)
        
        if (!frustum.intersectsObject(this))
        {
            if (this.userData.tile.pointsName != undefined)
            {
                var selectedObject = scene.getObjectByName(this.userData.tile.pointsName);
                currentMemory -= selectedObject.size;
                scene.remove(selectedObject);
            }

            this.userData.tile.lod = Infinity;
            this.userData.tile.pointsName = undefined;
        }
    });
}

function chooseLod(distance, minDistance, lods)
{
    // Reverse sort the LODs by number of points
    lods.sort((a, b) =>
    {
        return b.points- a.points;
    });

    if (lods.length == 1 || distance <= minDistance)
        return 0;

    for (var i = 1; i < lods.length; i++)
    {
        // Get the ratio between the current LOD and the best LOD
        var ratio = lods[0].points / lods[i].points;

        if (distance <= ratio * minDistance)
            return i;
    }

    // Otherwise, return the worst LOD
    return lods.length - 1;
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

    for (var i = 0; i < tiles.length; i++)
    {
        tiles[i].dispatchEvent({type: "update"});
    }

    renderer.render(scene, camera);
}

animate();
