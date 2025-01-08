import { h } from 'preact';
import { useState } from 'preact/hooks';

const SidebarNavigation = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const navigationItems = [
        { name: 'Seznam Podjetij', path: '/companieslist' },
        { name: 'Večkriterijska Analiza', path: '/analiza' },
        { name: 'Rezultati Analize', path: '/resanalysis' },
        { name: 'Primerjava Analize', path: '/analysiscomparison' },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div
                className="bg-blue-800 text-white w-64 space-y-6 py-7 px-2 transition-transform">
                {/* Logo */}
                <div className="text-2xl font-semibold text-center">MVOP</div>

                {/* Navigation Links */}
                <nav className="sticky top-0 space-y-4">
                    {navigationItems.map((item) => (
                        <a
                            href={item.path}
                            key={item.name}
                            className="block py-2.5 px-4 rounded transition hover:bg-gray-700"
                        >
                            {item.name}
                        </a>
                    ))}
                </nav>
            </div>
            

            {/* Main Content */}
            <div className="flex-1 bg-gray-100">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between bg-fuchsia-500 text-white p-4">
                    <h1 className="text-xl font-bold">Seminarska naloga</h1>
                </div>

                {/* Content */}
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SidebarNavigation;
