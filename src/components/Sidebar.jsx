import React from "react";
import { NavLink } from "react-router-dom";

import homeIcon from "../assets/icons/Home.svg";
import chargerIcon from "../assets/icons/FindCharger.svg";
import vehicleIcon from "../assets/icons/MyVehicle.svg";
import bookingIcon from "../assets/icons/Bookings.svg";
import historyIcon from "../assets/icons/History.svg";
import supportIcon from "../assets/icons/Support.svg";
import settingsIcon from "../assets/icons/Settings.svg";
import logoutIcon from "../assets/icons/LogOut.svg";

const Sidebar = ({ isOpen, setIsOpen }) => {

    const handleLogout = () => {
        // Clear authentication
        localStorage.removeItem("token");

        // Clear stored user information
        localStorage.removeItem("user");

        // Clear legacy authentication keys
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");

        // Go back to login
        window.location.replace("/login");
    };

    const navItems = [
        {
            name: "Home",
            path: "/home",
            icon: homeIcon,
        },
        {
            name: "Find Charger",
            path: "/home/find-charger",
            icon: chargerIcon,
        },
        {
            name: "My Vehicles",
            path: "/home/vehicles",
            icon: vehicleIcon,
        },
        {
            name: "Bookings",
            path: "/home/bookings",
            icon: bookingIcon,
        },
        {
            name: "History",
            path: "/home/history",
            icon: historyIcon,
        },
        {
            name: "Support",
            path: "/home/support",
            icon: supportIcon,
        },
    ];

    return (
        <>

            {/* =========================
                MOBILE OVERLAY
            ========================= */}

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/30
                        lg:hidden
                    "
                />
            )}


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                className={`
                    fixed
                    left-0
                    top-20
                    z-40

                    flex
                    h-[calc(100vh-5rem)]
                    w-56
                    flex-col

                    border-r
                    border-gray-200
                    bg-white

                    transition-transform
                    duration-300
                    ease-in-out

                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }

                    lg:translate-x-0
                `}
            >

                {/* =========================
                    MAIN NAVIGATION
                ========================= */}

                <nav className="flex-1 px-3 py-6">

                    <ul className="space-y-2">

                        {navItems.map((item) => (

                            <li key={item.name}>

                                <NavLink
                                    to={item.path}
                                    end={item.path === "/home"}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => `
                                        flex
                                        items-center
                                        gap-4

                                        rounded-xl
                                        px-4
                                        py-3

                                        text-[15px]
                                        font-medium

                                        transition-all
                                        duration-200

                                        ${isActive
                                            ? "bg-green-50 text-green-600"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }
                                    `}
                                >

                                    {({ isActive }) => (
                                        <>
                                            <img
                                                src={item.icon}
                                                alt=""
                                                className={`
                                                    h-5
                                                    w-5
                                                    shrink-0

                                                    ${isActive
                                                        ? "opacity-100"
                                                        : "opacity-70"
                                                    }
                                                `}
                                            />

                                            <span>
                                                {item.name}
                                            </span>
                                        </>
                                    )}

                                </NavLink>

                            </li>

                        ))}

                    </ul>

                </nav>


                {/* =========================
                    BOTTOM NAVIGATION
                ========================= */}

                <div
                    className="
                        border-t
                        border-gray-100
                        px-3
                        py-4
                    "
                >

                    {/* Settings */}

                    <NavLink
                        to="/home/settings"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                            flex
                            items-center
                            gap-4

                            rounded-xl
                            px-4
                            py-3

                            text-[15px]
                            font-medium

                            transition-all
                            duration-200

                            ${isActive
                                ? "bg-green-50 text-green-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }
                        `}
                    >

                        <img
                            src={settingsIcon}
                            alt=""
                            className="h-5 w-5 opacity-70"
                        />

                        <span>
                            Settings
                        </span>

                    </NavLink>


                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
        mt-1
        flex
         w-full
        items-center
        gap-4

        rounded-xl
        px-4
        py-3

        text-[15px]
        font-medium
        text-gray-600

        transition-all
        duration-200

        hover:bg-red-50
        hover:text-red-600
    "
                    >
                        <img
                            src={logoutIcon}
                            alt=""
                            className="h-5 w-5 opacity-70"
                        />

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </aside>

        </>
    );
};

export default Sidebar;