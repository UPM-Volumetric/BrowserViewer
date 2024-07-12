import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { pointCloudeVertexShader, pointCloudFragmentShader } from "./shaders";

export class Tile
{
    private static DEBUG:boolean = false;
    private static tileMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
    private static pointCloudMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        vertexShader: pointCloudeVertexShader,
        fragmentShader: pointCloudFragmentShader,
        uniforms: {
            "scaleFactor": {value: 1200}
        }
    });

    private tile:TileJSON;
    private scene:THREE.Scene;
    private cube?:THREE.Mesh;
    private loaded:boolean = false;
    private box?:THREE.BoxHelper;

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
    private build()
    {
        var geometry = new THREE.BoxGeometry(this.tile.width, this.tile.height, this.tile.depth);
        
        this.cube = new THREE.Mesh(geometry, Tile.tileMaterial);
        this.cube.position.set(this.tile.x, this.tile.y, this.tile.z);
        this.cube.userData.tile = this;
        
        this.scene.add(this.cube);
        
        if (Tile.DEBUG)
        {
            this.box = new THREE.BoxHelper(this.cube, 0x00ff00);
            this.scene.add(this.box);
        }

        this.load();
    }

    /**
     * Whether the tile is in the user viewport
     * @returns Whether the tile is in the user viewport
     */
    public isInViewport():boolean
    {
        return true;
    }

    /**
     * Loads the tile when it is in the viewport
     */
    private load()
    {
        this.cube!.onBeforeRender = (renderer, scene, camera, geometry, material, group) =>
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
