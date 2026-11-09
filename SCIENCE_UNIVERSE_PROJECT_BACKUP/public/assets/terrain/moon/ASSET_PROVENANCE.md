# Moon LOLA and LROC asset provenance

## Required source products

- **Elevation:** USGS Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014
- **Elevation URL:** https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif
- **Declared size:** 8,494,203,833 bytes
- **Imagery:** USGS Lunar LRO LROC WAC Mosaic global 100 m, June 2013
- **Imagery URL:** https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LROC-WAC_Mosaic_global_100m_June2013.tif
- **Declared size:** 5,959,263,751 bytes

## Runtime crop

The game crop is centered on the Apollo 16 landing site:

- Center longitude: 15.4995 E
- Center latitude: 8.9734 S
- Coverage: approximately 4096 m square
- DEM runtime dimensions: 512 x 512, signed 16-bit little-endian
- Albedo runtime dimensions: 1024 x 1024 WebP
- Destination: `public/assets/terrain/moon/lola_118m/apollo16_crop/`

These source mosaics cover the Moon globally and are distributed by USGS planetary
mapping. Conversion and runtime integrity metadata must be generated only after
TIFF validation with rasterio/GDAL.

## Transfer state

Source downloads use `.partial` suffixes while incomplete. Neither partial TIFF
may be renamed or consumed until its complete byte length and TIFF structure are
validated. The runtime never loads source TIFF files.
