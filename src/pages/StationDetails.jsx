import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import chargerIcon from "../assets/icons/FindCharger.svg";

const StationDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [station, setStation] = useState(null);

    const [chargers, setChargers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // FETCH STATION + CHARGERS
    // =====================================================

    useEffect(() => {

        const fetchStationDetails = async () => {

            try {

                setLoading(true);

                setError("");

                const token =
                    localStorage.getItem("token");


                // -----------------------------
                // Station
                // -----------------------------

                const stationResponse =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/api/stations/${id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (!stationResponse.ok) {

                    throw new Error(
                        "Failed to load station."
                    );

                }


                const stationData =
                    await stationResponse.json();


                setStation(stationData);


                // -----------------------------
                // Chargers
                // -----------------------------

                const chargerResponse =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/api/stations/${id}/chargers`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (!chargerResponse.ok) {

                    throw new Error(
                        "Failed to load chargers."
                    );

                }


                const chargerData =
                    await chargerResponse.json();


                setChargers(chargerData);


            } catch (error) {

                console.error(
                    "Station details error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load station details."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchStationDetails();

    }, [id]);


    // =====================================================
    // STATUS STYLE
    // =====================================================

    const getStatusStyle = (status) => {

        switch (status) {

            case "AVAILABLE":

                return {
                    wrapper:
                        "bg-green-50 text-green-700",
                    dot:
                        "bg-green-500",
                };


            case "BUSY":

                return {
                    wrapper:
                        "bg-orange-50 text-orange-700",
                    dot:
                        "bg-orange-500",
                };


            case "CHARGING":

                return {
                    wrapper:
                        "bg-blue-50 text-blue-700",
                    dot:
                        "bg-blue-500",
                };


            case "OFFLINE":

                return {
                    wrapper:
                        "bg-red-50 text-red-700",
                    dot:
                        "bg-red-500",
                };


            default:

                return {
                    wrapper:
                        "bg-gray-100 text-gray-600",
                    dot:
                        "bg-gray-400",
                };

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="px-6 py-8 lg:px-14">

                <div className="animate-pulse">

                    <div className="h-4 w-28 rounded bg-gray-200" />

                    <div className="mt-3 h-10 w-80 rounded bg-gray-200" />

                    <div className="mt-3 h-5 w-[500px] max-w-full rounded bg-gray-200" />

                    <div className="mt-8 h-40 rounded-2xl bg-gray-200" />

                    <div className="mt-6 h-20 rounded-xl bg-gray-200" />

                    <div className="mt-3 h-20 rounded-xl bg-gray-200" />

                    <div className="mt-3 h-20 rounded-xl bg-gray-200" />

                </div>

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="px-6 py-8 lg:px-14">

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        text-sm
                        font-medium
                        text-green-600
                        hover:text-green-700
                    "
                >
                    ← Back
                </button>


                <div
                    className="
                        mt-6
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-6
                    "
                >

                    <h2 className="font-semibold text-red-700">
                        Something went wrong
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>

                </div>

            </div>
        );

    }


    if (!station) {
        return null;
    }


    return (
        <div className="px-6 py-8 lg:px-14">

            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-gray-500
                    transition
                    hover:text-gray-900
                "
            >
                ← Back to Find Charger
            </button>


            {/* =================================================
                STATION HEADER
            ================================================= */}

            <div
                className="
                    mt-6
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-6
                    shadow-sm
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-start
                        lg:justify-between
                    "
                >

                    <div>

                        <p className="text-sm font-medium text-green-600">
                            Charging Station
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
                            {station.stationName}
                        </h1>

                        <p className="mt-2 text-gray-500">
                            📍 {station.address}
                        </p>

                    </div>


                    {/* Station status */}

                    <div
                        className={`
                            inline-flex
                            w-fit
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-semibold

                            ${
                                station.stationStatus ===
                                "AVAILABLE"
                                    ? "bg-green-50 text-green-700"
                                    : station.stationStatus ===
                                      "BUSY"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                            }
                        `}
                    >

                        <span
                            className={`
                                h-2.5
                                w-2.5
                                rounded-full

                                ${
                                    station.stationStatus ===
                                    "AVAILABLE"
                                        ? "bg-green-500"
                                        : station.stationStatus ===
                                          "BUSY"
                                        ? "bg-orange-500"
                                        : "bg-gray-400"
                                }
                            `}
                        />

                        {station.stationStatus}

                    </div>

                </div>


                {/* Station stats */}

                <div
                    className="
                        mt-6
                        grid
                        grid-cols-2
                        gap-3
                        sm:grid-cols-4
                    "
                >

                    <StationStat
                        label="Price"
                        value={
                            station.pricePerKwh !== null &&
                            station.pricePerKwh !== undefined
                                ? `₹${station.pricePerKwh}/kWh`
                                : "—"
                        }
                    />

                    <StationStat
                        label="Rating"
                        value={
                            station.rating !== null &&
                            station.rating !== undefined
                                ? `${station.rating} ★`
                                : "—"
                        }
                    />

                    <StationStat
                        label="Total Chargers"
                        value={
                            station.totalChargers ?? "—"
                        }
                    />

                    <StationStat
                        label="Available"
                        value={
                            station.availableChargers ?? "—"
                        }
                    />

                </div>

            </div>


            {/* =================================================
                CHARGERS
            ================================================= */}

            <div className="mt-8">

                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <p className="text-sm font-medium text-green-600">
                            Charging Points
                        </p>

                        <h2
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-[#071A2D]
                            "
                        >
                            Available Chargers
                        </h2>

                    </div>


                    <p className="text-sm text-gray-500">
                        {chargers.length} charger
                        {chargers.length !== 1
                            ? "s"
                            : ""}
                    </p>

                </div>


                <div className="mt-5 space-y-3">

                    {chargers.length === 0 ? (

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-200
                                bg-white
                                p-10
                                text-center
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gray-100
                                "
                            >
                                ⚡
                            </div>

                            <h3
                                className="
                                    mt-4
                                    font-semibold
                                    text-[#071A2D]
                                "
                            >
                                No chargers found
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                "
                            >
                                This station currently has no
                                charger information available.
                            </p>

                        </div>

                    ) : (

                        chargers.map((charger) => {

                            const status =
                                getStatusStyle(
                                    charger.chargerStatus
                                );


                            const canBook =
                                charger.chargerStatus ===
                                "AVAILABLE";


                            return (
                                <div
                                    key={charger.id}
                                    className="
                                        rounded-2xl
                                        border
                                        border-gray-200
                                        bg-white
                                        p-5
                                        shadow-sm
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-5
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        {/* Charger info */}

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    h-12
                                                    w-12
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-green-50
                                                "
                                            >

                                                <img
                                                    src={
                                                        chargerIcon
                                                    }
                                                    alt=""
                                                    className="
                                                        h-6
                                                        w-6
                                                    "
                                                />

                                            </div>


                                            <div>

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
                                                            font-bold
                                                            text-[#071A2D]
                                                        "
                                                    >
                                                        {
                                                            charger.chargerNumber
                                                        }
                                                    </h3>


                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            px-2.5
                                                            py-1
                                                            text-[11px]
                                                            font-semibold
                                                            ${status.wrapper}
                                                        `}
                                                    >

                                                        <span
                                                            className={`
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full
                                                                ${status.dot}
                                                            `}
                                                        />

                                                        {
                                                            charger.chargerStatus
                                                        }

                                                    </span>

                                                </div>


                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        flex-wrap
                                                        gap-x-4
                                                        gap-y-1
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >

                                                    <span>
                                                        {
                                                            charger.connectorType
                                                        }
                                                    </span>

                                                    <span>
                                                        {
                                                            charger.outputPower
                                                        }{" "}
                                                        kW
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* Book */}

                                        <button
                                            type="button"
                                            disabled={!canBook}
                                            onClick={() => {
                                                // Booking flow will be
                                                // connected here.
                                                console.log(
                                                    "Book charger:",
                                                    charger
                                                );
                                            }}
                                            className={`
                                                rounded-xl
                                                px-6
                                                py-3
                                                text-sm
                                                font-semibold
                                                transition

                                                ${
                                                    canBook
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                                                }
                                            `}
                                        >
                                            {canBook
                                                ? "Book Charger"
                                                : charger.chargerStatus ===
                                                  "BUSY"
                                                ? "Currently Busy"
                                                : "Unavailable"}
                                        </button>

                                    </div>

                                </div>
                            );

                        })

                    )}

                </div>

            </div>


            {/* =================================================
                LOCATION
            ================================================= */}

            <div
                className="
                    mt-8
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                "
            >

                <div className="p-5">

                    <h2
                        className="
                            font-bold
                            text-[#071A2D]
                        "
                    >
                        Station Location
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        {station.address}
                    </p>

                </div>


                <div
                    className="
                        flex
                        h-48
                        items-center
                        justify-center
                        bg-[#eef2ef]
                        text-center
                    "
                >

                    <div>

                        <div className="text-3xl">
                            📍
                        </div>

                        <p
                            className="
                                mt-2
                                text-sm
                                font-medium
                                text-gray-700
                            "
                        >
                            Map integration coming next
                        </p>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            {station.latitude},{" "}
                            {station.longitude}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};


// =========================================================
// STATION STAT
// =========================================================

const StationStat = ({
    label,
    value,
}) => {

    return (
        <div
            className="
                rounded-xl
                bg-gray-50
                p-4
            "
        >

            <p className="text-xs text-gray-500">
                {label}
            </p>

            <p
                className="
                    mt-1
                    text-lg
                    font-bold
                    text-[#071A2D]
                "
            >
                {value}
            </p>

        </div>
    );
};


export default StationDetails;