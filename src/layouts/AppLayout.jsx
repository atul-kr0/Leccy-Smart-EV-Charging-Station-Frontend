import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AppLayout = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">

            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />


            {/* Main application */}

            <div className="min-h-screen lg:ml-56">

                <Topbar
                    setIsOpen={setSidebarOpen}
                />

                <main className="pt-20">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default AppLayout;