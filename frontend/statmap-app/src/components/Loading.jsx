import React, { useState, useEffect } from "react";

function Loading() {
    
    return (
        <div className="flex items-center justify-center h-screen bg-black w-screen">
            <div className="relative">
                <div class="animate-bounce">
                    <div class="h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-600"></div>
                    <div class="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-700 animate-spin">
                    </div>
                </div>

                <div className="flex items-center justify-center mt-4 animate-pulse">
                    <p className="text-green-500">Loading . . . </p>
                </div>
            </div>
        </div>

    )

}

export default Loading;