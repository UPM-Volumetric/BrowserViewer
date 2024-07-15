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

        var representations: number[] = [];
        
        // Download the lowest LOD for all tiles
        for (var i = 0; i < tilesInViewport.length; i++)
        {
            var representation = tilesInViewport[i].tile.representations.length - 1;
            
            representations.push(representation);

            var pointCount = this.pointCountSolution(tilesInViewport, representations);

            // Never get over the point budget
            if (pointCount > this.maxPoints)
                representations[i] = -1
        }

        // Then increase the LOD of all tiles equally
        loop1: while (true)
        {
            for (var i = 0; i < tilesInViewport.length; i++)
            {
                var actualRepresentation = representations[i];
                
                if (actualRepresentation == 0)
                    continue;

                representations[i] = actualRepresentation - 1; // TODO Check if it exists
    
                var pointCount = this.pointCountSolution(tilesInViewport, representations);
    
                // Never get over the point budget
                if (pointCount > this.maxPoints)
                {
                    representations[i] = actualRepresentation;
                    break loop1;
                }
            }

            if (representations[representations.length - 1] == 0)
                break;
        }

        console.log(representations);
        console.log(this.pointCountSolution(tilesInViewport, representations))

        // Download the tiles near the camera first, one at the time
        for (var i = 0; i < tilesInViewport.length; i++)
        {
            var id = representations[i];

            tilesInViewport[i].loadRepresentation(id);
        }
    }

    private pointCountSolution(tiles:Tile[], representations:number[]): number
    {
        var pointCount = 0;

        for (var i = 0; i < tiles.length; i++)
        {
            var id = representations[i];

            if (id >= 0 && id < tiles[i].tile.representations.length)
                pointCount += tiles[i].tile.representations[id].points;
        }

        return pointCount;
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
