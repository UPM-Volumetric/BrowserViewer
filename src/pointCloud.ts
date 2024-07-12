import * as THREE from "three";
import { Tile } from "./tile";

export class PointCloud
{
    private manifest?:ManifestJSON;
    private maxPoints:number;
    private tiles:Tile[] = [];

    /**
     * Constructor
     * @param manifestURI The URI of the manifest
     */
    constructor(manifestURI:string, maxPoints:number, scene:THREE.Scene)
    {
        this.maxPoints = maxPoints;
        this.loadManifestAndTiles(manifestURI, scene);
    }

    /**
     * Loads the manifest and prepares the tiles
     * @param manifestURI The URI of the manifest
     */
    private async loadManifestAndTiles(manifestURI:string, scene:THREE.Scene)
    {
        fetch(manifestURI).then(async response =>
        {
            this.manifest = await response.json();

            if (this.manifest !== undefined)
            {
                for (var i = 0; i < this.manifest.tiles.length; i++)
                {
                    var tile = new Tile(this.manifest.tiles[i], scene);
    
                    this.tiles.push(tile);
                }
            }
        }).catch(error => console.error("Error: ", error));
    }

    private downloadRepresentations()
    {
        // Get all the tiles in the viewport
        var tilesInViewport = this.tiles.filter((value:Tile) =>
        {
            value.isInViewport();
        });
        
        // Download the representation with the lowest number of points for each tile
        var representations = [];

        for (var tile in tilesInViewport)
        {
            // representations
        }

        // Upgrade the representation of the tiles closest to the user without exceeding the point budget

        // Download the tiles near the camera first, one at the time
    }
}
