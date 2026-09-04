import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import vehicleFallback from "../assets/images/VehicleCard.png";
import { getBrandLogo, getVehicleImage } from "../utils/vehicleAssets";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/api/vehicles`;
const CATALOGUE_API_URL = `${API_BASE_URL}/api/vehicle-catalogue`;
const BOOKINGS_API_URL = `${API_BASE_URL}/api/bookings`;

const emptyForm = {
    manufacturer: "",
    model: "",
    variant: "",
    registrationNumber: "",
    catalogueVehicleId: "",
};

const Icon = ({ name, size = 20 }) => {
    const paths = {
        car: (
            <>
                <path d="M5 17h14l-1.2-6.1a2 2 0 0 0-2-1.6H8.2a2 2 0 0 0-2 1.6L5 17Z" />
                <path d="M4 17v3m16-3v3M7 17h.01M17 17h.01M4 14h16" />
            </>
        ),
        bolt: <path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z" />,
        battery: (
            <>
                <rect x="3" y="6" width="17" height="12" rx="2" />
                <path d="M20 10h2v4h-2M7 12h6" />
            </>
        ),
        plug: (
            <>
                <path d="M8 2v7m8-7v7M6 9h12v2a6 6 0 0 1-12 0V9Zm6 8v5" />
            </>
        ),
        edit: (
            <>
                <path d="m4 20 4.2-1 9.7-9.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
                <path d="m13.5 7.5 3 3" />
            </>
        ),
        trash: (
            <>
                <path d="M4 7h16M10 11v6m4-6v6M9 7V4h6v3m-9 0 1 14h10l1-14" />
            </>
        ),
        plus: <path d="M12 5v14M5 12h14" />,
        arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        close: <path d="m6 6 12 12M18 6 6 18" />,
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


const CatalogueSelect = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    loading = false,
    getOptionValue = (option) => option,
    getOptionLabel = (option) => option,
}) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const selectedOption = options.find(
        (option) => String(getOptionValue(option)) === String(value)
    );
    const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";
    const isDisabled = disabled || loading;

    const choose = (option) => {
        onChange({
            target: {
                name,
                value: String(getOptionValue(option)),
            },
        });
        setOpen(false);
    };

    return (
        <div className={`catalogue-select ${open ? "is-open" : ""}`} ref={ref}>
            <button
                type="button"
                className={`catalogue-select-trigger ${!selectedLabel ? "placeholder" : ""}`}
                onClick={() => !isDisabled && setOpen((prev) => !prev)}
                disabled={isDisabled}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{loading ? "Loading..." : selectedLabel || placeholder}</span>
                <span className="catalogue-select-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </span>
            </button>

            {open && !isDisabled && (
                <div className="catalogue-select-menu" role="listbox">
                    {options.length === 0 ? (
                        <div className="catalogue-select-empty">No options available</div>
                    ) : (
                        options.map((option) => {
                            const optionValue = String(getOptionValue(option));
                            const optionLabel = getOptionLabel(option);
                            const selected = String(value) === optionValue;

                            return (
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    className={`catalogue-select-option ${selected ? "selected" : ""}`}
                                    key={optionValue}
                                    onClick={() => choose(option)}
                                >
                                    <span>{optionLabel}</span>
                                    {selected && (
                                        <span className="catalogue-select-check" aria-hidden="true">✓</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const getToken = () => localStorage.getItem("token");

const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.vehicles)) return data.vehicles;
    if (Array.isArray(data?.bookings)) return data.bookings;
    return [];
};

const normalizeVehicle = (vehicle) => {
    const dcPower = Number(vehicle?.maxDcChargingKw ?? vehicle?.maxChargingPower ?? 0);
    const acPower = Number(vehicle?.maxAcChargingKw ?? 0);

    return {
        ...vehicle,
        catalogueVehicleId: vehicle?.catalogueVehicleId ?? vehicle?.catalogueVehicle?.id ?? null,
        batteryCapacity: vehicle?.batteryCapacity ?? vehicle?.batteryCapacityKwh ?? 0,
        chargingType: vehicle?.chargingType ?? (dcPower > 0 ? "DC" : "AC"),
        maxChargingPower: vehicle?.maxChargingPower ?? (dcPower || acPower),
        imagePath: vehicle?.imagePath ?? vehicle?.catalogueVehicle?.imagePath ?? null,
    };
};

const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    // Read the response as text first. Some successful endpoints (especially
    // DELETE) can return 200/204 with an empty response body. Calling
    // response.json() on an empty body throws:
    // "Unexpected end of JSON input".
    const rawBody = await response.text();
    let body = null;

    if (rawBody.trim()) {
        try {
            body = JSON.parse(rawBody);
        } catch {
            body = rawBody;
        }
    }

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        if (body && typeof body === "object" && !Array.isArray(body)) {
            message = body?.message || body?.error || message;
        } else if (typeof body === "string" && body.trim()) {
            message = body;
        }

        const error = new Error(message);

        // Bean Validation errors are returned as:
        // { registrationNumber: "Enter a valid registration number ..." }
        if (body && typeof body === "object" && !Array.isArray(body)) {
            const validationErrors = Object.fromEntries(
                Object.entries(body).filter(
                    ([, value]) => typeof value === "string"
                )
            );

            if (Object.keys(validationErrors).length > 0) {
                error.fieldErrors = validationErrors;
            }
        }

        throw error;
    }

    // Empty successful response is valid (including DELETE 204 or a 200
    // response with no body). Never try to JSON.parse an empty string.
    if (!rawBody.trim() || response.status === 204) return null;

    return body;
};

const getStatus = (vehicle, bookings) => {
    const live = bookings
        .filter((booking) => {
            const vehicleId = booking?.vehicleId ?? booking?.vehicle?.id;
            const status = String(booking?.status || "").toUpperCase();
            return (
                String(vehicleId) === String(vehicle?.id) &&
                ["WAITING", "NOTIFIED", "ACTIVE", "CHARGING"].includes(status)
            );
        })
        .sort(
            (a, b) =>
                new Date(b?.bookedAt || b?.requestedAt || 0) -
                new Date(a?.bookedAt || a?.requestedAt || 0)
        )[0];

    if (!live) return { key: "IDLE", label: "Ready to charge", booking: null };

    const status = String(live.status || "").toUpperCase();

    if (status === "WAITING")
        return { key: "WAITING", label: "Waiting for charger", booking: live };
    if (status === "NOTIFIED")
        return { key: "READY", label: "Charger ready", booking: live };

    return { key: "CHARGING", label: "Charging now", booking: live };
};

const MyVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [models, setModels] = useState([]);
    const [variants, setVariants] = useState([]);
    const [catalogueLoading, setCatalogueLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [activeVehicle, setActiveVehicle] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchVehicles = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            if (!silent) setError("");

            const data = await apiRequest(`${API_URL}/getAllVehicles`);
            setVehicles(getArray(data).map(normalizeVehicle));
        } catch (err) {
            console.error("Vehicle sync error:", err);

            // Background sync must never flash an error banner over the UI.
            // Keep the currently displayed vehicles and let the next sync retry.
            if (!silent) {
                setError(err.message || "Unable to load your vehicles.");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchManufacturers = async () => {
        try {
            const data = await apiRequest(`${CATALOGUE_API_URL}/manufacturers`);
            setManufacturers(getArray(data));
        } catch (err) {
            console.error("Catalogue manufacturer error:", err);
        }
    };

    const fetchModels = async (manufacturer) => {
        if (!manufacturer) {
            setModels([]);
            setVariants([]);
            return;
        }

        try {
            setCatalogueLoading(true);
            const data = await apiRequest(
                `${CATALOGUE_API_URL}/models?manufacturer=${encodeURIComponent(manufacturer)}`
            );
            const uniqueModels = [...new Map(
                getArray(data).map((item) => [item.model, item])
            ).values()];
            setModels(uniqueModels);
        } catch (err) {
            console.error("Catalogue model error:", err);
            setError(err.message || "Unable to load vehicle models.");
        } finally {
            setCatalogueLoading(false);
        }
    };

    const fetchVariants = async (manufacturer, model) => {
        if (!manufacturer || !model) {
            setVariants([]);
            return;
        }

        try {
            setCatalogueLoading(true);
            const data = await apiRequest(
                `${CATALOGUE_API_URL}/variants?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`
            );
            setVariants(getArray(data));
        } catch (err) {
            console.error("Catalogue variant error:", err);
            setError(err.message || "Unable to load vehicle variants.");
        } finally {
            setCatalogueLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await apiRequest(BOOKINGS_API_URL, {
                method: "GET",
                cache: "no-store",
            });
            setBookings(getArray(data));
        } catch (err) {
            console.error("Booking status error:", err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            await Promise.all([fetchVehicles(), fetchBookings(), fetchManufacturers()]);
            if (!mounted) return;
        };

        load();

        // Keep the UI in sync with backend changes without reloading the browser.
        // React state updates the vehicle cards and overview stats in-place.
        const vehicleSyncInterval = window.setInterval(
            () => fetchVehicles(true),
            5000
        );

        const bookingSyncInterval = window.setInterval(
            () => fetchBookings(),
            5000
        );

        // Refresh immediately when the user comes back to this tab.
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchVehicles(true);
                fetchBookings();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            mounted = false;
            window.clearInterval(vehicleSyncInterval);
            window.clearInterval(bookingSyncInterval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const stats = useMemo(() => {
        const charging = vehicles.filter(
            (vehicle) => getStatus(vehicle, bookings).key === "CHARGING"
        ).length;

        const dc = vehicles.filter(
            (vehicle) => String(vehicle.chargingType).toUpperCase() === "DC"
        ).length;

        return {
            total: vehicles.length,
            charging,
            dc,
        };
    }, [vehicles, bookings]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchVehicles(true), fetchBookings()]);
        setRefreshing(false);
    };

    const openAdd = () => {
        setEditingVehicle(null);
        setFormData(emptyForm);
        setError("");
        setFieldErrors({});
        setShowForm(true);
    };

    const openEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            manufacturer: vehicle.manufacturer || "",
            model: vehicle.model || "",
            variant: vehicle.variant || "",
            registrationNumber: vehicle.registrationNumber || "",
            catalogueVehicleId: vehicle.catalogueVehicleId || "",
        });
        fetchModels(vehicle.manufacturer || "");
        fetchVariants(vehicle.manufacturer || "", vehicle.model || "");
        setError("");
        setFieldErrors({});
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;
        setShowForm(false);
        setEditingVehicle(null);
        setFormData(emptyForm);
        setFieldErrors({});
    };

    const handleChange = async (event) => {
        const { name, value } = event.target;

        if (name === "manufacturer") {
            setFormData((prev) => ({ ...prev, manufacturer: value, model: "", variant: "", catalogueVehicleId: "" }));
            setModels([]);
            setVariants([]);
            await fetchModels(value);
            return;
        }

        if (name === "model") {
            setFormData((prev) => ({ ...prev, model: value, variant: "", catalogueVehicleId: "" }));
            setVariants([]);
            await fetchVariants(formData.manufacturer, value);
            return;
        }

        if (name === "variant") {
            const selected = variants.find((item) => String(item.id) === String(value));
            setFormData((prev) => ({
                ...prev,
                variant: selected?.variant || "",
                catalogueVehicleId: selected?.id || "",
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        // Remove the error for this field as soon as the user edits it.
        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setFieldErrors({});

            if (!formData.catalogueVehicleId) {
                setFieldErrors({
                    catalogueVehicleId:
                        "Please select a valid vehicle variant from the catalogue.",
                });
                return;
            }

            const payload = {
                registrationNumber: formData.registrationNumber.trim().toUpperCase(),
                catalogueVehicleId: Number(formData.catalogueVehicleId),
            };

            const editing = Boolean(editingVehicle);

            await apiRequest(
                editing
                    ? `${API_URL}/update/${editingVehicle.id}`
                    : `${API_URL}/addVehicle`,
                {
                    method: editing ? "PUT" : "POST",
                    body: JSON.stringify(payload),
                }
            );

            await fetchVehicles(true);
            closeForm();
        } catch (err) {
            console.error(err);

            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
                setError("");
            } else {
                setError(err.message || "Unable to save vehicle.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?"))
            return;

        try {
            setDeletingId(vehicleId);
            setError("");

            await apiRequest(`${API_URL}/delete/${vehicleId}`, {
                method: "DELETE",
            });

            setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
            if (activeVehicle?.id === vehicleId) setActiveVehicle(null);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to delete vehicle.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <>
                <style>{styles}</style>
                <div className="vehicles-page">
                    <div className="vehicle-shell">
                        <div className="skeleton eyebrow-skeleton" />
                        <div className="skeleton title-skeleton" />
                        <div className="skeleton copy-skeleton" />
                        <div className="skeleton-grid">
                            {[1, 2, 3].map((item) => (
                                <div className="vehicle-skeleton" key={item}>
                                    <div className="skeleton image-skeleton" />
                                    <div className="skeleton line-skeleton" />
                                    <div className="skeleton short-skeleton" />
                                    <div className="skeleton boxes-skeleton" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{styles}</style>

            <main className="vehicles-page">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <div className="vehicle-shell">
                    <header className="vehicles-header reveal">
                        <div>
                            <div className="eyebrow">
                                <span className="eyebrow-bolt">
                                    <Icon name="bolt" size={13} />
                                </span>
                                YOUR GARAGE
                            </div>

                            <h1>
                                Your EVs.
                                <span> Ready to move.</span>
                            </h1>

                            <p>
                                Keep your vehicles, charging specifications, and
                                live charging status in one place.
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="add-button" onClick={openAdd}>
                                <Icon name="plus" size={19} />
                                Add vehicle
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div className="error-banner reveal">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    <section className="garage-overview reveal">
                        <div className="overview-main">
                            <div className="overview-orb">
                                <Icon name="car" size={28} />
                            </div>
                            <div>
                                <span className="overview-kicker">GARAGE OVERVIEW</span>
                                <h2>
                                    {vehicles.length === 0
                                        ? "Your garage is waiting."
                                        : `${vehicles.length} vehicle${vehicles.length > 1 ? "s" : ""} in your garage`}
                                </h2>
                                <p>
                                    {stats.charging
                                        ? `${stats.charging} vehicle is currently charging.`
                                        : "Everything is ready for your next charging trip."}
                                </p>
                            </div>
                        </div>

                        <div className="overview-stats">
                            <div>
                                <span>VEHICLES</span>
                                <strong>{stats.total}</strong>
                            </div>
                            <div>
                                <span>CHARGING</span>
                                <strong className={stats.charging ? "green-number" : ""}>
                                    {stats.charging}
                                </strong>
                            </div>
                            <div>
                                <span>DC READY</span>
                                <strong>{stats.dc}</strong>
                            </div>
                        </div>
                    </section>

                    {vehicles.length === 0 ? (
                        <section className="empty-garage reveal">
                            <div className="empty-visual">
                                <div className="empty-ring ring-one" />
                                <div className="empty-ring ring-two" />
                                <div className="empty-car">
                                    <Icon name="car" size={42} />
                                </div>
                                <span className="floating-bolt bolt-a">⚡</span>
                                <span className="floating-bolt bolt-b">⚡</span>
                            </div>

                            <span className="empty-kicker">START YOUR GARAGE</span>
                            <h2>Add your first EV</h2>
                            <p>
                                Save your vehicle details once and Leccy can use
                                them for charger compatibility, recommendations,
                                charging estimates, and bookings.
                            </p>

                            <button className="add-button large" onClick={openAdd}>
                                <Icon name="plus" size={20} />
                                Add your first vehicle
                            </button>
                        </section>
                    ) : (
                        <>
                            <div className="section-heading reveal">
                                <div>
                                    <span className="section-kicker">YOUR VEHICLES</span>
                                    <h2>Charging profiles</h2>
                                </div>
                                <p>
                                    Live status updates automatically while you keep
                                    this page open.
                                </p>
                            </div>

                            <section className="vehicle-grid">
                                {vehicles.map((vehicle, index) => {
                                    const status = getStatus(vehicle, bookings);
                                    const isActive = activeVehicle?.id === vehicle.id;

                                    return (
                                        <article
                                            className={`vehicle-card reveal-card ${isActive ? "selected-card" : ""}`}
                                            key={vehicle.id}
                                            style={{ "--delay": `${index * 90}ms` }}
                                            onClick={() => setActiveVehicle(vehicle)}
                                        >
                                            <div className="card-image">
                                                <img
                                                    className="vehicle-card-image"
                                                    src={vehicle.imagePath || getVehicleImage(vehicle.manufacturer, vehicle.model)}
                                                    alt={`${vehicle.manufacturer} ${vehicle.model}`}
                                                    onError={(e) => {
                                                        if (e.currentTarget.dataset.fallbackApplied) return;
                                                        e.currentTarget.dataset.fallbackApplied = "true";
                                                        e.currentTarget.src = vehicleFallback;
                                                    }}
                                                />

                                                <div className={`live-badge ${status.key.toLowerCase()}`}>
                                                    <i />
                                                    {status.label}
                                                </div>

                                                <div className="card-actions">
                                                    <button
                                                        title="Edit vehicle"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEdit(vehicle);
                                                        }}
                                                    >
                                                        <Icon name="edit" size={16} />
                                                    </button>

                                                    <button
                                                        title="Delete vehicle"
                                                        className="delete-action"
                                                        disabled={deletingId === vehicle.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(vehicle.id);
                                                        }}
                                                    >
                                                        <Icon name="trash" size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="card-content">
                                                <div className="vehicle-title-row">
                                                    <div>
                                                        <div className="vehicle-label brand-label">
                                                            <img
                                                                src={getBrandLogo(vehicle.manufacturer)}
                                                                alt=""
                                                                aria-hidden="true"
                                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                            />
                                                            <span>{vehicle.manufacturer}</span>
                                                        </div>
                                                        <h3>{vehicle.model}</h3>
                                                    </div>
                                                    <span className="vehicle-index">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </span>
                                                </div>

                                                <div className="registration">
                                                    <span>REGISTRATION</span>
                                                    <strong>{vehicle.registrationNumber}</strong>
                                                </div>

                                                <div className="spec-grid">
                                                    <div className="spec">
                                                        <div className="spec-icon">
                                                            <Icon name="battery" size={17} />
                                                        </div>
                                                        <div>
                                                            <span>Battery</span>
                                                            <strong>{vehicle.batteryCapacity} kWh</strong>
                                                        </div>
                                                    </div>

                                                    <div className="spec">
                                                        <div className="spec-icon">
                                                            <Icon name="plug" size={17} />
                                                        </div>
                                                        <div>
                                                            <span>Connector</span>
                                                            <strong>{vehicle.connectorType}</strong>
                                                        </div>
                                                    </div>

                                                    <div className="spec">
                                                        <div className="spec-icon">
                                                            <Icon name="bolt" size={17} />
                                                        </div>
                                                        <div>
                                                            <span>Charging</span>
                                                            <strong>{vehicle.chargingType}</strong>
                                                        </div>
                                                    </div>

                                                    <div className="spec">
                                                        <div className="spec-icon">
                                                            <Icon name="bolt" size={17} />
                                                        </div>
                                                        <div>
                                                            <span>Max power</span>
                                                            <strong>{vehicle.maxChargingPower} kW</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-footer">
                                                    <button
                                                        className="details-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveVehicle(vehicle);
                                                        }}
                                                    >
                                                        View vehicle
                                                        <Icon name="arrow" size={16} />
                                                    </button>

                                                    <Link
                                                        to="/home/find-charger"
                                                        className="charge-link"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Find charger
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        </>
                    )}

                    <section className="bottom-feature reveal">
                        <div className="feature-icon-wrap">
                            <Icon name="bolt" size={24} />
                        </div>
                        <div>
                            <span>BUILT FOR YOUR NEXT TRIP</span>
                            <h3>Your vehicle profile powers smarter charging.</h3>
                            <p>
                                Leccy uses connector, charging type, battery capacity,
                                and power details to make station selection more useful.
                            </p>
                        </div>
                        <Link to="/home/find-charger">
                            Find a charger
                            <Icon name="arrow" size={17} />
                        </Link>
                    </section>
                </div>
            </main>

            {activeVehicle && (
                <div
                    className="modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setActiveVehicle(null);
                    }}
                >
                    <div className="vehicle-detail-modal">
                        <button
                            className="modal-close"
                            onClick={() => setActiveVehicle(null)}
                        >
                            <Icon name="close" size={21} />
                        </button>

                        <div className="detail-hero">
                            <div className="detail-image">
                                <img
                                    className="detail-vehicle-image"
                                    src={activeVehicle.imagePath || getVehicleImage(activeVehicle.manufacturer, activeVehicle.model)}
                                    alt={`${activeVehicle.manufacturer} ${activeVehicle.model}`}
                                    onError={(e) => {
                                                        if (e.currentTarget.dataset.fallbackApplied) return;
                                                        e.currentTarget.dataset.fallbackApplied = "true";
                                                        e.currentTarget.src = vehicleFallback;
                                                    }}
                                />
                            </div>

                            <div>
                                <span className="section-kicker">VEHICLE PROFILE</span>
                                <h2>
                                    {activeVehicle.manufacturer}{" "}
                                    {activeVehicle.model}
                                </h2>
                                <p>{activeVehicle.registrationNumber}</p>

                                <div className={`detail-status ${getStatus(activeVehicle, bookings).key.toLowerCase()}`}>
                                    <i />
                                    {getStatus(activeVehicle, bookings).label}
                                </div>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div>
                                <span>Battery capacity</span>
                                <strong>{activeVehicle.batteryCapacity} kWh</strong>
                            </div>
                            <div>
                                <span>Connector</span>
                                <strong>{activeVehicle.connectorType}</strong>
                            </div>
                            <div>
                                <span>Charging type</span>
                                <strong>{activeVehicle.chargingType}</strong>
                            </div>
                            <div>
                                <span>Maximum power</span>
                                <strong>{activeVehicle.maxChargingPower} kW</strong>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button
                                className="outline-button"
                                onClick={() => {
                                    setActiveVehicle(null);
                                    openEdit(activeVehicle);
                                }}
                            >
                                <Icon name="edit" size={17} />
                                Edit vehicle
                            </button>

                            <Link
                                to="/home/find-charger"
                                className="add-button"
                            >
                                Find compatible charger
                                <Icon name="arrow" size={17} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div
                    className="modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeForm();
                    }}
                >
                    <div className="form-modal">
                        <div className="form-header">
                            <div>
                                <span className="section-kicker">
                                    {editingVehicle ? "UPDATE PROFILE" : "NEW VEHICLE"}
                                </span>
                                <h2>
                                    {editingVehicle
                                        ? "Edit your EV"
                                        : "Add a vehicle"}
                                </h2>
                                <p>
                                    Select your vehicle from Leccy's verified catalogue.
                                    Charging specifications are filled automatically.
                                </p>
                            </div>

                            <button className="modal-close" onClick={closeForm}>
                                <Icon name="close" size={21} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label>
                                    Manufacturer
                                    <CatalogueSelect
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        options={manufacturers}
                                        placeholder="Select manufacturer"
                                        disabled={catalogueLoading}
                                    />
                                </label>

                                <label>
                                    Model
                                    <CatalogueSelect
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        options={models}
                                        placeholder="Select model"
                                        disabled={!formData.manufacturer || catalogueLoading}
                                        getOptionValue={(item) => item.model}
                                        getOptionLabel={(item) => item.model}
                                    />
                                </label>

                                <label className="full">
                                    Variant
                                    <CatalogueSelect
                                        name="variant"
                                        value={formData.catalogueVehicleId}
                                        onChange={handleChange}
                                        options={variants}
                                        placeholder={catalogueLoading ? "Loading variants..." : "Select variant"}
                                        disabled={!formData.model || catalogueLoading}
                                        getOptionValue={(item) => item.id}
                                        getOptionLabel={(item) => item.variant || item.model}
                                    />
                                </label>

                                <label className="full">
                                    Registration number
                                    <input
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. DL01AB1234"
                                        required
                                        aria-invalid={Boolean(fieldErrors.registrationNumber)}
                                        className={
                                            fieldErrors.registrationNumber
                                                ? "field-error"
                                                : ""
                                        }
                                    />
                                    {fieldErrors.registrationNumber && (
                                        <span className="field-error-message">
                                            {fieldErrors.registrationNumber}
                                        </span>
                                    )}
                                </label>

                                {formData.catalogueVehicleId && (
                                    <div className="catalogue-preview full">
                                        <span>CATALOGUE VEHICLE</span>
                                        <strong>
                                            {formData.manufacturer} {formData.model}
                                            {formData.variant ? ` · ${formData.variant}` : ""}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            <div className="form-tip">
                                <div>
                                    <Icon name="bolt" size={18} />
                                </div>
                                <p>
                                    <strong>Why the catalogue matters</strong>
                                    <br />
                                    Leccy uses the selected vehicle variant to load its
                                    verified battery, connector, and charging specifications.
                                </p>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="outline-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="add-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingVehicle
                                            ? "Save changes"
                                            : "Add vehicle"}
                                    {!saving && <Icon name="arrow" size={17} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

const styles = `
    * { box-sizing: border-box; }

    .vehicles-page {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        background:
            radial-gradient(circle at 82% 5%, rgba(0,168,59,.075), transparent 28%),
            radial-gradient(circle at 5% 55%, rgba(0,168,59,.045), transparent 25%),
            #f7f9fb;
        color: #06243d;
        padding: 44px 36px 70px;
    }

    .vehicle-shell {
        width: min(1180px, 100%);
        margin: 0 auto;
        position: relative;
        z-index: 2;
    }

    .ambient {
        position: absolute;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        filter: blur(80px);
        pointer-events: none;
        animation: drift 12s ease-in-out infinite alternate;
    }

    .ambient-one {
        right: -100px;
        top: 180px;
        background: rgba(0,168,59,.055);
    }

    .ambient-two {
        left: -170px;
        bottom: 80px;
        background: rgba(6,36,61,.035);
        animation-delay: -4s;
    }

    .vehicles-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 30px;
        margin-bottom: 32px;
    }

    .eyebrow,
    .section-kicker,
    .overview-kicker,
    .empty-kicker {
        color: #00a83b;
        font-size: 12px;
        font-weight: 850;
        letter-spacing: .16em;
    }

    .eyebrow {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .eyebrow-bolt {
        width: 25px;
        height: 25px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #eafff1;
        animation: softPulse 2.5s infinite;
    }

    .vehicles-header h1 {
        margin: 11px 0 8px;
        font-size: clamp(38px, 5vw, 64px);
        line-height: .98;
        letter-spacing: -.055em;
        font-weight: 850;
    }

    .vehicles-header h1 span {
        color: #00a83b;
    }

    .vehicles-header p {
        margin: 0;
        color: #71879e;
        font-size: 16px;
        line-height: 1.65;
        max-width: 620px;
    }

    .header-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }

    button,
    a,
    input,
    select {
        font: inherit;
    }

    button,
    a {
        -webkit-tap-highlight-color: transparent;
    }

    .add-button,
    .refresh-button,
    .outline-button {
        min-height: 48px;
        border-radius: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        padding: 0 18px;
        cursor: pointer;
        text-decoration: none;
        font-weight: 750;
        transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
    }

    .add-button {
        border: 1px solid #00a83b;
        background: #00a83b;
        color: white;
        box-shadow: 0 9px 24px rgba(0,168,59,.17);
    }

    .add-button:hover {
        transform: translateY(-2px);
        background: #009737;
        box-shadow: 0 13px 30px rgba(0,168,59,.22);
    }

    .refresh-button {
        border: 1px solid #dbe5ec;
        background: white;
        color: #06243d;
    }

    .refresh-button:hover {
        transform: translateY(-2px);
        border-color: #b9d6c4;
        color: #00a83b;
    }

    .refresh-button span {
        color: #00a83b;
        font-size: 19px;
    }

    .refresh-button:disabled,
    .add-button:disabled {
        opacity: .6;
        cursor: wait;
    }

    .spin {
        display: inline-block;
        animation: spin 1s linear infinite;
    }

    .garage-overview {
        display: grid;
        grid-template-columns: 1.25fr 1fr;
        gap: 18px;
        padding: 24px;
        border: 1px solid #dce8e1;
        border-radius: 24px;
        background:
            linear-gradient(120deg, #ffffff 0%, #fafffc 100%);
        box-shadow: 0 14px 45px rgba(6,36,61,.055);
        margin-bottom: 48px;
        overflow: hidden;
        position: relative;
    }

    .garage-overview::before {
        content: "";
        position: absolute;
        width: 260px;
        height: 260px;
        right: -100px;
        top: -130px;
        border-radius: 50%;
        background: rgba(0,168,59,.07);
        animation: breathe 5s ease-in-out infinite;
    }

    .overview-main {
        display: flex;
        align-items: center;
        gap: 18px;
    }

    .overview-orb {
        width: 64px;
        height: 64px;
        border-radius: 20px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        color: #00a83b;
        background: #ecfff3;
        box-shadow: inset 0 0 0 1px #d3f5df;
        animation: float 4s ease-in-out infinite;
    }

    .overview-main h2 {
        margin: 5px 0 3px;
        font-size: 22px;
        letter-spacing: -.025em;
    }

    .overview-main p {
        margin: 0;
        color: #71879e;
        font-size: 13px;
    }

    .overview-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        position: relative;
        z-index: 1;
    }

    .overview-stats > div {
        min-width: 0;
        padding: 13px;
        border-radius: 15px;
        background: #f5f8fa;
        border: 1px solid #edf1f4;
    }

    .overview-stats span {
        display: block;
        color: #8a9caf;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
    }

    .overview-stats strong {
        display: block;
        margin-top: 7px;
        font-size: 23px;
        letter-spacing: -.03em;
    }

    .overview-stats small {
        font-size: 10px;
        color: #8a9caf;
    }

    .green-number {
        color: #00a83b;
    }

    .section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 20px;
    }

    .section-heading h2 {
        margin: 5px 0 0;
        font-size: 27px;
        letter-spacing: -.035em;
    }

    .section-heading > p {
        margin: 0;
        max-width: 420px;
        color: #7a8fa4;
        font-size: 13px;
        line-height: 1.6;
        text-align: right;
    }

    .vehicle-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
    }

    .vehicle-card {
        min-width: 0;
        border: 1px solid #dce5ec;
        border-radius: 23px;
        background: white;
        overflow: hidden;
        cursor: pointer;
        box-shadow: 0 10px 35px rgba(6,36,61,.045);
        transition:
            transform .35s cubic-bezier(.2,.8,.2,1),
            box-shadow .35s ease,
            border-color .35s ease;
        animation-delay: var(--delay);
    }

    .vehicle-card:hover {
        transform: translateY(-8px);
        border-color: #b7ddc5;
        box-shadow: 0 22px 50px rgba(6,36,61,.11);
    }

    .selected-card {
        border-color: #00a83b;
        box-shadow: 0 20px 50px rgba(0,168,59,.12);
    }

    .card-image {
        height: 218px;
        position: relative;
        overflow: hidden;
        display: grid;
        place-items: center;
        background: #f5f8fa;
    }


    .vehicle-card-image {
        width: 96%;
        height: 190px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        transition: transform .45s cubic-bezier(.2,.8,.2,1);
    }

    .vehicle-card:hover .vehicle-card-image {
        transform: scale(1.055) translateY(-4px);
    }

    .live-badge {
        position: absolute;
        left: 14px;
        top: 14px;
        z-index: 3;
        padding: 8px 11px;
        border-radius: 999px;
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(220,229,236,.9);
        color: #71879e;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 7px;
    }

    .live-badge i,
    .detail-status i {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #9aabba;
    }

    .live-badge.charging,
    .live-badge.ready {
        color: #008f34;
        border-color: #c7efd6;
        background: rgba(239,255,245,.94);
    }

    .live-badge.charging i,
    .live-badge.ready i,
    .detail-status.charging i,
    .detail-status.ready i {
        background: #00a83b;
        box-shadow: 0 0 0 5px rgba(0,168,59,.1);
    }

    .live-badge.charging i {
        animation: pingDot 1.2s infinite;
    }

    .live-badge.waiting {
        color: #9a6500;
        border-color: #f1dfb5;
        background: #fffaf0;
    }

    .live-badge.waiting i {
        background: #e8a500;
    }

    .card-actions {
        position: absolute;
        top: 13px;
        right: 13px;
        display: flex;
        gap: 7px;
        z-index: 4;
    }

    .card-actions button {
        width: 35px;
        height: 35px;
        border: 1px solid #dce5ec;
        border-radius: 10px;
        background: rgba(255,255,255,.93);
        color: #5d7389;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: .2s ease;
    }

    .card-actions button:hover {
        color: #00a83b;
        border-color: #a9d8ba;
        transform: translateY(-2px);
    }

    .card-actions .delete-action:hover {
        color: #d53d3d;
        border-color: #f1bcbc;
        background: #fff7f7;
    }

    .card-content {
        padding: 20px;
    }

    .vehicle-title-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
    }

    .vehicle-label {
        color: #00a83b;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .1em;
        text-transform: uppercase;
    }

    .brand-label {
        display: flex;
        align-items: center;
        gap: 7px;
    }

    .brand-label img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        filter: grayscale(1);
        opacity: .8;
    }

    .vehicle-title-row h3 {
        margin: 4px 0 0;
        font-size: 22px;
        line-height: 1.1;
        letter-spacing: -.035em;
    }

    .vehicle-index {
        color: #bdc8d2;
        font-size: 12px;
        font-weight: 800;
    }

    .registration {
        margin-top: 15px;
        padding: 10px 12px;
        border-radius: 11px;
        background: #f7f9fb;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
    }

    .registration span {
        color: #8a9caf;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
    }

    .registration strong {
        font-size: 12px;
        letter-spacing: .08em;
    }

    .spec-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
    }

    .spec {
        display: flex;
        gap: 9px;
        align-items: center;
        min-width: 0;
        padding: 10px;
        border: 1px solid #edf1f4;
        border-radius: 12px;
    }

    .spec-icon {
        width: 31px;
        height: 31px;
        border-radius: 9px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        color: #00a83b;
        background: #effff5;
    }

    .spec span,
    .spec strong {
        display: block;
    }

    .spec span {
        color: #8a9caf;
        font-size: 9px;
    }

    .spec strong {
        margin-top: 2px;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-footer {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        padding-top: 15px;
        border-top: 1px solid #edf1f4;
    }

    .details-button,
    .charge-link {
        border: none;
        background: transparent;
        color: #06243d;
        text-decoration: none;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
    }

    .details-button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #00a83b;
    }

    .charge-link {
        margin-left: auto;
        color: #71879e;
    }

    .charge-link:hover {
        color: #00a83b;
    }

    .bottom-feature {
        margin-top: 42px;
        padding: 22px;
        border-radius: 21px;
        border: 1px solid #dce8e1;
        background: linear-gradient(110deg, #f5fff8, white);
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 17px;
        align-items: center;
    }

    .feature-icon-wrap {
        width: 50px;
        height: 50px;
        border-radius: 15px;
        display: grid;
        place-items: center;
        color: #00a83b;
        background: #eafff1;
        animation: softPulse 3s infinite;
    }

    .bottom-feature span {
        color: #00a83b;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: .12em;
    }

    .bottom-feature h3 {
        margin: 4px 0;
        font-size: 16px;
    }

    .bottom-feature p {
        margin: 0;
        color: #71879e;
        font-size: 12px;
        line-height: 1.5;
    }

    .bottom-feature > a {
        color: #00a83b;
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 7px;
        text-decoration: none;
    }

    .empty-garage {
        min-height: 480px;
        padding: 50px 20px;
        border: 1px dashed #cbd9e2;
        border-radius: 26px;
        background: rgba(255,255,255,.76);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .empty-visual {
        position: relative;
        width: 160px;
        height: 145px;
        display: grid;
        place-items: center;
        margin-bottom: 20px;
    }

    .empty-car {
        width: 86px;
        height: 86px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #00a83b;
        background: #effff5;
        border: 1px solid #c9efd7;
        position: relative;
        z-index: 3;
        animation: float 3s ease-in-out infinite;
    }

    .empty-ring {
        position: absolute;
        border: 1px solid #ccebd7;
        border-radius: 50%;
        animation: expandRing 3s ease-out infinite;
    }

    .ring-one { width: 112px; height: 112px; }
    .ring-two { width: 150px; height: 150px; animation-delay: 1.1s; }

    .floating-bolt {
        position: absolute;
        color: #00a83b;
        font-size: 18px;
        animation: floatBolt 3.5s ease-in-out infinite;
    }

    .bolt-a { top: 8px; left: 20px; }
    .bolt-b { bottom: 4px; right: 15px; animation-delay: 1.4s; }

    .empty-garage h2 {
        margin: 8px 0 7px;
        font-size: 28px;
        letter-spacing: -.035em;
    }

    .empty-garage > p {
        max-width: 540px;
        margin: 0 auto 22px;
        color: #71879e;
        font-size: 14px;
        line-height: 1.7;
    }

    .add-button.large {
        min-height: 52px;
        padding: 0 22px;
    }

    .field-error {
        border-color: #d53d3d !important;
        box-shadow: 0 0 0 3px rgba(213,61,61,.08);
    }

    .field-error:focus {
        border-color: #d53d3d !important;
        box-shadow: 0 0 0 3px rgba(213,61,61,.12);
    }

    .field-error-message {
        display: block;
        margin-top: 7px;
        color: #c63b3b;
        font-size: 12px;
        font-weight: 650;
        line-height: 1.4;
    }

    .error-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        margin: -12px 0 22px;
        border: 1px solid #ffd0d0;
        border-radius: 13px;
        background: #fff6f6;
        color: #c63b3b;
        font-size: 13px;
    }

    .error-banner > span {
        width: 23px;
        height: 23px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #ffe3e3;
        font-weight: 800;
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        padding: 20px;
        background: rgba(3,18,29,.5);
        backdrop-filter: blur(7px);
        display: grid;
        place-items: center;
        animation: fadeIn .22s ease;
    }

    .vehicle-detail-modal,
    .form-modal {
        width: min(720px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 25px;
        border: 1px solid rgba(255,255,255,.7);
        background: white;
        box-shadow: 0 30px 90px rgba(0,0,0,.28);
        animation: modalIn .38s cubic-bezier(.2,.8,.2,1);
        position: relative;
    }

    .modal-close {
        width: 39px;
        height: 39px;
        border: 1px solid #dfe7ed;
        border-radius: 11px;
        background: white;
        color: #71879e;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: .2s ease;
    }

    .modal-close:hover {
        color: #00a83b;
        border-color: #b9dfc6;
        transform: rotate(4deg);
    }

    .vehicle-detail-modal > .modal-close {
        position: absolute;
        right: 19px;
        top: 19px;
        z-index: 5;
    }

    .detail-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        min-height: 300px;
        background: #f7faf8;
    }

    .detail-image {
        position: relative;
        height: 260px;
        display: grid;
        place-items: center;
    }


    .detail-vehicle-image {
        width: 98%;
        height: 235px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        animation: detailCarIn .7s cubic-bezier(.2,.8,.2,1);
    }

    .detail-hero > div:last-child {
        padding: 35px 50px 35px 15px;
    }

    .detail-hero h2 {
        margin: 8px 0 5px;
        font-size: 32px;
        line-height: 1.05;
        letter-spacing: -.045em;
    }

    .detail-hero p {
        margin: 0;
        color: #71879e;
    }

    .detail-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 18px;
        padding: 9px 12px;
        border-radius: 999px;
        background: #f1f5f7;
        color: #71879e;
        font-size: 11px;
        font-weight: 800;
    }

    .detail-status.charging,
    .detail-status.ready {
        color: #008f34;
        background: #eafff1;
    }

    .detail-status.waiting {
        color: #956300;
        background: #fff6df;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 9px;
        padding: 25px;
    }

    .detail-grid > div {
        padding: 15px;
        border: 1px solid #e7edf1;
        border-radius: 14px;
        background: #fafbfc;
    }

    .detail-grid span,
    .detail-grid strong {
        display: block;
    }

    .detail-grid span {
        color: #899bad;
        font-size: 10px;
    }

    .detail-grid strong {
        margin-top: 7px;
        font-size: 14px;
    }

    .detail-actions {
        display: flex;
        gap: 10px;
        padding: 0 25px 25px;
    }

    .outline-button {
        border: 1px solid #d9e3ea;
        background: white;
        color: #06243d;
    }

    .outline-button:hover {
        border-color: #a8d5b7;
        color: #00a83b;
        transform: translateY(-2px);
    }

    .form-modal {
        padding: 28px;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 25px;
    }

    .form-header h2 {
        margin: 7px 0 4px;
        font-size: 30px;
        letter-spacing: -.04em;
    }

    .form-header p {
        margin: 0;
        color: #71879e;
        font-size: 13px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 17px;
    }

    .form-grid label {
        color: #526b82;
        font-size: 11px;
        font-weight: 800;
    }

    .form-grid label.full {
        grid-column: 1 / -1;
    }

    .catalogue-select {
        position: relative;
        margin-top: 7px;
    }

    .catalogue-select-trigger {
        width: 100%;
        height: 52px;
        border: 1px solid #dce5ec;
        border-radius: 14px;
        outline: none;
        padding: 0 15px;
        background: rgba(255,255,255,.96);
        color: #06243d;
        font-size: 14px;
        font-weight: 650;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(6,36,61,.025);
        transition: border-color .2s ease, box-shadow .2s ease, background .2s ease, transform .2s ease;
    }

    .catalogue-select-trigger:hover:not(:disabled) {
        border-color: #b9d6c4;
        background: #fbfffc;
    }

    .catalogue-select-trigger:focus-visible,
    .catalogue-select.is-open .catalogue-select-trigger {
        border-color: #00a83b;
        box-shadow: 0 0 0 4px rgba(0,168,59,.08), 0 8px 22px rgba(6,36,61,.055);
    }

    .catalogue-select-trigger.placeholder {
        color: #93a2b0;
        font-weight: 550;
    }

    .catalogue-select-trigger:disabled {
        opacity: .58;
        cursor: not-allowed;
        background: #f5f7f9;
    }

    .catalogue-select-chevron {
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        border-radius: 9px;
        display: grid;
        place-items: center;
        color: #7890a4;
        background: #f2f6f8;
        transition: transform .22s ease, color .2s ease, background .2s ease;
    }

    .catalogue-select-chevron svg {
        width: 16px;
        height: 16px;
    }

    .catalogue-select.is-open .catalogue-select-chevron {
        transform: rotate(180deg);
        color: #00a83b;
        background: #eafff1;
    }

    .catalogue-select-menu {
        position: absolute;
        z-index: 30;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        max-height: 255px;
        overflow-y: auto;
        padding: 7px;
        border: 1px solid #dce8e1;
        border-radius: 16px;
        background: rgba(255,255,255,.98);
        box-shadow: 0 18px 45px rgba(6,36,61,.15), 0 3px 10px rgba(6,36,61,.05);
        backdrop-filter: blur(14px);
        animation: dropdownIn .18s cubic-bezier(.2,.8,.2,1);
    }

    .catalogue-select-menu::-webkit-scrollbar {
        width: 7px;
    }

    .catalogue-select-menu::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: #d7e2e8;
    }

    .catalogue-select-option {
        width: 100%;
        min-height: 43px;
        padding: 0 11px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: #526b82;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        font-size: 13px;
        font-weight: 650;
        cursor: pointer;
        transition: background .16s ease, color .16s ease, transform .16s ease;
    }

    .catalogue-select-option:hover {
        background: #f0fff5;
        color: #007f30;
        transform: translateX(2px);
    }

    .catalogue-select-option.selected {
        background: #eafff1;
        color: #008f34;
    }

    .catalogue-select-check {
        width: 23px;
        height: 23px;
        flex-shrink: 0;
        border-radius: 7px;
        display: grid;
        place-items: center;
        background: #00a83b;
        color: white;
        font-size: 12px;
        font-weight: 900;
    }

    .catalogue-select-empty {
        padding: 18px 12px;
        text-align: center;
        color: #8a9caf;
        font-size: 12px;
    }

    .form-grid input,
    .form-grid select {
        width: 100%;
        height: 50px;
        margin-top: 7px;
        border: 1px solid #dce5ec;
        border-radius: 12px;
        outline: none;
        padding: 0 14px;
        background: white;
        color: #06243d;
        font-size: 14px;
        transition: .2s ease;
    }

    .form-grid input:focus,
    .form-grid select:focus {
        border-color: #00a83b;
        box-shadow: 0 0 0 4px rgba(0,168,59,.08);
    }

    .unit-input {
        position: relative;
    }

    .unit-input input {
        padding-right: 55px;
    }

    .unit-input span {
        position: absolute;
        right: 15px;
        top: 23px;
        color: #91a2b2;
        font-size: 11px;
        font-weight: 700;
    }

    .form-tip {
        display: flex;
        gap: 11px;
        margin-top: 20px;
        padding: 14px;
        border: 1px solid #d7efdf;
        border-radius: 14px;
        background: #f4fff7;
    }

    .form-tip > div {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        color: #00a83b;
        border-radius: 9px;
        background: #e3faeb;
    }

    .form-tip p {
        margin: 0;
        color: #71879e;
        font-size: 11px;
        line-height: 1.55;
    }

    .form-tip strong {
        color: #06243d;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 23px;
    }

    .skeleton {
        background: linear-gradient(90deg, #e9eef2 25%, #f5f7f8 50%, #e9eef2 75%);
        background-size: 200% 100%;
        animation: skeleton 1.3s infinite;
        border-radius: 9px;
    }

    .eyebrow-skeleton { width: 120px; height: 13px; }
    .title-skeleton { width: min(500px, 70%); height: 55px; margin-top: 13px; }
    .copy-skeleton { width: 460px; max-width: 80%; height: 18px; margin-top: 12px; }
    .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
        margin-top: 48px;
    }
    .vehicle-skeleton {
        height: 480px;
        padding: 18px;
        background: white;
        border: 1px solid #e5ebef;
        border-radius: 23px;
    }
    .image-skeleton { height: 200px; border-radius: 16px; }
    .line-skeleton { width: 70%; height: 22px; margin-top: 24px; }
    .short-skeleton { width: 45%; height: 13px; margin-top: 10px; }
    .boxes-skeleton { width: 100%; height: 125px; margin-top: 22px; }

    .reveal {
        animation: revealUp .7s cubic-bezier(.2,.8,.2,1) both;
    }

    .reveal-card {
        animation: cardIn .65s cubic-bezier(.2,.8,.2,1) both;
    }

    @keyframes revealUp {
        from { opacity: 0; transform: translateY(22px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes cardIn {
        from { opacity: 0; transform: translateY(28px) scale(.975); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes modalIn {
        from { opacity: 0; transform: translateY(20px) scale(.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes detailCarIn {
        from { opacity: 0; transform: translateX(-25px) scale(.94); }
        to { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes float {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
    }

    @keyframes floatBolt {
        0%,100% { transform: translateY(0) rotate(-5deg); opacity: .55; }
        50% { transform: translateY(-8px) rotate(8deg); opacity: 1; }
    }

    @keyframes breathe {
        0%,100% { transform: scale(.94); opacity: .55; }
        50% { transform: scale(1.08); opacity: .95; }
    }

    @keyframes softPulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(0,168,59,0); }
        50% { box-shadow: 0 0 0 8px rgba(0,168,59,.06); }
    }

    @keyframes pingDot {
        0% { box-shadow: 0 0 0 0 rgba(0,168,59,.35); }
        70% { box-shadow: 0 0 0 7px rgba(0,168,59,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,168,59,0); }
    }

    @keyframes expandRing {
        0% { opacity: .65; transform: scale(.75); }
        100% { opacity: 0; transform: scale(1.2); }
    }

    @keyframes drift {
        from { transform: translate3d(0,0,0); }
        to { transform: translate3d(20px,-15px,0); }
    }

    @keyframes dropdownIn {
        from { opacity: 0; transform: translateY(-5px) scale(.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes skeleton {
        to { background-position: -200% 0; }
    }

    @media (max-width: 1050px) {
        .vehicle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .garage-overview { grid-template-columns: 1fr; }
    }

    @media (max-width: 760px) {
        .vehicles-page { padding: 28px 18px 50px; }
        .vehicles-header,
        .section-heading {
            align-items: flex-start;
            flex-direction: column;
        }
        .header-actions { width: 100%; }
        .header-actions > * { flex: 1; }
        .section-heading > p { text-align: left; }
        .vehicle-grid { grid-template-columns: 1fr; }
        .overview-stats { grid-template-columns: 1fr 1fr; }
        .bottom-feature { grid-template-columns: auto 1fr; }
        .bottom-feature > a { grid-column: 2; }
        .detail-hero { grid-template-columns: 1fr; }
        .detail-hero > div:last-child { padding: 10px 25px 30px; }
        .detail-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 520px) {
        .vehicles-header h1 { font-size: 42px; }
        .garage-overview { padding: 18px; }
        .overview-main { align-items: flex-start; }
        .overview-stats { grid-template-columns: 1fr 1fr; }
        .form-modal { padding: 20px; }
        .form-grid { grid-template-columns: 1fr; }
        .form-grid label.full { grid-column: auto; }
        .form-actions { flex-direction: column-reverse; }
        .form-actions > * { width: 100%; }
        .detail-grid { grid-template-columns: 1fr; }
        .detail-actions { flex-direction: column; }
        .detail-actions > * { width: 100%; }
        .card-image { height: 200px; }
    }

    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
        }
    }
`;

export default MyVehicles;

// FINAL DELETE RESPONSE FIX: empty/non-JSON DELETE responses are handled safely in apiRequest().
