import * as THREE from "three";
import { Tile } from "./tile";
import CameraControls from "camera-controls";

export class PointCloud
{
    private manifest?:ManifestJSON;
    private maxPoints:number;
    private tiles:Tile[] = [];

    /**
     * Constructor
     * @param manifestURI The URI of the manifest
     */
    constructor(manifestURI:string, maxPoints:number, scene:THREE.Scene, cameraControls:CameraControls)
    {
        this.maxPoints = maxPoints;
        this.loadManifestAndTiles(manifestURI, scene, cameraControls);
    }

    /**
     * Loads the manifest and prepares the tiles
     * @param manifestURI The URI of the manifest
     */
    private async loadManifestAndTiles(manifestURI:string, scene:THREE.Scene, cameraControls:CameraControls)
    {
        fetch(manifestURI).then(async response =>
        {
            this.manifest = await response.json();

            if (this.manifest !== undefined)
            {
                for (var i = 0; i < this.manifest.tiles.length; i++)
                {
                    var tile = new Tile(this.manifest.tiles[i], scene, cameraControls);
    
                    this.tiles.push(tile);
                }
            }

            cameraControls.addEventListener("control", () => this.downloadRepresentations());
            this.downloadRepresentations();
        }).catch(error => console.error("Error: ", error));
    }

    private downloadRepresentations()
    {
        // Get all the tiles in the viewport
        var tilesInViewport = this.tiles.filter((tile:Tile) =>
        {
            return tile.isInViewport();
        });

        // Sort the tiles according to their distance with the camera
        tilesInViewport.sort((a:Tile, b:Tile) =>
        {
            // Return a negative value if the first argument is less than the second argument
            return a.distanceFromCamera() - b.distanceFromCamera();
        });

        // Download the tiles near the camera first, one at the time
        for (var tile of tilesInViewport)
        {
            var representationId = tile.tile.representations.length - 1;

            tile.loadRepresentation(representationId);
        }

        // TODO Get point count
        console.log(this.pointCount());

        // TODO Respect the point budget when downloading
    }

    /**
     * Calculates the current number of points loaded for this point cloud
     * @returns The current number of points loaded for this point cloud
     */
    private pointCount(): number
    {
        var pointCount = 0;

        for (var tile of this.tiles)
        {
            pointCount += tile.pointCount();
        }

        return pointCount;
    }
}
