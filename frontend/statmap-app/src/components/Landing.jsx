import React, { useState } from "react";
import DropMenu from "./DropMenu";
import BlackGlobe from '../black_globe.svg';
import Example from "./Example";

const Landing = () => {
    return (
        <div className="flex items-center gap-4 p-4">
            <img src={BlackGlobe} alt="black globe" />
            
            <Example />
        </div>
    );
};

export default Landing;