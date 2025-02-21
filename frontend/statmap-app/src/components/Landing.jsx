import React, { useState } from "react";
import BlackGlobe from '../black_globe.svg';
import HoverDropMenu from "./HoverDropMenu";

const Landing = () => {
    return (
        <div className="flex items-center gap-4 p-4">
            <img src={BlackGlobe} alt="black globe" />
            
            <HoverDropMenu />
        </div>
    );
};

export default Landing;