import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { pointCloudeVertexShader, pointCloudFragmentShader } from "./shaders";
import CameraControls from "camera-controls";

export class Tile
{
    private static DRACO:DRACOLoader;
    private static DEBUG:boolean = true;
    private static tileMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
    private static pointCloudMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        vertexShader: pointCloudeVertexShader,
        fragmentShader: pointCloudFragmentShader,
        uniforms: {
            "scaleFactor": {value: 1200}
        }
    });

    public tile:TileJSON;
    private scene:THREE.Scene;
    private cameraControls:CameraControls;
    private cube?:THREE.Mesh;

    /**
     * The id of the chosen representation.
     * Its value is -1 if no representation has been chosen.
     */
    private representationId:number = -1;

    private box?:THREE.BoxHelper;
    private points?:THREE.Points;

    /**
     * Constructor
     * @param tile The information of the tiles from the manifest
     * @param scene The Three.js scene
     * @param cameraControls The camera-control object
     */
    constructor(tile:TileJSON, scene:THREE.Scene, cameraControls:CameraControls)
    {
        this.tile = tile;
        this.scene = scene;
        this.cameraControls = cameraControls;
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
    }

    /**
     * Whether the tile is in the user viewport
     * @returns Whether the tile is in the user viewport
     */
    public isInViewport():boolean
    {
        // If there is no tile, it can't be in the viewport
        if (!this.cube)
            return false;

        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(this.cameraControls.camera.projectionMatrix, this.cameraControls.camera.matrixWorldInverse)
        
        frustum.setFromProjectionMatrix(matrix)
        
        if (!frustum.intersectsObject(this.cube))
            return false;

        return true;
    }

    /**
     * Returns the euclidian distance of the center of the tile with the position of the camera.
     * If the tile has not been loaded yet, returns NaN.
     * @returns The euclidian distance of the center of the tile with the position of the camera or NaN if the tile has not been loaded yet.
     */
    public distanceFromCamera():number
    {
        if (!this.cube)
            return NaN;

        return this.cameraControls.camera.position.distanceTo(this.cube.position);
    }

    /**
     * Loads the tile when it is in the viewport
     * @param representationId The id of the representation in the tile JSON
     */
    public loadRepresentation(representationId:number)
    {
        if (this.representationId != -1)
            return;

        this.representationId = representationId;

        const uri = this.tile.representations[representationId].segment;
        const re = /(?:\.([^.]+))?$/;
        const extension = re.exec(uri)![1];
        
        var loader = this.getLoader(extension);

        loader.load(uri, (data) =>
        {
            this.points = new THREE.Points(data, Tile.pointCloudMaterial);

            this.scene.add(this.points);
        }, undefined, (error) => {
            console.log(error);
        });
    }

    /**
     * Gets the point count of the representation that has been chosen.
     * The point count is retrieved from the manifest.
     * Returns 0 if no representation has been chosen.
     * @returns The point count of the representation that has been chosen
     */
    public pointCount(): number
    {
        if (this.representationId == -1)
            return 0;

        return this.tile.representations[this.representationId].points;
    }

    /**
     * Returns the proper loader to use according to `extension`.
     * Returns a `PLYLoader` for the extension `ply` and a `DracoLoader` for the extension `drc`.
     * @param extension The file extension of the 3D model to load. Must not start with a dot.
     * @returns The proper loader to use according to `extension`
     */
    private getLoader(extension:string)
    {
        if (extension == "ply")
        {
            return new PLYLoader();
        }
        else if (extension == "drc")
        {
            return Tile.getDraco();
        }
        else
        {
            throw new Error(`Loader not supported for extension ${extension}`);
        }
    }

    private static getDraco(): DRACOLoader
    {
        if (!Tile.DRACO)
        {
            Tile.DRACO = new DRACOLoader();
            Tile.DRACO.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
            Tile.DRACO.preload();
        }

        return Tile.DRACO;
    }
}
