#!/usr/bin/env python3
"""Convert verified lunar LOLA TIFFs into the Moon runtime crop format."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.warp import transform_bounds


EXPECTED_SOURCE_LENGTHS = {
    "Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif": 8_494_203_833,
    "Lunar_LRO_LROC-WAC_Mosaic_global_100m_June2013.tif": 5_959_263_751,
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dem_tiff", type=Path)
    parser.add_argument("imagery_tiff", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)

    for source in (args.dem_tiff, args.imagery_tiff):
        source_name = source.name[:-len(".partial")] if source.name.endswith(".partial") else source.name
        expected_length = EXPECTED_SOURCE_LENGTHS.get(source_name)
        if expected_length is None:
            raise ValueError(f"Unrecognized lunar source filename: {source_name}")
        if source.stat().st_size != expected_length:
            raise ValueError(
                f"{source.name} is incomplete: expected {expected_length} bytes, "
                f"found {source.stat().st_size}"
            )
        with rasterio.open(source):
            pass

    # Apollo 16 landing site, using a 4096 m square game region.
    center_lon = 15.4995
    center_lat = -8.9734
    longitude_half = 0.0661
    latitude_half = 0.0677
    west, south, east, north = (
        center_lon - longitude_half,
        center_lat - latitude_half,
        center_lon + longitude_half,
        center_lat + latitude_half,
    )

    with rasterio.open(args.dem_tiff) as dem:
        bounds = transform_bounds(dem.crs, "EPSG:4326",
                                  *dem.bounds, densify_pts=21)
        if west < bounds[0] or south < bounds[1] or east > bounds[2] or north > bounds[3]:
            raise ValueError(f"Apollo 16 crop is outside DEM bounds {bounds}")
        window = rasterio.windows.from_bounds(west, south, east, north, dem.transform)
        data = dem.read(
            1,
            window=window,
            out_shape=(512, 512),
            resampling=Resampling.average,
            masked=True,
        )

    height = np.asarray(data.filled(-32768), dtype=np.int16)
    if np.all(height == -32768):
        raise ValueError("Moon DEM crop contains only no-data values")
    raw_path = args.output_dir / "apollo16_512x512_lola_i16le.raw"
    height.astype("<i2").tofile(raw_path)

    metadata = {
        "dataset": "USGS Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014",
        "sourceUrl": "https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif",
        "sourceSha256": sha256(args.dem_tiff),
        "width": 512,
        "height": 512,
        "encoding": "int16-little-endian",
        "noData": -32768,
        "bounds": {"west": west, "south": south, "east": east, "north": north},
        "projection": "EPSG:4326 simple cylindrical metadata; values sampled from source raster",
        "datum": "Moon",
        "units": "meters",
        "orientation": "north-up",
        "worldCoverageMeters": 4096,
        "runtimeScale": 0.002,
        "runtimeBaseMeters": 0,
        "gameBaseHeight": 5.5,
    }
    (args.output_dir / "apollo16_512x512_lola.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )

    with rasterio.open(args.imagery_tiff) as imagery:
        window = rasterio.windows.from_bounds(
            west, south, east, north, imagery.transform
        )
        rgb = imagery.read(
            (1, 2, 3),
            window=window,
            out_shape=(1024, 1024),
            resampling=Resampling.bilinear,
        ).astype(np.float32)

    if rgb.shape[0] != 3:
        raise ValueError(f"Expected RGB LROC imagery, found {rgb.shape[0]} bands")
    rgb -= rgb.min(axis=(1, 2), keepdims=True)
    maximum = rgb.max(axis=(1, 2), keepdims=True)
    rgb = np.divide(rgb, maximum, out=np.zeros_like(rgb), where=maximum != 0)
    rgb = np.moveaxis(np.clip(rgb * 255, 0, 255).astype(np.uint8), 0, -1)
    Image.fromarray(rgb, "RGB").save(args.output_dir / "apollo16_1024x1024_lroc.webp",
                                      format="WEBP", quality=88, method=6)
    print(json.dumps({
        "dem": str(raw_path),
        "heightmapSha256": sha256(raw_path),
        "imagery": str(args.output_dir / "apollo16_1024x1024_lroc.webp"),
        "imagerySourceSha256": sha256(args.imagery_tiff),
        "bounds": [west, south, east, north],
    }, indent=2))


if __name__ == "__main__":
    main()
