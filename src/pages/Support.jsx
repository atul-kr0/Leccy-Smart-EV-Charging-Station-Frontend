import { useState } from "react";
import "./support-page.css";

const FAQS = [
    {
        question: "How do I find a charging station?",
        answer:
            "Open Find Charger from the sidebar and search for charging stations near your location.",
    },
    {
        question: "How do I add my vehicle?",
        answer:
            "Go to My Vehicles and add your vehicle details. You can manage your saved vehicles from there.",
    },
    {
        question: "How do I make a booking?",
        answer:
            "Find a charging station, select an available slot, choose your vehicle and confirm the booking.",
    },
    {
        question: "Where can I see my bookings?",
        answer:
            "Open Bookings from the sidebar to view your upcoming and active bookings.",
    },
    {
        question: "Where can I see previous bookings?",
        answer:
            "Open History to view your previous charging activity and completed bookings.",
    },
];

const TOPICS = [
    {
        icon: "📅",
        title: "Bookings",
        description:
            "Booking, cancellation and availability help.",
        search: "booking",
    },
    {
        icon: "⚡",
        title: "Charging stations",
        description:
            "Find stations and understand charging information.",
        search: "charging",
    },
    {
        icon: "🚗",
        title: "Vehicles",
        description:
            "Manage your vehicles and charging preferences.",
        search: "vehicle",
    },
    {
        icon: "👤",
        title: "Account",
        description:
            "Profile, login and account related questions.",
        search: "account",
    },
];

const Support = () => {

    const [search, setSearch] = useState("");

    const [openFaq, setOpenFaq] = useState(null);

    const [showContactForm, setShowContactForm] =
        useState(false);

    const [sending, setSending] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        subject: "General enquiry",
        message: "",
    });


    // =========================================================
    // FILTER FAQ
    // =========================================================

    const filteredFaqs = FAQS.filter((faq) => {

        const query = search.toLowerCase().trim();

        if (!query) {
            return true;
        }

        return (
            faq.question
                .toLowerCase()
                .includes(query) ||
            faq.answer
                .toLowerCase()
                .includes(query)
        );
    });


    // =========================================================
    // OPEN CONTACT FORM
    // =========================================================

    const openContactForm = () => {

        setShowContactForm(true);
        setSubmitted(false);
        setError("");

        setTimeout(() => {

            document
                .querySelector(".support-form-card")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }, 50);
    };


    // =========================================================
    // CLOSE CONTACT FORM
    // =========================================================

    const closeContactForm = () => {

        if (sending) {
            return;
        }

        setShowContactForm(false);

        setSubmitted(false);
        setError("");

        setForm({
            subject: "General enquiry",
            message: "",
        });
    };


    // =========================================================
    // FORM CHANGE
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
    // SUBMIT SUPPORT REQUEST
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSending(true);
        setSubmitted(false);
        setError("");


        /*
         * These values assume your logged-in user information
         * is stored in localStorage.
         *
         * Change the keys if your project uses different ones.
         */

        const storedUser =
            localStorage.getItem("user");

        let user = null;

        try {

            user = storedUser
                ? JSON.parse(storedUser)
                : null;

        } catch {
            user = null;
        }


        const name =
            user?.name ||
            user?.username ||
            "Leccy User";

        const email =
            user?.email ||
            "";


        if (!email) {

            setError(
                "We couldn't find your account email. Please contact us through the public contact page."
            );

            setSending(false);

            return;
        }


        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/contact`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        subject: form.subject,
                        message: form.message,
                    }),
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to send support request"
                );

            }


            setSubmitted(true);

            setForm({
                subject: "General enquiry",
                message: "",
            });


        } catch (err) {

            console.error(
                "Support request error:",
                err
            );

            setError(
                "Couldn't send your request. Please try again."
            );

        } finally {

            setSending(false);

        }
    };


    return (

        <main className="support-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="support-header">

                <div>

                    <p className="support-eyebrow">
                        SUPPORT
                    </p>

                    <h1>
                        How can we help?
                    </h1>

                    <p className="support-subtitle">
                        Find answers to common questions or
                        get in touch with the Leccy support team.
                    </p>

                </div>

            </section>


            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="support-search-section">

                <div className="support-search">

                    <span className="support-search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search help articles..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>

            </section>


            {/* =================================================
                QUICK HELP
            ================================================= */}

            <section className="support-section">

                <div className="support-section-header">

                    <div>

                        <p className="support-label">
                            QUICK HELP
                        </p>

                        <h2>
                            Popular topics
                        </h2>

                    </div>

                </div>


                <div className="support-topic-grid">

                    {TOPICS.map((topic) => (

                        <button
                            key={topic.title}
                            type="button"
                            className="support-topic-card"
                            onClick={() =>
                                setSearch(topic.search)
                            }
                        >

                            <div className="support-topic-icon">
                                {topic.icon}
                            </div>

                            <div>

                                <h3>
                                    {topic.title}
                                </h3>

                                <p>
                                    {topic.description}
                                </p>

                            </div>

                        </button>

                    ))}

                </div>

            </section>


            {/* =================================================
                FAQ
            ================================================= */}

            <section className="support-section">

                <div className="support-section-header">

                    <div>

                        <p className="support-label">
                            FAQ
                        </p>

                        <h2>
                            Frequently asked questions
                        </h2>

                    </div>

                </div>


                <div className="support-faq-list">

                    {filteredFaqs.length > 0 ? (

                        filteredFaqs.map((faq) => {

                            const isOpen =
                                openFaq === faq.question;

                            return (

                                <div
                                    key={faq.question}
                                    className={`support-faq ${
                                        isOpen
                                            ? "open"
                                            : ""
                                    }`}
                                >

                                    <button
                                        type="button"
                                        className="support-faq-question"
                                        onClick={() =>
                                            setOpenFaq(
                                                isOpen
                                                    ? null
                                                    : faq.question
                                            )
                                        }
                                    >

                                        <span>
                                            {faq.question}
                                        </span>

                                        <span className="support-faq-icon">
                                            {isOpen
                                                ? "−"
                                                : "+"}
                                        </span>

                                    </button>


                                    {isOpen && (

                                        <div className="support-faq-answer">

                                            <p>
                                                {faq.answer}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            );

                        })

                    ) : (

                        <div className="support-no-results">

                            <h3>
                                No results found
                            </h3>

                            <p>
                                Try a different search term
                                or contact our support team.
                            </p>

                        </div>

                    )}

                </div>

            </section>


            {/* =================================================
                CONTACT SUPPORT CTA
            ================================================= */}

            {!showContactForm && (

                <section className="support-contact-card">

                    <div>

                        <p className="support-label">
                            STILL NEED HELP?
                        </p>

                        <h2>
                            We're here for you.
                        </h2>

                        <p>
                            Couldn't find what you were
                            looking for? Send us a message
                            and our team will get back to you.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="support-contact-button"
                        onClick={openContactForm}
                    >

                        Contact support

                        <span>
                            →
                        </span>

                    </button>

                </section>

            )}


            {/* =================================================
                INLINE SUPPORT FORM
            ================================================= */}

            {showContactForm && (

                <section className="support-form-card">

                    <div className="support-form-header">

                        <div>

                            <p className="support-label">
                                CONTACT SUPPORT
                            </p>

                            <h2>
                                Tell us what happened.
                            </h2>

                            <p>
                                Your account details will be
                                used automatically.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="support-close-button"
                            onClick={closeContactForm}
                            disabled={sending}
                        >
                            ×
                        </button>

                    </div>


                    {/* FORM */}

                    <form
                        className="support-form"
                        onSubmit={handleSubmit}
                    >


                        {/* ACCOUNT */}

                        <div className="support-account-info">

                            <div className="support-account-icon">
                                👤
                            </div>

                            <div>

                                <span>
                                    Sending as
                                </span>

                                <strong>
                                    Your Leccy account
                                </strong>

                            </div>

                        </div>


                        {/* SUBJECT */}

                        <div className="support-field">

                            <label htmlFor="support-subject">
                                Issue type
                            </label>

                            <select
                                id="support-subject"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                disabled={sending}
                            >

                                <option>
                                    General enquiry
                                </option>

                                <option>
                                    Technical issue
                                </option>

                                <option>
                                    Booking problem
                                </option>

                                <option>
                                    Charging station
                                </option>

                                <option>
                                    Vehicle problem
                                </option>

                                <option>
                                    Account problem
                                </option>

                                <option>
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* MESSAGE */}

                        <div className="support-field">

                            <div className="support-message-label">

                                <label htmlFor="support-message">
                                    Message
                                </label>

                                <span>
                                    {form.message.length}/1000
                                </span>

                            </div>

                            <textarea
                                id="support-message"
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
                                placeholder="Tell us what happened..."
                                rows={7}
                                required
                                disabled={sending}
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="support-error">

                                <strong>
                                    Couldn't send request
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* SUCCESS */}

                        {submitted && (

                            <div className="support-success">

                                <div className="support-success-icon">
                                    ✓
                                </div>

                                <div>

                                    <strong>
                                        Support request sent.
                                    </strong>

                                    <p>
                                        We've received your
                                        message and will get
                                        back to you soon.
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* ACTIONS */}

                        <div className="support-form-actions">

                            <button
                                type="button"
                                className="support-cancel-button"
                                onClick={closeContactForm}
                                disabled={sending}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="support-submit-button"
                                disabled={sending}
                            >

                                {sending
                                    ? "Sending..."
                                    : "Send request"}

                                {!sending && (
                                    <span>
                                        →
                                    </span>
                                )}

                            </button>

                        </div>


                        <p className="support-form-note">
                            We'll use your account email
                            to respond to this request.
                        </p>

                    </form>

                </section>

            )}

        </main>

    );
};

export default Support;