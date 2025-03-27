
import GlobeTest from "./GlobeTest";
import React, { Suspense } from "react";
import Loading from "../Loading";
import ConicGlobe from "./ConicGlobe";
import NightLightsEarth from "./NightLightsEarth";
function GlobeModeTest() {

    return (
        <div>
            <Suspense fallback={<Loading />}>
                <NightLightsEarth />
            </Suspense>
        </div>
    )
}

export default GlobeModeTest;