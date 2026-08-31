import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./how-it-works-page.css";

/* =========================================================
   ICONS
========================================================= */

const Icon = ({ name, className = "" }) => {
    const icons = {
        bolt: (
            <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        ),

        location: (
            <>
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 5 5" />
            </>
        ),

        compare: (
            <>
                <path d="M6 19V9" />
                <path d="M12 19V5" />
                <path d="M18 19v-7" />
                <path d="M4 19h16" />
            </>
        ),

        ticket: (
            <path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V7Zm6 3h4m-4 4h4" />
        ),

        car: (
            <>
                <path d="m5 11 2-5h10l2 5" />
                <path d="M3 11h18v6H3z" />
                <circle cx="7" cy="17" r="1.5" />
                <circle cx="17" cy="17" r="1.5" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
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


/* =========================================================
   STEPS
========================================================= */

const steps = [
    {
        number: "01",
        icon: "car",
        title: "Add your vehicle",
        text: "Save your EV details and charging preferences so Leccy can provide more relevant charging options.",
    },
    {
        number: "02",
        icon: "location",
        title: "Find a station",
        text: "Search nearby charging stations or use your current location to discover available options.",
    },
    {
        number: "03",
        icon: "compare",
        title: "Compare stations",
        text: "Check distance, charger availability, estimated waiting time, compatibility, and pricing.",
    },
    {
        number: "04",
        icon: "ticket",
        title: "Book or join the queue",
        text: "Reserve a suitable charger or join the queue when the available chargers are busy.",
    },
    {
        number: "05",
        icon: "bolt",
        title: "Check in & charge",
        text: "Use your digital token at the station, check in, and start your charging session.",
    },
    {
        number: "06",
        icon: "clock",
        title: "Track your session",
        text: "Follow your charging progress and session information until your vehicle is ready.",
    },
];


/* =========================================================
   COMPONENT
========================================================= */

const HowItWorks = () => {

    const pageRef = useRef(null);

    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    useEffect(() => {

        const elements =
            pageRef.current?.querySelectorAll("[data-reveal]") || [];

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                    }

                });

            },
            {
                threshold: 0.12,
            }
        );

        elements.forEach((element) => {
            observer.observe(element);
        });

        return () => observer.disconnect();

    }, []);


    return (
        <main
            ref={pageRef}
            className="how-page"
        >

            <Navbar />


            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="how-hero">

                <div className="how-grid" />

                <div className="how-glow how-glow-one" />
                <div className="how-glow how-glow-two" />


                <div className="how-shell how-hero-inner">

                    {/* LEFT */}

                    <div
                        className="how-hero-copy"
                        data-reveal
                    >

                        <div className="how-eyebrow">
                            <Icon name="bolt" />
                            HOW LECCY WORKS
                        </div>


                        <h1>
                            From searching
                            <span>to charging.</span>
                        </h1>


                        <p>
                            Finding an EV charger shouldn't be complicated.
                            Leccy guides you through the entire charging
                            journey in a few simple steps.
                        </p>


                        <div className="how-hero-actions">

                            <Link
                                to="/register"
                                className="how-primary-button"
                            >
                                Get started
                                <Icon name="arrow" />
                            </Link>


                            <a
                                href="#steps"
                                className="how-secondary-button"
                            >
                                See how it works
                                <span>↓</span>
                            </a>

                        </div>

                    </div>


                    {/* =================================================
                        ROUTE DIAGRAM
                    ================================================= */}

                    <div
                        className="how-route-card"
                        data-reveal
                    >

                        <div className="route-title">
                            <span>YOUR CHARGING JOURNEY</span>
                            <small>Simple. Clear. Connected.</small>
                        </div>


                        {/* Connecting path */}

                        <svg
                            className="route-path"
                            viewBox="0 0 460 330"
                            preserveAspectRatio="none"
                        >

                            <path
                                d="
                                    M 100 65
                                    C 180 65, 180 115, 280 115
                                    C 370 115, 370 165, 280 165
                                    C 180 165, 180 215, 100 215
                                    C 190 215, 190 275, 285 275
                                "
                            />

                        </svg>


                        {/* FIND */}

                        <div className="route-step route-step-find">

                            <div className="route-icon">
                                <Icon name="search" />
                            </div>

                            <div className="route-text">
                                <strong>Find</strong>
                                <span>Nearby stations</span>
                            </div>

                        </div>


                        {/* COMPARE */}

                        <div className="route-step route-step-compare">

                            <div className="route-icon">
                                <Icon name="compare" />
                            </div>

                            <div className="route-text">
                                <strong>Compare</strong>
                                <span>Check availability</span>
                            </div>

                        </div>


                        {/* BOOK */}

                        <div className="route-step route-step-book">

                            <div className="route-icon">
                                <Icon name="ticket" />
                            </div>

                            <div className="route-text">
                                <strong>Book</strong>
                                <span>Reserve your slot</span>
                            </div>

                        </div>


                        {/* CHARGE */}

                        <div className="route-step route-step-charge">

                            <div className="route-charge-icon">
                                <Icon name="bolt" />
                            </div>

                            <div className="route-text route-charge-text">
                                <strong>Charge</strong>
                                <span>Plug in & go</span>
                            </div>

                        </div>


                        <div className="route-status">
                            <span className="status-live-dot" />
                            Charging journey connected
                        </div>

                    </div>

                </div>

            </section>



            {/* =====================================================
                INTRO
            ===================================================== */}

            <section className="how-intro">

                <div
                    className="how-shell"
                    data-reveal
                >

                    <div className="how-intro-number">
                        01
                    </div>

                    <div>

                        <p className="how-section-label">
                            THE PROCESS
                        </p>

                        <h2>
                            One simple journey.
                            <span>Six clear steps.</span>
                        </h2>

                        <p className="how-intro-text">
                            Leccy brings together station discovery,
                            charger availability, booking, queue
                            management, and charging tracking into
                            one straightforward experience.
                        </p>

                    </div>

                </div>

            </section>



            {/* =====================================================
                STEPS
            ===================================================== */}

            <section
                id="steps"
                className="how-steps-section"
            >

                <div className="how-shell">

                    <div
                        className="how-section-heading"
                        data-reveal
                    >

                        <p className="how-section-label">
                            HOW IT WORKS
                        </p>

                        <h2>
                            Everything happens
                            <span>in one place.</span>
                        </h2>

                        <p>
                            No guessing. No unnecessary steps.
                            Just a clear path from finding a charger
                            to finishing your session.
                        </p>

                    </div>


                    <div className="how-steps-grid">

                        {steps.map((step, index) => (

                            <article
                                key={step.number}
                                className="how-step-card"
                                data-reveal
                                style={{
                                    transitionDelay:
                                        `${index * 80}ms`,
                                }}
                            >

                                <div className="step-top">

                                    <span className="step-number">
                                        {step.number}
                                    </span>

                                    <div className="step-icon">
                                        <Icon name={step.icon} />
                                    </div>

                                </div>


                                <h3>
                                    {step.title}
                                </h3>


                                <p>
                                    {step.text}
                                </p>


                                {index < steps.length - 1 && (
                                    <div className="step-arrow">
                                        →
                                    </div>
                                )}

                            </article>

                        ))}

                    </div>

                </div>

            </section>



            {/* =====================================================
                EXPERIENCE STRIP
            ===================================================== */}

            <section className="how-experience">

                <div className="how-shell">

                    <div
                        className="experience-card"
                        data-reveal
                    >

                        <div className="experience-copy">

                            <p className="how-section-label">
                                BUILT AROUND THE DRIVER
                            </p>

                            <h2>
                                Less waiting.
                                <span>More certainty.</span>
                            </h2>

                            <p>
                                Leccy is designed to give drivers the
                                information they need before they reach
                                the station—and keep them informed while
                                they charge.
                            </p>

                        </div>


                        <div className="experience-points">

                            <div>
                                <div className="experience-icon">
                                    <Icon name="location" />
                                </div>

                                <span>
                                    Find nearby stations
                                </span>
                            </div>


                            <div>
                                <div className="experience-icon">
                                    <Icon name="clock" />
                                </div>

                                <span>
                                    Understand waiting time
                                </span>
                            </div>


                            <div>
                                <div className="experience-icon">
                                    <Icon name="check" />
                                </div>

                                <span>
                                    Know your charging status
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>



            {/* =====================================================
                CTA
            ===================================================== */}

            <section className="how-cta-section">

                <div className="how-shell">

                    <div
                        className="how-cta"
                        data-reveal
                    >

                        <div className="how-cta-glow" />

                        <div className="how-cta-content">

                            <p className="how-eyebrow">
                                <Icon name="bolt" />
                                READY TO CHARGE?
                            </p>

                            <h2>
                                Your next charge
                                <span>starts here.</span>
                            </h2>

                            <p>
                                Find a station, compare your options,
                                and make charging a little easier with
                                Leccy.
                            </p>

                        </div>


                        <div className="how-cta-actions">

                            <Link
                                to="/register"
                                className="how-primary-button"
                            >
                                Get started
                                <Icon name="arrow" />
                            </Link>


                            <Link
                                to="/features"
                                className="how-cta-link"
                            >
                                Explore features →
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
};

export default HowItWorks;