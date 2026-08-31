import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo/logo-dark.svg";

const Footer = () => {
    return (
        <footer className="bg-[#080808] text-white">

            <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-16">

                {/* TOP */}
                <div
                    className="
                        grid gap-12
                        md:grid-cols-2
                        lg:grid-cols-[2fr_1fr_1fr_1fr]
                    "
                >

                    {/* BRAND */}
                    <div>

                        <Link to="/landing">
                            <img
                                src={logo}
                                alt="Leccy"
                                className="w-36"
                            />
                        </Link>

                        <p
                            className="
                                mt-6 max-w-sm
                                text-[15px]
                                leading-7
                                text-gray-400
                            "
                        >
                            Smart EV charging made effortless.
                            Find nearby stations, understand
                            availability, and charge with confidence.
                        </p>

                        <div className="mt-6 flex gap-3">

                            <span
                                className="
                                    rounded-full
                                    border border-white/10
                                    px-4 py-2
                                    text-xs
                                    text-gray-400
                                "
                            >
                                ⚡ Smart Charging
                            </span>

                            <span
                                className="
                                    rounded-full
                                    border border-white/10
                                    px-4 py-2
                                    text-xs
                                    text-gray-400
                                "
                            >
                                🌱 Electric Future
                            </span>

                        </div>

                    </div>

                    {/* PRODUCT */}
                    <FooterColumn title="Product">

                        <FooterLink to="/features">
                            Features
                        </FooterLink>

                        <FooterLink to="/pricing">
                            Pricing
                        </FooterLink>

                        <FooterLink to="/how-it-works">
                            How It Works
                        </FooterLink>

                    </FooterColumn>

                    {/* COMPANY */}
                    <FooterColumn title="Company">

                        <FooterLink to="/about">
                            About Us
                        </FooterLink>

                        <FooterLink to="/contact">
                            Contact
                        </FooterLink>

                    </FooterColumn>

                    {/* SUPPORT */}
                    <FooterColumn title="Support">

                        <FooterLink to="/contact">
                            Contact Support
                        </FooterLink>

                        <FooterLink to="/contact">
                            FAQs
                        </FooterLink>

                        <FooterLink to="/login">
                            Login
                        </FooterLink>

                    </FooterColumn>

                </div>

                {/* BOTTOM */}
                <div
                    className="
                        mt-14 flex
                        flex-col gap-5
                        border-t border-white/10
                        pt-7
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <p className="text-sm text-gray-500">
                        © 2026 Leccy. All rights reserved.
                    </p>

                    <div className="flex gap-6">

                        <a
                            href="#"
                            className="
                                text-sm text-gray-500
                                transition hover:text-green-500
                            "
                        >
                            Privacy
                        </a>

                        <a
                            href="#"
                            className="
                                text-sm text-gray-500
                                transition hover:text-green-500
                            "
                        >
                            Terms
                        </a>

                        <a
                            href="#"
                            className="
                                text-sm text-gray-500
                                transition hover:text-green-500
                            "
                        >
                            GitHub
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    );
};


/* =========================================
   FOOTER COLUMN
========================================= */

const FooterColumn = ({
    title,
    children,
}) => {
    return (
        <div>

            <h3 className="mb-5 text-sm font-semibold text-white">
                {title}
            </h3>

            <div className="flex flex-col gap-4">
                {children}
            </div>

        </div>
    );
};


/* =========================================
   FOOTER LINK
========================================= */

const FooterLink = ({
    to,
    children,
}) => {
    return (
        <Link
            to={to}
            className="
                text-sm text-gray-400
                transition-all duration-200
                hover:translate-x-1
                hover:text-green-500
            "
        >
            {children}
        </Link>
    );
};

export default Footer;