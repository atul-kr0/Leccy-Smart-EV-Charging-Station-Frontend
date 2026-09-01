import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import {
    useNavigate,
} from "react-router-dom";

import "maplibre-gl/dist/maplibre-gl.css";

maplibregl.setWorkerUrl(workerUrl);


// ============================================================
// CONFIG
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL;

const STATIONS_URL =
    `${API_BASE_URL}/api/stations`;

const STATION_DETAILS_URL =
    `${API_BASE_URL}/api/station-details`;

const VEHICLES_URL =
    `${API_BASE_URL}/api/vehicles/getAllVehicles`;

const RECOMMENDATION_URL =
    `${API_BASE_URL}/api/recommendations`;

const BOOKING_URL =
    `${API_BASE_URL}/api/bookings`;

const MAPTILER_KEY =
    import.meta.env.VITE_MAPTILER_KEY?.trim();

if (!API_BASE_URL) {
    console.error(
        "VITE_API_URL is missing. Add it to .env or Vercel Environment Variables."
    );
}

if (!MAPTILER_KEY) {
    console.error(
        "VITE_MAPTILER_KEY is missing. Add it to .env or Vercel Environment Variables."
    );
}


// ============================================================
// ICON
// ============================================================

const Icon = ({
    name,
    size = 20,
}) => {

    const paths = {

        search: (
            <>
                <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                />
                <path d="m16 16 5 5" />
            </>
        ),

        location: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="8"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </>
        ),

        refresh: (
            <>
                <path d="M20 11a8 8 0 0 0-14.9-4" />
                <path d="M5 3v4h4" />
                <path d="M4 13a8 8 0 0 0 14.9 4" />
                <path d="M19 21v-4h-4" />
            </>
        ),

        close: (
            <>
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
            </>
        ),

        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
            </>
        ),

        bolt: (
            <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        ),

        clock: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />
                <path d="M12 7v5l3 2" />
            </>
        ),

        car: (
            <>
                <path d="M5 17h14" />
                <path d="m6 17-1-5 2-5h10l2 5-1 5" />
                <circle cx="8" cy="17" r="1.5" />
                <circle cx="16" cy="17" r="1.5" />
            </>
        ),

        charger: (
            <>
                <path d="M7 3h8v18H7z" />
                <path d="M10 7h2M10 11h2M10 15h2" />
                <path d="M15 8h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-2" />
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
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {paths[name]}
        </svg>
    );
};


// ============================================================
// PRIORITIES
// ============================================================

const PRIORITIES = [
    {
        value: "WAITING_TIME",
        label: "Shortest waiting time",
    },
    {
        value: "NEAREST_STATION",
        label: "Nearest station",
    },
    {
        value: "FAST_CHARGING",
        label: "Fastest charging",
    },
    {
        value: "LOWEST_COST",
        label: "Lowest cost",
    },
];


// ============================================================
// AUTH
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};


const getHeaders = () => {

    const token = getToken();

    return {
        "Content-Type": "application/json",

        ...(token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {}),
    };
};


// ============================================================
// API FETCH
// ============================================================

const apiFetch = async (
    url,
    options = {}
) => {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {
                    ...getHeaders(),
                    ...(options.headers || {}),
                },
            }
        );


    if (!response.ok) {

        let message =
            `Request failed (${response.status})`;

        try {

            const body =
                await response.json();

            message =
                body?.message ||
                body?.error ||
                message;

        } catch {
            // Response may not contain JSON.
        }

        throw new Error(message);
    }


    if (response.status === 204) {
        return null;
    }


    return response.json();
};


// ============================================================
// ARRAY HELPER
// ============================================================

const getArrayFromResponse = (
    data,
    keys = []
) => {

    if (Array.isArray(data)) {
        return data;
    }


    for (const key of keys) {

        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }


    if (Array.isArray(data?.content)) {
        return data.content;
    }


    return [];
};


// ============================================================
// COORDINATES
// ============================================================

const getCoordinates = (
    station
) => {

    const latitude =
        Number(
            station?.latitude ??
            station?.lat
        );

    const longitude =
        Number(
            station?.longitude ??
            station?.lng ??
            station?.lon
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }


    return {
        latitude,
        longitude,
    };
};


// ============================================================
// STATION STATUS
// ============================================================

const isStationActive = (
    station
) => {

    const status =
        String(
            station?.stationStatus ??
            station?.status ??
            ""
        ).toUpperCase();


    return status === "ACTIVE";
};


// ============================================================
// FORMAT DISTANCE
// ============================================================

const formatDistance = (
    distance
) => {

    if (
        distance === null ||
        distance === undefined ||
        distance === ""
    ) {
        return "—";
    }


    const number =
        Number(distance);


    if (!Number.isFinite(number)) {
        return "—";
    }


    return `${number.toFixed(1)} km`;
};


const getDrivingDistance = (item) =>
    item?.drivingDistanceKm ??
    item?.distanceKm ??
    item?.distance ??
    null;

const getDrivingEta = (item) =>
    item?.estimatedTravelTimeMinutes ??
    item?.estimatedDriveTimeMinutes ??
    item?.travelTimeMinutes ??
    item?.etaMinutes ??
    null;


// ============================================================
// FORMAT CONNECTOR NAME
// ============================================================

const formatConnectorName = (
    type
) => {

    if (!type) {
        return "Unknown";
    }


    const normalized =
        String(type)
            .toUpperCase()
            .replace(/-/g, "_");


    if (
        normalized === "TYPE_2" ||
        normalized === "TYPE2"
    ) {
        return "Type 2";
    }


    if (normalized === "CCS2") {
        return "CCS2";
    }


    if (
        normalized === "CHADEMO" ||
        normalized === "CHADEMO"
    ) {
        return "CHAdeMO";
    }


    return String(type)
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
};


// ============================================================
// GET BROWSER POSITION
// ============================================================

const getBrowserPosition = () => {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported by this browser."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000,
                }
            );
        }
    );
};


// ============================================================
// STATION DETAILS HELPERS
// ============================================================

const getDetailsPayload = (details) => {
    if (!details || typeof details !== "object") {
        return null;
    }

    if (
        details.data &&
        typeof details.data === "object" &&
        !Array.isArray(details.data)
    ) {
        return details.data;
    }

    return details;
};

const getConnectorList = (...sources) => {
    for (const source of sources) {
        const payload = getDetailsPayload(source);

        if (!payload) {
            continue;
        }

        const candidates = [
            payload.connectorAvailability,
            payload.connectors,
            payload.connectorAvailabilities,
            payload.chargerAvailability,
            payload.chargerAvailabilities,
        ];

        for (const candidate of candidates) {
            if (Array.isArray(candidate)) {
                return candidate;
            }
        }
    }

    return [];
};

const getConnectorWait = (connector) => {
    const candidates = [
        connector?.waitingTimeMinutes,
        connector?.waitingTime,
        connector?.estimatedWaitingTime,
        connector?.estimatedWaitMinutes,
        connector?.waitTime,
        connector?.queueWaitTime,
    ];

    for (const value of candidates) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            continue;
        }

        const number = Number(value);

        if (Number.isFinite(number)) {
            return number;
        }
    }

    return null;
};

const getDetailsDistance = (...sources) => {
    for (const source of sources) {
        const payload = getDetailsPayload(source);

        const value =
            payload?.distanceKm ??
            payload?.drivingDistanceKm ??
            payload?.distance ??
            null;

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            return value;
        }
    }

    return null;
};

const getDetailsDriveTime = (...sources) => {
    for (const source of sources) {
        const payload = getDetailsPayload(source);

        const value =
            payload?.estimatedDriveTimeMinutes ??
            payload?.estimatedTravelTimeMinutes ??
            payload?.drivingEtaMinutes ??
            payload?.travelTimeMinutes ??
            payload?.etaMinutes ??
            null;

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {
            return value;
        }
    }

    return null;
};

const getStationCoordinatesText = (station) => {
    const latitude = Number(
        station?.latitude ??
        station?.lat
    );

    const longitude = Number(
        station?.longitude ??
        station?.lng ??
        station?.lon
    );

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return "—";
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

const formatMinutes = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        return "—";
    }

    return `${number} min`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const FindCharger = () => {

    const navigate =
        useNavigate();


    // ========================================================
    // MAP
    // ========================================================

    const mapContainerRef =
        useRef(null);

    const mapRef =
        useRef(null);

    const stationMarkersRef =
        useRef([]);

    const userMarkerRef =
        useRef(null);


    const [mapReady, setMapReady] =
        useState(false);


    // ========================================================
    // STATIONS
    // ========================================================

    const [stations, setStations] =
        useState([]);

    const [stationsLoading, setStationsLoading] =
        useState(true);

    const [stationsError, setStationsError] =
        useState("");


    // ========================================================
    // SEARCH
    // ========================================================

    const [search, setSearch] =
        useState("");

    const [searchFocused, setSearchFocused] =
        useState(false);


    // ========================================================
    // STATION DETAILS
    // ========================================================

    const [selectedStation, setSelectedStation] =
        useState(null);

    const [popupPosition, setPopupPosition] =
        useState(null);

    const [stationDetails, setStationDetails] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [detailsError, setDetailsError] =
        useState("");


    // ========================================================
    // LOCATION
    // ========================================================

    const [userLocation, setUserLocation] =
        useState(null);

    const [locationLoading, setLocationLoading] =
        useState(false);


    // ========================================================
    // VEHICLES
    // ========================================================

    const [vehicles, setVehicles] =
        useState([]);

    const [vehiclesLoading, setVehiclesLoading] =
        useState(false);

    const [vehicleError, setVehicleError] =
        useState("");


    // ========================================================
    // BOOKING
    // ========================================================

    const [bookingStation, setBookingStation] =
        useState(null);

    const [showBookingModal, setShowBookingModal] =
        useState(false);

    const [bookingVehicleId, setBookingVehicleId] =
        useState("");

    const [bookingCurrentBattery, setBookingCurrentBattery] =
        useState(20);

    const [bookingTargetBattery, setBookingTargetBattery] =
        useState(80);

    const [bookingLoading, setBookingLoading] =
        useState(false);

    const [bookingError, setBookingError] =
        useState("");

    const [bookingSuccess, setBookingSuccess] =
        useState("");

    const [bookingResponse, setBookingResponse] =
        useState(null);


    // ========================================================
    // SMART CHARGER
    // ========================================================

    const [showSmartModal, setShowSmartModal] =
        useState(false);

    const [recommendationMode, setRecommendationMode] =
        useState("SMART");

    const [selectedVehicleId, setSelectedVehicleId] =
        useState("");

    const [currentBattery, setCurrentBattery] =
        useState(20);

    const [targetBattery, setTargetBattery] =
        useState(80);

    const [selectedPriorities, setSelectedPriorities] =
        useState([]);

    const [recommendationLoading, setRecommendationLoading] =
        useState(false);

    const [recommendationError, setRecommendationError] =
        useState("");

    const [recommendations, setRecommendations] =
        useState([]);

    const [showResults, setShowResults] =
        useState(false);


    // ========================================================
    // SEARCHED STATIONS
    // ========================================================

    const searchedStations =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            if (!query) {
                return [];
            }


            return stations.filter(
                (station) => {

                    const name =
                        String(
                            station?.stationName ??
                            ""
                        ).toLowerCase();

                    const address =
                        String(
                            station?.address ??
                            ""
                        ).toLowerCase();


                    return (
                        name.includes(query) ||
                        address.includes(query)
                    );
                }
            );

        }, [
            stations,
            search,
        ]);


    // ========================================================
    // LOAD STATIONS
    // ========================================================

    const loadStations =
        useCallback(
            async () => {

                try {

                    setStationsLoading(true);
                    setStationsError("");


                    const data =
                        await apiFetch(
                            STATIONS_URL
                        );


                    const list =
                        getArrayFromResponse(
                            data,
                            [
                                "stations",
                                "data",
                                "results",
                            ]
                        );


                    setStations(list);


                    return list;

                } catch (error) {

                    console.error(
                        "Station loading failed:",
                        error
                    );


                    setStationsError(
                        error.message ||
                        "Unable to load charging stations."
                    );


                    return [];

                } finally {

                    setStationsLoading(false);
                }

            },
            []
        );


    // ========================================================
    // LOAD VEHICLES
    // ========================================================

    const loadVehicles =
        useCallback(
            async () => {

                try {

                    setVehiclesLoading(true);
                    setVehicleError("");


                    const data =
                        await apiFetch(
                            VEHICLES_URL
                        );


                    const list =
                        getArrayFromResponse(
                            data,
                            [
                                "vehicles",
                                "data",
                                "results",
                            ]
                        );


                    setVehicles(list);


                    if (
                        list.length > 0 &&
                        !selectedVehicleId
                    ) {

                        setSelectedVehicleId(
                            String(
                                list[0].id
                            )
                        );
                    }


                    return list;

                } catch (error) {

                    console.error(
                        "Vehicle loading failed:",
                        error
                    );


                    setVehicles([]);


                    setVehicleError(
                        error.message ||
                        "Unable to load vehicles."
                    );


                    return [];

                } finally {

                    setVehiclesLoading(false);
                }

            },
            [
                selectedVehicleId,
            ]
        );


    // ========================================================
    // INITIAL DATA
    // ========================================================

    useEffect(() => {

        loadStations();

    }, [
        loadStations,
    ]);


    // ========================================================
    // MAP CREATION
    // ========================================================

    useEffect(() => {

        if (!mapContainerRef.current) {
            return;
        }


        if (!MAPTILER_KEY) {

            console.error(
                "VITE_MAPTILER_KEY is missing."
            );

            return;
        }


        if (mapRef.current) {
            return;
        }


        const map =
            new maplibregl.Map({

                container:
                    mapContainerRef.current,

                style:
                    `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`,

                center: [
                    77.2090,
                    28.6139,
                ],

                zoom: 10,

                attributionControl: true,

                /*
                 * IMPORTANT:
                 *
                 * This removes the "Use Ctrl + scroll
                 * to zoom" behavior.
                 */
                cooperativeGestures: false,

                dragPan: true,

                scrollZoom: true,

                doubleClickZoom: true,

                touchZoomRotate: true,
            });


        map.addControl(
            new maplibregl.NavigationControl(),
            "top-right"
        );


        map.on(
            "load",
            () => {

                map.resize();

                setMapReady(true);
            }
        );


        map.on(
            "error",
            (event) => {

                console.error(
                    "MapLibre error:",
                    event
                );
            }
        );


        mapRef.current = map;


        return () => {

            stationMarkersRef.current.forEach(
                marker =>
                    marker.remove()
            );

            stationMarkersRef.current = [];


            if (userMarkerRef.current) {

                userMarkerRef.current.remove();

                userMarkerRef.current = null;
            }


            map.remove();

            mapRef.current = null;

            setMapReady(false);
        };

    }, []);


    // ========================================================
    // MAP RESIZE
    // ========================================================

    useEffect(() => {

        if (
            !mapContainerRef.current ||
            !mapRef.current
        ) {
            return;
        }


        const observer =
            new ResizeObserver(
                () => {

                    mapRef.current?.resize();

                }
            );


        observer.observe(
            mapContainerRef.current
        );


        return () =>
            observer.disconnect();

    }, [
        mapReady,
    ]);


    // ========================================================
    // REACT MAP POPUP POSITION
    // ========================================================

    const updatePopupPosition = useCallback(() => {
        if (!mapRef.current || !selectedStation) {
            setPopupPosition(null);
            return;
        }

        const coordinates = getCoordinates(selectedStation);
        if (!coordinates) {
            setPopupPosition(null);
            return;
        }

        const point = mapRef.current.project([
            coordinates.longitude,
            coordinates.latitude,
        ]);

        const mapRect =
            mapContainerRef.current?.getBoundingClientRect();

        if (!mapRect) {
            setPopupPosition(null);
            return;
        }

        // MapLibre's project() returns coordinates relative to the map
        // canvas. The React popup is position: fixed, so convert them
        // to viewport coordinates before rendering it.
        const rawLeft = mapRect.left + point.x;
        const rawTop = mapRect.top + point.y;

        // Keep the larger card inside the viewport horizontally.
        const popupHalfWidth = Math.min(410, (window.innerWidth - 40) / 2);
        const left = Math.min(
            Math.max(rawLeft, popupHalfWidth + 16),
            window.innerWidth - popupHalfWidth - 16
        );

        // Prefer above the marker. If the marker is too close to the
        // top of the viewport, render below it instead of clipping the card.
        const placeBelow = rawTop < 235;

        setPopupPosition({
            left,
            top: rawTop,
            placeBelow,
            markerX: rawLeft - left,
        });
    }, [selectedStation]);

    useEffect(() => {
        if (!mapReady || !mapRef.current || !selectedStation) {
            setPopupPosition(null);
            return;
        }

        const map = mapRef.current;
        updatePopupPosition();

        const handleMove = () => updatePopupPosition();
        const handleResize = () => updatePopupPosition();

        map.on("move", handleMove);
        map.on("resize", handleResize);

        return () => {
            map.off("move", handleMove);
            map.off("resize", handleResize);
        };
    }, [mapReady, selectedStation, updatePopupPosition]);


    // ========================================================
    // LOAD STATION DETAILS
    // ========================================================

    const loadStationDetails =
        useCallback(
            async (station) => {

                if (!station?.id) {
                    return;
                }

                setSelectedStation(station);
                setPopupPosition(null);
                setStationDetails(null);
                setDetailsError("");
                setDetailsLoading(true);

                let latitude =
                    userLocation?.latitude ??
                    null;

                let longitude =
                    userLocation?.longitude ??
                    null;

                try {

                    const data =
                        await apiFetch(
                            STATION_DETAILS_URL,
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({
                                        stationId:
                                            Number(
                                                station.id
                                            ),

                                        userLatitude:
                                            latitude,

                                        userLongitude:
                                            longitude,
                                    }),
                            }
                        );

                    const details =
                        getDetailsPayload(data) || {};

                    /*
                     * The station DTO already contains the complete
                     * station card payload:
                     *
                     * id
                     * stationName
                     * address
                     * latitude
                     * longitude
                     * pricePerKwh
                     * rating
                     * distanceKm
                     * estimatedDriveTimeMinutes
                     * connectorAvailability[]
                     *
                     * Merge the station DTO with the details response so
                     * we never lose those fields when the details endpoint
                     * returns only distance-related information.
                     */
                    const mergedDetails = {
                        ...station,
                        ...details,

                        id:
                            details.id ??
                            station.id,

                        stationName:
                            details.stationName ??
                            station.stationName,

                        address:
                            details.address ??
                            station.address,

                        latitude:
                            details.latitude ??
                            station.latitude,

                        longitude:
                            details.longitude ??
                            station.longitude,

                        pricePerKwh:
                            details.pricePerKwh ??
                            station.pricePerKwh,

                        rating:
                            details.rating ??
                            station.rating,

                        distanceKm:
                            details.distanceKm ??
                            details.drivingDistanceKm ??
                            station.distanceKm,

                        estimatedDriveTimeMinutes:
                            details.estimatedDriveTimeMinutes ??
                            details.estimatedTravelTimeMinutes ??
                            details.drivingEtaMinutes ??
                            station.estimatedDriveTimeMinutes,

                        connectorAvailability:
                            Array.isArray(
                                details.connectorAvailability
                            )
                                ? details.connectorAvailability
                                : Array.isArray(
                                    station.connectorAvailability
                                )
                                    ? station.connectorAvailability
                                    : Array.isArray(
                                        details.connectors
                                    )
                                        ? details.connectors
                                        : [],
                    };

                    console.log(
                        "Station card data:",
                        mergedDetails
                    );

                    setStationDetails(
                        mergedDetails
                    );

                } catch (error) {

                    console.error(
                        "Station details failed:",
                        error
                    );

                    /*
                     * Even if the secondary station-details endpoint
                     * fails, the /api/stations DTO still contains the
                     * information needed to populate the card.
                     *
                     * Keep the station selected and render its complete
                     * DTO instead of replacing the card with an error.
                     */
                    setStationDetails(
                        station
                    );

                    setDetailsError("");

                } finally {

                    setDetailsLoading(false);
                }

            },
            [
                userLocation,
            ]
        );


    // ========================================================
    // STATION MARKERS
    // ========================================================

    useEffect(() => {

        if (
            !mapReady ||
            !mapRef.current
        ) {
            return;
        }


        const map =
            mapRef.current;


        stationMarkersRef.current.forEach(
            marker =>
                marker.remove()
        );


        stationMarkersRef.current = [];


        stations.forEach(
            (station) => {

                const coordinates =
                    getCoordinates(
                        station
                    );


                if (!coordinates) {
                    return;
                }


                const active =
                    isStationActive(
                        station
                    );


                /*
                 * Simple circular marker.
                 *
                 * Only two states:
                 *
                 * ACTIVE      → green
                 * INACTIVE    → dark
                 *
                 * No charger-count
                 * animation.
                 */

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "fc-station-marker";


                element.innerHTML = `
                    <div class="fc-marker-icon" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:transform .18s ease,box-shadow .18s ease;will-change:transform;">
                    <svg
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        fill="none"
                    >
                        <circle
                            cx="17"
                            cy="17"
                            r="13"
                            fill="${active ? "#00A83B" : "#303A43"}"
                            stroke="white"
                            stroke-width="3"
                        />

                        <path
                            d="M19.2 8.5L12.3 18h5.1l-1 7.5L22 16h-5l2.2-7.5Z"
                            fill="white"
                        />
                    </svg>
                    </div>
                `;

                Object.assign(
                    element.style,
                    {
                        width: "42px",
                        height: "42px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        // MapLibre owns this root element's transform.
                    }
                );

                const markerIcon =
                    element.querySelector(".fc-marker-icon");

                markerIcon?.addEventListener("mouseenter", () => {
                    markerIcon.style.transform = "scale(1.12)";
                    markerIcon.style.boxShadow = "0 7px 20px rgba(0,0,0,.30)";
                });

                markerIcon?.addEventListener("mouseleave", () => {
                    markerIcon.style.transform = "scale(1)";
                    markerIcon.style.boxShadow = "0 4px 12px rgba(0,0,0,.22)";
                });


                element.addEventListener(
                    "click",
                    () => {

                        map.flyTo({
                            center: [
                                coordinates.longitude,
                                coordinates.latitude,
                            ],

                            zoom: 14,

                            duration: 650,
                        });


                        loadStationDetails(
                            station
                        );
                    }
                );


                const marker =
                    new maplibregl.Marker({
                        element,
                        anchor: "center",
                    })
                        .setLngLat([
                            coordinates.longitude,
                            coordinates.latitude,
                        ])
                        .addTo(map);


                stationMarkersRef.current.push(
                    marker
                );
            }
        );


    }, [
        stations,
        mapReady,
        loadStationDetails,
    ]);


    // ========================================================
    // USER LOCATION MARKER
    // ========================================================

    useEffect(() => {

        if (
            !mapReady ||
            !mapRef.current ||
            !userLocation
        ) {
            return;
        }


        if (userMarkerRef.current) {

            userMarkerRef.current.remove();

            userMarkerRef.current = null;
        }


        const element =
            document.createElement(
                "div"
            );


        element.innerHTML = `
            <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
            >
                <circle
                    cx="19"
                    cy="19"
                    r="14"
                    fill="rgba(25,118,255,.16)"
                />

                <circle
                    cx="19"
                    cy="19"
                    r="7"
                    fill="#1976FF"
                    stroke="white"
                    stroke-width="3"
                />

                <circle
                    cx="19"
                    cy="19"
                    r="2"
                    fill="white"
                />
            </svg>
        `;


        Object.assign(
            element.style,
            {
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
            }
        );


        userMarkerRef.current =
            new maplibregl.Marker({
                element,
                anchor: "center",
            })
                .setLngLat([
                    userLocation.longitude,
                    userLocation.latitude,
                ])
                .addTo(
                    mapRef.current
                );


    }, [
        userLocation,
        mapReady,
    ]);


    // ========================================================
    // CURRENT LOCATION
    // ========================================================

    const getCurrentLocation =
        useCallback(
            async () => {

                try {

                    setLocationLoading(
                        true
                    );


                    const position =
                        await getBrowserPosition();


                    const location = {
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,
                    };


                    setUserLocation(
                        location
                    );


                    mapRef.current?.flyTo({
                        center: [
                            location.longitude,
                            location.latitude,
                        ],

                        zoom: 14,

                        duration: 800,
                    });


                } catch (error) {

                    console.error(
                        "Location error:",
                        error
                    );


                    alert(
                        "Unable to get your current location. Please allow location access."
                    );

                } finally {

                    setLocationLoading(
                        false
                    );
                }

            },
            []
        );


    // ========================================================
    // AUTOMATIC LOCATION
    // ========================================================

    useEffect(() => {

        if (!navigator.geolocation) {
            return;
        }


        navigator.geolocation.getCurrentPosition(

            (position) => {

                setUserLocation({
                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,
                });

            },

            () => {
                // User can manually enable it.
            },

            {
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 60000,
            }
        );

    }, []);


    // ========================================================
    // SEARCH STATION
    // ========================================================

    const focusStation =
        (station) => {

            const coordinates =
                getCoordinates(
                    station
                );


            if (coordinates) {

                mapRef.current?.flyTo({

                    center: [
                        coordinates.longitude,
                        coordinates.latitude,
                    ],

                    zoom: 14,

                    duration: 700,
                });
            }


            loadStationDetails(
                station
            );
        };


    // ========================================================
    // REFRESH
    // ========================================================

    const refreshMap =
        async () => {

            await loadStations();

            mapRef.current?.resize();

            mapRef.current?.triggerRepaint();
        };


    // ========================================================
    // VEHICLE LABEL
    // ========================================================

    const vehicleLabel =
        (vehicle) => {

            if (!vehicle) {
                return "Vehicle";
            }


            return [
                vehicle.manufacturer,
                vehicle.model,
                vehicle.registrationNumber
                    ? `— ${vehicle.registrationNumber}`
                    : "",
            ]
                .filter(Boolean)
                .join(" ");
        };


    // ========================================================
    // OPEN BOOKING
    // ========================================================

    const openBookingModal =
        async (station) => {

            setBookingStation(
                station
            );

            setBookingError("");

            setBookingSuccess("");

            setBookingResponse(
                null
            );


            let availableVehicles =
                vehicles;


            if (
                availableVehicles.length === 0
            ) {

                availableVehicles =
                    await loadVehicles();
            }


            const firstVehicle =
                availableVehicles.find(
                    vehicle =>
                        String(
                            vehicle.id
                        ) ===
                        String(
                            selectedVehicleId
                        )
                ) ||
                availableVehicles[0];


            if (firstVehicle) {

                setBookingVehicleId(
                    String(
                        firstVehicle.id
                    )
                );
            }


            setShowBookingModal(
                true
            );
        };


    // ========================================================
    // BOOK CHARGER
    // ========================================================

    const bookCharger =
        async () => {

            setBookingError("");

            setBookingSuccess("");

            setBookingResponse(
                null
            );


            if (!bookingStation?.id) {

                setBookingError(
                    "Please select a charging station."
                );

                return;
            }


            if (!bookingVehicleId) {

                setBookingError(
                    "Please select a vehicle."
                );

                return;
            }


            const current =
                Number(
                    bookingCurrentBattery
                );

            const target =
                Number(
                    bookingTargetBattery
                );


            if (
                !Number.isFinite(current) ||
                !Number.isFinite(target) ||
                current < 0 ||
                current > 100 ||
                target < 0 ||
                target > 100
            ) {

                setBookingError(
                    "Battery percentage must be between 0 and 100."
                );

                return;
            }


            if (
                target <= current
            ) {

                setBookingError(
                    "Target battery must be higher than current battery."
                );

                return;
            }


            const request = {

                vehicleId:
                    Number(
                        bookingVehicleId
                    ),

                stationId:
                    Number(
                        bookingStation.id
                    ),

                currentBatteryPercentage:
                    current,

                targetBatteryPercentage:
                    target,
            };


            try {

                setBookingLoading(
                    true
                );


                const data =
                    await apiFetch(
                        BOOKING_URL,
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    request
                                ),
                        }
                    );


                setBookingResponse(
                    data
                );


                setBookingSuccess(
                    data?.message ||
                    "Charger booked successfully."
                );


            } catch (error) {

                console.error(
                    "Booking failed:",
                    error
                );


                setBookingError(
                    error.message ||
                    "Unable to book this charger."
                );

            } finally {

                setBookingLoading(
                    false
                );
            }
        };


    // ========================================================
    // SMART CHARGER
    // ========================================================

    const openSmartCharger =
        async () => {

            setRecommendationError("");

            setRecommendations([]);

            setShowResults(
                false
            );


            if (
                vehicles.length === 0
            ) {
                await loadVehicles();
            }


            setShowSmartModal(
                true
            );
        };


    // ========================================================
    // PRIORITY
    // ========================================================

    const togglePriority =
        (priority) => {

            setSelectedPriorities(
                current => {

                    if (
                        current.includes(
                            priority.value
                        )
                    ) {

                        return current.filter(
                            item =>
                                item !==
                                priority.value
                        );
                    }


                    return [
                        ...current,
                        priority.value,
                    ];
                }
            );
        };


    // ========================================================
    // FIND BEST CHARGER
    // ========================================================

    const findBestCharger =
        async () => {

            setRecommendationError("");


            if (!selectedVehicleId) {

                setRecommendationError(
                    "Please select a vehicle."
                );

                return;
            }


            const current =
                Number(
                    currentBattery
                );

            const target =
                Number(
                    targetBattery
                );


            if (
                current < 0 ||
                current > 100 ||
                target < 0 ||
                target > 100
            ) {

                setRecommendationError(
                    "Battery percentage must be between 0 and 100."
                );

                return;
            }


            if (
                target <= current
            ) {

                setRecommendationError(
                    "Target battery must be higher than current battery."
                );

                return;
            }


            if (
                recommendationMode ===
                    "CUSTOM" &&
                selectedPriorities.length === 0
            ) {

                setRecommendationError(
                    "Select at least one priority."
                );

                return;
            }


            let latitude =
                userLocation?.latitude;

            let longitude =
                userLocation?.longitude;


            if (
                latitude == null ||
                longitude == null
            ) {

                try {

                    const position =
                        await getBrowserPosition();


                    latitude =
                        position.coords.latitude;

                    longitude =
                        position.coords.longitude;


                    setUserLocation({
                        latitude,
                        longitude,
                    });

                } catch {

                    setRecommendationError(
                        "Please allow location access so Leccy can find the best charger."
                    );

                    return;
                }
            }


            const request = {

                vehicleId:
                    Number(
                        selectedVehicleId
                    ),

                currentLatitude:
                    latitude,

                currentLongitude:
                    longitude,

                currentBatteryPercentage:
                    current,

                targetBatteryPercentage:
                    target,

                recommendationType:
                    recommendationMode,

                priorities:
                    recommendationMode ===
                    "CUSTOM"
                        ? selectedPriorities
                        : [],
            };


            try {

                setRecommendationLoading(
                    true
                );


                const data =
                    await apiFetch(
                        RECOMMENDATION_URL,
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    request
                                ),
                        }
                    );


                const results =
                    getArrayFromResponse(
                        data,
                        [
                            "recommendations",
                            "results",
                            "data",
                        ]
                    );


                setRecommendations(
                    results
                );


                setShowSmartModal(
                    false
                );

                setShowResults(
                    true
                );


            } catch (error) {

                console.error(
                    "Recommendation failed:",
                    error
                );


                setRecommendationError(
                    error.message ||
                    "Unable to generate recommendations."
                );

            } finally {

                setRecommendationLoading(
                    false
                );
            }
        };


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <main className="fc-page">

            <style>
                {`

                /* =================================================
                   PAGE
                ================================================= */

                .fc-page {
                    min-height: 100%;
                    background: #f6f8fa;
                    padding: 28px 34px 36px;
                    color: #06243d;
                }

                .fc-shell {
                    max-width: 1500px;
                    margin: 0 auto;
                }


                /* =================================================
                   HEADER
                ================================================= */

                .fc-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 18px;
                }

                .fc-eyebrow {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color: #00a83b;
                    font-size: 14px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                }

                .fc-title {
                    margin: 7px 0 0;
                    font-size: 36px;
                    line-height: 1.1;
                    font-weight: 800;
                    letter-spacing: -.025em;
                    color: #06243d;
                }

                .fc-subtitle {
                    margin: 8px 0 0;
                    color: #71879d;
                    font-size: 15px;
                }

                .fc-best-button {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    border: none;
                    border-radius: 14px;
                    padding: 14px 20px;
                    background: #00a83b;
                    color: white;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 8px 22px rgba(0,168,59,.18);
                    transition: .2s ease;
                }

                .fc-best-button:hover {
                    background: #009436;
                    transform: translateY(-1px);
                }


                /* =================================================
                   SEARCH
                ================================================= */

                .fc-search-row {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 14px;
                }

                .fc-search {
                    flex: 1;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 0 17px;
                    border: 1px solid #dbe4eb;
                    border-radius: 14px;
                    background: white;
                    transition: .2s ease;
                }

                .fc-search.focused {
                    border-color: #00a83b;
                    box-shadow: 0 0 0 3px rgba(0,168,59,.08);
                }

                .fc-search-icon {
                    color: #91a4b5;
                    display: flex;
                }

                .fc-search-input {
                    width: 100%;
                    border: none;
                    outline: none;
                    background: transparent;
                    color: #06243d;
                    font-size: 15px;
                }

                .fc-search-input::placeholder {
                    color: #9aabb9;
                }


                /* =================================================
                   MAP
                ================================================= */

                .fc-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                    gap: 14px;
                }

                .fc-layout.has-search {
                    grid-template-columns:
                        minmax(0, 1fr)
                        365px;
                }

                .fc-map-card {
                    position: relative;
                    height: 650px;
                    overflow: hidden;
                    border: 1px solid #dfe7ed;
                    border-radius: 22px;
                    background: #e9eff3;
                    box-shadow: 0 12px 35px rgba(6,36,61,.06);
                }

                .fc-map {
                    position: absolute;
                    inset: 0;
                }

                .fc-react-popup {
                    position: fixed;
                    z-index: 2000;
                    width: 820px;
                    min-width: 760px;
                    min-height: 560px;
                    max-width: calc(100vw - 32px);
                    max-height: min(820px, calc(100vh - 32px));
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    transform: translate(-50%, calc(-100% - 12px));
                    border: 1px solid #e1e8ed;
                    border-radius: 20px;
                    background: white;
                    box-shadow: 0 24px 70px rgba(6,36,61,.24);
                    animation: fcPopupIn .22s ease both;
                    scrollbar-width: thin;
                    pointer-events: auto;
                }

                @keyframes fcPopupIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, calc(-100% - 6px)) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, calc(-100% - 12px)) scale(1);
                    }
                }

                .fc-react-popup::-webkit-scrollbar {
                    width: 7px;
                }

                .fc-react-popup::-webkit-scrollbar-thumb {
                    background: #d5e0e7;
                    border-radius: 99px;
                }

                .fc-react-popup-arrow {
                    position: absolute;
                    left: var(--popup-arrow-x, 50%);
                    bottom: -8px;
                    width: 16px;
                    height: 16px;
                    transform: translateX(-50%) rotate(45deg);
                    background: white;
                    border-right: 1px solid #e1e8ed;
                    border-bottom: 1px solid #e1e8ed;
                }

                .fc-react-popup.is-below {
                    transform: translate(-50%, 12px);
                }

                @keyframes fcPopupInBelow {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 6px) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 12px) scale(1);
                    }
                }

                .fc-react-popup.is-below {
                    animation: fcPopupInBelow .22s ease both;
                }

                .fc-react-popup.is-below .fc-react-popup-arrow {
                    top: -8px;
                    bottom: auto;
                    border-right: none;
                    border-bottom: none;
                    border-left: 1px solid #e1e8ed;
                    border-top: 1px solid #e1e8ed;
                }

                .fc-react-popup-close {
                    position: absolute;
                    z-index: 3;
                    top: 7px;
                    right: 8px;
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 8px;
                    background: #f4f7f8;
                    color: #718597;
                    font-size: 20px;
                    line-height: 1;
                    cursor: pointer;
                }

                .fc-react-popup-close:hover {
                    color: #06243d;
                    background: #eaf0f3;
                }

                .fc-react-popup .fc-popup {
                    width: 100%;
                    min-height: 560px;
                    box-sizing: border-box;
                    padding: 32px 34px 30px;
                }

                .fc-station-info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 9px;
                    margin-top: 14px;
                }

                .fc-station-info {
                    padding: 11px 12px;
                    border-radius: 10px;
                    background: #f7f9fa;
                    border: 1px solid #edf1f3;
                }

                .fc-station-info-label {
                    color: #8a9aaa;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: .05em;
                    font-weight: 800;
                }

                .fc-station-info-value {
                    margin-top: 4px;
                    color: #17344b;
                    font-size: 12px;
                    font-weight: 750;
                    word-break: break-word;
                }

                .fc-connector {
                    padding: 15px 0;
                    border-bottom: 1px solid #edf1f4;
                }

                .fc-connector:last-child {
                    border-bottom: none;
                }

                .fc-connector-name {
                    font-size: 15px;
                    font-weight: 850;
                }

                .fc-connector-stats {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 7px;
                    margin-top: 9px;
                }

                .fc-connector-stat {
                    padding: 9px 10px;
                    border-radius: 9px;
                    font-size: 11px;
                    font-weight: 800;
                    text-align: center;
                }

                .fc-queue-row {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 16px;
                    align-items: center;
                    padding: 11px 0;
                    font-size: 13px;
                }

                .fc-queue-time {
                    padding: 7px 10px;
                    border-radius: 9px;
                    background: #e9faef;
                    color: #008c35;
                    font-weight: 850;
                    white-space: nowrap;
                }

                .fc-queue-time.unavailable {
                    background: #edf0f2;
                    color: #66737d;
                }

                .fc-queue-note {
                    margin-top: 9px;
                    color: #8a9aaa;
                    font-size: 11px;
                    line-height: 1.4;
                }


                /* =================================================
                   MAP CONTROLS
                ================================================= */

                .fc-map-controls {
                    position: absolute;
                    top: 17px;
                    left: 17px;
                    z-index: 20;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .fc-map-control {
                    width: 43px;
                    height: 43px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(220,229,236,.9);
                    border-radius: 13px;
                    background: rgba(255,255,255,.96);
                    color: #06243d;
                    cursor: pointer;
                    box-shadow: 0 7px 20px rgba(0,0,0,.12);
                    transition: .2s ease;
                }

                .fc-map-control:hover {
                    color: #00a83b;
                    transform: translateY(-1px);
                }

                .fc-map-control:disabled {
                    opacity: .55;
                    cursor: wait;
                }


                /* =================================================
                   SEARCH RESULTS PANEL
                ================================================= */

                .fc-results-panel {
                    height: 650px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #dfe7ed;
                    border-radius: 22px;
                    background: white;
                    box-shadow: 0 12px 35px rgba(6,36,61,.06);
                    animation: fcPanelIn .28s ease both;
                }

                @keyframes fcPanelIn {
                    from {
                        opacity: 0;
                        transform: translateX(12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .fc-results-header {
                    padding: 22px;
                    border-bottom: 1px solid #e9eef2;
                }

                .fc-results-title {
                    font-size: 20px;
                    font-weight: 800;
                }

                .fc-results-count {
                    margin-top: 5px;
                    color: #7b90a3;
                    font-size: 13px;
                }

                .fc-results-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .fc-result-card {
                    padding: 20px 22px;
                    border: none;
                    border-bottom: 1px solid #edf1f4;
                    background: white;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .fc-result-card:hover {
                    background: #f8fcfa;
                }

                .fc-result-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                }

                .fc-result-name {
                    color: #06243d;
                    font-size: 17px;
                    font-weight: 800;
                }

                .fc-result-address {
                    margin-top: 5px;
                    color: #8093a5;
                    font-size: 13px;
                    line-height: 1.4;
                }

                .fc-status {
                    flex-shrink: 0;
                    padding: 6px 9px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: .03em;
                }

                .fc-status.active {
                    background: #e9faef;
                    color: #008c35;
                }

                .fc-status.inactive {
                    background: #edf0f2;
                    color: #64717c;
                }

                .fc-result-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: 16px;
                }

                .fc-meta {
                    padding: 10px;
                    border-radius: 11px;
                    background: #f6f8fa;
                }

                .fc-meta-label {
                    color: #8a9cad;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: .04em;
                }

                .fc-meta-value {
                    margin-top: 4px;
                    color: #06243d;
                    font-size: 13px;
                    font-weight: 750;
                }


                /* =================================================
                   EMPTY SEARCH
                ================================================= */

                .fc-empty {
                    padding: 45px 22px;
                    text-align: center;
                    color: #8093a5;
                    font-size: 14px;
                }


                /* =================================================
                   STATION POPUP
                ================================================= */

                .fc-popup {
                    width: 100%;
                    color: #06243d;
                }

                .fc-popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                }

                .fc-popup-name {
                    font-size: 24px;
                    font-weight: 800;
                }

                .fc-popup-address {
                    margin-top: 7px;
                    color: #7c91a3;
                    font-size: 12px;
                    line-height: 1.4;
                }

                .fc-popup-summary {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 7px;
                    margin-top: 15px;
                }

                .fc-popup-pill {
                    padding: 10px 13px;
                    border-radius: 9px;
                    background: #f4f7f9;
                    color: #4e6579;
                    font-size: 12px;
                    font-weight: 750;
                }

                .fc-connector-section {
                    margin-top: 19px;
                    padding-top: 16px;
                    border-top: 1px solid #e8edf1;
                }

                .fc-popup-section-title {
                    margin-bottom: 11px;
                    color: #06243d;
                    font-size: 12px;
                    font-weight: 850;
                    letter-spacing: .07em;
                }

                .fc-connector {
                    padding: 12px 0;
                    border-bottom: 1px solid #eef2f4;
                }

                .fc-connector:last-child {
                    border-bottom: none;
                }

                .fc-connector-name {
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 800;
                }

                .fc-connector-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .fc-connector-stat {
                    padding: 7px 9px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 750;
                }

                .fc-connector-stat.available {
                    background: #e9faef;
                    color: #008c35;
                }

                .fc-connector-stat.busy {
                    background: #fff4e5;
                    color: #c77700;
                }

                .fc-connector-stat.unavailable {
                    background: #edf0f2;
                    color: #66737d;
                }

                .fc-queue {
                    margin-top: 17px;
                    padding-top: 16px;
                    border-top: 1px solid #e8edf1;
                }

                .fc-queue-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    font-size: 13px;
                }

                .fc-queue-time {
                    color: #00a83b;
                    font-weight: 800;
                }

                .fc-queue-time.unavailable {
                    color: #8a98a3;
                }

                .fc-queue-note {
                margin-top: 14px;
                padding: 10px 12px;
                border-radius: 10px;
                background: #f0fdf4;
                color: #64748b;
                font-size: 11px;
                line-height: 1.45;
            }

            .fc-popup-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: 18px;
                }

                .fc-popup-button {
                    height: 52px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 850;
                }

                .fc-popup-button.primary {
                    background: #00a83b;
                    color: white;
                }

                .fc-popup-button.secondary {
                    background: #06243d;
                    color: white;
                }

                .fc-popup-button:disabled {
                    opacity: .5;
                    cursor: not-allowed;
                }


                /* =================================================
                   LOADING
                ================================================= */

                .fc-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 150px;
                    color: #7d91a3;
                    font-size: 13px;
                }

                .fc-spinner {
                    width: 18px;
                    height: 18px;
                    margin-right: 9px;
                    border: 2px solid #dce6ec;
                    border-top-color: #00a83b;
                    border-radius: 50%;
                    animation: fcSpin .7s linear infinite;
                }

                @keyframes fcSpin {
                    to {
                        transform: rotate(360deg);
                    }
                }


                /* =================================================
                   MODALS
                ================================================= */

                .fc-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(3,20,33,.58);
                    backdrop-filter: blur(5px);
                    animation: fcFade .2s ease both;
                }

                @keyframes fcFade {
                    from {
                        opacity: 0;
                    }

                    to {
                        opacity: 1;
                    }
                }

                .fc-modal {
                    width: min(650px, calc(100vw - 30px));
                    max-height: 88vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border-radius: 22px;
                    background: white;
                    box-shadow: 0 30px 90px rgba(0,0,0,.3);
                    animation: fcModalIn .25s ease both;
                }

                @keyframes fcModalIn {
                    from {
                        opacity: 0;
                        transform: translateY(14px) scale(.98);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .fc-modal-header {
                    position: relative;
                    padding: 23px 26px 19px;
                    border-bottom: 1px solid #e8eef2;
                }

                .fc-modal-kicker {
                    color: #00a83b;
                    font-size: 11px;
                    font-weight: 850;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                }

                .fc-modal-title {
                    margin-top: 6px;
                    font-size: 26px;
                    font-weight: 800;
                }

                .fc-modal-description {
                    margin-top: 5px;
                    color: #71879b;
                    font-size: 13px;
                }

                .fc-modal-close {
                    position: absolute;
                    top: 16px;
                    right: 17px;
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    border-radius: 10px;
                    background: #f5f7f8;
                    color: #71879b;
                    cursor: pointer;
                }

                .fc-modal-close:hover {
                    color: #06243d;
                }

                .fc-modal-content {
                    overflow-y: auto;
                    padding: 22px 26px 27px;
                }


                /* =================================================
                   FORM
                ================================================= */

                .fc-field {
                    margin-top: 19px;
                }

                .fc-field:first-child {
                    margin-top: 0;
                }

                .fc-label {
                    display: block;
                    margin-bottom: 8px;
                    color: #06243d;
                    font-size: 13px;
                    font-weight: 800;
                }

                .fc-select,
                .fc-number {
                    width: 100%;
                    height: 50px;
                    box-sizing: border-box;
                    padding: 0 13px;
                    border: 1px solid #dbe4ea;
                    border-radius: 12px;
                    outline: none;
                    background: white;
                    color: #06243d;
                    font-size: 14px;
                }

                .fc-select:focus,
                .fc-number:focus {
                    border-color: #00a83b;
                    box-shadow: 0 0 0 3px rgba(0,168,59,.08);
                }

                .fc-battery-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 13px;
                }

                .fc-station-summary {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 15px;
                    border-radius: 14px;
                    background: #f6fbf8;
                    border: 1px solid #dcefe3;
                }

                .fc-station-summary-name {
                    font-size: 16px;
                    font-weight: 800;
                }

                .fc-station-summary-address {
                    margin-top: 4px;
                    color: #7890a1;
                    font-size: 12px;
                }

                .fc-price {
                    white-space: nowrap;
                    font-size: 15px;
                    font-weight: 800;
                    color: #00a83b;
                }

                .fc-confirm {
                    width: 100%;
                    height: 51px;
                    margin-top: 20px;
                    border: none;
                    border-radius: 13px;
                    background: #00a83b;
                    color: white;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .fc-confirm:hover {
                    background: #009436;
                }

                .fc-confirm:disabled {
                    opacity: .6;
                    cursor: wait;
                }


                /* =================================================
                   SUCCESS
                ================================================= */

                .fc-success {
                    padding: 14px;
                    border: 1px solid #bceacb;
                    border-radius: 13px;
                    background: #effcf4;
                    color: #008a34;
                    font-size: 13px;
                    font-weight: 700;
                }

                .fc-booking-info {
                    margin-top: 14px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 9px;
                }

                .fc-booking-info-card {
                    padding: 12px;
                    border-radius: 11px;
                    background: #f6f8fa;
                }

                .fc-booking-info-label {
                    color: #8496a6;
                    font-size: 10px;
                    text-transform: uppercase;
                }

                .fc-booking-info-value {
                    margin-top: 4px;
                    font-size: 13px;
                    font-weight: 800;
                }


                /* =================================================
                   ERROR
                ================================================= */

                .fc-error {
                    margin-top: 13px;
                    padding: 12px 14px;
                    border: 1px solid #ffd1d1;
                    border-radius: 11px;
                    background: #fff2f2;
                    color: #c62828;
                    font-size: 12px;
                }


                /* =================================================
                   SMART MODAL
                ================================================= */

                .fc-mode-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .fc-mode {
                    padding: 15px;
                    border: 1px solid #dce5eb;
                    border-radius: 13px;
                    background: white;
                    text-align: left;
                    cursor: pointer;
                }

                .fc-mode.selected {
                    border-color: #00a83b;
                    background: #effcf4;
                }

                .fc-mode-title {
                    font-size: 14px;
                    font-weight: 800;
                }

                .fc-mode-copy {
                    margin-top: 4px;
                    color: #7890a2;
                    font-size: 11px;
                    line-height: 1.4;
                }

                .fc-priority-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .fc-priority {
                    padding: 12px;
                    border: 1px solid #dce5eb;
                    border-radius: 11px;
                    background: white;
                    color: #06243d;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .fc-priority.selected {
                    border-color: #00a83b;
                    background: #effcf4;
                    color: #008a34;
                }


                /* =================================================
                   RECOMMENDATIONS
                ================================================= */

                .fc-recommendation {
                    padding: 16px;
                    margin-bottom: 10px;
                    border: 1px solid #dce5eb;
                    border-radius: 14px;
                }

                .fc-recommendation.best {
                    border-color: #9be3b8;
                    background: #fbfffc;
                }

                .fc-rec-top {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                }

                .fc-rec-name {
                    font-size: 16px;
                    font-weight: 800;
                }

                .fc-best-pill {
                    display: inline-block;
                    margin-top: 5px;
                    padding: 4px 7px;
                    border-radius: 20px;
                    background: #ddf8e7;
                    color: #008a34;
                    font-size: 9px;
                    font-weight: 850;
                }

                .fc-score {
                    color: #00a83b;
                    font-size: 22px;
                    font-weight: 850;
                }

                .fc-rec-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 7px;
                    margin-top: 13px;
                }

                .fc-rec-stat {
                    padding: 9px;
                    border-radius: 9px;
                    background: #f5f7f8;
                }

                .fc-rec-stat-label {
                    color: #8799a9;
                    font-size: 9px;
                }

                .fc-rec-stat-value {
                    margin-top: 3px;
                    font-size: 12px;
                    font-weight: 800;
                }

                .fc-view-button {
                    width: 100%;
                    height: 41px;
                    margin-top: 11px;
                    border: none;
                    border-radius: 10px;
                    background: #06243d;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 800;
                }


                /* =================================================
                   RESPONSIVE
                ================================================= */

                @media (max-width: 1000px) {

                    .fc-layout.has-search {
                        grid-template-columns: 1fr;
                    }

                    .fc-results-panel {
                        height: 430px;
                    }

                }


                @media (max-width: 700px) {

                    .fc-page {
                        padding: 18px;
                    }

                    .fc-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .fc-best-button {
                        width: 100%;
                        justify-content: center;
                    }

                    .fc-title {
                        font-size: 29px;
                    }

                    .fc-map-card {
                        height: 540px;
                    }

                    .fc-battery-grid,
                    .fc-mode-grid,
                    .fc-priority-grid {
                        grid-template-columns: 1fr;
                    }

                    .fc-rec-stats {
                        grid-template-columns: 1fr 1fr;
                    }

                    .fc-popup-actions {
                        grid-template-columns: 1fr;
                    }

                    .fc-react-popup {
                        width: calc(100vw - 24px);
                        min-width: 0;
                        min-height: 0;
                        max-width: calc(100vw - 24px);
                        max-height: calc(100vh - 24px);
                    }

                    .fc-station-info-grid {
                        grid-template-columns: 1fr;
                    }

                    .fc-connector-stats {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                `}
            </style>


            <div className="fc-shell">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="fc-header">

                    <div>

                        <div className="fc-eyebrow">
                            <Icon
                                name="bolt"
                                size={15}
                            />

                            Find Charger
                        </div>

                        <h1 className="fc-title">
                            Find a Charging Station
                        </h1>

                        <p className="fc-subtitle">
                            Search stations, check live charger
                            availability and join the queue.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="fc-best-button"
                        onClick={
                            openSmartCharger
                        }
                    >
                        <Icon
                            name="bolt"
                            size={17}
                        />

                        Find Best Charger

                        <Icon
                            name="arrow"
                            size={16}
                        />
                    </button>

                </header>


                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div className="fc-search-row">

                    <div
                        className={`fc-search ${
                            searchFocused
                                ? "focused"
                                : ""
                        }`}
                    >

                        <span className="fc-search-icon">

                            <Icon
                                name="search"
                                size={19}
                            />

                        </span>


                        <input
                            className="fc-search-input"
                            value={search}
                            onFocus={() =>
                                setSearchFocused(
                                    true
                                )
                            }
                            onBlur={() =>
                                setSearchFocused(
                                    false
                                )
                            }
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search charging station or address..."
                        />

                    </div>

                </div>


                {/* ==================================================
                    MAP + CONDITIONAL SEARCH PANEL
                ================================================== */}

                <div
                    className={`fc-layout ${
                        search.trim()
                            ? "has-search"
                            : ""
                    }`}
                >

                    {/* MAP */}

                    <div className="fc-map-card">

                        <div
                            ref={mapContainerRef}
                            className="fc-map"
                        />


                        {/* MAP CONTROLS */}

                        <div className="fc-map-controls">

                            <button
                                type="button"
                                className="fc-map-control"
                                title="Current location"
                                onClick={
                                    getCurrentLocation
                                }
                                disabled={
                                    locationLoading
                                }
                            >

                                <Icon
                                    name="location"
                                    size={20}
                                />

                            </button>


                            <button
                                type="button"
                                className="fc-map-control"
                                title="Refresh stations"
                                onClick={
                                    refreshMap
                                }
                                disabled={
                                    stationsLoading
                                }
                            >

                                <Icon
                                    name="refresh"
                                    size={19}
                                />

                            </button>

                        </div>


                        {/* STATION API ERROR */}

                        {stationsError && (

                            <div
                                style={{
                                    position:
                                        "absolute",

                                    left: 18,

                                    right: 18,

                                    bottom: 18,

                                    zIndex: 30,
                                }}
                            >

                                <div className="fc-error">
                                    {stationsError}
                                </div>

                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        SEARCH RESULT PANEL
                    ================================================== */}

                    {search.trim() && (

                        <aside className="fc-results-panel">

                            <div className="fc-results-header">

                                <div className="fc-results-title">
                                    Search Results
                                </div>

                                <div className="fc-results-count">
                                    {searchedStations.length}{" "}
                                    station
                                    {searchedStations.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </div>

                            </div>


                            <div className="fc-results-list">

                                {searchedStations.length ===
                                    0 && (

                                    <div className="fc-empty">

                                        No charging station
                                        matches your search.

                                    </div>

                                )}


                                {searchedStations.map(
                                    station => {

                                        const active =
                                            isStationActive(
                                                station
                                            );


                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    station.id
                                                }
                                                className="fc-result-card"
                                                onClick={() =>
                                                    focusStation(
                                                        station
                                                    )
                                                }
                                            >

                                                <div className="fc-result-top">

                                                    <div>

                                                        <div className="fc-result-name">
                                                            {
                                                                station.stationName
                                                            }
                                                        </div>

                                                        <div className="fc-result-address">
                                                            {
                                                                station.address ||
                                                                "Address unavailable"
                                                            }
                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`fc-status ${
                                                            active
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {active
                                                            ? "ACTIVE"
                                                            : "INACTIVE"}
                                                    </span>

                                                </div>


                                                <div className="fc-result-meta">

                                                    <div className="fc-meta">

                                                        <div className="fc-meta-label">
                                                            Price
                                                        </div>

                                                        <div className="fc-meta-value">
                                                            ₹
                                                            {station.pricePerKwh ??
                                                                "—"}
                                                            /kWh
                                                        </div>

                                                    </div>


                                                    <div className="fc-meta">

                                                        <div className="fc-meta-label">
                                                            Rating
                                                        </div>

                                                        <div className="fc-meta-value">
                                                            ⭐{" "}
                                                            {station.rating ??
                                                                "—"}
                                                        </div>

                                                    </div>

                                                </div>

                                            </button>
                                        );
                                    }
                                )}

                            </div>

                        </aside>
                    )}

                </div>

            </div>


            {/* ========================================================
                STATION DETAILS POPUP
                This is a React overlay. maplibre-gl's Popup class
                must not be rendered directly as JSX.
            ======================================================== */}

            {selectedStation && popupPosition && (
                <div
                    className={`fc-react-popup ${
                        popupPosition.placeBelow
                            ? "is-below"
                            : ""
                    }`}
                    style={{
                        left: popupPosition.left,
                        top: popupPosition.top,
                        "--popup-arrow-x": `${Math.max(
                            28,
                            Math.min(
                                792,
                                popupPosition.markerX
                            )
                        )}px`,
                    }}
                >
                    <div className="fc-react-popup-arrow" />

                    <button
                        type="button"
                        className="fc-react-popup-close"
                        onClick={() => {
                            setSelectedStation(null);
                            setStationDetails(null);
                            setDetailsError("");
                            setPopupPosition(null);
                        }}
                        aria-label="Close station details"
                    >
                        ×
                    </button>

                    <div className="fc-popup">

                        {detailsLoading && (
                            <div className="fc-loading">
                                <span className="fc-spinner" />
                                Loading station details...
                            </div>
                        )}

                        {!detailsLoading &&
                            stationDetails && (
                                <>
                                    {(() => {
                                        const details =
                                            getDetailsPayload(
                                                stationDetails
                                            ) ||
                                            {};

                                        /*
                                         * Prefer the exact station DTO
                                         * fields requested for the card.
                                         * Use details as a fallback for
                                         * values calculated by the
                                         * secondary endpoint.
                                         */
                                        const connectors =
                                            getConnectorList(
                                                details,
                                                selectedStation
                                            );

                                        const distance =
                                            getDetailsDistance(
                                                details,
                                                selectedStation
                                            );

                                        const driveTime =
                                            getDetailsDriveTime(
                                                details,
                                                selectedStation
                                            );

                                        const stationId =
                                            details.id ??
                                            selectedStation.id;

                                        const latitude =
                                            details.latitude ??
                                            selectedStation.latitude;

                                        const longitude =
                                            details.longitude ??
                                            selectedStation.longitude;

                                        return (
                                            <>
                                                <div className="fc-popup-header">
                                                    <div>
                                                        <div className="fc-popup-name">
                                                            {
                                                                details.stationName ??
                                                                selectedStation.stationName ??
                                                                "Charging Station"
                                                            }
                                                        </div>

                                                        <div className="fc-popup-address">
                                                            {
                                                                details.address ??
                                                                selectedStation.address ??
                                                                "Address unavailable"
                                                            }
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`fc-status ${
                                                            isStationActive(
                                                                selectedStation
                                                            )
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {isStationActive(
                                                            selectedStation
                                                        )
                                                            ? "ACTIVE"
                                                            : "INACTIVE"}
                                                    </span>
                                                </div>

                                                <div className="fc-popup-summary">
                                                    <span className="fc-popup-pill">
                                                        ⭐{" "}
                                                        {details.rating ??
                                                            selectedStation.rating ??
                                                            "—"}
                                                    </span>

                                                    <span className="fc-popup-pill">
                                                        ₹
                                                        {details.pricePerKwh ??
                                                            selectedStation.pricePerKwh ??
                                                            "—"}
                                                        /kWh
                                                    </span>

                                                    <span className="fc-popup-pill">
                                                        📍{" "}
                                                        {formatDistance(
                                                            distance
                                                        )}
                                                    </span>

                                                    <span className="fc-popup-pill">
                                                        🚗{" "}
                                                        {driveTime != null
                                                            ? `~${driveTime} min drive`
                                                            : "Drive time —"}
                                                    </span>
                                                </div>

                                                <div className="fc-station-info-grid">
                                                    <div className="fc-station-info">
                                                        <div className="fc-station-info-label">
                                                            Station ID
                                                        </div>
                                                        <div className="fc-station-info-value">
                                                            {stationId ?? "—"}
                                                        </div>
                                                    </div>

                                                    <div className="fc-station-info">
                                                        <div className="fc-station-info-label">
                                                            Latitude
                                                        </div>
                                                        <div className="fc-station-info-value">
                                                            {Number.isFinite(
                                                                Number(
                                                                    latitude
                                                                )
                                                            )
                                                                ? Number(
                                                                    latitude
                                                                ).toFixed(6)
                                                                : "—"}
                                                        </div>
                                                    </div>

                                                    <div className="fc-station-info">
                                                        <div className="fc-station-info-label">
                                                            Longitude
                                                        </div>
                                                        <div className="fc-station-info-value">
                                                            {Number.isFinite(
                                                                Number(
                                                                    longitude
                                                                )
                                                            )
                                                                ? Number(
                                                                    longitude
                                                                ).toFixed(6)
                                                                : "—"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="fc-connector-section">
                                                    <div className="fc-popup-section-title">
                                                        CONNECTOR AVAILABILITY
                                                    </div>

                                                    {connectors.length ===
                                                    0 ? (
                                                        <div className="fc-popup-muted">
                                                            No connector availability
                                                            data returned by the
                                                            station API.
                                                        </div>
                                                    ) : (
                                                        connectors.map(
                                                            (
                                                                connector,
                                                                index
                                                            ) => {
                                                                const available =
                                                                    Number(
                                                                        connector.available ??
                                                                            0
                                                                    );

                                                                const busy =
                                                                    Number(
                                                                        connector.busy ??
                                                                            0
                                                                    );

                                                                const unavailable =
                                                                    Number(
                                                                        connector.unavailable ??
                                                                            0
                                                                    );

                                                                const waiting =
                                                                    getConnectorWait(
                                                                        connector
                                                                    );

                                                                return (
                                                                    <div
                                                                        className="fc-connector"
                                                                        key={`${
                                                                            connector.connectorType ??
                                                                            "connector"
                                                                        }-${index}`}
                                                                    >
                                                                        <div className="fc-connector-name">
                                                                            {formatConnectorName(
                                                                                connector.connectorType
                                                                            )}
                                                                        </div>

                                                                        <div className="fc-connector-stats">
                                                                            <span className="fc-connector-stat available">
                                                                                🟢{" "}
                                                                                {
                                                                                    available
                                                                                }{" "}
                                                                                Available
                                                                            </span>

                                                                            <span className="fc-connector-stat busy">
                                                                                🟠{" "}
                                                                                {
                                                                                    busy
                                                                                }{" "}
                                                                                Busy
                                                                            </span>

                                                                            <span className="fc-connector-stat unavailable">
                                                                                ⚫{" "}
                                                                                {
                                                                                    unavailable
                                                                                }{" "}
                                                                                Unavailable
                                                                            </span>

                                                                            <span
                                                                                className={`fc-connector-stat ${
                                                                                    waiting ===
                                                                                        null ||
                                                                                    waiting <
                                                                                        0
                                                                                        ? "unavailable"
                                                                                        : "available"
                                                                                }`}
                                                                            >
                                                                                ⏱️{" "}
                                                                                {formatMinutes(
                                                                                    waiting
                                                                                )}{" "}
                                                                                Wait
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        )
                                                    )}
                                                </div>

                                                <div className="fc-queue">
                                                    <div className="fc-popup-section-title">
                                                        QUEUE STATUS
                                                    </div>

                                                    {connectors.length ===
                                                    0 ? (
                                                        <div className="fc-popup-muted">
                                                            Queue information
                                                            unavailable because
                                                            connector availability
                                                            was not returned.
                                                        </div>
                                                    ) : (
                                                        connectors.map(
                                                            (
                                                                connector,
                                                                index
                                                            ) => {
                                                                const available =
                                                                    Number(
                                                                        connector.available ??
                                                                            0
                                                                    );

                                                                const waiting =
                                                                    getConnectorWait(
                                                                        connector
                                                                    );

                                                                let queueText;

                                                                if (
                                                                    waiting !==
                                                                        null &&
                                                                    waiting >=
                                                                        0
                                                                ) {
                                                                    queueText =
                                                                        waiting ===
                                                                            0
                                                                            ? "0 min • Ready now"
                                                                            : `~${waiting} min`;
                                                                } else if (
                                                                    available >
                                                                    0
                                                                ) {
                                                                    queueText =
                                                                        "0 min • Ready now";
                                                                } else {
                                                                    queueText =
                                                                        "Wait time unavailable";
                                                                }

                                                                return (
                                                                    <div
                                                                        className="fc-queue-row"
                                                                        key={`queue-${
                                                                            connector.connectorType ??
                                                                            "connector"
                                                                        }-${index}`}
                                                                    >
                                                                        <span>
                                                                            {formatConnectorName(
                                                                                connector.connectorType
                                                                            )}
                                                                        </span>

                                                                        <span
                                                                            className={`fc-queue-time ${
                                                                                queueText ===
                                                                                "Wait time unavailable"
                                                                                    ? "unavailable"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            {queueText}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )
                                                    )}

                                                    {connectors.length > 0 && (
                                                        <div className="fc-queue-note">
                                                            Waiting time comes
                                                            directly from the
                                                            connector
                                                            availability data
                                                            returned by the API.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="fc-popup-actions">
                                                    <button
                                                        type="button"
                                                        className="fc-popup-button secondary"
                                                        onClick={() =>
                                                            openBookingModal(
                                                                selectedStation
                                                            )
                                                        }
                                                        disabled={
                                                            !isStationActive(
                                                                selectedStation
                                                            )
                                                        }
                                                    >
                                                        Join Queue
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="fc-popup-button primary"
                                                        onClick={() =>
                                                            focusStation(
                                                                selectedStation
                                                            )
                                                        }
                                                    >
                                                        Directions
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </>
                            )}

                        {!detailsLoading &&
                            !stationDetails && (
                                <div className="fc-loading">
                                    <span className="fc-spinner" />
                                    Preparing station card...
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* ========================================================
                BOOKING MODAL
            ======================================================== */}

            {showBookingModal && (

                <div
                    className="fc-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setShowBookingModal(
                                false
                            );
                        }
                    }}
                >

                    <div className="fc-modal">

                        <div className="fc-modal-header">

                            <div className="fc-modal-kicker">
                                Queue Booking
                            </div>

                            <div className="fc-modal-title">
                                Join Charging Queue
                            </div>

                            <div className="fc-modal-description">
                                Select your vehicle and
                                charging target.
                            </div>


                            <button
                                type="button"
                                className="fc-modal-close"
                                onClick={() =>
                                    setShowBookingModal(
                                        false
                                    )
                                }
                            >
                                <Icon
                                    name="close"
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="fc-modal-content">

                            <div className="fc-station-summary">

                                <div>

                                    <div className="fc-station-summary-name">
                                        {
                                            bookingStation?.stationName ??
                                            "Charging Station"
                                        }
                                    </div>

                                    <div className="fc-station-summary-address">
                                        {
                                            bookingStation?.address ??
                                            "Address unavailable"
                                        }
                                    </div>

                                </div>


                                <div className="fc-price">
                                    ₹
                                    {
                                        bookingStation?.pricePerKwh ??
                                        "—"
                                    }
                                    /kWh
                                </div>

                            </div>


                            <div className="fc-field">

                                <label className="fc-label">
                                    Select vehicle
                                </label>


                                <select
                                    className="fc-select"
                                    value={
                                        bookingVehicleId
                                    }
                                    onChange={event =>
                                        setBookingVehicleId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        vehiclesLoading
                                    }
                                >

                                    {vehiclesLoading ? (

                                        <option value="">
                                            Loading vehicles...
                                        </option>

                                    ) : vehicles.length ===
                                      0 ? (

                                        <option value="">
                                            No vehicles found
                                        </option>

                                    ) : (

                                        <>

                                            <option value="">
                                                Select a vehicle
                                            </option>


                                            {vehicles.map(
                                                vehicle => (

                                                    <option
                                                        key={
                                                            vehicle.id
                                                        }
                                                        value={
                                                            vehicle.id
                                                        }
                                                    >
                                                        {
                                                            vehicleLabel(
                                                                vehicle
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </>

                                    )}

                                </select>

                            </div>


                            <div className="fc-battery-grid">

                                <div className="fc-field">

                                    <label className="fc-label">
                                        Current battery
                                    </label>

                                    <input
                                        className="fc-number"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            bookingCurrentBattery
                                        }
                                        onChange={event =>
                                            setBookingCurrentBattery(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="fc-field">

                                    <label className="fc-label">
                                        Target battery
                                    </label>

                                    <input
                                        className="fc-number"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            bookingTargetBattery
                                        }
                                        onChange={event =>
                                            setBookingTargetBattery(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            <div
                                style={{
                                    marginTop:
                                        "13px",
                                    padding:
                                        "12px 14px",
                                    borderRadius:
                                        "11px",
                                    background:
                                        "#f6f8fa",
                                    color:
                                        "#71879b",
                                    fontSize:
                                        "12px",
                                    lineHeight:
                                        1.5,
                                }}
                            >
                                Charging duration and final
                                cost are determined by the
                                backend during the booking
                                process.
                            </div>


                            {vehicleError && (

                                <div className="fc-error">
                                    {vehicleError}
                                </div>

                            )}


                            {bookingError && (

                                <div className="fc-error">
                                    {bookingError}
                                </div>

                            )}


                            {bookingSuccess && (

                                <div
                                    className="fc-success"
                                    style={{
                                        marginTop:
                                            "14px",
                                    }}
                                >
                                    {bookingSuccess}
                                </div>

                            )}


                            {bookingResponse && (

                                <div className="fc-booking-info">

                                    <div className="fc-booking-info-card">

                                        <div className="fc-booking-info-label">
                                            Token
                                        </div>

                                        <div className="fc-booking-info-value">
                                            {
                                                bookingResponse.tokenNumber ??
                                                "—"
                                            }
                                        </div>

                                    </div>


                                    <div className="fc-booking-info-card">

                                        <div className="fc-booking-info-label">
                                            Charger
                                        </div>

                                        <div className="fc-booking-info-value">
                                            {
                                                bookingResponse.chargerNumber ??
                                                "Assigned by system"
                                            }
                                        </div>

                                    </div>


                                    <div className="fc-booking-info-card">

                                        <div className="fc-booking-info-label">
                                            Status
                                        </div>

                                        <div className="fc-booking-info-value">
                                            {
                                                bookingResponse.status ??
                                                "—"
                                            }
                                        </div>

                                    </div>


                                    <div className="fc-booking-info-card">

                                        <div className="fc-booking-info-label">
                                            Est. Charging
                                        </div>

                                        <div className="fc-booking-info-value">
                                            {
                                                bookingResponse.estimatedChargingDuration !=
                                                null
                                                    ? `${bookingResponse.estimatedChargingDuration} min`
                                                    : "Calculated by backend"
                                            }
                                        </div>

                                    </div>

                                </div>

                            )}


                            {!bookingSuccess && (

                                <button
                                    type="button"
                                    className="fc-confirm"
                                    onClick={
                                        bookCharger
                                    }
                                    disabled={
                                        bookingLoading
                                    }
                                >
                                    {bookingLoading
                                        ? "Joining Queue..."
                                        : "Join Charging Queue"}
                                </button>

                            )}


                            {bookingSuccess && (

                                <button
                                    type="button"
                                    className="fc-confirm"
                                    onClick={() =>
                                        navigate(
                                            "/home/bookings"
                                        )
                                    }
                                >
                                    View My Bookings
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ========================================================
                SMART CHARGER MODAL
            ======================================================== */}

            {showSmartModal && (

                <div
                    className="fc-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setShowSmartModal(
                                false
                            );
                        }
                    }}
                >

                    <div className="fc-modal">

                        <div className="fc-modal-header">

                            <div className="fc-modal-kicker">
                                Smart Charging
                            </div>

                            <div className="fc-modal-title">
                                Find Your Best Charger
                            </div>

                            <div className="fc-modal-description">
                                Leccy will rank compatible
                                stations using your preferences.
                            </div>


                            <button
                                type="button"
                                className="fc-modal-close"
                                onClick={() =>
                                    setShowSmartModal(
                                        false
                                    )
                                }
                            >
                                <Icon
                                    name="close"
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="fc-modal-content">

                            <div className="fc-field">

                                <label className="fc-label">
                                    Recommendation mode
                                </label>


                                <div className="fc-mode-grid">

                                    <button
                                        type="button"
                                        className={`fc-mode ${
                                            recommendationMode ===
                                            "SMART"
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setRecommendationMode(
                                                "SMART"
                                            )
                                        }
                                    >

                                        <div className="fc-mode-title">
                                            ⚡ Smart
                                        </div>

                                        <div className="fc-mode-copy">
                                            Let Leccy's
                                            recommendation
                                            engine balance
                                            the important factors.
                                        </div>

                                    </button>


                                    <button
                                        type="button"
                                        className={`fc-mode ${
                                            recommendationMode ===
                                            "CUSTOM"
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setRecommendationMode(
                                                "CUSTOM"
                                            )
                                        }
                                    >

                                        <div className="fc-mode-title">
                                            🎯 Custom
                                        </div>

                                        <div className="fc-mode-copy">
                                            Choose the factors
                                            that matter most
                                            to you.
                                        </div>

                                    </button>

                                </div>

                            </div>


                            <div className="fc-field">

                                <label className="fc-label">
                                    Vehicle
                                </label>


                                <select
                                    className="fc-select"
                                    value={
                                        selectedVehicleId
                                    }
                                    onChange={event =>
                                        setSelectedVehicleId(
                                            event.target.value
                                        )
                                    }
                                >

                                    {vehicles.length ===
                                    0 ? (

                                        <option value="">
                                            No vehicles found
                                        </option>

                                    ) : (

                                        <>

                                            <option value="">
                                                Select a vehicle
                                            </option>


                                            {vehicles.map(
                                                vehicle => (

                                                    <option
                                                        key={
                                                            vehicle.id
                                                        }
                                                        value={
                                                            vehicle.id
                                                        }
                                                    >
                                                        {
                                                            vehicleLabel(
                                                                vehicle
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </>

                                    )}

                                </select>

                            </div>


                            <div className="fc-battery-grid">

                                <div className="fc-field">

                                    <label className="fc-label">
                                        Current battery
                                    </label>

                                    <input
                                        className="fc-number"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            currentBattery
                                        }
                                        onChange={event =>
                                            setCurrentBattery(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="fc-field">

                                    <label className="fc-label">
                                        Target battery
                                    </label>

                                    <input
                                        className="fc-number"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            targetBattery
                                        }
                                        onChange={event =>
                                            setTargetBattery(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {recommendationMode ===
                                "CUSTOM" && (

                                <div className="fc-field">

                                    <label className="fc-label">
                                        Priorities
                                    </label>


                                    <div className="fc-priority-grid">

                                        {PRIORITIES.map(
                                            priority => (

                                                <button
                                                    type="button"
                                                    key={
                                                        priority.value
                                                    }
                                                    className={`fc-priority ${
                                                        selectedPriorities.includes(
                                                            priority.value
                                                        )
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        togglePriority(
                                                            priority
                                                        )
                                                    }
                                                >
                                                    {
                                                        priority.label
                                                    }
                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {recommendationError && (

                                <div className="fc-error">
                                    {
                                        recommendationError
                                    }
                                </div>

                            )}


                            <button
                                type="button"
                                className="fc-confirm"
                                onClick={
                                    findBestCharger
                                }
                                disabled={
                                    recommendationLoading
                                }
                            >
                                {recommendationLoading
                                    ? "Finding best charger..."
                                    : "Find Best Charger"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ========================================================
                RECOMMENDATION RESULTS
            ======================================================== */}

            {showResults && (

                <div className="fc-overlay">

                    <div className="fc-modal">

                        <div className="fc-modal-header">

                            <div className="fc-modal-kicker">
                                Smart Charging
                            </div>

                            <div className="fc-modal-title">
                                Best Chargers For You
                            </div>

                            <div className="fc-modal-description">
                                Ranked according to your
                                selected preferences.
                            </div>


                            <button
                                type="button"
                                className="fc-modal-close"
                                onClick={() =>
                                    setShowResults(
                                        false
                                    )
                                }
                            >
                                <Icon
                                    name="close"
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="fc-modal-content">

                            {recommendations.length ===
                            0 ? (

                                <div className="fc-empty">
                                    No suitable charging
                                    stations were found.
                                </div>

                            ) : (

                                recommendations.map(
                                    (
                                        recommendation,
                                        index
                                    ) => {

                                        const station =
                                            stations.find(
                                                item =>
                                                    Number(
                                                        item.id
                                                    ) ===
                                                    Number(
                                                        recommendation.stationId
                                                    )
                                            );


                                        return (

                                            <div
                                                className={`fc-recommendation ${
                                                    index ===
                                                    0
                                                        ? "best"
                                                        : ""
                                                }`}
                                                key={
                                                    recommendation.stationId ??
                                                    index
                                                }
                                            >

                                                <div className="fc-rec-top">

                                                    <div>

                                                        <div className="fc-rec-name">
                                                            {
                                                                recommendation.stationName ||
                                                                station?.stationName ||
                                                                "Charging Station"
                                                            }
                                                        </div>


                                                        {index ===
                                                            0 && (

                                                            <span className="fc-best-pill">
                                                                BEST MATCH
                                                            </span>

                                                        )}

                                                    </div>


                                                    <div className="fc-score">

                                                        {Math.round(
                                                            Number(
                                                                recommendation.recommendationScore ??
                                                                recommendation.score ??
                                                                0
                                                            )
                                                        )}
                                                        %

                                                    </div>

                                                </div>


                                                <div className="fc-rec-stats">

                                                    <div className="fc-rec-stat">

                                                        <div className="fc-rec-stat-label">
                                                            Distance
                                                        </div>

                                                        <div className="fc-rec-stat-value">
                                                            {
                                                                formatDistance(
                                                                    getDrivingDistance(recommendation)
                                                                )
                                                            }
                                                        </div>

                                                    </div>


                                                    <div className="fc-rec-stat">

                                                        <div className="fc-rec-stat-label">
                                                            Waiting
                                                        </div>

                                                        <div className="fc-rec-stat-value">
                                                            {
                                                                recommendation.waitingTime ??
                                                                0
                                                            }{" "}
                                                            min
                                                        </div>

                                                    </div>


                                                    <div className="fc-rec-stat">

                                                        <div className="fc-rec-stat-label">
                                                            Charging
                                                        </div>

                                                        <div className="fc-rec-stat-value">
                                                            {
                                                                recommendation.chargingDuration ??
                                                                0
                                                            }{" "}
                                                            min
                                                        </div>

                                                    </div>


                                                    <div className="fc-rec-stat">

                                                        <div className="fc-rec-stat-label">
                                                            Driving ETA
                                                        </div>

                                                        <div className="fc-rec-stat-value">
                                                            {getDrivingEta(recommendation) != null
                                                                ? `${getDrivingEta(recommendation)} min`
                                                                : "—"}
                                                        </div>

                                                    </div>

                                                    <div className="fc-rec-stat">

                                                        <div className="fc-rec-stat-label">
                                                            Price / kWh
                                                        </div>

                                                        <div className="fc-rec-stat-value">
                                                            ₹
                                                            {
                                                                recommendation.pricePerKwh ??
                                                                "—"
                                                            }
                                                        </div>

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="fc-view-button"
                                                    onClick={() => {

                                                        if (
                                                            station
                                                        ) {

                                                            focusStation(
                                                                station
                                                            );

                                                            setShowResults(
                                                                false
                                                            );
                                                        }

                                                    }}
                                                >
                                                    View Station
                                                </button>

                                            </div>

                                        );
                                    }
                                )

                            )}

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
};


export default FindCharger;