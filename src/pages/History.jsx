import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/bookings`;

const LIVE_STATUSES = ["WAITING", "NOTIFIED", "CHARGING"];

/* =========================================================
   API
========================================================= */

const getToken = () => localStorage.getItem("token");

const apiFetch = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication token not found. Please log in again."
        );
    }

    const response = await fetch(url, {
        ...options,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const body = await response.json();

            message =
                body?.message ||
                body?.error ||
                message;
        } catch {
            // Response may not be JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (status) =>
    String(status || "").toUpperCase();

const isLiveStatus = (status) =>
    LIVE_STATUSES.includes(
        normalizeStatus(status)
    );

const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
        case "COMPLETED":
            return "Completed";

        case "CANCELLED":
            return "Cancelled";

        case "EXPIRED":
            return "Expired";

        case "WAITING":
            return "Waiting";

        case "NOTIFIED":
            return "Charger ready";

        case "CHARGING":
            return "Charging";

        default:
            return (
                String(status || "Unknown")
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                    )
            );
    }
};

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatShortDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDuration = (minutes) => {
    const total = Math.max(
        0,
        Math.round(Number(minutes) || 0)
    );

    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours > 0) {
        return `${hours}h ${String(mins).padStart(2, "0")}m`;
    }

    return `${mins}m`;
};

const getDateValue = (booking) => {
    return (
        booking?.bookedAt ||
        booking?.createdAt ||
        booking?.bookingDate ||
        booking?.startTime ||
        null
    );
};

/* =========================================================
   ICON
========================================================= */

const Icon = ({ name, size = 20 }) => {
    const paths = {
        history: (
            <>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        bolt: (
            <path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z" />
        ),

        charger: (
            <>
                <rect
                    x="6"
                    y="2"
                    width="12"
                    height="20"
                    rx="2"
                />
                <path d="M9 7h6M9 11h6M9 15h3" />
                <path d="M18 7h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </>
        ),

        check: (
            <path d="m5 12 4 4L19 6" />
        ),

        close: (
            <>
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),

        filter: (
            <>
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
            </>
        ),

        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),

        calendar: (
            <>
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
};

/* =========================================================
   STATUS PILL
========================================================= */

const StatusPill = ({ status }) => {
    const normalized = normalizeStatus(status);

    return (
        <span
            className={`history-status ${normalized.toLowerCase()}`}
        >
            <span />
            {getStatusLabel(normalized)}
        </span>
    );
};

/* =========================================================
   HISTORY CARD
========================================================= */

const HistoryCard = ({ booking, onSelect }) => {
    const status = normalizeStatus(
        booking?.status
    );

    const station =
        booking?.stationName ||
        "Charging Station";

    const date = getDateValue(booking);

    const charger = booking?.chargerNumber
        ? `Charger #${booking.chargerNumber}`
        : booking?.chargerId
            ? `Charger ID ${booking.chargerId}`
            : "Charger not assigned";

    return (
        <button
            type="button"
            className="history-card"
            onClick={() => onSelect(booking)}
        >
            <div
                className={`history-card-icon ${status.toLowerCase()}`}
            >
                <Icon
                    name={
                        status === "COMPLETED"
                            ? "check"
                            : status === "CANCELLED" ||
                                status === "EXPIRED"
                                ? "close"
                                : "bolt"
                    }
                    size={19}
                />
            </div>

            <div className="history-card-main">
                <div className="history-card-title">
                    <h3>{station}</h3>
                    <StatusPill status={status} />
                </div>

                <p>
                    Booking #
                    {booking?.bookingId ?? "—"}
                    {booking?.chargerNumber
                        ? ` · Charger #${booking.chargerNumber}`
                        : ""}
                </p>
            </div>

            <div className="history-card-detail">
                <span>CHARGER</span>
                <strong>{charger}</strong>
            </div>

            <div className="history-card-detail">
                <span>EST. CHARGE</span>
                <strong>
                    {booking?.estimatedChargingDuration != null
                        ? formatDuration(
                            booking.estimatedChargingDuration
                        )
                        : "—"}
                </strong>
            </div>

            <div className="history-card-date">
                <Icon
                    name="calendar"
                    size={14}
                />

                <div>
                    <strong>
                        {formatShortDate(date)}
                    </strong>

                    <span>
                        {date
                            ? new Date(date).toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )
                            : "—"}
                    </span>
                </div>
            </div>

            <div className="history-card-arrow">
                <Icon
                    name="arrow"
                    size={16}
                />
            </div>
        </button>
    );
};

/* =========================================================
   DETAIL DRAWER
========================================================= */

const HistoryDetail = ({ booking, onClose }) => {
    if (!booking) {
        return null;
    }

    const status = normalizeStatus(
        booking.status
    );

    const station =
        booking?.stationName ||
        "Charging Station";

    const charger =
        booking?.chargerNumber
            ? `#${booking.chargerNumber}`
            : booking?.chargerId
                ? `ID ${booking.chargerId}`
                : "—";

    return (
        <div
            className="history-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <aside className="history-drawer">

                <div className="drawer-header">

                    <div>
                        <span className="drawer-kicker">
                            BOOKING DETAILS
                        </span>

                        <h2>
                            Booking #
                            {booking.bookingId ?? "—"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="drawer-close"
                        onClick={onClose}
                    >
                        <Icon
                            name="close"
                            size={18}
                        />
                    </button>

                </div>


                <div className="drawer-status">
                    <StatusPill
                        status={status}
                    />
                </div>


                <div className="drawer-station">

                    <div className="drawer-station-icon">
                        <Icon
                            name="bolt"
                            size={22}
                        />
                    </div>

                    <div>
                        <span>
                            CHARGING STATION
                        </span>

                        <strong>
                            {station}
                        </strong>
                    </div>

                </div>


                <div className="drawer-grid">

                    <div>
                        <span>BOOKED ON</span>
                        <strong>
                            {formatDate(
                                getDateValue(booking)
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>CHARGER</span>
                        <strong>
                            {charger}
                        </strong>
                    </div>

                    <div>
                        <span>EST. CHARGE</span>
                        <strong>
                            {booking?.estimatedChargingDuration != null
                                ? formatDuration(
                                    booking.estimatedChargingDuration
                                )
                                : "—"}
                        </strong>
                    </div>

                    <div>
                        <span>TOKEN</span>
                        <strong>
                            {booking?.tokenNumber
                                ? `#${booking.tokenNumber}`
                                : "—"}
                        </strong>
                    </div>

                </div>


                <div className="drawer-note">

                    <Icon
                        name={
                            status === "COMPLETED"
                                ? "check"
                                : "history"
                        }
                        size={17}
                    />

                    <p>
                        {status === "COMPLETED"
                            ? "This charging booking has been completed successfully."
                            : status === "CANCELLED"
                                ? "This booking was cancelled."
                                : status === "EXPIRED"
                                    ? "This booking expired before charging was started."
                                    : "This booking is part of your charging history."}
                    </p>

                </div>

            </aside>
        </div>
    );
};

/* =========================================================
   MAIN
========================================================= */

const History = () => {
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedBooking, setSelectedBooking] =
        useState(null);


    const fetchBookings = useCallback(
        async (initial = false) => {

            try {

                if (initial) {
                    setLoading(true);
                    setError("");
                }

                const data =
                    await apiFetch(API_URL);

                const list =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.content)
                            ? data.content
                            : Array.isArray(data?.bookings)
                                ? data.bookings
                                : [];

                setBookings(list);

            } catch (err) {

                console.error(
                    "History loading error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load your history."
                );

            } finally {

                if (initial) {
                    setLoading(false);
                }

            }

        },
        []
    );


    useEffect(() => {
        let cancelled = false;

        const loadInitialHistory = async () => {
            if (!cancelled) {
                await fetchBookings(true);
            }
        };

        loadInitialHistory();

        /*
         * Keep history synchronized automatically.
         *
         * The backend is polled in the background so the user does not
         * need a Refresh button. Changes such as COMPLETED, CANCELLED,
         * or EXPIRED bookings appear automatically on the next sync.
         */
        const syncInterval = window.setInterval(() => {
            if (!cancelled) {
                fetchBookings(false);
            }
        }, 2000);

        /*
         * Refresh immediately when the user returns to this tab.
         */
        const handleVisibilityChange = () => {
            if (!document.hidden && !cancelled) {
                fetchBookings(false);
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            cancelled = true;
            window.clearInterval(syncInterval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [fetchBookings]);


    const historyBookings =
        useMemo(() => {

            return bookings
                .filter(
                    (booking) =>
                        !isLiveStatus(
                            booking?.status
                        )
                )
                .sort((a, b) => {

                    const dateA =
                        new Date(
                            getDateValue(a) || 0
                        ).getTime();

                    const dateB =
                        new Date(
                            getDateValue(b) || 0
                        ).getTime();

                    return dateB - dateA;
                });

        }, [bookings]);


    const completedCount =
        historyBookings.filter(
            (booking) =>
                normalizeStatus(
                    booking.status
                ) === "COMPLETED"
        ).length;


    const cancelledCount =
        historyBookings.filter(
            (booking) =>
                normalizeStatus(
                    booking.status
                ) === "CANCELLED"
        ).length;


    const filteredBookings =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            return historyBookings.filter(
                (booking) => {

                    const status =
                        normalizeStatus(
                            booking?.status
                        );

                    if (
                        statusFilter !== "ALL" &&
                        status !== statusFilter
                    ) {
                        return false;
                    }

                    if (!query) {
                        return true;
                    }

                    const searchable = [
                        booking?.bookingId,
                        booking?.stationName,
                        booking?.chargerNumber,
                        booking?.chargerId,
                        booking?.tokenNumber,
                        status,
                    ]
                        .filter(
                            (value) =>
                                value !== null &&
                                value !== undefined
                        )
                        .join(" ")
                        .toLowerCase();

                    return searchable.includes(
                        query
                    );
                }
            );

        }, [
            historyBookings,
            search,
            statusFilter,
        ]);


    if (loading) {

        return (
            <>
                <PageStyles />

                <main className="history-page">

                    <div className="history-shell">

                        <div className="history-loading">

                            <div className="loading-line eyebrow" />

                            <div className="loading-line title" />

                            <div className="loading-line text" />

                            <div className="loading-toolbar" />

                            <div className="loading-list">
                                <div />
                                <div />
                                <div />
                            </div>

                        </div>

                    </div>

                </main>
            </>
        );
    }


    return (
        <>
            <PageStyles />

            <main className="history-page">

                <div className="history-shell">

                    {/* =================================================
                        HERO
                    ================================================= */}

                    <header className="history-hero">

                        <div>

                            <div className="history-eyebrow">

                                <span>
                                    <Icon
                                        name="history"
                                        size={13}
                                    />
                                </span>

                                CHARGING HISTORY

                            </div>

                            <h1>
                                Every charge,
                                <span> kept track.</span>
                            </h1>

                            <p>
                                Review your previous charging
                                bookings, stations and session details
                                in one place.
                            </p>

                        </div>


                    </header>


                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <section className="history-summary">

                        <div className="summary-card">

                            <div className="summary-icon green">
                                <Icon
                                    name="history"
                                    size={18}
                                />
                            </div>

                            <div>
                                <span>
                                    TOTAL SESSIONS
                                </span>

                                <strong>
                                    {String(
                                        historyBookings.length
                                    ).padStart(2, "0")}
                                </strong>

                                <small>
                                    Previous bookings
                                </small>
                            </div>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon blue">
                                <Icon
                                    name="check"
                                    size={18}
                                />
                            </div>

                            <div>
                                <span>
                                    COMPLETED
                                </span>

                                <strong>
                                    {String(
                                        completedCount
                                    ).padStart(2, "0")}
                                </strong>

                                <small>
                                    Successful charges
                                </small>
                            </div>

                        </div>


                        <div className="summary-card">

                            <div className="summary-icon red">
                                <Icon
                                    name="close"
                                    size={18}
                                />
                            </div>

                            <div>
                                <span>
                                    CANCELLED
                                </span>

                                <strong>
                                    {String(
                                        cancelledCount
                                    ).padStart(2, "0")}
                                </strong>

                                <small>
                                    Cancelled bookings
                                </small>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="history-error">

                            <span>!</span>

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchBookings(true)
                                }
                            >
                                Try again
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        FILTERS
                    ================================================= */}

                    <section className="history-controls">

                        <div className="history-search">

                            <Icon
                                name="search"
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search station, booking or charger..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                            {search && (

                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    <Icon
                                        name="close"
                                        size={14}
                                    />
                                </button>

                            )}

                        </div>


                        <div className="history-filter">

                            <Icon
                                name="filter"
                                size={16}
                            />

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="ALL">
                                    All status
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                                <option value="EXPIRED">
                                    Expired
                                </option>
                            </select>

                        </div>

                    </section>


                    {/* =================================================
                        RESULTS HEADER
                    ================================================= */}

                    <div className="history-results-header">

                        <div>

                            <span className="section-kicker">
                                YOUR HISTORY
                            </span>

                            <h2>
                                Previous bookings
                            </h2>

                        </div>

                        <span className="result-count">
                            {filteredBookings.length}{" "}
                            {filteredBookings.length === 1
                                ? "booking"
                                : "bookings"}
                        </span>

                    </div>


                    {/* =================================================
                        LIST
                    ================================================= */}

                    {filteredBookings.length > 0 ? (

                        <section className="history-list">

                            {filteredBookings.map(
                                (booking, index) => (

                                    <HistoryCard
                                        key={
                                            booking?.bookingId ??
                                            `${getDateValue(
                                                booking
                                            )}-${index}`
                                        }
                                        booking={booking}
                                        onSelect={
                                            setSelectedBooking
                                        }
                                    />

                                )
                            )}

                        </section>

                    ) : (

                        <section className="history-empty">

                            <div className="history-empty-icon">

                                <Icon
                                    name="history"
                                    size={27}
                                />

                            </div>

                            <span>
                                {search ||
                                statusFilter !== "ALL"
                                    ? "NO MATCHES"
                                    : "NO HISTORY YET"}
                            </span>

                            <h3>
                                {search ||
                                statusFilter !== "ALL"
                                    ? "Nothing matches your filters."
                                    : "Your charging history is empty."}
                            </h3>

                            <p>
                                {search ||
                                statusFilter !== "ALL"
                                    ? "Try changing your search or status filter."
                                    : "Completed and cancelled bookings will appear here."}
                            </p>

                            {(search ||
                                statusFilter !== "ALL") && (

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter(
                                            "ALL"
                                        );
                                    }}
                                >
                                    Clear filters
                                </button>

                            )}

                        </section>

                    )}

                </div>

            </main>


            <HistoryDetail
                booking={selectedBooking}
                onClose={() =>
                    setSelectedBooking(null)
                }
            />

        </>
    );
};

/* =========================================================
   STYLES
========================================================= */

const PageStyles = () => (
    <style>{`

        * {
            box-sizing: border-box;
        }

        .history-page {
            min-height: 100%;
            padding: 38px 34px 65px;
            background:
                radial-gradient(
                    circle at 90% 0%,
                    rgba(0,168,59,.07),
                    transparent 31%
                ),
                #F7F9FA;
        }

        .history-shell {
            width: min(1120px, 100%);
            margin: 0 auto;
        }


        /* =========================
           HERO
        ========================= */

        .history-hero {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 30px;
        }

        .history-eyebrow {
            display: flex;
            align-items: center;
            gap: 7px;

            color: #00A83B;

            font-size: 10px;
            font-weight: 850;
            letter-spacing: .14em;
        }

        .history-eyebrow span {
            display: flex;
            align-items: center;
            justify-content: center;

            width: 22px;
            height: 22px;

            border-radius: 7px;

            background: #EAF9EF;
        }

        .history-hero h1 {
            margin: 13px 0 0;

            color: #071A2D;

            font-size: clamp(42px, 5vw, 59px);
            line-height: .98;
            letter-spacing: -.055em;
        }

        .history-hero h1 span {
            color: #00A83B;
        }

        .history-hero p {
            max-width: 610px;

            margin: 13px 0 0;

            color: #8194A5;

            font-size: 13px;
            line-height: 1.6;
        }

        /* =========================
           SUMMARY
        ========================= */

        .history-summary {
            display: grid;
            grid-template-columns:
                repeat(3, minmax(0, 1fr));

            gap: 13px;

            margin-top: 34px;
        }

        .summary-card {
            min-height: 118px;

            display: flex;
            align-items: center;

            gap: 14px;

            padding: 20px;

            border: 1px solid #E0E8EC;
            border-radius: 18px;

            background: white;

            box-shadow:
                0 8px 25px rgba(7,26,45,.035);
        }

        .summary-icon {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 12px;
        }

        .summary-icon.green {
            background: #EFFBF4;
            color: #00A83B;
        }

        .summary-icon.blue {
            background: #EEF6FF;
            color: #2878BD;
        }

        .summary-icon.red {
            background: #FFF1F1;
            color: #C62828;
        }

        .summary-card div:last-child {
            min-width: 0;

            display: flex;
            flex-direction: column;
        }

        .summary-card span {
            color: #93A2AD;

            font-size: 8px;
            font-weight: 850;
            letter-spacing: .1em;
        }

        .summary-card strong {
            margin-top: 4px;

            color: #071A2D;

            font-size: 25px;
            line-height: 1;

            letter-spacing: -.04em;
        }

        .summary-card small {
            margin-top: 5px;

            color: #91A0AA;

            font-size: 10px;
        }


        /* =========================
           ERROR
        ========================= */

        .history-error {
            display: flex;
            align-items: center;
            gap: 11px;

            margin-top: 18px;
            padding: 13px 15px;

            border: 1px solid #F3C5C5;
            border-radius: 12px;

            background: #FFF7F7;
            color: #B42318;
        }

        .history-error > span {
            width: 23px;
            height: 23px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: #FEE4E2;

            font-size: 12px;
            font-weight: 800;
        }

        .history-error p {
            flex: 1;

            margin: 0;

            font-size: 12px;
        }

        .history-error button {
            border: none;
            background: transparent;

            color: #B42318;

            font-size: 11px;
            font-weight: 800;

            cursor: pointer;
        }


        /* =========================
           CONTROLS
        ========================= */

        .history-controls {
            display: flex;
            align-items: center;

            gap: 10px;

            margin-top: 29px;
        }

        .history-search,
        .history-filter {
            height: 45px;

            display: flex;
            align-items: center;

            gap: 9px;

            border: 1px solid #DDE5E9;
            border-radius: 11px;

            background: white;

            color: #8A9AA6;
        }

        .history-search {
            flex: 1;

            padding: 0 13px;
        }

        .history-search input {
            flex: 1;

            min-width: 0;

            border: none;
            outline: none;

            background: transparent;

            color: #071A2D;

            font-family: inherit;
            font-size: 12px;
        }

        .history-search input::placeholder {
            color: #A1AFB8;
        }

        .clear-search {
            width: 24px;
            height: 24px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            border-radius: 7px;

            background: #F1F4F5;

            color: #7D8E9A;

            cursor: pointer;
        }

        .history-filter {
            width: 155px;

            padding: 0 12px;
        }

        .history-filter select {
            width: 100%;

            border: none;
            outline: none;

            background: transparent;

            color: #506474;

            font-family: inherit;
            font-size: 11px;

            cursor: pointer;
        }


        /* =========================
           RESULTS HEADER
        ========================= */

        .history-results-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;

            margin-top: 34px;
            margin-bottom: 14px;
        }

        .section-kicker {
            color: #00A83B;

            font-size: 9px;
            font-weight: 850;
            letter-spacing: .13em;
        }

        .history-results-header h2 {
            margin: 6px 0 0;

            color: #071A2D;

            font-size: 22px;
            letter-spacing: -.035em;
        }

        .result-count {
            color: #92A0AA;

            font-size: 10px;
        }


        /* =========================
           HISTORY LIST
        ========================= */

        .history-list {
            overflow: hidden;

            border: 1px solid #DEE7EB;
            border-radius: 19px;

            background: white;

            box-shadow:
                0 10px 30px rgba(7,26,45,.035);
        }

        .history-card {
            width: 100%;

            display: grid;
            grid-template-columns:
                46px minmax(220px, 1fr)
                150px 105px 145px 22px;

            align-items: center;

            gap: 15px;

            padding: 18px 20px;

            border: none;
            border-bottom: 1px solid #EDF1F3;

            background: white;

            color: #071A2D;

            text-align: left;

            font-family: inherit;

            cursor: pointer;

            transition:
                background .18s ease,
                transform .18s ease;
        }

        .history-card:last-child {
            border-bottom: none;
        }

        .history-card:hover {
            background: #FBFDFC;
        }

        .history-card-icon {
            width: 39px;
            height: 39px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 12px;

            background: #EFFBF4;
            color: #00A83B;
        }

        .history-card-icon.cancelled,
        .history-card-icon.expired {
            background: #FFF1F1;
            color: #C62828;
        }

        .history-card-icon.completed {
            background: #EEF6FF;
            color: #2878BD;
        }

        .history-card-main {
            min-width: 0;
        }

        .history-card-title {
            display: flex;
            align-items: center;
            flex-wrap: wrap;

            gap: 8px;
        }

        .history-card-title h3 {
            overflow: hidden;

            margin: 0;

            color: #071A2D;

            font-size: 13px;
            font-weight: 700;

            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .history-card-main > p {
            overflow: hidden;

            margin: 5px 0 0;

            color: #91A0AA;

            font-size: 10px;

            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .history-status {
            display: inline-flex;
            align-items: center;

            gap: 5px;

            padding: 5px 8px;

            border-radius: 20px;

            font-size: 7px;
            font-weight: 850;

            text-transform: uppercase;
            letter-spacing: .05em;

            white-space: nowrap;
        }

        .history-status > span {
            width: 5px;
            height: 5px;

            border-radius: 50%;

            background: currentColor;
        }

        .history-status.completed {
            background: #EEF6FF;
            color: #2878BD;
        }

        .history-status.cancelled {
            background: #FFF0F0;
            color: #C62828;
        }

        .history-status.expired {
            background: #F1F3F5;
            color: #75818A;
        }

        .history-status.waiting {
            background: #FFF7E8;
            color: #A46B00;
        }

        .history-status.notified {
            background: #EEF6FF;
            color: #2878BD;
        }

        .history-status.charging {
            background: #EDF9F1;
            color: #008F35;
        }

        .history-card-detail,
        .history-card-date {
            display: flex;
            flex-direction: column;

            gap: 4px;

            min-width: 0;
        }

        .history-card-detail span {
            color: #9AA8B3;

            font-size: 7px;
            font-weight: 850;

            letter-spacing: .08em;
        }

        .history-card-detail strong {
            overflow: hidden;

            color: #526675;

            font-size: 10px;
            font-weight: 650;

            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .history-card-date {
            flex-direction: row;
            align-items: center;

            gap: 8px;

            color: #8A9AA8;
        }

        .history-card-date > svg {
            flex-shrink: 0;
            color: #A0AFB8;
        }

        .history-card-date div {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .history-card-date strong {
            color: #526675;
            font-size: 10px;
            font-weight: 650;
        }

        .history-card-date span {
            color: #A0ADB6;
            font-size: 9px;
        }

        .history-card-arrow {
            color: #B0BCC4;

            transition:
                transform .2s ease,
                color .2s ease;
        }

        .history-card:hover .history-card-arrow {
            transform: translateX(3px);
            color: #00A83B;
        }


        /* =========================
           EMPTY
        ========================= */

        .history-empty {
            min-height: 300px;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            padding: 45px 25px;

            border: 1px dashed #D6E1E6;
            border-radius: 19px;

            background: white;

            text-align: center;
        }

        .history-empty-icon {
            width: 58px;
            height: 58px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 16px;

            border-radius: 17px;

            background: #EFFBF4;
            color: #00A83B;
        }

        .history-empty > span {
            color: #00A83B;

            font-size: 8px;
            font-weight: 850;

            letter-spacing: .13em;
        }

        .history-empty h3 {
            margin: 7px 0 0;

            color: #071A2D;

            font-size: 21px;
            letter-spacing: -.03em;
        }

        .history-empty p {
            max-width: 400px;

            margin: 7px 0 0;

            color: #8A9AA8;

            font-size: 12px;
            line-height: 1.55;
        }

        .history-empty button {
            height: 38px;

            margin-top: 18px;
            padding: 0 15px;

            border: 1px solid #DCE6E0;
            border-radius: 9px;

            background: white;

            color: #00A83B;

            font-size: 11px;
            font-weight: 750;

            cursor: pointer;
        }


        /* =========================
           DRAWER
        ========================= */

        .history-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;

            display: flex;
            justify-content: flex-end;

            background: rgba(7,26,45,.28);

            backdrop-filter: blur(3px);
        }

        .history-drawer {
            width: min(440px, 100%);

            height: 100%;

            overflow-y: auto;

            padding: 30px;

            background: white;

            box-shadow:
                -12px 0 40px rgba(7,26,45,.12);

            animation:
                drawerIn .24s ease-out;
        }

        @keyframes drawerIn {
            from {
                transform: translateX(30px);
                opacity: .6;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .drawer-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;
        }

        .drawer-kicker {
            color: #00A83B;

            font-size: 8px;
            font-weight: 850;

            letter-spacing: .13em;
        }

        .drawer-header h2 {
            margin: 7px 0 0;

            color: #071A2D;

            font-size: 24px;
            letter-spacing: -.04em;
        }

        .drawer-close {
            width: 35px;
            height: 35px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            border-radius: 9px;

            background: #F1F4F5;
            color: #697B88;

            cursor: pointer;
        }

        .drawer-status {
            margin-top: 19px;
        }

        .drawer-station {
            display: flex;
            align-items: center;

            gap: 13px;

            margin-top: 24px;
            padding-bottom: 24px;

            border-bottom: 1px solid #EAEFF2;
        }

        .drawer-station-icon {
            width: 48px;
            height: 48px;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 14px;

            background: #EFFBF4;
            color: #00A83B;
        }

        .drawer-station div:last-child {
            min-width: 0;

            display: flex;
            flex-direction: column;

            gap: 5px;
        }

        .drawer-station span {
            color: #9AA8B3;

            font-size: 7px;
            font-weight: 850;

            letter-spacing: .1em;
        }

        .drawer-station strong {
            overflow: hidden;

            color: #071A2D;

            font-size: 16px;

            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .drawer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;

            gap: 10px;

            margin-top: 23px;
        }

        .drawer-grid > div {
            min-height: 72px;

            padding: 13px;

            border: 1px solid #E5EBEE;
            border-radius: 12px;

            background: #FBFCFD;
        }

        .drawer-grid span {
            display: block;

            color: #9AA8B3;

            font-size: 7px;
            font-weight: 850;

            letter-spacing: .09em;
        }

        .drawer-grid strong {
            display: block;

            margin-top: 6px;

            color: #071A2D;

            font-size: 11px;

            word-break: break-word;
        }

        .drawer-note {
            display: flex;
            align-items: flex-start;

            gap: 10px;

            margin-top: 22px;
            padding: 14px;

            border-radius: 11px;

            background: #F5F9F7;

            color: #00A83B;
        }

        .drawer-note p {
            margin: 0;

            color: #718595;

            font-size: 11px;
            line-height: 1.55;
        }


        /* =========================
           LOADING
        ========================= */

        .history-loading {
            margin-top: 15px;
        }

        .loading-line,
        .loading-toolbar,
        .loading-list > div {
            background:
                linear-gradient(
                    90deg,
                    #E8EDF0,
                    #F7F9FA,
                    #E8EDF0
                );

            background-size: 200% 100%;

            animation:
                shimmer 1.3s linear infinite;

            border-radius: 10px;
        }

        @keyframes shimmer {
            from {
                background-position: 100% 0;
            }

            to {
                background-position: -100% 0;
            }
        }

        .loading-line.eyebrow {
            width: 130px;
            height: 13px;
        }

        .loading-line.title {
            width: 430px;
            max-width: 80%;

            height: 58px;

            margin-top: 15px;
        }

        .loading-line.text {
            width: 540px;
            max-width: 90%;

            height: 17px;

            margin-top: 13px;
        }

        .loading-toolbar {
            height: 45px;

            margin-top: 34px;
        }

        .loading-list {
            display: flex;
            flex-direction: column;

            gap: 1px;

            margin-top: 16px;
        }

        .loading-list > div {
            height: 76px;
        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 950px) {

            .history-card {
                grid-template-columns:
                    44px minmax(200px, 1fr)
                    130px 105px 24px;
            }

            .history-card-date {
                display: none;
            }

        }


        @media (max-width: 760px) {

            /*
             * Mobile layout
             *
             * Keep the desktop composition untouched. On phones the
             * page uses tighter spacing, smaller type and compact cards
             * so more useful history content fits on screen.
             */

            .history-page {
                padding: 20px 14px 36px;
            }

            .history-shell {
                width: 100%;
            }

            .history-hero {
                align-items: flex-start;
                flex-direction: column;
                gap: 0;
            }

            .history-eyebrow {
                font-size: 9px;
            }

            .history-eyebrow span {
                width: 20px;
                height: 20px;
                border-radius: 6px;
            }

            .history-hero h1 {
                margin-top: 9px;
                font-size: 31px;
                line-height: 1.02;
                letter-spacing: -.045em;
                max-width: 330px;
            }

            .history-hero p {
                max-width: 360px;
                margin-top: 9px;
                font-size: 11px;
                line-height: 1.45;
            }

            .history-summary {
                grid-template-columns: 1fr;
                gap: 9px;
                margin-top: 20px;
            }

            .summary-card {
                min-height: 76px;
                gap: 11px;
                padding: 13px 14px;
                border-radius: 14px;
            }

            .summary-icon {
                width: 35px;
                height: 35px;
                border-radius: 10px;
            }

            .summary-card span {
                font-size: 7px;
            }

            .summary-card strong {
                margin-top: 3px;
                font-size: 22px;
            }

            .summary-card small {
                margin-top: 3px;
                font-size: 9px;
            }

            .history-controls {
                align-items: stretch;
                flex-direction: column;
                gap: 7px;
                margin-top: 18px;
            }

            .history-search,
            .history-filter {
                height: 39px;
                border-radius: 10px;
            }

            .history-search {
                padding: 0 11px;
            }

            .history-search input {
                font-size: 11px;
            }

            .history-filter {
                width: 100%;
                padding: 0 10px;
            }

            .history-filter select {
                font-size: 10px;
            }

            .history-results-header {
                margin-top: 22px;
                margin-bottom: 9px;
            }

            .section-kicker {
                font-size: 8px;
            }

            .history-results-header h2 {
                margin-top: 4px;
                font-size: 18px;
            }

            .result-count {
                font-size: 9px;
            }

            .history-list {
                border-radius: 14px;
            }

            .history-card {
                grid-template-columns:
                    34px minmax(0, 1fr) 18px;

                gap: 9px;
                padding: 12px 11px;
            }

            .history-card-icon {
                width: 34px;
                height: 34px;
                border-radius: 10px;
            }

            .history-card-icon svg {
                width: 16px;
                height: 16px;
            }

            .history-card-title {
                gap: 5px;
            }

            .history-card-title h3 {
                font-size: 11px;
            }

            .history-card-main > p {
                margin-top: 3px;
                font-size: 8px;
            }

            .history-status {
                gap: 4px;
                padding: 4px 6px;
                font-size: 6px;
            }

            .history-status > span {
                width: 4px;
                height: 4px;
            }

            .history-card-arrow {
                grid-column: 3;
            }

            .history-card-arrow svg {
                width: 14px;
                height: 14px;
            }

            .history-card-main {
                grid-column: 2;
            }

            .history-empty {
                min-height: 220px;
                padding: 30px 18px;
                border-radius: 14px;
            }

            .history-empty-icon {
                width: 48px;
                height: 48px;
                margin-bottom: 12px;
                border-radius: 14px;
            }

            .history-empty h3 {
                font-size: 18px;
            }

            .history-empty p {
                font-size: 10px;
            }

            .history-empty button {
                height: 34px;
                margin-top: 14px;
                padding: 0 13px;
                font-size: 10px;
            }

            .history-drawer {
                width: min(390px, 100%);
                padding: 20px 15px;
            }

            .drawer-header {
                gap: 12px;
            }

            .drawer-header h2 {
                margin-top: 5px;
                font-size: 20px;
            }

            .drawer-status {
                margin-top: 13px;
            }

            .drawer-station {
                gap: 10px;
                margin-top: 17px;
                padding-bottom: 17px;
            }

            .drawer-station-icon {
                width: 40px;
                height: 40px;
                border-radius: 11px;
            }

            .drawer-station strong {
                font-size: 14px;
            }

            .drawer-grid {
                gap: 7px;
                margin-top: 16px;
            }

            .drawer-grid > div {
                min-height: 60px;
                padding: 10px;
                border-radius: 10px;
            }

            .drawer-grid strong {
                margin-top: 4px;
                font-size: 10px;
            }

            .drawer-note {
                gap: 8px;
                margin-top: 15px;
                padding: 11px;
            }

            .drawer-note p {
                font-size: 10px;
            }

        }


        @media (max-width: 500px) {

            .history-page {
                padding: 17px 12px 30px;
            }

            .history-hero h1 {
                font-size: 28px;
                max-width: 300px;
            }

            .history-hero p {
                font-size: 10px;
            }

            .history-summary {
                margin-top: 17px;
            }

            .summary-card {
                min-height: 70px;
                padding: 11px 12px;
            }

            .summary-icon {
                width: 32px;
                height: 32px;
                border-radius: 9px;
            }

            .summary-card strong {
                font-size: 20px;
            }

            .summary-card small {
                font-size: 8px;
            }

            .history-controls {
                margin-top: 15px;
            }

            .history-results-header {
                margin-top: 18px;
            }

            .history-results-header h2 {
                font-size: 17px;
            }

            .history-card {
                grid-template-columns:
                    31px minmax(0, 1fr) 16px;

                gap: 8px;
                padding: 10px 9px;
            }

            .history-card-icon {
                width: 31px;
                height: 31px;
            }

            .history-card-title h3 {
                font-size: 10px;
            }

            .history-card-main > p {
                font-size: 7px;
            }

            .history-status {
                padding: 3px 5px;
                font-size: 5.5px;
            }

            .history-drawer {
                padding: 18px 13px;
            }

            .drawer-grid {
                grid-template-columns: 1fr;
            }

        }

    `}</style>
);

export default History;
