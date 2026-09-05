import React, {
    useEffect,
    useState,
} from "react";


const NOTIFICATIONS_STORAGE_KEY =
    "leccy_notifications";


const Notifications = () => {

    const [
        notifications,
        setNotifications,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    // =====================================================
    // USER KEY
    // =====================================================

    const getUserKey = () => {

        try {

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "null"
                );


            return (
                user?.email ||
                user?.id ||
                "default"
            );

        } catch {

            return "default";

        }

    };


    // =====================================================
    // STORAGE KEY
    // =====================================================

    const getNotificationsKey = () => {

        return `${NOTIFICATIONS_STORAGE_KEY}_${getUserKey()}`;

    };


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications = () => {

        try {

            const stored =
                localStorage.getItem(
                    getNotificationsKey()
                );


            if (!stored) {

                setNotifications([]);

                return;

            }


            const parsed =
                JSON.parse(stored);


            if (
                Array.isArray(parsed)
            ) {

                setNotifications(
                    parsed
                );

            } else {

                setNotifications([]);

            }

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

            setNotifications([]);

        }

    };


    // =====================================================
    // SAVE NOTIFICATIONS
    // =====================================================

    const saveNotifications = (
        items
    ) => {

        localStorage.setItem(
            getNotificationsKey(),
            JSON.stringify(items)
        );


        setNotifications(
            items
        );


        /*
         * Tell Topbar to update
         * its unread badge.
         */

        window.dispatchEvent(
            new Event(
                "leccy-notifications-updated"
            )
        );

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadNotifications();

        setLoading(false);


        /*
         * Topbar may create a new notification
         * while we're already on this page.
         */

        const handleNotificationUpdate =
            () => {

                loadNotifications();

            };


        window.addEventListener(
            "leccy-notifications-updated",
            handleNotificationUpdate
        );


        /*
         * Live synchronization.
         *
         * Same-tab updates are handled by the custom event.
         * The storage event handles another tab/window.
         * A short silent poll catches updates made by any
         * other part of the application.
         */
        const handleStorageUpdate = (event) => {

            if (
                event.key === getNotificationsKey()
                || event.key === null
            ) {
                loadNotifications();
            }

        };

        window.addEventListener(
            "storage",
            handleStorageUpdate
        );

        const interval =
            window.setInterval(
                loadNotifications,
                1000
            );


        return () => {

            window.removeEventListener(
                "leccy-notifications-updated",
                handleNotificationUpdate
            );

            window.removeEventListener(
                "storage",
                handleStorageUpdate
            );


            window.clearInterval(
                interval
            );

        };

    }, []);


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    const markAsRead = (
        id
    ) => {

        const updated =
            notifications.map(
                (notification) => {

                    if (
                        notification.id ===
                        id
                    ) {

                        return {
                            ...notification,
                            read: true,
                        };

                    }


                    return notification;

                }
            );


        saveNotifications(
            updated
        );

    };


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead = () => {

        const updated =
            notifications.map(
                (notification) => ({
                    ...notification,
                    read: true,
                })
            );


        saveNotifications(
            updated
        );

    };


    // =====================================================
    // DELETE ONE
    // =====================================================

    const deleteNotification = (
        id
    ) => {

        const updated =
            notifications.filter(
                (notification) =>
                    notification.id !== id
            );


        saveNotifications(
            updated
        );

    };


    // =====================================================
    // CLEAR ALL
    // =====================================================

    const clearAll = () => {

        if (
            !window.confirm(
                "Clear all notifications?"
            )
        ) {

            return;

        }


        saveNotifications([]);

    };


    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.read
        ).length;


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "";

        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "";

        }


        return parsed.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    // =====================================================
    // ICON
    // =====================================================

    const getIcon = (
        type
    ) => {

        switch (type) {

            case "READY":
                return "🔌";

            case "CHARGING":
                return "⚡";

            case "COMPLETED":
                return "✓";

            case "BOOKING_CREATED":
                return "📅";

            default:
                return "🔔";

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div
                className="
                    px-6
                    py-8
                    lg:px-14
                "
            >

                <div
                    className="
                        animate-pulse
                    "
                >

                    <div
                        className="
                            h-4
                            w-32
                            rounded
                            bg-gray-200
                        "
                    />


                    <div
                        className="
                            mt-3
                            h-9
                            w-64
                            rounded
                            bg-gray-200
                        "
                    />


                    <div
                        className="
                            mt-8
                            h-24
                            rounded-2xl
                            bg-gray-200
                        "
                    />


                    <div
                        className="
                            mt-3
                            h-24
                            rounded-2xl
                            bg-gray-200
                        "
                    />


                    <div
                        className="
                            mt-3
                            h-24
                            rounded-2xl
                            bg-gray-200
                        "
                    />

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div
            className="
                px-6
                py-8
                lg:px-14
            "
        >

            <style>{`
                @media (max-width: 767px) {

                    /*
                     * Mobile only:
                     * Notifications and Unread become one card.
                     * The desktop two-card layout is preserved.
                     */
                    .notification-summary {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0 !important;
                        padding: 6px !important;
                        border: 1px solid #E1E8EC !important;
                        border-radius: 16px !important;
                        background: #FFFFFF !important;
                        box-shadow: 0 8px 24px rgba(7, 26, 45, .04);
                    }

                    .notification-summary > div {
                        min-width: 0;
                        min-height: 82px;
                        padding: 10px 8px !important;
                        border: 0 !important;
                        border-radius: 11px !important;
                        box-shadow: none !important;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }

                    .notification-summary > div + div {
                        border-left: 1px solid #EDF1F3 !important;
                        border-radius: 0 11px 11px 0 !important;
                    }

                    .notification-summary .summary-label {
                        font-size: 9px !important;
                        line-height: 1.15 !important;
                        letter-spacing: .07em;
                    }

                    .notification-summary .summary-value {
                        margin-top: 5px !important;
                        font-size: 25px !important;
                        line-height: 1 !important;
                    }

                    /*
                     * Keep the actual notification cards at their
                     * existing size as requested.
                     */
                    .notification-summary ~ section > div > div {
                        /* intentionally no size changes */
                    }

                    /*
                     * Give the mobile page a little breathing room
                     * while keeping the existing desktop spacing.
                     */
                    .notifications-mobile-tight {
                        width: 100%;
                    }
                }
            `}</style>

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                "
            >

                <div>

                    <p
                        className="
                            text-sm
                            font-medium
                            text-green-600
                        "
                    >
                        Leccy updates
                    </p>


                    <h1
                        className="
                            mt-1
                            text-3xl
                            font-bold
                            tracking-tight
                            text-[#071A2D]
                        "
                    >
                        Notifications
                    </h1>


                    <p
                        className="
                            mt-2
                            text-gray-500
                        "
                    >
                        Stay updated with your
                        bookings and charging
                        sessions.
                    </p>

                </div>


                {/* ACTIONS */}

                <div
                    className="
                        flex
                        flex-wrap
                        gap-2
                    "
                >

                    {unreadCount > 0 && (

                        <button
                            type="button"
                            onClick={
                                markAllAsRead
                            }
                            className="
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-[#071A2D]
                                transition
                                hover:bg-gray-50
                            "
                        >
                            Mark all read
                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
                className="
                    notification-summary
                    mt-7
                    grid
                    gap-3
                    sm:grid-cols-2
                "
            >

                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        px-6
                        py-5
                        shadow-sm
                    "
                >

                    <p
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-gray-400
                            summary-label
                        "
                    >
                        Notifications
                    </p>


                    <p
                        className="
                            mt-1
                            text-2xl
                            font-bold
                            text-[#071A2D]
                            summary-value
                        "
                    >
                        {
                            notifications.length
                        }
                    </p>

                </div>


                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        px-6
                        py-5
                        shadow-sm
                    "
                >

                    <p
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-gray-400
                            summary-label
                        "
                    >
                        Unread
                    </p>


                    <p
                        className="
                            mt-1
                            text-2xl
                            font-bold
                            text-green-600
                            summary-value
                        "
                    >
                        {unreadCount}
                    </p>

                </div>

            </div>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section
                className="
                    mt-7
                    max-w-4xl
                "
            >

                {notifications.length === 0 ? (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-dashed
                            border-gray-300
                            bg-white
                            px-6
                            py-20
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-green-50
                                text-2xl
                            "
                        >
                            🔔
                        </div>


                        <h2
                            className="
                                mt-5
                                text-xl
                                font-bold
                                text-[#071A2D]
                            "
                        >
                            You're all caught up
                        </h2>


                        <p
                            className="
                                mx-auto
                                mt-2
                                max-w-md
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            Notifications about
                            your charging bookings
                            and sessions will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            space-y-3
                        "
                    >

                        {notifications.map(
                            (notification) => (

                                <div
                                    key={
                                        notification.id
                                    }
                                    className={`
                                        relative
                                        rounded-2xl
                                        border
                                        bg-white
                                        px-5
                                        py-5
                                        shadow-sm
                                        transition

                                        ${
                                            notification.read

                                                ? "border-gray-200"

                                                : "border-green-200 bg-green-50/30"
                                        }
                                    `}
                                >

                                    <div
                                        className="
                                            flex
                                            gap-4
                                        "
                                    >

                                        {/* ICON */}

                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-green-50
                                                text-lg
                                            "
                                        >

                                            {getIcon(
                                                notification.type
                                            )}

                                        </div>


                                        {/* CONTENT */}

                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                <h3
                                                    className="
                                                        font-semibold
                                                        text-[#071A2D]
                                                    "
                                                >
                                                    {
                                                        notification.title
                                                    }
                                                </h3>


                                                {!notification.read && (

                                                    <span
                                                        className="
                                                            rounded-full
                                                            bg-green-100
                                                            px-2
                                                            py-0.5
                                                            text-[11px]
                                                            font-semibold
                                                            text-green-700
                                                        "
                                                    >
                                                        NEW
                                                    </span>

                                                )}

                                            </div>


                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    leading-6
                                                    text-gray-600
                                                "
                                            >
                                                {
                                                    notification.message
                                                }
                                            </p>


                                            <div
                                                className="
                                                    mt-3
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-3
                                                    text-xs
                                                    text-gray-400
                                                "
                                            >

                                                <span>
                                                    {
                                                        formatDate(
                                                            notification.createdAt
                                                        )
                                                    }
                                                </span>


                                                {notification.stationName && (

                                                    <span>
                                                        •{" "}
                                                        {
                                                            notification.stationName
                                                        }
                                                    </span>

                                                )}


                                                {notification.chargerNumber && (

                                                    <span>
                                                        • Charger{" "}
                                                        {
                                                            notification.chargerNumber
                                                        }
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            className="
                                                flex
                                                shrink-0
                                                items-start
                                                gap-1
                                            "
                                        >

                                            {!notification.read && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                    className="
                                                        rounded-lg
                                                        px-2
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        text-green-600
                                                        hover:bg-green-50
                                                    "
                                                    title="Mark as read"
                                                >
                                                    ✓
                                                </button>

                                            )}


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteNotification(
                                                        notification.id
                                                    )
                                                }
                                                className="
                                                    rounded-lg
                                                    px-2
                                                    py-1
                                                    text-xs
                                                    text-gray-400
                                                    hover:bg-gray-100
                                                    hover:text-gray-700
                                                "
                                                title="Remove"
                                            >
                                                ×
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                CLEAR ALL
            ================================================= */}

            {notifications.length > 0 && (

                <div
                    className="
                        mt-5
                        max-w-4xl
                        text-right
                    "
                >

                    <button
                        type="button"
                        onClick={
                            clearAll
                        }
                        className="
                            text-sm
                            font-medium
                            text-gray-400
                            transition
                            hover:text-red-500
                        "
                    >
                        Clear all notifications
                    </button>

                </div>

            )}

        </div>

    );

};


export default Notifications;