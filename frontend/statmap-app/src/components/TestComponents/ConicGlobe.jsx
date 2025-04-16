// Import dependencies
import React, { useRef, useEffect, useState, forwardRef, memo, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ConicPolygonGeometry from 'three-conic-polygon-geometry';
//import { polygonCentroid } from "d3-polygon";
import { useCountrySelection } from '../CountrySelectionContext'; // Context for passing selected country to game pages

//drawing countries on a globe using conical projections of polygons from here: https://github.com/vasturiano/three-conic-polygon-geometry

function CountryPolygons({ geoData, globeRef, isDraggingRef }) {
    const [countries, setCountries] = useState([]);
    //const [selectedCountry, setSelectedCountry] = useState(null);
    const { selectedCountry, selectCountry } = useCountrySelection();
    const polygonsRef = useRef();

    // Handler for making sure only one country is selectable at a time and setting selected country context so game page can access selected country
    const handleCountrySelect = (country) => {
        {/*setSelectedCountry(prevSelected =>
            prevSelected === countryId ? null : countryId
        );*/}
        selectCountry(prevSelected =>
            prevSelected.code === country.code ? { name: null, code: null } : { name: country.name, code: country.code }
        );
        console.log(`Selected country: ${country.name} (${country.code})`);

    };

    useEffect(() => {
        if (!geoData) return;

        const newCountries = [];

        geoData.features.forEach(({ properties, geometry }) => {
            //const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
            const polygons = [geometry.coordinates];
            const countryName = properties.ADMIN;
            const iso_a3 = properties.ISO_A3;
            const adm0_a3 = properties.ADM0_A3;
            const alt = 1.003; // Height/altitude 1.003
            //console.log(countryName, iso_a3, adm0_a3);

            polygons.forEach((coords, index) => {
                //console.log(newNames)
                //const geometry = new ConicPolygonGeometry(coords, 0, alt, true, true, true, 1);
                //const mesh = new THREE.Mesh(geometry, materials);
                //newMeshes.push(mesh);

                newCountries.push({ name: countryName, coords: coords, altitude: alt, id: `${adm0_a3}-${index}`, adm: adm0_a3, iso: iso_a3, type: geometry.type });
            });
        });
        console.log('loading polygons');
        //setNames(newNames);
        //setMeshes(newMeshes);
        setCountries(newCountries);
    }, []);
    console.log('country polygons');

    useFrame(() => {
        if (polygonsRef.current && globeRef.current) {
            polygonsRef.current.rotation.copy(globeRef.current.rotation);
        }
    });

    return (
        <>
            <group ref={polygonsRef}>
                {countries.map((country) => (
                    <Country
                        key={country.id}
                        name={country.name}
                        coords={country.coords}
                        altitude={country.altitude}
                        type={country.type}
                        iso={country.iso}
                        isSelected={selectedCountry.code === country.adm}
                        onSelect={() => handleCountrySelect({ name: country.name, code: country.adm })}
                        isDraggingRef={isDraggingRef}
                    />
                ))}
            </group>

        </>
    );
}

const Country = memo(function Country({ name, coords, altitude, type, iso, isSelected, onSelect, isDraggingRef }) {
    console.log("country");

    const [hovered, setHovered] = useState(false);
    const countryRef = useRef();

    //console.log(isSelected, hovered);

    const { color, show, raise } = useMemo(() => ({
        color: isSelected ? 'teal' : (hovered ? 'cyan' : 'purple'),
        show: isSelected || hovered,
        raise: isSelected ? 0.005 : (hovered ? 0 : 0)
    }), [isSelected, hovered]);

    //const geometry = new ConicPolygonGeometry(coords, (0.99), (altitude + raise), true, true, true, 5);
    const geometry = useMemo(() => {
        //console.log("memo render");
        if (type === 'Polygon') {
            return [new ConicPolygonGeometry(coords, (0.99), (altitude + raise), false, true, true, 5)];
        } else {
            return coords.map(coord =>
                new ConicPolygonGeometry(coord, (0.99), (altitude + raise), false, true, true, 5)
            );
        }
    }, [coords, altitude, raise, type]);

    const materials = useMemo(() => [ //side material
        new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.45,
            transparent: true,
            wireframe: false,
            visible: show
        }),
        new THREE.MeshBasicMaterial({ //top material
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.45,
            transparent: true,
            wireframe: false,
            visible: show
        }),
        new THREE.MeshBasicMaterial({ //bottom material
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.45,
            transparent: true,
            wireframe: false,
            visible: show
        })
    ], [color, show]);

    const handleClick = useCallback((event) => {
        event.stopPropagation();

        if (isDraggingRef.current) {
            //console.log('Click ignored: dragging');
            return; // Do nothing if dragging
        }

        document.body.style.cursor = 'pointer';
        onSelect();
        // console.log(`selected on ${name}`);
    }, [onSelect, isDraggingRef]);

    const handlePointerOver = useCallback((event) => {
        event.stopPropagation();

        if (isDraggingRef.current) {
            //console.log('Hover ignored: dragging');
            return; // Do nothing if dragging
        }

        document.body.style.cursor = 'pointer';
        setHovered(true);
    }, [isDraggingRef]);

    const handlePointerOut = useCallback((event) => {
        event.stopPropagation();

        if (isDraggingRef.current && !hovered) {
            return;
        }

        if (!isDraggingRef.current) {
            document.body.style.cursor = 'auto';
        }

        setHovered(false);
    }, [isDraggingRef, hovered]);

    //const edges = new THREE.EdgesGeometry(geometry);
    return (
        <group ref={countryRef}>
            {geometry.map((geo, index) => (
                <mesh
                    key={`${name}-${index}`}
                    onClick={handleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <primitive object={geo} attach="geometry" />
                    <primitive object={materials[0]} attach="material-0" />
                    <primitive object={materials[1]} attach="material-1" />
                    <primitive object={materials[2]} attach="material-2" />
                </mesh>
            ))}
        </group>
    )

}, (prevProps, nextProps) => {
    //comparison function - only re-render if these conditions change
    return (
        prevProps.isSelected === nextProps.isSelected
    );
});

function ConicGlobe({ globeRef, isDraggingRef, geoData }) {
    //const [geoData, setGeoData] = useState(null);

    //https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson
    // Load GeoJSON data

    /*useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Error loading GeoJSON:', err));
        console.log('conic fetch');
        //console.log(geoData);
    }, []);*/


    console.log('conicglobe');
    //console.log(geoData)

    return (
        <>
            {/* Load country polygons */}
            {geoData && <CountryPolygons geoData={geoData} globeRef={globeRef} isDraggingRef={isDraggingRef} />}
        </>

    );
}

export default ConicGlobe;
