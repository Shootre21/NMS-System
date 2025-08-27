import React from 'react';

type Page = 'dashboard' | 'troubleshooting' | 'devices';

interface NavigationProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
    label: string;
    page: Page;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}> = ({ label, page, currentPage, setCurrentPage }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                    ? 'bg-cyan-500 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:bg-gray-700/80 hover:text-white'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    );
};


const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <nav className="bg-gray-800/50 p-2 rounded-lg border border-cyan-500/20 flex items-center justify-center space-x-2" aria-label="Main navigation">
            <NavItem label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem label="Troubleshooting" page="troubleshooting" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem label="Devices" page="devices" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </nav>
    );
};

export default Navigation;
