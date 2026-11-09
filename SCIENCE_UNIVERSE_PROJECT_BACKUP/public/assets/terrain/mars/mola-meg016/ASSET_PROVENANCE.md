# Mars Jezero MOLA terrain provenance

## Elevation source

- **Dataset:** Mars Global Surveyor MOLA Mission Experiment Gridded Data Record
  (MEGDR), product `MGS-M-MOLA-5-MEGDR-L3-V1.0`.
- **Product:** `MEGT90N000EB.IMG`, 16 pixels per degree global northern/eastern
  hemispheric map.
- **Archive landing page:** https://pds-geosciences.wustl.edu/missions/mgs/megdr.html
- **Observed native spacing:** approximately 3.704 km/pixel (16 pixels per degree).
- **Source encoding:** signed 16-bit big-endian elevation in an ENVI-compatible
  pair of `.img`/`.hdr` products.
- **Vertical reference:** Mars areoid using the MOLA GMM3/Goddard degree-50 model.
- **Usage:** NASA planetary data distributed by the Planetary Data System; the
  product label and accompanying dataset documentation define the source and
  data-use terms.

## Runtime Jezero crop

The source map was cropped to:

- West/east: 75.5 E to 79.5 E
- South/north: 16.4 N to 20.4 N
- Center: 77.5 E, 18.4 N
- Runtime dimensions: 256 x 256
- Runtime coverage: 240 world meters
- Runtime encoding: signed 16-bit little-endian
- Runtime no-data value: -8192
- Vertical scale: 0.04 world meters per measured source meter
- Recorded runtime range: approximately -3837 m to 459 m

The resulting file and metadata are:

- `jezero_crop/jezero_256x256_mola_i16le.raw`
- `jezero_crop/jezero_256x256_mola.json`

This conversion preserves measured regional relief, not rover-scale terrain.
The game must not represent MOLA resolution as photographic surface detail.

## Verified downloaded assets

SHA-256 values are recorded for the exact files present in this repository:

| File | Bytes | SHA-256 |
|---|---:|---|
| `megt90n000eb.img` | 33177600 | `d18d9b9ab8c5516d02e157dd2cde0f1d0d160c21940e953ba22391269a545e7b` |
| `megt90n000eb.hdr` | 1060 | `1d3d3bab68cf7f709db3f3c8dfb64cd1611392b7b6d170c5f55406aee2c783e7` |
| `megt90n000eb.lbl` | 4813 | `0f2bd919dddb86d83489a008d3007bd915507c892a0f22ce49ad5dd5d2fc7d8a` |
| `megt90n000eb.xml` | 15528 | `c393221db2de31916b30113ce28841dd967456dadb9bf2735eb30496eb37afa2` |
| `jezero_crop/jezero_256x256_mola_i16le.raw` | 131072 | `2b3b833e4f4dfd82c66537873288055b4028ccbbf64d49a38ebf51d2633291eb` |
| `jezero_crop/jezero_256x256_mola.json` | 850 | `fd54baae815befa67ee9d47ebf2f0b251d988fe0fa58839ded472c95a8aae92d` |

## Surface imagery and Moon status

The bundled texture system currently supplies generated planetary albedo,
normal, and roughness patterns. It is **not** presented as NASA orbital
imagery or a licensed PBR material library.

No authenticated Jezero orbital image texture could be bundled in this pass
because the NASA/USGS terrain-imagery hosts were unavailable by DNS or direct
HTTP access from this environment. A future texture integration requires a
georeferenced image whose coverage matches the 75.5 E to 79.5 E and 16.4 N to
20.4 N crop, plus explicit usage terms and checksum provenance.

Moon LOLA elevation integration remains pending for the same verification
requirement. Measured Mars relief is therefore the only claimed elevation
data source in the current runtime.
