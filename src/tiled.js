import * as THREE from "three";
import CameraControls from "camera-controls";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader.js";

class Tile
{
    static #material = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.0});
    #tile;
    #scene;
    #cube;
    #points;
    #loaded;

    constructor(tile, scene)
    {
        this.#tile = tile;
        this.#scene = scene;
    }

    /**
     * Makes an invisible cube that represents the tile boundaries
     */
    build()
    {
        var geometry = new THREE.BoxGeometry(this.#tile.width, this.#tile.height, this.#tile.depth);
        
        this.#cube = new THREE.Mesh(geometry, Tile.#material);
        this.#cube.position.set(this.#tile.x, this.#tile.y, this.#tile.z);
        this.#cube.userData.tile = this;

        this.#scene.add(this.#cube);

        this.load();
    }

    load()
    {
        this.#cube.onBeforeRender = (renderer, scene, camera, geometry, material, group) =>
        {
            if (this.#loaded)
                return;

            this.#loaded = true;

            const loader = new PLYLoader();
            const uri = this.#tile.representations[0].segment;
            
            loader.load(uri, (data) =>
            {
                // const material = new THREE.PointsMaterial({size: 0.1, sizeAttenuation: false, vertexColors: true});

                const material = new THREE.ShaderMaterial({
                    vertexColors: true,
                    vertexShader: `
                        precision highp float;
                        varying vec3 vColor;
        
                        void main() {
                            vColor = color;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

                            float dx = pow(position[0] - cameraPosition[0], 2.0);
                            float dy = pow(position[1] - cameraPosition[1], 2.0);
                            float dz = pow(position[2] - cameraPosition[2], 2.0);
                            float delta  = pow(dx + dy + dz, 0.5);

                            gl_PointSize = 1300.0 / delta; // The factor is model dependant
                        }
                    `,
                    fragmentShader: /*THREE.ShaderLib["points"].fragmentShader*/`
                        // TODO The color is too dark
                        precision highp float;
                        varying vec3 vColor;

                        void main() {
                            gl_FragColor = vec4(vColor, 1);
                        }
                    `
                });

                const points = new THREE.Points(data, material);
    
                this.#points = points;
                this.#scene.add(points);
                this.#loaded = true;
            }, null, (error) => {
                console.log(error);
            });
        }
    }
}

// Create the scene
CameraControls.install({THREE: THREE});

const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(1, 1, 1);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 10000000000);
camera.position.set(600, 100, 600);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

renderer.setSize(innerWidth, innerHeight);

const cameraControls = new CameraControls(camera, canvas);

// Load the manifest
const response = await fetch("data/redandblack/manifest.json");
const manifest = await response.json();
var tiles = [];

for (var i = 0; i < manifest.tiles.length; i++)
{
    var tile = new Tile(manifest.tiles[i], scene);

    tile.build();
    tiles.push(tile);
}

// Add the grid
const gridHelper = new THREE.GridHelper(50, 50);
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