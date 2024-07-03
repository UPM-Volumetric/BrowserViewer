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
    async loadManifestAndTiles(manifestURI:string, scene:THREE.Scene)
    {
        var response = await fetch(manifestURI);
        this.manifest = await response.json();

        for (var i = 0; i < this.manifest.tiles.length; i++)
        {
            var tile = new Tile(this.manifest.tiles[i], scene);

            this.tiles.push(tile);
        }
    }
}
