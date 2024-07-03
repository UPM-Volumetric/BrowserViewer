interface ManifestJSON
{
    tiles:TileJSON[]
}

interface TileJSON
{
    x:number;
    y:number;
    z:number;
    width:number;
    height:number;
    depth:number;
    representations:RepresentationJSON[]
}

interface RepresentationJSON
{
    points:number
    segment:string
}