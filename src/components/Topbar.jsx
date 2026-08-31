import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo/logo-bright.svg";
import notificationIcon from "../assets/icons/Notification.svg";
import profileIcon from "../assets/icons/Profile.svg";


const BOOKINGS_URL =
    `${import.meta.env.VITE_API_URL}/api/bookings`;

const NOTIFICATIONS_STORAGE_KEY =
    "leccy_notifications";

const LAST_BOOKING_STATES_KEY =
    "leccy_last_booking_states";


const Topbar = ({ setIsOpen }) => {

    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] =
        useState(0);


    // =====================================================
    // GET CURRENT USER KEY
    // =====================================================

    const getUserKey = () => {

        try {

            const user =
                JSON.parse(
                    localStorage.getItem("user") ||
                    "null"
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
    // USER-SPECIFIC STORAGE KEYS
    // =====================================================

    const getNotificationsKey = () => {

        return `${NOTIFICATIONS_STORAGE_KEY}_${getUserKey()}`;

    };


    const getBookingStatesKey = () => {

        return `${LAST_BOOKING_STATES_KEY}_${getUserKey()}`;

    };


    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // =====================================================
    // UPDATE UNREAD COUNT
    // =====================================================

    const updateUnreadCount = () => {

        try {

            const stored =
                localStorage.getItem(
                    getNotificationsKey()
                );


            if (!stored) {

                setUnreadCount(0);

                return;

            }


            const notifications =
                JSON.parse(stored);


            if (!Array.isArray(notifications)) {

                setUnreadCount(0);

                return;

            }


            const unread =
                notifications.filter(
                    (notification) =>
                        !notification.read
                ).length;


            setUnreadCount(unread);

        } catch (error) {

            console.error(
                "Failed to read notification count:",
                error
            );

            setUnreadCount(0);

        }

    };


    // =====================================================
    // SAVE NOTIFICATIONS
    // =====================================================

    const saveNotifications = (
        notifications
    ) => {

        localStorage.setItem(
            getNotificationsKey(),
            JSON.stringify(
                notifications
            )
        );


        window.dispatchEvent(
            new Event(
                "leccy-notifications-updated"
            )
        );


        updateUnreadCount();

    };


    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    const createNotification = ({
        id,
        type,
        title,
        message,
        bookingId,
        stationName,
        chargerNumber,
    }) => {

        return {

            id,

            type,

            title,

            message,

            bookingId:
                bookingId || null,

            stationName:
                stationName || null,

            chargerNumber:
                chargerNumber || null,

            createdAt:
                new Date().toISOString(),

            read: false,

        };

    };


    // =====================================================
    // BOOKING NOTIFICATION SYNC
    // =====================================================

    const syncBookingNotifications = async () => {

        const token =
            getToken();


        if (!token) {

            return;

        }


        try {

            const response =
                await fetch(
                    BOOKINGS_URL,
                    {
                        method: "GET",

                        cache: "no-store",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            // =================================================
            // HANDLE DIFFERENT RESPONSE FORMATS
            // =================================================

            const bookings =
                Array.isArray(data)

                    ? data

                    : Array.isArray(
                        data?.content
                    )

                        ? data.content

                        : Array.isArray(
                            data?.bookings
                        )

                            ? data.bookings

                            : [];


            // =================================================
            // LOAD EXISTING NOTIFICATIONS
            // =================================================

            let notifications = [];


            try {

                notifications =
                    JSON.parse(
                        localStorage.getItem(
                            getNotificationsKey()
                        ) || "[]"
                    );


                if (
                    !Array.isArray(
                        notifications
                    )
                ) {

                    notifications = [];

                }

            } catch {

                notifications = [];

            }


            // =================================================
            // LOAD PREVIOUS BOOKING STATES
            // =================================================

            let previousStates = null;


            try {

                const stored =
                    localStorage.getItem(
                        getBookingStatesKey()
                    );


                if (stored) {

                    previousStates =
                        JSON.parse(
                            stored
                        );

                }

            } catch {

                previousStates = null;

            }


            // =================================================
            // FIRST SYNC
            // =================================================
            /*
             * Important:
             *
             * On the first ever sync, we only establish
             * the current booking states.
             *
             * Otherwise every old booking would suddenly
             * become a "new booking" notification.
             */

            if (!previousStates) {

                const initialStates = {};


                bookings.forEach(
                    (booking) => {

                        if (
                            !booking?.bookingId
                        ) {

                            return;

                        }


                        initialStates[
                            booking.bookingId
                        ] =
                            String(
                                booking.status ||
                                ""
                            ).toUpperCase();

                    }
                );


                localStorage.setItem(
                    getBookingStatesKey(),
                    JSON.stringify(
                        initialStates
                    )
                );


                updateUnreadCount();

                return;

            }


            let changed = false;


            // =================================================
            // PROCESS BOOKINGS
            // =================================================

            bookings.forEach(
                (booking) => {

                    if (
                        !booking?.bookingId
                    ) {

                        return;

                    }


                    const bookingId =
                        booking.bookingId;


                    const currentStatus =
                        String(
                            booking.status ||
                            ""
                        ).toUpperCase();


                    const previousStatus =
                        previousStates[
                            bookingId
                        ];


                    // =================================================
                    // NEW BOOKING
                    // =================================================

                    if (
                        !previousStatus
                    ) {

                        const alreadyExists =
                            notifications.some(
                                (notification) =>
                                    notification.bookingId ===
                                        bookingId &&
                                    notification.type ===
                                        "BOOKING_CREATED"
                            );


                        if (
                            !alreadyExists
                        ) {

                            notifications.unshift(

                                createNotification({

                                    id:
                                        `booking-${bookingId}-created`,

                                    type:
                                        "BOOKING_CREATED",

                                    title:
                                        "Booking confirmed",

                                    message:
                                        `Your booking at ${
                                            booking.stationName ||
                                            "the charging station"
                                        } has been confirmed and is waiting for a charger.`,

                                    bookingId,

                                    stationName:
                                        booking.stationName,

                                    chargerNumber:
                                        booking.chargerNumber,

                                })

                            );


                            changed = true;

                        }


                        return;

                    }


                    // =================================================
                    // NO STATUS CHANGE
                    // =================================================

                    if (
                        previousStatus ===
                        currentStatus
                    ) {

                        return;

                    }


                    let notification = null;


                    // =================================================
                    // NOTIFIED
                    // =================================================

                    if (
                        currentStatus ===
                        "NOTIFIED"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-notified`,

                                type:
                                    "READY",

                                title:
                                    "Your charger is ready",

                                message:
                                    booking.chargerNumber

                                        ? `Charger ${booking.chargerNumber} is ready at ${booking.stationName || "the station"}. Please proceed to the charger.`

                                        : `A charger is ready at ${booking.stationName || "the station"}. Please proceed to the station.`,

                                bookingId,

                                stationName:
                                    booking.stationName,

                                chargerNumber:
                                    booking.chargerNumber,

                            });

                    }


                    // =================================================
                    // ACTIVE
                    // =================================================

                    else if (
                        currentStatus ===
                        "ACTIVE"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-active`,

                                type:
                                    "CHARGING",

                                title:
                                    "Charging started",

                                message:
                                    booking.chargerNumber

                                        ? `Your vehicle is now charging on ${booking.chargerNumber}.`

                                        : "Your charging session has started.",

                                bookingId,

                                stationName:
                                    booking.stationName,

                                chargerNumber:
                                    booking.chargerNumber,

                            });

                    }


                    // =================================================
                    // CHARGING
                    // =================================================

                    else if (
                        currentStatus ===
                        "CHARGING"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-charging`,

                                type:
                                    "CHARGING",

                                title:
                                    "Charging in progress",

                                message:
                                    booking.chargerNumber

                                        ? `Your vehicle is currently charging on ${booking.chargerNumber}.`

                                        : "Your vehicle is currently charging.",

                                bookingId,

                                stationName:
                                    booking.stationName,

                                chargerNumber:
                                    booking.chargerNumber,

                            });

                    }


                    // =================================================
                    // COMPLETED
                    // =================================================

                    else if (
                        currentStatus ===
                        "COMPLETED"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-completed`,

                                type:
                                    "COMPLETED",

                                title:
                                    "Charging completed",

                                message:
                                    `Your charging session at ${
                                        booking.stationName ||
                                        "the charging station"
                                    } has been completed.`,

                                bookingId,

                                stationName:
                                    booking.stationName,

                            });

                    }


                    // =================================================
                    // CANCELLED
                    // =================================================

                    else if (
                        currentStatus ===
                        "CANCELLED"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-cancelled`,

                                type:
                                    "BOOKING",

                                title:
                                    "Booking cancelled",

                                message:
                                    `Your booking at ${
                                        booking.stationName ||
                                        "the charging station"
                                    } has been cancelled.`,

                                bookingId,

                                stationName:
                                    booking.stationName,

                            });

                    }


                    // =================================================
                    // EXPIRED
                    // =================================================

                    else if (
                        currentStatus ===
                        "EXPIRED"
                    ) {

                        notification =
                            createNotification({

                                id:
                                    `booking-${bookingId}-expired`,

                                type:
                                    "BOOKING",

                                title:
                                    "Booking expired",

                                message:
                                    `Your booking at ${
                                        booking.stationName ||
                                        "the charging station"
                                    } has expired.`,

                                bookingId,

                                stationName:
                                    booking.stationName,

                            });

                    }


                    // =================================================
                    // SAVE NEW NOTIFICATION
                    // =================================================

                    if (
                        notification
                    ) {

                        /*
                         * Prevent duplicate notification
                         * for the same status.
                         */

                        const exists =
                            notifications.some(
                                (item) =>
                                    item.id ===
                                    notification.id
                            );


                        if (!exists) {

                            notifications.unshift(
                                notification
                            );

                            changed = true;

                        }

                    }

                }
            );


            // =================================================
            // UPDATE BOOKING STATES
            // =================================================

            const latestStates = {
                ...previousStates,
            };


            bookings.forEach(
                (booking) => {

                    if (
                        !booking?.bookingId
                    ) {

                        return;

                    }


                    latestStates[
                        booking.bookingId
                    ] =
                        String(
                            booking.status ||
                            ""
                        ).toUpperCase();

                }
            );


            localStorage.setItem(
                getBookingStatesKey(),
                JSON.stringify(
                    latestStates
                )
            );


            // =================================================
            // SAVE
            // =================================================

            if (changed) {

                const limited =
                    notifications.slice(
                        0,
                        50
                    );


                saveNotifications(
                    limited
                );

            } else {

                updateUnreadCount();

            }

        } catch (error) {

            console.error(
                "Booking notification sync failed:",
                error
            );

        }

    };


    // =====================================================
    // INITIAL LOAD + LIVE POLLING
    // =====================================================

    useEffect(() => {

        updateUnreadCount();

        /*
         * Sync immediately.
         */

        syncBookingNotifications();


        /*
         * Then check every 5 seconds.
         */

        const interval =
            window.setInterval(
                () => {

                    syncBookingNotifications();

                },
                5000
            );


        /*
         * Same-tab notification updates.
         */

        const handleNotificationUpdate =
            () => {

                updateUnreadCount();

            };


        /*
         * Other-tab localStorage updates.
         */

        const handleStorageChange =
            (event) => {

                if (
                    event.key ===
                    getNotificationsKey()
                ) {

                    updateUnreadCount();

                }

            };


        window.addEventListener(
            "leccy-notifications-updated",
            handleNotificationUpdate
        );


        window.addEventListener(
            "storage",
            handleStorageChange
        );


        return () => {

            window.clearInterval(
                interval
            );


            window.removeEventListener(
                "leccy-notifications-updated",
                handleNotificationUpdate
            );


            window.removeEventListener(
                "storage",
                handleStorageChange
            );

        };

    }, []);


    // =====================================================
    // OPEN NOTIFICATIONS
    // =====================================================

    const handleNotificationsClick = () => {

        navigate(
            "/home/notifications"
        );

    };


    // =====================================================
    // OPEN PROFILE
    // =====================================================

    const handleProfileClick = () => {

        navigate(
            "/home/profile"
        );

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <header
            className="
                fixed
                top-0
                left-0
                z-50

                flex
                h-20
                w-full
                items-center
                justify-between

                border-b
                border-gray-200
                bg-white

                px-16

                max-md:px-6
            "
        >

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div
                className="
                    flex
                    items-center
                    gap-3
                    -ml-9
                    max-md:ml-0
                "
            >

                {/* MOBILE MENU */}

                <button
                    type="button"
                    onClick={() =>
                        setIsOpen(true)
                    }
                    className="
                        -ml-5
                        rounded-lg
                        p-2
                        text-gray-700
                        transition
                        hover:bg-gray-100
                        lg:hidden
                    "
                    aria-label="Open menu"
                >
                    ☰
                </button>


                {/* LOGO */}

                <img
                    src={logo}
                    alt="Leccy Logo"
                    className="
                        h-14
                        w-auto
                        lg:h-16
                    "
                />

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div
                className="
                    flex
                    items-center
                    gap-3
                    sm:gap-5
                "
            >

                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <button
                    type="button"
                    onClick={
                        handleNotificationsClick
                    }
                    className="
                        relative
                        rounded-lg
                        p-2
                        transition
                        hover:bg-gray-100
                    "
                    aria-label="Notifications"
                >

                    <img
                        src={notificationIcon}
                        alt="Notifications"
                        className="
                            h-6
                            w-6
                        "
                    />


                    {/* UNREAD BADGE */}

                    {unreadCount > 0 && (

                        <span
                            className="
                                absolute
                                -right-1
                                -top-1

                                flex
                                min-h-[18px]
                                min-w-[18px]

                                items-center
                                justify-center

                                rounded-full
                                bg-green-500

                                px-1

                                text-[10px]
                                font-bold
                                leading-none
                                text-white

                                ring-2
                                ring-white
                            "
                        >

                            {unreadCount > 99
                                ? "99+"
                                : unreadCount}

                        </span>

                    )}

                </button>


                {/* =================================================
                    PROFILE
                ================================================= */}

                <button
                    type="button"
                    onClick={
                        handleProfileClick
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        px-2
                        py-1.5
                        transition
                        hover:bg-gray-100
                    "
                    aria-label="Profile"
                >

                    <img
                        src={profileIcon}
                        alt="Profile"
                        className="
                            h-7
                            w-7
                        "
                    />


                    <span
                        className="
                            hidden
                            text-sm
                            font-medium
                            text-gray-700
                            sm:block
                        "
                    >
                        Profile
                    </span>

                </button>

            </div>

        </header>

    );

};


export default Topbar;