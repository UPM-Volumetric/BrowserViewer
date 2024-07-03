import * as THREE from "three";
import { Tile } from "./tile";

export class PointCloud
{
    private manifest?:ManifestJSON;
    private tiles:Tile[] = [];

    /**
     * Constructor
     * @param manifestURI The URI of the manifest
     */
    constructor(manifestURI:string, scene:THREE.Scene)
    {
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
}
