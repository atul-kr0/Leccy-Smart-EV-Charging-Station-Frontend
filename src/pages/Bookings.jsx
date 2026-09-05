import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/bookings`;
const STOP_CHARGING_URL =
    `${import.meta.env.VITE_API_URL}/api/charging-session/stop`;

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
            // Some backend responses are not JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

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
    LIVE_STATUSES.includes(normalizeStatus(status));

const isChargingStatus = (status) =>
    normalizeStatus(status) === "CHARGING";

const getTimerKey = (bookingId) =>
    `leccy_charging_start_${bookingId}`;

const getChargingStart = (booking) => {
    const possibleValues = [
        booking?.chargingStartedAt,
        booking?.startedAt,
        booking?.startTime,
    ];

    for (const value of possibleValues) {
        if (!value) continue;

        const timestamp = new Date(value).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    return null;
};

const formatDuration = (minutes) => {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours > 0) {
        return `${hours}h ${String(mins).padStart(2, "0")}m`;
    }

    return `${mins}m`;
};

const formatCountdown = (seconds) => {
    const safe = Math.max(
        0,
        Math.floor(Number(seconds) || 0)
    );

    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(
            minutes
        ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
        secs
    ).padStart(2, "0")}`;
};

/*
 * Timer colour:
 * START  -> red
 *         -> orange
 *         -> amber/yellow
 * FINISH -> green
 *
 * The ring itself shrinks because it represents REMAINING TIME.
 */
const getTimerColor = (remainingRatio) => {
    const progress = 1 - Math.max(
        0,
        Math.min(1, remainingRatio)
    );

    const stops = [
        [0, "#EF4444"],
        [0.33, "#F97316"],
        [0.66, "#F59E0B"],
        [1, "#16A34A"],
    ];

    for (let i = 1; i < stops.length; i++) {
        if (progress <= stops[i][0]) {
            const [p1, c1] = stops[i - 1];
            const [p2, c2] = stops[i];
            const amount = (progress - p1) / (p2 - p1);

            return interpolateColor(c1, c2, amount);
        }
    }

    return "#16A34A";
};

const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");

    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16),
    };
};

const interpolateColor = (first, second, amount) => {
    const a = hexToRgb(first);
    const b = hexToRgb(second);

    const channel = (x, y) =>
        Math.round(x + (y - x) * amount)
            .toString(16)
            .padStart(2, "0");

    return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(
        a.b,
        b.b
    )}`;
};

/* =========================================================
   ICONS
========================================================= */

const Icon = ({ name, size = 20 }) => {
    const paths = {
        bolt: (
            <path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z" />
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        location: (
            <>
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),
        charger: (
            <>
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <path d="M9 7h6M9 11h6M9 15h3" />
                <path d="M18 7h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </>
        ),
        ticket: (
            <path d="M4 7a3 3 0 0 0 0 6v5h16v-5a3 3 0 0 0 0-6V4H4v3Z" />
        ),
        check: (
            <path d="m5 12 4 4L19 6" />
        ),
        arrow: (
            <path d="M5 12h14m-6-6 6 6-6 6" />
        ),
        spark: (
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
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
   MAIN
========================================================= */

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const syncInFlight = useRef(false);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [stoppingId, setStoppingId] = useState(null);
    const [now, setNow] = useState(Date.now());

    const fetchBookings = useCallback(async (initial = false) => {
        if (syncInFlight.current) return;

        syncInFlight.current = true;

        try {
            if (initial) setLoading(true);

            const data = await apiFetch(API_URL);

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.content)
                    ? data.content
                    : Array.isArray(data?.bookings)
                        ? data.bookings
                        : [];

            /*
             * This page is for active bookings only.
             * As soon as the backend changes a booking to a terminal
             * state (COMPLETED, CANCELLED, EXPIRED, NO_SHOW, etc.),
             * remove it from this page automatically.
             * No full browser reload and no error message are needed.
             */
            setBookings(list.filter((booking) => isLiveStatus(booking?.status)));
            setError("");
            setLastSyncedAt(Date.now());

            /* Clean up countdown storage for bookings that are no longer live. */
            list.forEach((booking) => {
                if (
                    booking?.bookingId
                    && !isLiveStatus(booking?.status)
                ) {
                    localStorage.removeItem(
                        getTimerKey(booking.bookingId)
                    );
                }
            });
        } catch (err) {
            console.error("Booking sync failed:", err);

            /*
             * Only the first load needs a visible error.
             * Background sync failures should not replace a working
             * booking card or flash an error while the page is live.
             */
            if (initial) {
                setError(
                    err.message ||
                        "Unable to load your bookings."
                );
            }
        } finally {
            if (initial) setLoading(false);
            syncInFlight.current = false;
        }
    }, []);

    useEffect(() => {
        fetchBookings(true);

        /*
         * Background polling keeps booking status current without
         * forcing a full browser reload.
         */
        const interval = window.setInterval(() => {
            fetchBookings(false);
        }, 3000);

        /* Refresh immediately when the user returns to the tab. */
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchBookings(false);
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            window.clearInterval(interval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [fetchBookings]);

    const activeBooking = useMemo(
        () =>
            bookings.find((booking) =>
                isLiveStatus(booking?.status)
            ) || null,
        [bookings]
    );

    /*
     * Keep a one-second clock only while a charging session
     * exists. The backend remains the source of truth for status.
     */
    useEffect(() => {
        if (!activeBooking || !isChargingStatus(activeBooking.status)) {
            return;
        }

        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [activeBooking]);

    /*
     * If the backend doesn't return a start timestamp, keep
     * a local fallback so refreshing the page doesn't reset
     * the visual countdown.
     */
    useEffect(() => {
        bookings.forEach((booking) => {
            if (
                !booking?.bookingId ||
                !isChargingStatus(booking.status)
            ) {
                return;
            }

            const backendStart = getChargingStart(booking);
            const key = getTimerKey(booking.bookingId);

            if (backendStart) {
                localStorage.setItem(
                    key,
                    String(backendStart)
                );
                return;
            }

            if (!localStorage.getItem(key)) {
                localStorage.setItem(
                    key,
                    String(Date.now())
                );
            }
        });
    }, [bookings]);

    const handleCancel = async (bookingId) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this booking?"
            )
        ) {
            return;
        }

        try {
            setCancellingId(bookingId);
            setError("");

            await apiFetch(`${API_URL}/${bookingId}`, {
                method: "DELETE",
            });

            await fetchBookings(false);
        } catch (err) {
            console.error("Cancellation failed:", err);
            setError(
                err.message ||
                    "Unable to cancel this booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    /*
     * IMPORTANT:
     * Backend expects:
     * Authorization: Bearer <JWT>
     * POST /api/charging-session/stop
     * { "token": "<booking token>" }
     */
    const handleStopCharging = async (booking) => {
        const token = booking?.tokenNumber;

        if (!token) {
            setError(
                "Charging token is missing for this booking."
            );
            return;
        }

        if (
            !window.confirm(
                "Stop the charging session? The session will be completed."
            )
        ) {
            return;
        }

        try {
            setStoppingId(booking.bookingId);
            setError("");

            await apiFetch(STOP_CHARGING_URL, {
                method: "POST",
                body: JSON.stringify({
                    token,
                }),
            });

            localStorage.removeItem(
                getTimerKey(booking.bookingId)
            );

            await fetchBookings(false);
        } catch (err) {
            console.error("Stop charging failed:", err);
            setError(
                err.message ||
                    "Unable to stop charging."
            );
        } finally {
            setStoppingId(null);
        }
    };

    if (loading) {
        return (
            <>
                <PageStyles />
                <main className="bookings-page">
                    <div className="loading-shell">
                        <div className="loading-line small" />
                        <div className="loading-line title" />
                        <div className="loading-line text" />

                        <div className="loading-stats">
                            <div />
                            <div />
                            <div />
                        </div>

                        <div className="loading-hero" />
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <PageStyles />

            <main className="bookings-page">
                <div className="bookings-shell">
                    {/* =================================================
                        HERO
                    ================================================= */}

                    <header className="booking-hero reveal">
                        <div>
                            <div className="eyebrow">
                                <span className="eyebrow-bolt">
                                    <Icon name="bolt" size={13} />
                                </span>
                                CHARGING HUB
                            </div>

                            <h1>
                                Your charging
                                <span> journey.</span>
                            </h1>

                            <p>
                                Manage your active booking, track your
                                charging session, and stay ready for
                                your next charge.
                            </p>
                        </div>

                        <div
                            className="live-sync"
                            aria-live="polite"
                            title={
                                lastSyncedAt
                                    ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                                    : "Booking status updates automatically"
                            }
                        >
                            <span className="live-sync-dot" />
                            <div>
                                <strong>Live updates</strong>
                                <small>Booking status syncs automatically</small>
                            </div>
                        </div>
                    </header>

                    {/* =================================================
                        QUICK OVERVIEW
                    ================================================= */}

                    <section className="overview-grid">
                        <OverviewCard
                            className="green-overview"
                            icon="bolt"
                            label="Current booking"
                            value={
                                activeBooking
                                    ? getStatusLabel(activeBooking.status)
                                    : "None"
                            }
                            detail={
                                activeBooking
                                    ? activeBooking.stationName ||
                                      "Charging station"
                                    : "No active booking"
                            }
                        />

                        <OverviewCard
                            icon="charger"
                            label="Charger"
                            value={
                                activeBooking?.chargerNumber
                                    ? `#${activeBooking.chargerNumber}`
                                    : "—"
                            }
                            detail={
                                activeBooking
                                    ? activeBooking.chargerNumber
                                        ? "Assigned to your booking"
                                        : "Waiting for assignment"
                                    : "Book a charger to get started"
                            }
                        />

                        <button
                            type="button"
                            className="overview-action-card reveal"
                            onClick={() => {
                                window.location.href = "/home/find-charger";
                            }}
                        >
                            <div className="overview-icon">
                                <Icon name="location" size={19} />
                            </div>

                            <div className="overview-copy">
                                <span>QUICK ACTION</span>
                                <strong>Find a charger</strong>
                                <small>
                                    Browse nearby charging stations
                                </small>
                            </div>

                            <Icon name="arrow" size={17} />
                        </button>
                    </section>

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="error-banner">
                            <span>!</span>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* =================================================
                        CURRENT SESSION
                    ================================================= */}

                    <section className="current-section">
                        <div className="section-heading reveal">
                            <div>
                                <div className="section-kicker">
                                    CURRENT SESSION
                                </div>
                                <h2>
                                    {activeBooking
                                        ? "You're on your way."
                                        : "Ready when you are."}
                                </h2>
                                <p>
                                    {activeBooking
                                        ? "Your booking status and charging journey are shown below."
                                        : "No charging session is active right now."}
                                </p>
                            </div>

                            {activeBooking && (
                                <div className="live-badge">
                                    <span />
                                    LIVE
                                </div>
                            )}
                        </div>

                        {activeBooking ? (
                            <ActiveBooking
                                booking={activeBooking}
                                now={now}
                                onCancel={handleCancel}
                                onStopCharging={
                                    handleStopCharging
                                }
                                cancellingId={cancellingId}
                                stoppingId={stoppingId}
                            />
                        ) : (
                            <EmptyState />
                        )}
                    </section>


                </div>
            </main>
        </>
    );
};

/* =========================================================
   ACTIVE BOOKING
========================================================= */

const ActiveBooking = ({
    booking,
    now,
    onCancel,
    onStopCharging,
    cancellingId,
    stoppingId,
}) => {
    const status = normalizeStatus(booking.status);
    const charging = status === "CHARGING";

    const countdown = useMemo(() => {
        if (!charging) {
            return {
                remainingSeconds: 0,
                remainingRatio: 1,
                totalSeconds: 0,
                hasTimer: false,
            };
        }

        const durationMinutes = Number(
            booking?.estimatedChargingDuration
        );

        if (
            !Number.isFinite(durationMinutes) ||
            durationMinutes <= 0
        ) {
            return {
                remainingSeconds: 0,
                remainingRatio: 1,
                totalSeconds: 0,
                hasTimer: false,
            };
        }

        const totalSeconds =
            durationMinutes * 60;

        let startTime = getChargingStart(booking);

        if (!startTime) {
            const stored = localStorage.getItem(
                getTimerKey(booking.bookingId)
            );

            const parsed = Number(stored);

            if (Number.isFinite(parsed) && parsed > 0) {
                startTime = parsed;
            }
        }

        if (!startTime) {
            return {
                remainingSeconds: totalSeconds,
                remainingRatio: 1,
                totalSeconds,
                hasTimer: false,
            };
        }

        const elapsed = Math.max(
            0,
            (now - startTime) / 1000
        );

        const remaining = Math.max(
            0,
            totalSeconds - elapsed
        );

        const remainingRatio = Math.max(
            0,
            Math.min(
                1,
                remaining / totalSeconds
            )
        );

        return {
            remainingSeconds: remaining,
            remainingRatio,
            totalSeconds,
            hasTimer: true,
        };
    }, [booking, charging, now]);

    const timerColor = getTimerColor(
        countdown.remainingRatio
    );

    const radius = 108;
    const circumference =
        2 * Math.PI * radius;

    const dashOffset =
        circumference *
        (1 - countdown.remainingRatio);

    const progressPercent = Math.round(
        (1 - countdown.remainingRatio) * 100
    );

    const station =
        booking.stationName ||
        "Charging Station";

    const charger =
        booking.chargerNumber
            ? `Charger #${booking.chargerNumber}`
            : booking.chargerId
                ? `Charger ID ${booking.chargerId}`
                : "Charger assignment pending";

    return (
        <article
            className={`active-card reveal ${
                charging ? "is-charging" : ""
            }`}
        >
            <div className="active-card-top">
                <div className="station-identity">
                    <div className="station-icon">
                        <Icon name="bolt" size={22} />
                    </div>

                    <div>
                        <div className="status-line">
                            <span
                                className={`status-dot ${status.toLowerCase()}`}
                            />
                            {getStatusLabel(status)}
                        </div>

                        <h3>{station}</h3>

                        <p>
                            {charger}
                            {booking.bookingId
                                ? ` · Booking #${booking.bookingId}`
                                : ""}
                        </p>
                    </div>
                </div>

                {status === "WAITING" && (
                    <button
                        className="danger-outline"
                        onClick={() =>
                            onCancel(
                                booking.bookingId
                            )
                        }
                        disabled={
                            cancellingId ===
                            booking.bookingId
                        }
                    >
                        {cancellingId ===
                        booking.bookingId
                            ? "Cancelling..."
                            : "Cancel booking"}
                    </button>
                )}
            </div>

            {charging ? (
                <div className="charging-layout">
                    {/* TIMER */}

                    <div className="timer-column">
                        <div
                            className="timer-orbit"
                            style={{
                                "--timer-color":
                                    timerColor,
                            }}
                        >
                            <div className="timer-glow" />

                            <svg
                                viewBox="0 0 240 240"
                                className="timer-svg"
                            >
                                <circle
                                    cx="120"
                                    cy="120"
                                    r={radius}
                                    fill="none"
                                    stroke="#E8EEF2"
                                    strokeWidth="11"
                                />

                                <circle
                                    cx="120"
                                    cy="120"
                                    r={radius}
                                    fill="none"
                                    stroke={timerColor}
                                    strokeWidth="11"
                                    strokeLinecap="round"
                                    strokeDasharray={
                                        circumference
                                    }
                                    strokeDashoffset={
                                        dashOffset
                                    }
                                />
                            </svg>

                            <div className="timer-content">
                                <span className="timer-label">
                                    TIME REMAINING
                                </span>

                                <strong>
                                    {countdown.hasTimer
                                        ? formatCountdown(
                                            countdown.remainingSeconds
                                        )
                                        : `${Math.round(
                                            Number(
                                                booking.estimatedChargingDuration
                                            ) || 0
                                        )}:00`}
                                </strong>

                                <span className="timer-sub">
                                    {progressPercent}% elapsed
                                </span>
                            </div>
                        </div>

                        <div
                            className="charging-now"
                            style={{
                                color: timerColor,
                            }}
                        >
                            <span />
                            Charging now
                        </div>
                    </div>

                    {/* DETAILS */}

                    <div className="charging-details">
                        <div className="charging-intro">
                            <span>⚡ LIVE CHARGING</span>
                            <h4>
                                Your vehicle is charging.
                            </h4>
                            <p>
                                The remaining time updates
                                continuously while your session
                                is active.
                            </p>
                        </div>

                        <div className="detail-grid">
                            <Detail
                                label="Charger"
                                value={
                                    booking.chargerNumber
                                        ? `#${booking.chargerNumber}`
                                        : booking.chargerId
                                            ? `ID ${booking.chargerId}`
                                            : "—"
                                }
                                icon="charger"
                            />

                            <Detail
                                label="Token"
                                value={
                                    booking.tokenNumber
                                        ? `#${booking.tokenNumber}`
                                        : "—"
                                }
                                icon="ticket"
                            />

                            <Detail
                                label="Estimated"
                                value={
                                    booking.estimatedChargingDuration !=
                                    null
                                        ? formatDuration(
                                            booking.estimatedChargingDuration
                                        )
                                        : "—"
                                }
                                icon="clock"
                            />

                            <Detail
                                label="Started"
                                value={
                                    getChargingStart(
                                        booking
                                    )
                                        ? formatDate(
                                            getChargingStart(
                                                booking
                                            )
                                        )
                                        : "Session active"
                                }
                                icon="bolt"
                            />
                        </div>

                        <div className="session-progress">
                            <div className="progress-heading">
                                <span>Charging progress</span>
                                <b>{progressPercent}%</b>
                            </div>

                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${progressPercent}%`,
                                        background:
                                            timerColor,
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            className="stop-button"
                            onClick={() =>
                                onStopCharging(
                                    booking
                                )
                            }
                            disabled={
                                stoppingId ===
                                booking.bookingId
                            }
                        >
                            <Icon name="bolt" size={17} />
                            {stoppingId ===
                            booking.bookingId
                                ? "Stopping charging..."
                                : "Stop charging"}
                        </button>
                    </div>
                </div>
            ) : (
                <PreChargingState
                    booking={booking}
                />
            )}
        </article>
    );
};

/* =========================================================
   WAITING / NOTIFIED
========================================================= */

const PreChargingState = ({ booking }) => {
    const status = normalizeStatus(
        booking.status
    );

    const isReady = status === "NOTIFIED";

    return (
        <div className="precharging-layout">
            <div className="journey-panel">
                <div className="journey-title">
                    YOUR CHARGING JOURNEY
                </div>

                <JourneyStep
                    active
                    complete
                    number="01"
                    title="Booking confirmed"
                    text="Your charging request has been registered."
                />

                <JourneyStep
                    active={isReady}
                    complete={isReady}
                    number="02"
                    title="Charger assignment"
                    text={
                        isReady
                            ? "A suitable charger is ready for you."
                            : "We're waiting for a suitable charger."
                    }
                />

                <JourneyStep
                    active={false}
                    number="03"
                    title="Charging starts"
                    text="Enter your token at the station to begin."
                />
            </div>

            <div
                className={`queue-panel ${
                    isReady ? "ready" : ""
                }`}
            >
                <div className="queue-icon">
                    <Icon
                        name={
                            isReady
                                ? "charger"
                                : "clock"
                        }
                        size={25}
                    />
                </div>

                <div className="queue-kicker">
                    {isReady
                        ? "CHARGER READY"
                        : "IN THE QUEUE"}
                </div>

                <h4>
                    {isReady
                        ? "Your charger is waiting."
                        : "We're finding your charger."}
                </h4>

                <p>
                    {isReady
                        ? booking.chargerNumber
                            ? `Proceed to charger #${booking.chargerNumber} and enter your token to start charging.`
                            : "Proceed to the station and enter your token to start charging."
                        : "You'll be notified as soon as a suitable charger becomes available."}
                </p>

                <div className="token-box">
                    <span>YOUR TOKEN</span>
                    <strong>
                        {booking.tokenNumber
                            ? `#${booking.tokenNumber}`
                            : "—"}
                    </strong>
                </div>

                <div className="queue-meta">
                    <span>
                        <Icon
                            name="clock"
                            size={15}
                        />
                        Estimated charge
                    </span>

                    <b>
                        {booking.estimatedChargingDuration !=
                        null
                            ? formatDuration(
                                booking.estimatedChargingDuration
                            )
                            : "—"}
                    </b>
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const OverviewCard = ({
    icon,
    label,
    value,
    detail,
    className = "",
}) => (
    <article
        className={`overview-card reveal ${className}`}
    >
        <div className="overview-icon">
            <Icon name={icon} size={19} />
        </div>

        <div className="overview-copy">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
        </div>

        <Icon
            name="arrow"
            size={17}
        />
    </article>
);

const Detail = ({
    icon,
    label,
    value,
}) => (
    <div className="detail-box">
        <div className="detail-icon">
            <Icon name={icon} size={16} />
        </div>

        <div>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    </div>
);

const JourneyStep = ({
    number,
    title,
    text,
    active,
    complete,
}) => (
    <div
        className={`journey-step ${
            active ? "active" : ""
        } ${complete ? "complete" : ""}`}
    >
        <div className="journey-number">
            {complete ? (
                <Icon name="check" size={14} />
            ) : (
                number
            )}
        </div>

        <div>
            <strong>{title}</strong>
            <p>{text}</p>
        </div>
    </div>
);

const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
        case "WAITING":
            return "Waiting";
        case "NOTIFIED":
            return "Charger ready";
        case "CHARGING":
            return "Charging";
        case "COMPLETED":
            return "Completed";
        case "CANCELLED":
            return "Cancelled";
        case "EXPIRED":
            return "Expired";
        default:
            return status || "Unknown";
    }
};

const EmptyState = () => (
    <div className="empty-session reveal">
        <div className="empty-visual">
            <div className="empty-ring ring-one" />
            <div className="empty-ring ring-two" />
            <div className="empty-bolt">
                <Icon name="bolt" size={31} />
            </div>
        </div>

        <div className="empty-copy">
            <div className="section-kicker">
                READY WHEN YOU ARE
            </div>

            <h3>
                No charging session is active.
            </h3>

            <p>
                Find a nearby charger and reserve your
                next charging slot. Your booking journey
                will appear here once you have one.
            </p>
        </div>
    </div>
);

/* =========================================================
   PAGE STYLES
========================================================= */

const PageStyles = () => (
    <style>{`
        * {
            box-sizing: border-box;
        }

        .bookings-page {
            min-height: 100%;
            background:
                radial-gradient(
                    circle at 88% 8%,
                    rgba(0,168,59,.055),
                    transparent 28%
                ),
                #F7F9FB;
            color: #071A2D;
            padding: 44px 34px 70px;
            overflow-x: hidden;
        }

        .bookings-shell {
            width: min(1120px, 100%);
            margin: 0 auto;
        }

        /* =========================
           ANIMATION
        ========================= */

        .reveal {
            animation:
                revealUp .65s cubic-bezier(.16,1,.3,1) both;
        }

        .overview-card:nth-child(1) {
            animation-delay: 80ms;
        }

        .overview-card:nth-child(2) {
            animation-delay: 150ms;
        }

        .overview-card:nth-child(3) {
            animation-delay: 220ms;
        }

        @keyframes revealUp {
            from {
                opacity: 0;
                transform: translateY(22px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes floatSoft {
            0%, 100% {
                transform: translateY(0);
            }

            50% {
                transform: translateY(-6px);
            }
        }

        @keyframes pulse {
            0% {
                box-shadow:
                    0 0 0 0 rgba(0,168,59,.18);
            }

            70% {
                box-shadow:
                    0 0 0 9px rgba(0,168,59,0);
            }

            100% {
                box-shadow:
                    0 0 0 0 rgba(0,168,59,0);
            }
        }

        @keyframes chargingGlow {
            0%, 100% {
                opacity: .18;
                transform: scale(.96);
            }

            50% {
                opacity: .38;
                transform: scale(1.05);
            }
        }

        @keyframes shimmer {
            0% {
                background-position: 200% 0;
            }

            100% {
                background-position: -200% 0;
            }
        }

        /* =========================
           HERO
        ========================= */

        .booking-hero {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 30px;
            margin-bottom: 28px;
        }

        .eyebrow,
        .section-kicker {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #00A83B;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: .16em;
        }

        .eyebrow-bolt {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .booking-hero h1 {
            margin: 9px 0 0;
            font-size: clamp(42px, 6vw, 68px);
            line-height: .98;
            letter-spacing: -.055em;
            font-weight: 850;
        }

        .booking-hero h1 span {
            color: #00A83B;
        }

        .booking-hero p {
            max-width: 690px;
            margin: 15px 0 0;
            color: #70849A;
            font-size: 16px;
            line-height: 1.65;
        }

        .live-sync {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 46px;
            padding: 9px 13px;
            border: 1px solid #DCE8E0;
            border-radius: 14px;
            background: #F7FCF9;
            box-shadow: 0 6px 20px rgba(7,26,45,.04);
        }

        .live-sync-dot {
            width: 9px;
            height: 9px;
            flex-shrink: 0;
            border-radius: 50%;
            background: #00A83B;
            box-shadow: 0 0 0 5px rgba(0,168,59,.10);
            animation: pulse 1.8s infinite;
        }

        .live-sync div {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .live-sync strong {
            color: #008E34;
            font-size: 12px;
            line-height: 1.1;
        }

        .live-sync small {
            color: #78909F;
            font-size: 10px;
            line-height: 1.2;
        }

        /* =========================
           OVERVIEW
        ========================= */

        .overview-grid {
            display: grid;
            grid-template-columns:
                repeat(3, minmax(0, 1fr));
            gap: 13px;
            margin-bottom: 38px;
        }

        .overview-card {
            min-height: 145px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 22px;
            border: 1px solid #DFE7EC;
            border-radius: 20px;
            background: white;
            box-shadow:
                0 8px 28px rgba(7,26,45,.045);
            transition:
                transform .25s ease,
                box-shadow .25s ease,
                border-color .25s ease;
        }

        .overview-card:hover {
            transform: translateY(-5px);
            box-shadow:
                0 16px 36px rgba(7,26,45,.08);
            border-color: #C8D8E0;
        }

        .overview-action-card {
            min-height: 145px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
            width: 100%;
            padding: 22px;
            border: 1px solid #DFE7EC;
            border-radius: 20px;
            background: white;
            color: #071A2D;
            text-align: left;
            box-shadow: 0 8px 28px rgba(7,26,45,.045);
            cursor: pointer;
            font: inherit;
            transition:
                transform .25s ease,
                box-shadow .25s ease,
                border-color .25s ease;
        }

        .overview-action-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 16px 36px rgba(7,26,45,.08);
            border-color: #C8D8E0;
        }

        .overview-action-card > svg {
            margin-left: auto;
            color: #A1B1BE;
            opacity: .7;
        }

        .overview-action-card .overview-copy strong {
            font-size: 23px;
        }

        .overview-card > svg {
            margin-left: auto;
            color: #A1B1BE;
            opacity: .7;
        }

        .overview-icon {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            background: #F1FBF5;
            color: #00A83B;
        }

        .overview-copy {
            display: flex;
            flex-direction: column;
        }

        .overview-copy span {
            color: #8395A6;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .overview-copy strong {
            margin-top: 7px;
            font-size: 31px;
            line-height: 1;
            letter-spacing: -.04em;
        }

        .overview-copy small {
            margin-top: 8px;
            color: #7A8FA2;
            font-size: 12px;
        }

        .green-overview {
            border-color: #BCE8CA;
            background:
                linear-gradient(
                    135deg,
                    #FFFFFF 0%,
                    #F2FFF6 100%
                );
        }

        .green-overview .overview-copy strong {
            color: #00A83B;
        }

        /* =========================
           ERROR
        ========================= */

        .error-banner {
            display: flex;
            align-items: center;
            gap: 11px;
            margin-bottom: 25px;
            padding: 13px 15px;
            border: 1px solid #FFD2D2;
            border-radius: 13px;
            background: #FFF5F5;
            color: #C62828;
            font-size: 14px;
        }

        .error-banner > span {
            width: 23px;
            height: 23px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #C62828;
            color: white;
            font-weight: 800;
        }

        /* =========================
           SECTIONS
        ========================= */

        .current-section {
            margin-top: 4px;
        }

        .section-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
            margin-bottom: 15px;
        }

        .section-heading h2 {
            margin: 5px 0 0;
            font-size: 25px;
            letter-spacing: -.035em;
        }

        .section-heading p {
            margin: 6px 0 0;
            color: #788EA2;
            font-size: 13px;
        }

        .live-badge {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 8px 12px;
            border-radius: 30px;
            background: #ECFBF2;
            color: #008E34;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: .1em;
        }

        .live-badge span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #00A83B;
            animation: pulse 1.8s infinite;
        }

        /* =========================
           ACTIVE CARD
        ========================= */

        .active-card {
            overflow: hidden;
            border: 1px solid #DCE6EB;
            border-radius: 25px;
            background: white;
            box-shadow:
                0 14px 45px rgba(7,26,45,.07);
        }

        .active-card.is-charging {
            border-color: #BDE8CA;
        }

        .active-card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 22px 25px;
            border-bottom: 1px solid #EDF1F4;
        }

        .station-identity {
            display: flex;
            align-items: center;
            gap: 13px;
        }

        .station-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 15px;
            background: #F0FBF4;
            color: #00A83B;
        }

        .status-line {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #71869A;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #A4B1BB;
        }

        .status-dot.waiting {
            background: #F59E0B;
        }

        .status-dot.notified {
            background: #2F80ED;
        }

        .status-dot.charging {
            background: #00A83B;
            animation: pulse 1.8s infinite;
        }

        .station-identity h3 {
            margin: 5px 0 0;
            font-size: 22px;
            letter-spacing: -.025em;
        }

        .station-identity p {
            margin: 4px 0 0;
            color: #8194A5;
            font-size: 12px;
        }

        .danger-outline {
            flex-shrink: 0;
            height: 39px;
            padding: 0 14px;
            border: 1px solid #F0BABA;
            border-radius: 11px;
            background: white;
            color: #C62828;
            font-size: 12px;
            font-weight: 750;
            cursor: pointer;
            transition: .2s ease;
        }

        .danger-outline:hover {
            background: #FFF5F5;
        }

        .danger-outline:disabled {
            opacity: .5;
            cursor: wait;
        }

        /* =========================
           CHARGING
        ========================= */

        .charging-layout {
            display: grid;
            grid-template-columns: 360px minmax(0, 1fr);
            min-height: 485px;
            background:
                radial-gradient(
                    circle at 15% 50%,
                    rgba(0,168,59,.065),
                    transparent 34%
                ),
                linear-gradient(
                    135deg,
                    #FBFEFC,
                    #FFFFFF
                );
        }

        .timer-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 35px 25px;
            border-right: 1px solid #E9F0EC;
        }

        .timer-orbit {
            position: relative;
            width: 275px;
            height: 275px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .timer-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
            overflow: visible;
        }

        .timer-svg circle:last-child {
            filter:
                drop-shadow(
                    0 0 8px
                    color-mix(
                        in srgb,
                        var(--timer-color) 25%,
                        transparent
                    )
                );
            transition:
                stroke .7s ease,
                stroke-dashoffset 1s linear;
        }

        .timer-glow {
            position: absolute;
            width: 185px;
            height: 185px;
            border-radius: 50%;
            background:
                radial-gradient(
                    circle,
                    color-mix(
                        in srgb,
                        var(--timer-color) 12%,
                        transparent
                    ),
                    transparent 68%
                );
            animation: chargingGlow 2.6s ease-in-out infinite;
        }

        .timer-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .timer-label {
            color: #7D91A2;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: .12em;
        }

        .timer-content strong {
            margin-top: 8px;
            color: var(--timer-color);
            font-size: 42px;
            line-height: 1;
            letter-spacing: -.055em;
            font-variant-numeric: tabular-nums;
            transition: color .7s ease;
        }

        .timer-sub {
            margin-top: 8px;
            color: #8395A5;
            font-size: 11px;
        }

        .charging-now {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-top: 16px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .09em;
            transition: color .7s ease;
        }

        .charging-now span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 1.8s infinite;
        }

        .charging-details {
            padding: 34px 34px 30px;
        }

        .charging-intro > span {
            color: #00A83B;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: .13em;
        }

        .charging-intro h4 {
            margin: 7px 0 0;
            font-size: 25px;
            letter-spacing: -.035em;
        }

        .charging-intro p {
            max-width: 510px;
            margin: 7px 0 0;
            color: #7C91A3;
            font-size: 13px;
            line-height: 1.55;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
            margin-top: 24px;
        }

        .detail-box {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 65px;
            padding: 11px;
            border: 1px solid #E6EDF1;
            border-radius: 13px;
            background: #FBFCFD;
        }

        .detail-icon {
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 10px;
            background: #F0F8F3;
            color: #00A83B;
        }

        .detail-box > div:last-child {
            min-width: 0;
        }

        .detail-box span,
        .detail-box strong {
            display: block;
        }

        .detail-box span {
            color: #8A9CAB;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
        }

        .detail-box strong {
            margin-top: 4px;
            color: #071A2D;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-progress {
            margin-top: 25px;
        }

        .progress-heading {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #73889B;
            font-size: 11px;
            font-weight: 750;
        }

        .progress-heading b {
            color: #071A2D;
        }

        .progress-track {
            height: 7px;
            overflow: hidden;
            border-radius: 20px;
            background: #EAF0F2;
        }

        .progress-fill {
            height: 100%;
            min-width: 2px;
            border-radius: inherit;
            transition:
                width 1s linear,
                background .7s ease;
        }

        .stop-button {
            width: 100%;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 23px;
            border: none;
            border-radius: 13px;
            background: #FFF0F0;
            color: #C62828;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            transition: .2s ease;
        }

        .stop-button:hover {
            background: #FFE3E3;
            transform: translateY(-1px);
        }

        .stop-button:disabled {
            opacity: .55;
            cursor: wait;
            transform: none;
        }

        /* =========================
           WAITING / READY
        ========================= */

        .precharging-layout {
            display: grid;
            grid-template-columns: 1.15fr .85fr;
            gap: 0;
            min-height: 370px;
        }

        .journey-panel {
            padding: 31px 32px;
            border-right: 1px solid #E9EEF1;
        }

        .journey-title {
            color: #8395A5;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: .13em;
            margin-bottom: 25px;
        }

        .journey-step {
            position: relative;
            display: flex;
            gap: 14px;
            padding-bottom: 29px;
            color: #B0BDC7;
        }

        .journey-step:not(:last-child)::after {
            content: "";
            position: absolute;
            left: 15px;
            top: 32px;
            width: 1px;
            height: calc(100% - 20px);
            background: #E3EAEE;
        }

        .journey-step.complete {
            color: #071A2D;
        }

        .journey-step.complete:not(:last-child)::after {
            background: #9DD9AF;
        }

        .journey-number {
            position: relative;
            z-index: 2;
            width: 31px;
            height: 31px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 1px solid #DDE5EA;
            border-radius: 50%;
            background: white;
            color: #93A3AF;
            font-size: 9px;
            font-weight: 800;
        }

        .journey-step.complete .journey-number {
            border-color: #9DDBB0;
            background: #ECFBF1;
            color: #00A83B;
        }

        .journey-step.active .journey-number {
            border-color: #76C992;
            background: #00A83B;
            color: white;
            box-shadow: 0 0 0 6px #E9F8EE;
        }

        .journey-step strong {
            display: block;
            padding-top: 3px;
            color: inherit;
            font-size: 14px;
        }

        .journey-step p {
            margin: 5px 0 0;
            color: #899BAB;
            font-size: 11px;
            line-height: 1.45;
        }

        .queue-panel {
            margin: 24px;
            padding: 27px;
            border-radius: 19px;
            background:
                linear-gradient(
                    145deg,
                    #FFF9EA,
                    #FFFCF6
                );
            border: 1px solid #F3E1B3;
        }

        .queue-panel.ready {
            background:
                linear-gradient(
                    145deg,
                    #EDFFF3,
                    #F8FFFA
                );
            border-color: #B7E5C6;
        }

        .queue-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: rgba(255,255,255,.8);
            color: #C58A00;
        }

        .queue-panel.ready .queue-icon {
            color: #00A83B;
        }

        .queue-kicker {
            margin-top: 22px;
            color: #A27A1D;
            font-size: 9px;
            font-weight: 850;
            letter-spacing: .12em;
        }

        .queue-panel.ready .queue-kicker {
            color: #00A83B;
        }

        .queue-panel h4 {
            margin: 6px 0 0;
            font-size: 22px;
            letter-spacing: -.03em;
        }

        .queue-panel > p {
            margin: 8px 0 0;
            color: #7C8E9D;
            font-size: 12px;
            line-height: 1.55;
        }

        .token-box {
            margin-top: 20px;
            padding: 13px 15px;
            border: 1px dashed #D8C88D;
            border-radius: 13px;
            background: rgba(255,255,255,.6);
        }

        .queue-panel.ready .token-box {
            border-color: #A8DDB8;
        }

        .token-box span {
            display: block;
            color: #8A98A2;
            font-size: 8px;
            font-weight: 850;
            letter-spacing: .12em;
        }

        .token-box strong {
            display: block;
            margin-top: 4px;
            color: #071A2D;
            font-size: 22px;
            letter-spacing: .08em;
        }

        .queue-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            color: #7F8F9B;
            font-size: 10px;
        }

        .queue-meta span {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .queue-meta b {
            color: #071A2D;
        }

        /* =========================
           EMPTY
        ========================= */

        .empty-session {
            position: relative;
            min-height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 42px;
            padding: 42px;
            overflow: hidden;
            border: 1px solid #DEE7EB;
            border-radius: 25px;
            background: white;
            box-shadow:
                0 12px 38px rgba(7,26,45,.045);
        }

        .empty-session::after {
            content: "";
            position: absolute;
            width: 420px;
            height: 420px;
            right: -220px;
            top: -240px;
            border-radius: 50%;
            background: #EFFBF3;
        }

        .empty-visual {
            position: relative;
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .empty-ring {
            position: absolute;
            border: 1px solid #CDEDD7;
            border-radius: 50%;
            animation: floatSoft 3.5s ease-in-out infinite;
        }

        .ring-one {
            inset: 5px;
        }

        .ring-two {
            inset: 19px;
            animation-delay: .5s;
        }

        .empty-bolt {
            position: relative;
            z-index: 2;
            width: 65px;
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 21px;
            background: #ECFBF1;
            color: #00A83B;
            box-shadow: 0 10px 28px rgba(0,168,59,.1);
        }

        .empty-copy {
            position: relative;
            z-index: 2;
            max-width: 520px;
        }

        .empty-copy h3 {
            margin: 7px 0 0;
            font-size: 25px;
            letter-spacing: -.035em;
        }

        .empty-copy p {
            max-width: 530px;
            margin: 8px 0 0;
            color: #788EA2;
            font-size: 13px;
            line-height: 1.6;
        }

        /* =========================
           LOADING
        ========================= */

        .loading-shell {
            width: min(1120px, 100%);
            margin: 40px auto;
        }

        .loading-line,
        .loading-stats > div,
        .loading-hero {
            background:
                linear-gradient(
                    90deg,
                    #E8EDF0,
                    #F7F9FA,
                    #E8EDF0
                );
            background-size: 200% 100%;
            animation: shimmer 1.3s linear infinite;
            border-radius: 10px;
        }

        .loading-line.small {
            width: 130px;
            height: 13px;
        }

        .loading-line.title {
            width: 390px;
            max-width: 75%;
            height: 55px;
            margin-top: 15px;
        }

        .loading-line.text {
            width: 520px;
            max-width: 90%;
            height: 17px;
            margin-top: 14px;
        }

        .loading-stats {
            display: grid;
            grid-template-columns: repeat(3,1fr);
            gap: 13px;
            margin-top: 35px;
        }

        .loading-stats > div {
            height: 145px;
        }

        .loading-hero {
            height: 485px;
            margin-top: 30px;
            border-radius: 25px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 900px) {
            .bookings-page {
                padding: 32px 22px 55px;
            }

            .charging-layout {
                grid-template-columns: 1fr;
            }

            .timer-column {
                border-right: none;
                border-bottom: 1px solid #E9F0EC;
                padding: 35px 20px 28px;
            }

            .precharging-layout {
                grid-template-columns: 1fr;
            }

            .journey-panel {
                border-right: none;
                border-bottom: 1px solid #E9EEF1;
            }

        }

        @media (max-width: 650px) {
            .bookings-page {
                padding: 18px 12px 32px;
            }

            .booking-hero {
                align-items: flex-start;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 18px;
            }

            .eyebrow,
            .section-kicker {
                font-size: 10px;
                letter-spacing: .13em;
            }

            .booking-hero h1 {
                margin-top: 5px;
                max-width: 330px;
                font-size: 35px;
                line-height: 1.02;
            }

            .booking-hero p {
                max-width: 360px;
                margin-top: 8px;
                font-size: 12px;
                line-height: 1.45;
            }

            .live-sync {
                width: 100%;
                min-height: 40px;
                padding: 8px 11px;
                border-radius: 12px;
            }

            .live-sync strong {
                font-size: 11px;
            }

            .live-sync small {
                font-size: 9px;
            }

            .overview-grid {
                grid-template-columns: 1fr;
                gap: 8px;
                margin-bottom: 24px;
            }

            .overview-card,
            .overview-action-card {
                min-height: 78px;
                gap: 11px;
                padding: 13px 14px;
                border-radius: 15px;
            }

            .overview-icon {
                width: 34px;
                height: 34px;
                border-radius: 10px;
            }

            .overview-copy span {
                font-size: 9px;
            }

            .overview-copy strong,
            .overview-action-card .overview-copy strong {
                margin-top: 4px;
                font-size: 22px;
            }

            .overview-copy small {
                margin-top: 4px;
                font-size: 10px;
            }

            .overview-card > svg,
            .overview-action-card > svg {
                width: 14px;
                height: 14px;
            }

            .section-heading {
                align-items: flex-start;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 11px;
            }

            .section-heading h2 {
                margin-top: 3px;
                font-size: 20px;
            }

            .section-heading p {
                margin-top: 4px;
                font-size: 11px;
            }

            .live-badge {
                padding: 6px 9px;
                font-size: 9px;
            }

            .active-card {
                border-radius: 17px;
            }

            .active-card-top {
                align-items: flex-start;
                flex-direction: column;
                gap: 11px;
                padding: 14px;
            }

            .station-identity {
                gap: 10px;
            }

            .station-icon {
                width: 38px;
                height: 38px;
                border-radius: 11px;
            }

            .status-line {
                font-size: 9px;
            }

            .station-identity h3 {
                margin-top: 3px;
                font-size: 17px;
            }

            .station-identity p {
                margin-top: 3px;
                font-size: 10px;
            }

            .danger-outline {
                width: 100%;
                height: 36px;
                font-size: 11px;
            }

            .charging-layout {
                min-height: 0;
            }

            .timer-column {
                padding: 22px 12px 18px;
            }

            .timer-orbit {
                width: 185px;
                height: 185px;
            }

            .timer-glow {
                width: 135px;
                height: 135px;
            }

            .timer-content strong {
                font-size: 30px;
            }

            .timer-label {
                font-size: 8px;
            }

            .timer-sub {
                margin-top: 5px;
                font-size: 9px;
            }

            .charging-now {
                margin-top: 10px;
                font-size: 10px;
            }

            .charging-details {
                padding: 18px 14px;
            }

            .charging-intro h4 {
                margin-top: 5px;
                font-size: 19px;
            }

            .charging-intro p {
                margin-top: 5px;
                font-size: 11px;
                line-height: 1.45;
            }

            .detail-grid {
                grid-template-columns: 1fr 1fr;
                gap: 7px;
                margin-top: 15px;
            }

            .detail-box {
                min-height: 54px;
                gap: 7px;
                padding: 8px;
                border-radius: 11px;
            }

            .detail-icon {
                width: 28px;
                height: 28px;
                border-radius: 8px;
            }

            .detail-box span {
                font-size: 8px;
            }

            .detail-box strong {
                margin-top: 3px;
                font-size: 11px;
            }

            .session-progress {
                margin-top: 16px;
            }

            .stop-button {
                height: 43px;
                margin-top: 15px;
                border-radius: 11px;
                font-size: 11px;
            }

            .precharging-layout {
                min-height: 0;
            }

            .journey-panel {
                padding: 18px 14px;
            }

            .journey-title {
                margin-bottom: 15px;
                font-size: 9px;
            }

            .journey-step {
                gap: 10px;
                padding-bottom: 18px;
            }

            .journey-number {
                width: 27px;
                height: 27px;
            }

            .journey-step strong {
                font-size: 12px;
            }

            .journey-step p {
                margin-top: 3px;
                font-size: 10px;
                line-height: 1.4;
            }

            .queue-panel {
                margin: 10px;
                padding: 15px;
                border-radius: 14px;
            }

            .queue-icon {
                width: 38px;
                height: 38px;
            }

            .queue-kicker {
                margin-top: 13px;
                font-size: 8px;
            }

            .queue-panel h4 {
                margin-top: 4px;
                font-size: 17px;
            }

            .queue-panel > p {
                margin-top: 5px;
                font-size: 10px;
                line-height: 1.45;
            }

            .token-box {
                margin-top: 13px;
                padding: 10px 11px;
            }

            .token-box strong {
                font-size: 18px;
            }

            .queue-meta {
                margin-top: 11px;
                font-size: 9px;
            }

            .empty-session {
                min-height: 190px;
                align-items: flex-start;
                flex-direction: column;
                gap: 12px;
                padding: 22px 17px;
                border-radius: 17px;
            }

            .empty-visual {
                width: 82px;
                height: 82px;
            }

            .empty-bolt {
                width: 48px;
                height: 48px;
                border-radius: 15px;
            }

            .empty-copy h3 {
                font-size: 19px;
            }

            .empty-copy p {
                font-size: 11px;
                line-height: 1.45;
            }
        }
    `}</style>
);

export default Bookings;
