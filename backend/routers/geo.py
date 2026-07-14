from fastapi import APIRouter

router = APIRouter()

# A very rough, minimal GeoJSON representation of Karnataka for demonstration
KARNATAKA_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Karnataka",
                "state_code": "KA"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [74.0, 11.5],
                        [78.5, 11.5],
                        [78.5, 18.5],
                        [74.0, 18.5],
                        [74.0, 11.5]
                    ]
                ]
            }
        }
    ]
}

@router.get("/karnataka")
async def get_karnataka_geojson():
    """
    Returns the GeoJSON boundary for Karnataka.
    Coordinates are roughly Lat [11.5, 18.5], Lng [74.0, 78.5].
    """
    return KARNATAKA_GEOJSON
