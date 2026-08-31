import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./contact-page.css";

const Icon = ({ name, className = "" }) => {
    const icons = {
        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),

        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        question: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.7 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.9 1.2-1.9 2.7" />
                <path d="M12 17h.01" />
            </>
        ),

        chevron: (
            <path d="m7 10 5 5 5-5" />
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
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

const SUBJECTS = [
    "General enquiry",
    "Technical issue",
    "Booking problem",
    "Charging station",
    "Feedback",
    "Partnership",
    "Other",
];

const Contact = () => {

    const pageRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "General enquiry",
        message: "",
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // REVEAL ANIMATIONS
    // =========================================================

    useEffect(() => {

        const elements =
            pageRef.current?.querySelectorAll(
                "[data-reveal]"
            ) || [];

        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {
                            entry.target.classList.add(
                                "is-visible"
                            );
                        }

                    });

                },
                {
                    threshold: 0.12,
                }
            );

        elements.forEach((element) =>
            observer.observe(element)
        );

        return () =>
            observer.disconnect();

    }, []);


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSubmitted(false);
        setError("");
    };


    // =========================================================
    // SUBJECT
    // =========================================================

    const selectSubject = (subject) => {

        setForm((previous) => ({
            ...previous,
            subject,
        }));

        setDropdownOpen(false);
        setSubmitted(false);
        setError("");
    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSending(true);
        setSubmitted(false);
        setError("");

        try {

const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/contact`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(form),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to send message"
                );
            }

            setSubmitted(true);

            setForm({
                name: "",
                email: "",
                subject: "General enquiry",
                message: "",
            });

        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            setError(
                "Couldn't send your message. Please try again."
            );

        } finally {

            setSending(false);

        }
    };


    return (
        <main
            ref={pageRef}
            className="contact-page"
        >

            <Navbar />


            {/* =================================================
                HERO
            ================================================= */}

            <section className="contact-hero">

                <div className="contact-grid-bg" />
                <div className="contact-orb contact-orb-one" />
                <div className="contact-orb contact-orb-two" />


                <div className="contact-shell">

                    <div
                        className="contact-hero-content"
                        data-reveal
                    >

                        <p className="contact-eyebrow">
                            Let's talk
                        </p>

                        <h1>
                            How can we
                            <span> help?</span>
                        </h1>

                        <p>
                            Have a question about Leccy,
                            found an issue, or simply have
                            an idea? We'd love to hear from
                            you.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                CONTACT CONTENT
            ================================================= */}

            <section className="contact-section">

                <div className="contact-shell">

                    <div className="contact-layout">


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <div
                            className="contact-form-card"
                            data-reveal
                        >

                            <div className="contact-form-header">

                                <p className="contact-kicker">
                                    Send a message
                                </p>

                                <h2>
                                    Tell us what's on
                                    your mind.
                                </h2>

                                <p>
                                    Fill in the form and
                                    we'll get back to you.
                                </p>

                            </div>


                            <form
                                onSubmit={handleSubmit}
                                className="contact-form"
                            >

                                {/* NAME + EMAIL */}

                                <div className="contact-two-column">

                                    <div className="contact-field">

                                        <label htmlFor="name">
                                            Your name
                                        </label>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            required
                                        />

                                    </div>


                                    <div className="contact-field">

                                        <label htmlFor="email">
                                            Email address
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* SUBJECT */}

                                <div className="contact-field">

                                    <label>
                                        What is this about?
                                    </label>


                                    <div
                                        className={`custom-select ${
                                            dropdownOpen
                                                ? "is-open"
                                                : ""
                                        }`}
                                    >

                                        <button
                                            type="button"
                                            className="custom-select-trigger"
                                            onClick={() =>
                                                setDropdownOpen(
                                                    (open) =>
                                                        !open
                                                )
                                            }
                                            aria-haspopup="listbox"
                                            aria-expanded={
                                                dropdownOpen
                                            }
                                        >

                                            <span>
                                                {form.subject}
                                            </span>

                                            <Icon
                                                name="chevron"
                                                className="select-chevron"
                                            />

                                        </button>


                                        {dropdownOpen && (

                                            <div
                                                className="custom-select-menu"
                                                role="listbox"
                                            >

                                                {SUBJECTS.map(
                                                    (subject) => (

                                                        <button
                                                            key={subject}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={
                                                                form.subject ===
                                                                subject
                                                            }
                                                            className={`custom-select-option ${
                                                                form.subject ===
                                                                subject
                                                                    ? "selected"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                selectSubject(
                                                                    subject
                                                                )
                                                            }
                                                        >

                                                            <span>
                                                                {subject}
                                                            </span>

                                                            {form.subject ===
                                                                subject && (
                                                                <Icon
                                                                    name="check"
                                                                    className="select-check"
                                                                />
                                                            )}

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* MESSAGE */}

                                <div className="contact-field">

                                    <div className="message-label-row">

                                        <label htmlFor="message">
                                            Message
                                        </label>

                                        <span>
                                            {
                                                form.message.length
                                            }
                                            /1000
                                        </span>

                                    </div>


                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={(event) => {

                                            if (
                                                event.target.value
                                                    .length <= 1000
                                            ) {

                                                handleChange(event);

                                            }

                                        }}
                                        placeholder="Tell us how we can help..."
                                        rows="7"
                                        required
                                    />

                                </div>


                                {/* SUCCESS */}

                                {submitted && (

                                    <div className="contact-success">

                                        <Icon
                                            name="check"
                                            className="success-icon"
                                        />

                                        <div>

                                            <strong>
                                                Message received.
                                            </strong>

                                            <p>
                                                Thanks for
                                                reaching out
                                                to Leccy.
                                            </p>

                                        </div>

                                    </div>

                                )}


                                {/* ERROR */}

                                {error && (

                                    <div className="contact-error">

                                        <strong>
                                            Something went wrong.
                                        </strong>

                                        <p>
                                            {error}
                                        </p>

                                    </div>

                                )}


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="contact-submit"
                                    disabled={sending}
                                >

                                    <span>
                                        {sending
                                            ? "Sending..."
                                            : "Send message"}
                                    </span>

                                    {!sending && (
                                        <Icon
                                            name="arrow"
                                            className="submit-arrow"
                                        />
                                    )}

                                </button>


                                <p className="contact-form-note">
                                    By submitting this form,
                                    you agree to be contacted
                                    regarding your enquiry.
                                </p>

                            </form>

                        </div>


                        {/* =================================================
                            RIGHT SIDE
                        ================================================= */}

                        <aside className="contact-sidebar">


                            {/* CONTACT INFO */}

                            <div
                                className="contact-info-card"
                                data-reveal
                            >

                                <p className="contact-kicker">
                                    Get in touch
                                </p>

                                <h2>
                                    We're here to help.
                                </h2>

                                <p>
                                    Whether you're testing
                                    Leccy, working on the
                                    project, or simply have
                                    an idea, send us a message.
                                </p>


                                <div className="contact-divider" />


                                <div className="contact-info-item">

                                    <div className="contact-info-icon">
                                        <Icon name="mail" />
                                    </div>

                                    <div>

                                        <small>
                                            Email
                                        </small>

                                        <strong>
                                            hello@leccy.app
                                        </strong>

                                    </div>

                                </div>


                                <div className="contact-info-item">

                                    <div className="contact-info-icon">
                                        <Icon name="clock" />
                                    </div>

                                    <div>

                                        <small>
                                            Response time
                                        </small>

                                        <strong>
                                            Usually within
                                            1–2 days
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* FAQ */}

                            <div
                                className="contact-faq-card"
                                data-reveal
                            >

                                <div className="contact-faq-icon">
                                    <Icon name="question" />
                                </div>

                                <div>

                                    <small>
                                        Looking for an answer?
                                    </small>

                                    <strong>
                                        Check the FAQ first.
                                    </strong>

                                    <Link to="/faq">

                                        Visit FAQ

                                        <Icon
                                            name="arrow"
                                            className="faq-arrow"
                                        />

                                    </Link>

                                </div>

                            </div>


                            {/* QUICK LINKS */}

                            <div
                                className="quick-links"
                                data-reveal
                            >

                                <p>
                                    Quick links
                                </p>

                                <Link to="/features">

                                    <span>
                                        Explore features
                                    </span>

                                    <Icon
                                        name="arrow"
                                        className="quick-arrow"
                                    />

                                </Link>


                                <Link to="/how-it-works">

                                    <span>
                                        How Leccy works
                                    </span>

                                    <Icon
                                        name="arrow"
                                        className="quick-arrow"
                                    />

                                </Link>


                                <Link to="/about">

                                    <span>
                                        About Leccy
                                    </span>

                                    <Icon
                                        name="arrow"
                                        className="quick-arrow"
                                    />

                                </Link>

                            </div>

                        </aside>

                    </div>

                </div>

            </section>

        </main>
    );
};


export default Contact;