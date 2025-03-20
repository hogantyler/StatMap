import React, { useState, useEffect, useMemo } from "react";
import Globe from "react-globe.gl";
import EarthMap from "../../textures/8k_earth.png";
import * as turf from "@turf/turf";

function GlobeModeTestPart2() {
  const [countriesData, setCountriesData] = useState([]);
  const [selectedCountryName, setSelectedCountryName] = useState("");

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((res) => res.json())
      .then((data) => setCountriesData(data.features))
      .catch((err) => console.error("Error fetching geojson:", err));
  }, []);

  // Memoize label data using Turf's centroid for better accuracy.
  const labelData = useMemo(() => {
    return countriesData.map((feature) => {
      const center = turf.pointOnFeature(feature);
      return {
        lat: center.geometry.coordinates[1],
        lng: center.geometry.coordinates[0],
        label: feature.properties.name,
      };
    });
  }, [countriesData]);

  return (
    <Globe
      globeImageUrl={EarthMap}
      backgroundColor="#000000"
      polygonsData={countriesData}
      polygonAltitude={0.01}
      polygonCapColor={(polygon) =>
        polygon.properties.name === selectedCountryName
          ? "rgba(0, 255, 0, 0.6)"
          : "rgba(255, 255, 255, 0.3)"
      }
      polygonSideColor={() => "rgba(255, 255, 255, 0.1)"}
      polygonStrokeColor={() => "#ffffff"}
      polygonsTransitionDuration={300}
      onPolygonClick={(polygon, event) => {
        setSelectedCountryName(polygon.properties.name);
        console.log("Country clicked:", polygon.properties.name);
      }}
      labelsData={labelData}
      labelLat={(d) => d.lat}
      labelLng={(d) => d.lng}
      labelText={(d) => d.label}
      labelSize={0.5}
      labelDotRadius={0.1}
      labelColor={() => "#ffffff"}
      labelAltitude={0.03}
      labelResolution={2}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default GlobeModeTestPart2;
