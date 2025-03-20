
import GlobeTest from "./GlobeTest";
import React, { Suspense } from "react";
import Loading from "../Loading";
import ConicGlobe from "./ConicGlobe";
function GlobeModeTest() {

    return (
        <div>
            <Suspense fallback={<Loading />}>
                <GlobeTest />
            </Suspense>
        </div>
    )
}

export default GlobeModeTest;