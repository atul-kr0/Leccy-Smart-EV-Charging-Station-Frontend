import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./pricing-page.css";


// ============================================================
// ICON
// ============================================================

const Icon = ({ name, className = "" }) => {

    const icons = {

        bolt: (
            <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),

        wallet: (
            <>
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H20a1 1 0 0 1 1 1.5V18a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 17.5v-10Z" />
                <path d="M3 8h16a2 2 0 0 1 2 2v1h-5a2 2 0 1 0 0 4h5v1" />
            </>
        ),

        charging: (
            <>
                <path d="M7 3h10v18H7z" />
                <path d="M10 7h4M10 11h4M10 15h4" />
                <path d="M17 7h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </>
        ),

        calculator: (
            <>
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
            </>
        ),

        shield: (
            <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
        ),

        station: (
            <>
                <path d="M7 3h9v18H7z" />
                <path d="M10 7h3M10 10h3M10 13h3" />
                <path d="M16 6h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
                <path d="M4 21h14" />
            </>
        ),

        location: (
            <>
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),

        info: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
            </>
        ),

    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {icons[name]}
        </svg>
    );
};


// ============================================================
// PRICING ITEMS
// ============================================================

const benefits = [
    {
        icon: "station",
        title: "Find charging stations",
        description:
            "Search nearby charging stations and compare their availability before you travel.",
    },
    {
        icon: "calculator",
        title: "See your estimated cost",
        description:
            "Set your current and target battery percentage to estimate the energy and charging cost.",
    },
    {
        icon: "location",
        title: "Choose based on what matters",
        description:
            "Compare distance, waiting time, charger availability, charging speed, and station price.",
    },
    {
        icon: "charging",
        title: "Track your charging",
        description:
            "Once charging starts, follow the session and see your progress and remaining time.",
    },
];


// ============================================================
// FAQ
// ============================================================

const faqs = [
    {
        question: "Does Leccy charge a subscription fee?",
        answer:
            "No. Leccy is designed as a free platform for drivers. You can search stations, compare options, manage bookings, and track charging without a Leccy subscription.",
    },
    {
        question: "How is my charging cost calculated?",
        answer:
            "The estimated cost is based on the energy required to move from your current battery percentage to your target percentage and the selected station's price per kWh.",
    },
    {
        question: "Is the price the same at every station?",
        answer:
            "No. Charging prices can differ between stations. Leccy displays the station's available price so you can compare your options before booking.",
    },
    {
        question: "Does a higher battery target cost more?",
        answer:
            "Yes. Charging from a lower battery percentage to a higher target generally requires more energy, so the estimated charging cost increases accordingly.",
    },
];


// ============================================================
// MAIN COMPONENT
// ============================================================

const Pricing = () => {

    const pageRef = useRef(null);


    // ========================================================
    // SCROLL REVEAL
    // ========================================================

    useEffect(() => {

        const elements =
            pageRef.current?.querySelectorAll(
                "[data-reveal]"
            ) || [];

        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );

                },
                {
                    threshold: 0.12,
                }
            );


        elements.forEach(
            (element) =>
                observer.observe(element)
        );


        return () =>
            observer.disconnect();

    }, []);


    return (
        <main
            ref={pageRef}
            className="pricing-page"
        >

            <Navbar />


            {/* ==================================================
                HERO
            ================================================== */}

            <section className="pricing-hero">

                <div className="pricing-grid" />

                <div className="pricing-glow pricing-glow-one" />

                <div className="pricing-glow pricing-glow-two" />


                <div className="pricing-shell pricing-hero-content">

                    <div
                        className="pricing-hero-copy"
                        data-reveal
                    >

                        <div className="pricing-eyebrow">

                            <Icon
                                name="bolt"
                                className="pricing-eyebrow-icon"
                            />

                            Simple & transparent
                        </div>


                        <h1>
                            Charging should be
                            <span>
                                clear before you pay.
                            </span>
                        </h1>


                        <p>
                            Leccy is free for drivers.
                            Compare stations, understand
                            charging costs, and choose the
                            option that works best for your
                            journey.
                        </p>


                        <div className="pricing-hero-actions">

                            <Link
                                to="/register"
                                className="pricing-primary-button"
                            >
                                Get started

                                <Icon
                                    name="arrow"
                                />
                            </Link>


                            <Link
                                to="/login"
                                className="pricing-secondary-button"
                            >
                                Log in
                            </Link>

                        </div>

                    </div>


                    {/* HERO PRICE CARD */}

                    <div
                        className="price-preview"
                        data-reveal
                    >

                        <div className="price-preview-top">

                            <div>
                                <span>
                                    YOUR CHARGING ESTIMATE
                                </span>

                                <strong>
                                    ₹187
                                </strong>

                                <small>
                                    Estimated cost
                                </small>
                            </div>


                            <div className="price-bolt">

                                <Icon
                                    name="bolt"
                                />

                            </div>

                        </div>


                        <div className="price-line">

                            <div>
                                <span>
                                    Current battery
                                </span>

                                <b>
                                    20%
                                </b>
                            </div>

                            <div>
                                <span>
                                    Target
                                </span>

                                <b>
                                    80%
                                </b>
                            </div>

                        </div>


                        <div className="price-progress">

                            <div className="price-progress-fill" />

                        </div>


                        <div className="price-preview-bottom">

                            <span>
                                Energy required
                            </span>

                            <b>
                                10.4 kWh
                            </b>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FREE SECTION
            ================================================== */}

            <section className="pricing-shell pricing-free-section">

                <div
                    className="free-card"
                    data-reveal
                >

                    <div className="free-card-main">

                        <div className="free-icon">

                            <Icon
                                name="wallet"
                            />

                        </div>


                        <div>

                            <div className="pricing-kicker">
                                FOR DRIVERS
                            </div>

                            <h2>
                                Leccy is free to use.
                            </h2>

                            <p>
                                No monthly plan. No driver
                                subscription. Just the tools
                                you need to find and manage
                                your EV charging.
                            </p>

                        </div>

                    </div>


                    <div className="free-badge">

                        <strong>
                            ₹0
                        </strong>

                        <span>
                            Leccy access
                        </span>

                    </div>

                </div>

            </section>


            {/* ==================================================
                WHAT YOU GET
            ================================================== */}

            <section className="pricing-shell pricing-benefits">

                <div
                    className="pricing-section-heading"
                    data-reveal
                >

                    <div className="pricing-kicker">
                        INCLUDED
                    </div>

                    <h2>
                        Everything you need to
                        plan a charge.
                    </h2>

                    <p>
                        Your Leccy account gives you
                        access to the core charging
                        experience without a subscription.
                    </p>

                </div>


                <div className="pricing-benefit-grid">

                    {benefits.map(
                        (
                            benefit,
                            index
                        ) => (

                            <article
                                key={
                                    benefit.title
                                }
                                className="pricing-benefit-card"
                                data-reveal
                                style={{
                                    transitionDelay:
                                        `${index * 70}ms`,
                                }}
                            >

                                <div className="benefit-icon">

                                    <Icon
                                        name={
                                            benefit.icon
                                        }
                                    />

                                </div>


                                <h3>
                                    {
                                        benefit.title
                                    }
                                </h3>


                                <p>
                                    {
                                        benefit.description
                                    }
                                </p>


                                <div className="benefit-check">

                                    <Icon
                                        name="check"
                                    />

                                    Included

                                </div>

                            </article>

                        )
                    )}

                </div>

            </section>


            {/* ==================================================
                HOW COST WORKS
            ================================================== */}

            <section className="pricing-explainer">

                <div className="pricing-shell">

                    <div
                        className="pricing-section-heading pricing-dark-heading"
                        data-reveal
                    >

                        <div className="pricing-kicker">
                            HOW CHARGING COST WORKS
                        </div>

                        <h2>
                            Know the estimate
                            before you book.
                        </h2>

                        <p>
                            Leccy uses your battery target
                            and the station's price to give
                            you a clearer idea of what the
                            charging session may cost.
                        </p>

                    </div>


                    <div className="cost-flow">

                        <div
                            className="cost-step"
                            data-reveal
                        >

                            <div className="cost-number">
                                01
                            </div>

                            <div className="cost-icon">

                                <Icon
                                    name="charging"
                                />

                            </div>

                            <h3>
                                Set your battery target
                            </h3>

                            <p>
                                Enter your current battery
                                percentage and how much you
                                want to charge.
                            </p>

                        </div>


                        <div className="cost-connector" />


                        <div
                            className="cost-step"
                            data-reveal
                        >

                            <div className="cost-number">
                                02
                            </div>

                            <div className="cost-icon">

                                <Icon
                                    name="station"
                                />

                            </div>

                            <h3>
                                Choose a station
                            </h3>

                            <p>
                                Compare available chargers,
                                waiting time and the station's
                                price per kWh.
                            </p>

                        </div>


                        <div className="cost-connector" />


                        <div
                            className="cost-step"
                            data-reveal
                        >

                            <div className="cost-number">
                                03
                            </div>

                            <div className="cost-icon">

                                <Icon
                                    name="calculator"
                                />

                            </div>

                            <h3>
                                See your estimate
                            </h3>

                            <p>
                                Leccy calculates an estimated
                                energy requirement and charging
                                cost before you confirm.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                TRANSPARENCY
            ================================================== */}

            <section className="pricing-shell pricing-transparency">

                <div
                    className="transparency-card"
                    data-reveal
                >

                    <div className="transparency-icon">

                        <Icon
                            name="shield"
                        />

                    </div>


                    <div>

                        <div className="pricing-kicker">
                            TRANSPARENT BY DESIGN
                        </div>

                        <h2>
                            The station sets the
                            charging price.
                        </h2>

                        <p>
                            Charging prices are station-specific.
                            Leccy displays the available price per
                            kWh so you can compare your options
                            instead of discovering the price after
                            you arrive.
                        </p>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FAQ
            ================================================== */}

            <section className="pricing-shell pricing-faq">

                <div
                    className="pricing-section-heading"
                    data-reveal
                >

                    <div className="pricing-kicker">
                        QUESTIONS
                    </div>

                    <h2>
                        Pricing, without the
                        confusing bits.
                    </h2>

                </div>


                <div className="faq-list">

                    {faqs.map(
                        (
                            faq,
                            index
                        ) => (

                            <article
                                key={
                                    faq.question
                                }
                                className="faq-item"
                                data-reveal
                                style={{
                                    transitionDelay:
                                        `${index * 60}ms`,
                                }}
                            >

                                <div className="faq-icon">

                                    <Icon
                                        name="info"
                                    />

                                </div>


                                <div>

                                    <h3>
                                        {
                                            faq.question
                                        }
                                    </h3>

                                    <p>
                                        {
                                            faq.answer
                                        }
                                    </p>

                                </div>

                            </article>

                        )
                    )}

                </div>

            </section>


            {/* ==================================================
                CTA
            ================================================== */}

            <section className="pricing-shell pricing-cta-section">

                <div
                    className="pricing-cta"
                    data-reveal
                >

                    <div className="pricing-cta-glow" />

                    <div className="relative z-10">

                        <div className="pricing-eyebrow">

                            <Icon
                                name="bolt"
                            />

                            Ready to charge smarter?

                        </div>


                        <h2>
                            Find a charger that
                            fits your journey.
                        </h2>


                        <p>
                            Search stations, compare
                            availability and understand
                            your estimated charging cost.
                        </p>

                    </div>


                    <div className="pricing-cta-actions">

                        <Link
                            to="/register"
                            className="pricing-primary-button"
                        >
                            Create account

                            <Icon
                                name="arrow"
                            />
                        </Link>


                        <Link
                            to="/login"
                            className="pricing-text-link"
                        >
                            Already registered? Log in
                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
};


export default Pricing;