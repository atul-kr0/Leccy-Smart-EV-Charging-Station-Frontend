import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo-bright.svg";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/landing" },
        { name: "Features", path: "/features" },
        { name: "How It Works", path: "/how-it-works" },
        { name: "Pricing", path: "/pricing" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-[100] h-[82px] border-b border-gray-200 bg-white">

            <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-7 lg:px-16">

                {/* LOGO */}
                <Link
                    to="/landing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center"
                >
                    <img
                        src={logo}
                        alt="Leccy"
                        className="h-[52px] w-auto lg:h-[58px]"
                    />
                </Link>


                {/* DESKTOP NAVIGATION */}
                <ul className="hidden h-full items-center gap-8 xl:gap-10 lg:flex">

                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        return (
                            <li
                                key={item.path}
                                className="relative flex h-full items-center"
                            >

                                <Link
                                    to={item.path}
                                    className={`
                                        relative flex h-full items-center
                                        text-[16px] font-medium
                                        transition-colors duration-300
                                        xl:text-[17px]
                                        ${active
                                            ? "text-green-600"
                                            : "text-gray-900 hover:text-green-600"
                                        }
                                    `}
                                >

                                    {item.name}

                                    {/* ACTIVE INDICATOR */}
                                    <span
                                        className={`
                                            absolute
                                            bottom-[13px]
                                            left-0
                                            h-[2px]
                                            rounded-full
                                            bg-green-600
                                            transition-all
                                            duration-300
                                            ${active
                                                ? "w-full"
                                                : "w-0"
                                            }
                                        `}
                                    />

                                </Link>

                            </li>
                        );
                    })}

                </ul>


                {/* DESKTOP AUTH */}
                <div className="hidden items-center gap-5 lg:flex">

                    <Link
                        to="/login"
                        className="
                            rounded-xl
                            px-5 py-3
                            text-[16px]
                            font-medium
                            text-gray-900
                            transition
                            hover:bg-gray-100
                        "
                    >
                        Log In
                    </Link>

                    <Link
                        to="/register"
                        className="
                            rounded-xl
                            bg-green-600
                            px-7 py-3.5
                            text-[16px]
                            font-semibold
                            text-white
                            shadow-[0_8px_25px_rgba(22,163,74,0.22)]
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-green-500
                            hover:shadow-[0_12px_30px_rgba(22,163,74,0.32)]
                        "
                    >
                        Sign Up
                    </Link>

                </div>


                {/* MOBILE BUTTON */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-xl
                        text-gray-900
                        transition
                        hover:bg-gray-100
                        lg:hidden
                    "
                    aria-label="Toggle navigation"
                >

                    {menuOpen ? (
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M6 6l12 12" />
                            <path d="M18 6 6 18" />
                        </svg>
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M4 7h16" />
                            <path d="M4 12h16" />
                            <path d="M4 17h16" />
                        </svg>
                    )}

                </button>

            </div>


            {/* MOBILE MENU */}
            <div
                className={`
                    absolute left-0 top-[82px]
                    w-full
                    border-b border-gray-200
                    bg-white
                    shadow-xl
                    transition-all duration-300
                    lg:hidden
                    ${menuOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-3 opacity-0"
                    }
                `}
            >

                <div className="px-6 py-5">

                    <div className="flex flex-col">

                        {navItems.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMenuOpen(false)}
                                    className={`
                                        flex items-center
                                        justify-between
                                        border-b border-gray-100
                                        py-4
                                        text-[16px]
                                        font-medium
                                        transition
                                        ${active
                                            ? "text-green-600"
                                            : "text-gray-900"
                                        }
                                    `}
                                >

                                    {item.name}

                                    {active && (
                                        <span className="h-2 w-2 rounded-full bg-green-600" />
                                    )}

                                </Link>
                            );
                        })}

                    </div>


                    {/* MOBILE AUTH */}
                    <div className="mt-6 flex gap-3">

                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="
                                flex-1
                                rounded-xl
                                border border-gray-300
                                px-5 py-3
                                text-center
                                text-[16px]
                                font-medium
                                text-gray-900
                            "
                        >
                            Log In
                        </Link>

                        <Link
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="
                                flex-1
                                rounded-xl
                                bg-green-600
                                px-5 py-3
                                text-center
                                text-[16px]
                                font-semibold
                                text-white
                            "
                        >
                            Sign Up
                        </Link>

                    </div>

                </div>

            </div>

        </nav>
    );
};

export default Navbar;