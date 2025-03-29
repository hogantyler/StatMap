import React, { Suspense, useState } from "react";
import Loading from "../Loading";
import GlobeTest from "./GlobeTest";
import NightLightsEarth from "./NightLightsEarth";
function GlobeModeTest() {

    const [nightGlobe, setNightGlobe] = useState(false);

    return (
        <div className="relative w-full h-full">
            <h1 className="absolute text-white z-50">{nightGlobe ? "Experiemental Testing Globe from NightLightsEarth.jsx" : "Normal Testing Globe from GlobeTest.jsx"}</h1>
            <button className="absolute bg-blue-500 text-white rounded z-50 top-7" onClick={() => { setNightGlobe(!nightGlobe) }}>change globe</button>
            <Suspense fallback={<Loading />}>
                {nightGlobe ? <NightLightsEarth /> : <GlobeTest />}
            </Suspense>
        </div>
    )
}

export default GlobeModeTest;