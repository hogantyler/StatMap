import React, { useState } from "react";
import BlackGlobe from '../black_globe.svg';
import HoverDropMenu from "./HoverDropMenu";

const Landing = () => {
    return (
        <div className="flex items-center gap-4 p-4 w-full">
            <img 
                src={BlackGlobe} 
                alt="black globe" 
                className="w-3/4 max-w-[80vw] h-auto" 
            />
        <HoverDropMenu />
        </div>
    );
};

export default Landing;