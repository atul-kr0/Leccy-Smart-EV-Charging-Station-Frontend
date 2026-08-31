import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./about.css";

const Icon = ({ name, className = "" }) => {

    const icons = {

        bolt: (
            <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),

        charger: (
            <>
                <path d="M7 3h10v18H7z" />
                <path d="M10 7h4M10 11h4M10 15h4" />
                <path d="M17 7h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </>
        ),

        route: (
            <>
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <path d="M8 18c5 0 1-7 8-12" />
            </>
        ),

        users: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
                <path d="M16 4a3 3 0 0 1 0 6M18 21v-2a5 5 0 0 0-3-4.6" />
            </>
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),

        code: (
            <>
                <path d="m8 9-4 3 4 3" />
                <path d="m16 9 4 3-4 3" />
                <path d="m14 5-4 14" />
            </>
        ),

        target: (
            <>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" />
            </>
        ),

        leaf: (
            <>
                <path d="M20 4C10 4 5 8 5 15c0 3 2 5 5 5 7 0 10-6 10-16Z" />
                <path d="M4 20c3-5 7-8 12-10" />
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


const About = () => {

    const pageRef = useRef(null);


    useEffect(() => {

        const elements =
            pageRef.current?.querySelectorAll(
                "[data-reveal]"
            ) || [];

        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

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

                    });

                },
                {
                    threshold: 0.12,
                }
            );


        elements.forEach((element) => {

            observer.observe(element);

        });


        return () =>
            observer.disconnect();

    }, []);


    return (

        <main
            ref={pageRef}
            className="about-page"
        >

            <Navbar />


            {/* ==================================================
                HERO
            ================================================== */}

            <section className="about-hero">

                <div className="about-grid" />

                <div className="about-glow about-glow-one" />

                <div className="about-glow about-glow-two" />


                <div className="about-shell about-hero-inner">

                    <div
                        className="about-hero-copy"
                        data-reveal
                    >

                        <p className="about-eyebrow">

                            <Icon name="bolt" />

                            ABOUT LECCY

                        </p>


                        <h1>

                            Charging should
                            <span>
                                just make sense.
                            </span>

                        </h1>


                        <p className="about-hero-text">

                            Leccy is an EV charging platform
                            designed to make finding,
                            comparing, booking and tracking
                            charging stations easier for
                            everyday EV drivers.

                        </p>


                        <div className="about-actions">

                            <Link
                                to="/register"
                                className="about-primary"
                            >

                                Get started

                                <Icon name="arrow" />

                            </Link>


                            <Link
                                to="/how-it-works"
                                className="about-secondary"
                            >

                                How Leccy works

                            </Link>

                        </div>

                    </div>


                    {/* HERO VISUAL */}

                    <div
                        className="about-hero-visual"
                        data-reveal
                    >

                        <div className="orbit orbit-one" />
                        <div className="orbit orbit-two" />


                        <div className="about-center-logo">

                            <Icon name="bolt" />

                        </div>


                        <div className="orbit-card card-search">

                            <Icon name="search" />

                            <div>
                                <strong>
                                    Find
                                </strong>

                                <span>
                                    nearby stations
                                </span>
                            </div>

                        </div>


                        <div className="orbit-card card-book">

                            <Icon name="charger" />

                            <div>
                                <strong>
                                    Book
                                </strong>

                                <span>
                                    your charger
                                </span>
                            </div>

                        </div>


                        <div className="orbit-card card-track">

                            <Icon name="bolt" />

                            <div>
                                <strong>
                                    Track
                                </strong>

                                <span>
                                    your session
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                INTRO
            ================================================== */}

            <section className="about-shell about-intro">

                <div
                    className="about-intro-label"
                    data-reveal
                >

                    <span>
                        THE IDEA
                    </span>

                    <div />

                </div>


                <div
                    className="about-intro-content"
                    data-reveal
                >

                    <h2>

                        EV charging is
                        <span>
                            more than plugging in.
                        </span>

                    </h2>


                    <p>

                        The difficult part isn't always
                        charging the vehicle. It is finding
                        the right charger, knowing whether
                        it is available, understanding the
                        expected wait, checking compatibility
                        and deciding whether it fits your
                        needs.

                    </p>


                    <p>

                        Leccy brings those decisions into
                        one place so drivers can make a
                        better choice before they arrive
                        at the station.

                    </p>

                </div>

            </section>


            {/* ==================================================
                WHY LECCY
            ================================================== */}

            <section className="why-section">

                <div className="about-shell">

                    <div
                        className="about-section-heading"
                        data-reveal
                    >

                        <p className="about-kicker">
                            WHY LECCY
                        </p>

                        <h2>
                            Built around the
                            driver's decision.
                        </h2>

                        <p>
                            Instead of treating charging
                            as a single action, Leccy
                            looks at the complete journey.
                        </p>

                    </div>


                    <div className="why-grid">


                        <article
                            className="why-card"
                            data-reveal
                        >

                            <div className="why-icon">

                                <Icon name="search" />

                            </div>

                            <span>
                                01
                            </span>

                            <h3>
                                Discover
                            </h3>

                            <p>
                                Find charging stations
                                based on where you are
                                and where you need to go.
                            </p>

                        </article>


                        <article
                            className="why-card"
                            data-reveal
                        >

                            <div className="why-icon">

                                <Icon name="target" />

                            </div>

                            <span>
                                02
                            </span>

                            <h3>
                                Decide
                            </h3>

                            <p>
                                Compare important factors
                                such as availability,
                                waiting time, compatibility
                                and price.
                            </p>

                        </article>


                        <article
                            className="why-card"
                            data-reveal
                        >

                            <div className="why-icon">

                                <Icon name="route" />

                            </div>

                            <span>
                                03
                            </span>

                            <h3>
                                Plan
                            </h3>

                            <p>
                                Book a suitable charger or
                                join a queue when the
                                preferred charger is busy.
                            </p>

                        </article>


                        <article
                            className="why-card"
                            data-reveal
                        >

                            <div className="why-icon">

                                <Icon name="bolt" />

                            </div>

                            <span>
                                04
                            </span>

                            <h3>
                                Charge
                            </h3>

                            <p>
                                Check in, start your session
                                and keep track of charging
                                progress until you're done.
                            </p>

                        </article>


                    </div>

                </div>

            </section>


            {/* ==================================================
                MISSION
            ================================================== */}

            <section className="mission-section">

                <div className="about-shell mission-inner">


                    <div
                        className="mission-visual"
                        data-reveal
                    >

                        <div className="mission-circle">

                            <Icon name="leaf" />

                        </div>


                        <div className="mission-ring ring-a" />
                        <div className="mission-ring ring-b" />


                        <span className="mission-dot dot-a" />
                        <span className="mission-dot dot-b" />
                        <span className="mission-dot dot-c" />

                    </div>


                    <div
                        className="mission-copy"
                        data-reveal
                    >

                        <p className="about-kicker">
                            OUR APPROACH
                        </p>


                        <h2>
                            Make the
                            <span>
                                better choice
                            </span>
                            easier.
                        </h2>


                        <p>

                            Leccy isn't about adding more
                            complexity to EV charging.
                            It is about presenting the
                            information drivers actually
                            need at the right time.

                        </p>


                        <p>

                            From the first station search
                            to the end of a charging
                            session, every part of the
                            experience is designed around
                            clarity and simplicity.

                        </p>


                        <div className="mission-list">

                            <div>

                                <Icon name="check" />

                                <span>
                                    Clear station information
                                </span>

                            </div>


                            <div>

                                <Icon name="check" />

                                <span>
                                    Practical charging decisions
                                </span>

                            </div>


                            <div>

                                <Icon name="check" />

                                <span>
                                    One connected charging journey
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                SYSTEM
            ================================================== */}

            <section className="system-section">

                <div className="about-shell">

                    <div
                        className="about-section-heading"
                        data-reveal
                    >

                        <p className="about-kicker">
                            ONE CONNECTED SYSTEM
                        </p>

                        <h2>
                            Everything works
                            together.
                        </h2>

                        <p>
                            Leccy connects the different
                            parts of an EV charging journey
                            instead of making the driver
                            manage them separately.
                        </p>

                    </div>


                    <div
                        className="system-flow"
                        data-reveal
                    >

                        <div className="system-item">

                            <div>
                                <Icon name="search" />
                            </div>

                            <span>
                                Discover
                            </span>

                        </div>


                        <i />


                        <div className="system-item">

                            <div>
                                <Icon name="target" />
                            </div>

                            <span>
                                Compare
                            </span>

                        </div>


                        <i />


                        <div className="system-item">

                            <div>
                                <Icon name="calendar" />
                            </div>

                            <span>
                                Book
                            </span>

                        </div>


                        <i />


                        <div className="system-item">

                            <div>
                                <Icon name="ticket" />
                            </div>

                            <span>
                                Check in
                            </span>

                        </div>


                        <i />


                        <div className="system-item">

                            <div>
                                <Icon name="bolt" />
                            </div>

                            <span>
                                Charge
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                PROJECT / TECHNOLOGY
            ================================================== */}

            <section className="project-section">

                <div className="about-shell project-inner">


                    <div
                        className="project-copy"
                        data-reveal
                    >

                        <p className="about-kicker">
                            THE PROJECT
                        </p>


                        <h2>
                            Built as a
                            <span>
                                real application.
                            </span>
                        </h2>


                        <p>

                            Leccy is built as a full-stack
                            EV charging platform, connecting
                            a modern web interface with
                            backend services and data.

                        </p>


                        <p>

                            The project focuses on turning
                            a real-world EV charging problem
                            into a practical software system
                            with authentication, vehicle
                            management, station discovery,
                            booking and charging-session
                            workflows.

                        </p>

                    </div>


                    <div
                        className="tech-card"
                        data-reveal
                    >

                        <div className="tech-card-header">

                            <Icon name="code" />

                            <span>
                                LECCY SYSTEM
                            </span>

                        </div>


                        <div className="tech-row">

                            <span>
                                Frontend
                            </span>

                            <strong>
                                React
                            </strong>

                        </div>


                        <div className="tech-row">

                            <span>
                                Styling
                            </span>

                            <strong>
                                Tailwind CSS
                            </strong>

                        </div>


                        <div className="tech-row">

                            <span>
                                Backend
                            </span>

                            <strong>
                                Spring Boot
                            </strong>

                        </div>


                        <div className="tech-row">

                            <span>
                                API
                            </span>

                            <strong>
                                REST
                            </strong>

                        </div>


                        <div className="tech-row">

                            <span>
                                Authentication
                            </span>

                            <strong>
                                JWT
                            </strong>

                        </div>


                        <div className="tech-row">

                            <span>
                                Maps
                            </span>

                            <strong>
                                MapLibre
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                VALUES
            ================================================== */}

            <section className="values-section">

                <div className="about-shell">

                    <div
                        className="about-section-heading"
                        data-reveal
                    >

                        <p className="about-kicker">
                            WHAT MATTERS
                        </p>

                        <h2>
                            Simple principles.
                        </h2>

                    </div>


                    <div className="values-grid">


                        <div
                            className="value"
                            data-reveal
                        >

                            <strong>
                                01
                            </strong>

                            <h3>
                                Clarity
                            </h3>

                            <p>
                                Give drivers the information
                                they need without making the
                                experience overwhelming.
                            </p>

                        </div>


                        <div
                            className="value"
                            data-reveal
                        >

                            <strong>
                                02
                            </strong>

                            <h3>
                                Practicality
                            </h3>

                            <p>
                                Focus on useful decisions
                                that actually matter during
                                a charging journey.
                            </p>

                        </div>


                        <div
                            className="value"
                            data-reveal
                        >

                            <strong>
                                03
                            </strong>

                            <h3>
                                Simplicity
                            </h3>

                            <p>
                                Keep the path from finding
                                a charger to charging as
                                straightforward as possible.
                            </p>

                        </div>


                    </div>

                </div>

            </section>


            {/* ==================================================
                CTA
            ================================================== */}

            <section className="about-shell about-cta-section">

                <div
                    className="about-cta"
                    data-reveal
                >

                    <div className="about-cta-glow" />


                    <div className="relative z-10">

                        <p className="about-eyebrow">

                            <Icon name="bolt" />

                            START WITH LECCY

                        </p>


                        <h2>
                            Ready to make charging simpler?
                        </h2>


                        <p>
                            Create your account and start
                            exploring the Leccy charging
                            experience.
                        </p>

                    </div>


                    <div
                        className="
                            relative
                            z-10
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                        "
                    >

                        <Link
                            to="/register"
                            className="about-primary"
                        >

                            Create account

                            <Icon name="arrow" />

                        </Link>


                        <Link
                            to="/how-it-works"
                            className="about-secondary"
                        >

                            See how it works

                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
};


export default About;