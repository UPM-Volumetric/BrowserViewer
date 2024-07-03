import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { pointCloudeVertexShader, pointCloudFragmentShader } from "./shaders";

export class Tile
{
    private static tileMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.20, wireframe: true});
    private static pointCloudMaterial = new THREE.ShaderMaterial({vertexColors: true, vertexShader: pointCloudeVertexShader, fragmentShader: pointCloudFragmentShader});
    // static #pointCloudMaterial = new THREE.PointsMaterial({vertexColors: true, size: 1})
    private tile:TileJSON;
    private scene:THREE.Scene;
    private cube?:THREE.Mesh;
    private loaded:boolean = false;

    /**
     * Constructor
     * @param tile The information of the tiles from the manifest
     * @param scene The Three.js scene
     */
    constructor(tile:TileJSON, scene:THREE.Scene)
    {
        this.tile = tile;
        this.scene = scene;
        this.build();
    }

    /**
     * Makes an invisible cube that represents the tile boundaries
     */
    build()
    {
        var geometry = new THREE.BoxGeometry(this.tile.width, this.tile.height, this.tile.depth);
        
        this.cube = new THREE.Mesh(geometry, Tile.tileMaterial);
        this.cube.position.set(this.tile.x, this.tile.y, this.tile.z);
        this.cube.userData.tile = this;

        this.scene.add(this.cube);

        this.load();
    }

    /**
     * Loads the tile when it is in the viewport
     */
    load()
    {
        this.cube.onBeforeRender = (renderer, scene, camera, geometry, material, group) =>
        {
            if (this.loaded)
                return;

            this.loaded = true;

            const loader = new PLYLoader();
            const uri = this.tile.representations[0].segment;
            
            loader.load(uri, (data) =>
            {
                const points = new THREE.Points(data, Tile.pointCloudMaterial);
    
                this.scene.add(points);
                this.loaded = true;
            }, undefined, (error) => {
                console.log(error);
            });
        }
    }
}
