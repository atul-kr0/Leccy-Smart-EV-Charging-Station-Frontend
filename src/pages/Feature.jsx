import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./feature-page.css";

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

        map: (
            <>
                <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                <path d="M9 3v15M15 6v15" />
            </>
        ),

        charger: (
            <>
                <path d="M7 3h10v18H7z" />
                <path d="M10 7h4M10 11h4M10 15h4" />
                <path d="M17 7h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        calendar: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 9h18" />
                <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
            </>
        ),

        ticket: (
            <path d="M4 5h16v4a2 2 0 0 0 0 6v4H4v-4a2 2 0 0 0 0-6V5Zm5 4h6m-6 4h6" />
        ),

        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </>
        ),

        battery: (
            <>
                <rect x="3" y="7" width="17" height="10" rx="2" />
                <path d="M21 10v4" />
                <path d="M7 10v4M11 10v4M15 10v4" />
            </>
        ),

        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        location: (
            <>
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
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


const features = [
    {
        number: "01",
        icon: "search",
        tone: "lime",
        title: "Find Nearby Chargers",
        description:
            "Search for EV charging stations around you and quickly see which locations are available for your journey.",
        visual: (
            <div className="feature-search-visual">
                <div className="fake-search">
                    <Icon name="location" />
                    <span>Search charging station...</span>
                </div>

                <div className="search-results">
                    <div>
                        <i />
                        <span>GreenVolt Hub</span>
                        <b>1.2 km</b>
                    </div>

                    <div>
                        <i />
                        <span>EV Power Station</span>
                        <b>2.4 km</b>
                    </div>
                </div>
            </div>
        ),
    },

    {
        number: "02",
        icon: "map",
        tone: "blue",
        title: "Interactive Station Map",
        description:
            "Explore charging stations directly on the map and select a location to view its details.",
        visual: (
            <div className="feature-map-visual">
                <div className="fake-map-grid" />

                <span className="map-pin pin-one">⚡</span>
                <span className="map-pin pin-two">⚡</span>
                <span className="map-pin pin-three">⚡</span>

                <div className="map-location-card">
                    <strong>EV Charging Station</strong>
                    <small>3 available · 1 busy</small>
                </div>
            </div>
        ),
    },

    {
        number: "03",
        icon: "charger",
        tone: "violet",
        title: "Real-Time Charger Status",
        description:
            "Check charger availability before heading to a station, including available, busy, and unavailable chargers.",
        visual: (
            <div className="charger-status-visual">
                <div className="charger-status available-status">
                    <i />
                    <span>Available</span>
                    <b>3</b>
                </div>

                <div className="charger-status busy-status">
                    <i />
                    <span>Busy</span>
                    <b>2</b>
                </div>

                <div className="charger-status offline-status">
                    <i />
                    <span>Offline</span>
                    <b>1</b>
                </div>
            </div>
        ),
    },

    {
        number: "04",
        icon: "clock",
        tone: "amber",
        title: "Queue Management",
        description:
            "When all suitable chargers are occupied, join a digital queue and see your position and estimated waiting time.",
        visual: (
            <div className="queue-visual">
                <span>YOUR QUEUE POSITION</span>

                <strong>#03</strong>

                <div className="queue-line">
                    <div />
                </div>

                <small>
                    Estimated wait · <b>18 min</b>
                </small>
            </div>
        ),
    },

    {
        number: "05",
        icon: "calendar",
        tone: "green",
        title: "Charger Booking",
        description:
            "Reserve a compatible charger in advance instead of arriving at a station without knowing whether a charger will be available.",
        visual: (
            <div className="booking-visual">
                <div className="booking-date">
                    <span>JUN</span>
                    <strong>24</strong>
                </div>

                <div>
                    <span>Charging slot</span>
                    <b>10:30 PM</b>
                    <small>TYPE2 · 22 kW</small>
                </div>

                <Icon name="check" />
            </div>
        ),
    },

    {
        number: "06",
        icon: "ticket",
        tone: "rose",
        title: "Digital Token",
        description:
            "Bookings and queues can be associated with a digital token so your charging session is easier to manage.",
        visual: (
            <div className="token-visual">
                <span>LECCY · DIGITAL TOKEN</span>

                <strong>7268 1492</strong>

                <small>
                    Your charging reference
                </small>
            </div>
        ),
    },

    {
        number: "07",
        icon: "battery",
        tone: "lime",
        title: "Charging Progress",
        description:
            "Track your charging session and keep an eye on the battery progress while your vehicle is connected.",
        visual: (
            <div className="charging-visual">

                <div className="charging-ring">
                    <strong>
                        68
                        <small>%</small>
                    </strong>
                </div>

                <div className="charging-info">
                    <b>Charging</b>
                    <span>24 min remaining</span>
                </div>

            </div>
        ),
    },

    {
        number: "08",
        icon: "bell",
        tone: "blue",
        title: "Smart Notifications",
        description:
            "Stay informed about booking confirmations, queue updates, charger readiness, and charging session changes.",
        visual: (
            <div className="notification-visual">

                <div>
                    <i>✓</i>
                    <span>Booking confirmed</span>
                </div>

                <div>
                    <i>⚡</i>
                    <span>Charger ready</span>
                </div>

                <div>
                    <i>✓</i>
                    <span>Charging completed</span>
                </div>

            </div>
        ),
    },
];


const steps = [
    {
        number: "01",
        title: "Search",
        description:
            "Find charging stations using your location or search for a specific area.",
    },

    {
        number: "02",
        title: "Compare",
        description:
            "Check station distance, charger availability, compatibility, price and waiting time.",
    },

    {
        number: "03",
        title: "Choose",
        description:
            "Select the station and charger that best fits your charging needs.",
    },

    {
        number: "04",
        title: "Book",
        description:
            "Reserve an available charger or join the queue when chargers are busy.",
    },

    {
        number: "05",
        title: "Check In",
        description:
            "Use your booking or digital token when you arrive at the station.",
    },

    {
        number: "06",
        title: "Charge",
        description:
            "Start your session and track the charging progress until you're ready to go.",
    },
];


const Feature = () => {

    const pageRef = useRef(null);


    useEffect(() => {

        const elements =
            pageRef.current?.querySelectorAll(
                "[data-reveal]"
            ) || [];

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

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


        return () => observer.disconnect();

    }, []);


    return (
        <main
            ref={pageRef}
            className="feature-page"
        >

            <Navbar />


            {/* ==================================================
                HERO
            ================================================== */}

            <section className="feature-hero">

                <div className="feature-grid" />

                <div className="feature-orb feature-orb-one" />

                <div className="feature-orb feature-orb-two" />


                <div className="feature-shell feature-hero-inner">

                    <div
                        className="feature-hero-copy"
                        data-reveal
                    >

                        <p className="eyebrow">

                            <Icon name="bolt" />

                            Everything in one place

                        </p>


                        <h1>
                            Charging made
                            <span>smarter.</span>
                        </h1>


                        <p className="hero-copy">
                            From finding the right station
                            to tracking your charging session,
                            Leccy brings the entire EV charging
                            journey together.
                        </p>


                        <div className="hero-actions">

                            <Link
                                to="/register"
                                className="primary-cta"
                            >
                                Get started

                                <Icon name="arrow" />

                            </Link>


                            <a
                                href="#feature-list"
                                className="secondary-cta"
                            >
                                Explore features

                                <span>↓</span>
                            </a>

                        </div>

                    </div>


                    {/* HERO VISUAL */}

                    <div
                        className="feature-hero-dashboard"
                        data-reveal
                    >

                        <div className="dashboard-top">

                            <div>
                                <span>NEARBY STATIONS</span>

                                <strong>
                                    12 stations
                                </strong>
                            </div>

                            <div className="dashboard-live">
                                <i />
                                LIVE
                            </div>

                        </div>


                        <div className="dashboard-map">

                            <div className="map-road road-one" />
                            <div className="map-road road-two" />
                            <div className="map-road road-three" />

                            <span className="dashboard-pin pin-a">
                                ⚡
                            </span>

                            <span className="dashboard-pin pin-b">
                                ⚡
                            </span>

                            <span className="dashboard-pin pin-c">
                                ⚡
                            </span>

                            <div className="dashboard-route" />

                        </div>


                        <div className="dashboard-station">

                            <div>

                                <span>
                                    SELECTED STATION
                                </span>

                                <strong>
                                    GreenVolt Hub
                                </strong>

                                <small>
                                    1.2 km away
                                </small>

                            </div>


                            <div className="dashboard-available">

                                <strong>
                                    3
                                </strong>

                                <span>
                                    available
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FEATURE GRID
            ================================================== */}

            <section
                id="feature-list"
                className="feature-shell feature-section"
            >

                <div
                    className="section-heading"
                    data-reveal
                >

                    <p className="section-kicker">
                        LECCY FEATURES
                    </p>

                    <h2>
                        Everything you need
                        before, during and after
                        charging.
                    </h2>

                    <p>
                        Leccy connects station discovery,
                        charger availability, booking,
                        queue management and charging
                        tracking into one experience.
                    </p>

                </div>


                <div className="feature-cards">

                    {features.map(
                        (feature, index) => (

                            <article
                                key={feature.title}
                                className={
                                    `feature-card feature-card-${feature.tone}`
                                }
                                data-reveal
                                style={{
                                    transitionDelay:
                                        `${index * 55}ms`,
                                }}
                            >

                                <div className="feature-card-top">

                                    <div className="feature-icon">

                                        <Icon
                                            name={feature.icon}
                                        />

                                    </div>


                                    <span>
                                        {feature.number}
                                    </span>

                                </div>


                                <h3>
                                    {feature.title}
                                </h3>


                                <p>
                                    {feature.description}
                                </p>


                                <div className="feature-visual">
                                    {feature.visual}
                                </div>

                            </article>

                        )
                    )}

                </div>

            </section>


            {/* ==================================================
                HOW IT WORKS
            ================================================== */}

            <section className="how-it-works">

                <div className="feature-shell how-inner">

                    <div
                        className="section-heading on-dark"
                        data-reveal
                    >

                        <p className="section-kicker">
                            HOW IT WORKS
                        </p>

                        <h2>
                            From searching to
                            charging in six steps.
                        </h2>

                        <p>
                            Leccy keeps the process simple
                            so you can spend less time
                            figuring out where to charge.
                        </p>

                    </div>


                    <div className="steps-grid">

                        {steps.map(
                            (step, index) => (

                                <div
                                    className="step"
                                    key={step.number}
                                    data-reveal
                                    style={{
                                        transitionDelay:
                                            `${index * 70}ms`,
                                    }}
                                >

                                    <span>
                                        {step.number}
                                    </span>


                                    <div>

                                        <h3>
                                            {step.title}
                                        </h3>

                                        <p>
                                            {
                                                step.description
                                            }
                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </section>


            {/* ==================================================
                WHY LECCY
            ================================================== */}

            <section className="feature-shell why-leccy">

                <div
                    className="why-copy"
                    data-reveal
                >

                    <p className="section-kicker">
                        WHY LECCY
                    </p>

                    <h2>
                        Less waiting.
                        More driving.
                    </h2>

                    <p>
                        Finding an EV charger shouldn't
                        mean opening multiple apps,
                        checking multiple stations,
                        or arriving without knowing
                        what's available.
                    </p>

                    <div className="why-points">

                        <div>
                            <Icon name="check" />
                            <span>
                                Know availability before you go
                            </span>
                        </div>

                        <div>
                            <Icon name="check" />
                            <span>
                                Compare stations in one place
                            </span>
                        </div>

                        <div>
                            <Icon name="check" />
                            <span>
                                Book compatible chargers
                            </span>
                        </div>

                        <div>
                            <Icon name="check" />
                            <span>
                                Keep track of your session
                            </span>
                        </div>

                    </div>

                </div>


                <div
                    className="why-visual"
                    data-reveal
                >

                    <div className="why-glow" />

                    <div className="why-circle">

                        <Icon name="bolt" />

                    </div>


                    <div className="why-stat stat-one">

                        <strong>
                            3
                        </strong>

                        <span>
                            Available
                        </span>

                    </div>


                    <div className="why-stat stat-two">

                        <strong>
                            18
                        </strong>

                        <span>
                            Min wait
                        </span>

                    </div>


                    <div className="why-stat stat-three">

                        <strong>
                            68%
                        </strong>

                        <span>
                            Charging
                        </span>

                    </div>

                </div>

            </section>


            {/* ==================================================
                CTA
            ================================================== */}

            <section className="feature-shell feature-cta-section">

                <div
                    className="cta-panel"
                    data-reveal
                >

                    <div className="cta-glow" />

                    <div className="cta-content">

                        <p className="eyebrow">

                            <Icon name="bolt" />

                            Ready to charge smarter?

                        </p>


                        <h2>
                            Find your next charger
                            with Leccy.
                        </h2>


                        <p>
                            Search nearby stations, compare
                            chargers, book your slot and
                            keep track of your charging session.
                        </p>

                    </div>


                    <div className="cta-actions">

                        <Link
                            to="/register"
                            className="primary-cta"
                        >
                            Create account

                            <Icon name="arrow" />

                        </Link>


                        <Link
                            to="/login"
                            className="text-link"
                        >
                            Already have an account? Log in
                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
};


export default Feature;