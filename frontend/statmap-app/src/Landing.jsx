import React, { useState } from "react";
import DropMenu from "./DropMenu";
import BlackGlobe from './black_globe.svg';

const Landing = () => {
    return (
        <div className="flex items-center gap-4 p-4">
            <img src={BlackGlobe} alt="black globe" />
            <DropMenu />
        </div>
    );
};

export default Landing;