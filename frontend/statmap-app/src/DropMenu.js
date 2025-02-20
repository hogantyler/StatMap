const DropMenu = () => {
    return (
        <div className="group absolute top-4 left-4 cursor-pointer z-50">
            {/* Hamburger Icon Trigger */}
            <div className="flex items-center justify-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="h-6 w-6 text-white"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
                    />
                </svg>
            </div>

            {/* Dark Dropdown Menu */}
            <div className="invisible absolute mt-2 w-48 flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-xl group-hover:visible transition-all">
                <a className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700">
                    Sign-In
                </a>

                <a className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700">
                    Scores
                </a>

                <a className="px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    Settings
                </a>
            </div>
        </div>
    );
};

export default DropMenu;