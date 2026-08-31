import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "leccy_settings";

const DEFAULT_SETTINGS = {
    notifications: true,
    bookingNotifications: true,
    chargingNotifications: true,
    locationAccess: true,
    autoDetectLocation: true,
    smartRecommendations: true,
    showUnavailableStations: false,
    darkMode: false,
};

const Settings = () => {
    const navigate = useNavigate();

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const [notificationStatus, setNotificationStatus] = useState("");

    // ---------------------------------------------------------
    // Load saved settings
    // ---------------------------------------------------------

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored) {
                const parsed = JSON.parse(stored);

                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                });
            }
        } catch (error) {
            console.error("Failed to load Leccy settings:", error);
        }
    }, []);

    // ---------------------------------------------------------
    // Apply dark mode immediately
    // ---------------------------------------------------------

    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            settings.darkMode
        );

        document.documentElement.dataset.theme = settings.darkMode
            ? "dark"
            : "light";
    }, [settings.darkMode]);

    // ---------------------------------------------------------
    // Update setting
    // ---------------------------------------------------------

    const updateSetting = async (key, value) => {
        // Main notifications switch
        if (key === "notifications" && value === true) {
            const permissionGranted = await requestNotificationPermission();

            if (!permissionGranted) {
                return;
            }
        }

        // Turning off notifications also disables the
        // individual notification categories.
        if (key === "notifications" && value === false) {
            setSettings((previous) => ({
                ...previous,
                notifications: false,
            }));

            setSaved(false);
            return;
        }

        // Individual notification settings cannot be enabled
        // while the main notification setting is disabled.
        if (
            (key === "bookingNotifications" ||
                key === "chargingNotifications") &&
            value === true &&
            !settings.notifications
        ) {
            setSettings((previous) => ({
                ...previous,
                notifications: true,
                [key]: true,
            }));

            const permissionGranted = await requestNotificationPermission();

            if (!permissionGranted) {
                setSettings((previous) => ({
                    ...previous,
                    notifications: false,
                    [key]: false,
                }));

                return;
            }

            setSaved(false);
            return;
        }

        // Location access
        if (key === "locationAccess" && value === true) {
            const granted = await requestLocationPermission();

            if (!granted) {
                return;
            }
        }

        // Auto-detect requires location access.
        if (key === "autoDetectLocation" && value === true) {
            if (!settings.locationAccess) {
                const granted = await requestLocationPermission();

                if (!granted) {
                    return;
                }

                setSettings((previous) => ({
                    ...previous,
                    locationAccess: true,
                    autoDetectLocation: true,
                }));

                setSaved(false);
                return;
            }

            const granted = await requestLocationPermission();

            if (!granted) {
                return;
            }
        }

        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));

        setSaved(false);
    };

    // ---------------------------------------------------------
    // Browser notification permission
    // ---------------------------------------------------------

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            setNotificationStatus(
                "Browser notifications are not supported."
            );

            return false;
        }

        if (Notification.permission === "granted") {
            setNotificationStatus("Notifications are enabled.");
            return true;
        }

        if (Notification.permission === "denied") {
            setNotificationStatus(
                "Notifications are blocked in your browser settings."
            );

            return false;
        }

        try {
            const permission = await Notification.requestPermission();

            if (permission === "granted") {
                setNotificationStatus("Notifications are enabled.");
                return true;
            }

            setNotificationStatus(
                "Notification permission was not granted."
            );

            return false;
        } catch (error) {
            console.error(
                "Notification permission request failed:",
                error
            );

            setNotificationStatus(
                "Could not enable browser notifications."
            );

            return false;
        }
    };

    // ---------------------------------------------------------
    // Browser location permission
    // ---------------------------------------------------------

    const requestLocationPermission = () => {
        return new Promise((resolve) => {
            if (!("geolocation" in navigator)) {
                setLocationStatus(
                    "Location services are not supported by this browser."
                );

                resolve(false);
                return;
            }

            setLocationStatus("Requesting your location...");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log(
                        "Leccy location:",
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    setLocationStatus(
                        "Location access is enabled."
                    );

                    resolve(true);
                },
                (error) => {
                    console.error(
                        "Location permission failed:",
                        error
                    );

                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationStatus(
                            "Location permission was denied."
                        );
                    } else {
                        setLocationStatus(
                            "Could not access your location."
                        );
                    }

                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    };

    // ---------------------------------------------------------
    // Save settings
    // ---------------------------------------------------------

    const saveSettings = () => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );

            // Tell other open Leccy components/tabs that settings
            // have changed.
            window.dispatchEvent(
                new CustomEvent("leccy-settings-changed", {
                    detail: settings,
                })
            );

            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 2500);
        } catch (error) {
            console.error("Failed to save Leccy settings:", error);
        }
    };

    // ---------------------------------------------------------
    // Reset
    // ---------------------------------------------------------

    const resetSettings = () => {
        const confirmed = window.confirm(
            "Reset all Leccy settings to default?"
        );

        if (!confirmed) return;

        setSettings(DEFAULT_SETTINGS);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_SETTINGS)
        );

        window.dispatchEvent(
            new CustomEvent("leccy-settings-changed", {
                detail: DEFAULT_SETTINGS,
            })
        );

        setLocationStatus("");
        setNotificationStatus("");

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    };

    // ---------------------------------------------------------
    // Logout
    // ---------------------------------------------------------

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");

        window.location.replace("/login");
    };

    // ---------------------------------------------------------
    // Toggle
    // ---------------------------------------------------------

    const Toggle = ({ checked, onChange }) => {
        return (
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                    checked ? "bg-green-600" : "bg-gray-300"
                }`}
                aria-pressed={checked}
            >
                <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        checked
                            ? "translate-x-6"
                            : "translate-x-1"
                    }`}
                />
            </button>
        );
    };

    // ---------------------------------------------------------
    // Setting row
    // ---------------------------------------------------------

    const SettingRow = ({
        title,
        description,
        checked,
        onChange,
        disabled = false,
    }) => {
        return (
            <div className="flex items-center justify-between gap-6 border-b border-gray-100 px-6 py-5 last:border-b-0 sm:px-7">
                <div>
                    <h3 className="text-[15px] font-semibold text-[#071A2D]">
                        {title}
                    </h3>

                    <p className="mt-1 max-w-xl text-sm leading-5 text-gray-500">
                        {description}
                    </p>
                </div>

                <div className={disabled ? "opacity-50" : ""}>
                    <Toggle
                        checked={checked}
                        onChange={disabled ? () => {} : onChange}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-full px-6 py-8 lg:px-14">
            <div>
                <p className="text-sm font-medium text-green-600">
                    Preferences
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#071A2D]">
                    Settings
                </h1>

                <p className="mt-2 max-w-2xl text-gray-500">
                    Manage your Leccy preferences, notifications and
                    charging experience.
                </p>
            </div>

            {/* Saved message */}
            {saved && (
                <div className="mt-5 max-w-4xl rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✓ Settings saved successfully.
                </div>
            )}

            {/* Notification status */}
            {notificationStatus && (
                <div className="mt-3 max-w-4xl rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                    {notificationStatus}
                </div>
            )}

            {/* Location status */}
            {locationStatus && (
                <div className="mt-3 max-w-4xl rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                    {locationStatus}
                </div>
            )}

            {/* Notifications */}
            <section className="mt-8 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-[#071A2D]">
                        Notifications
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Choose when Leccy should notify you.
                    </p>
                </div>

                <SettingRow
                    title="Notifications"
                    description="Enable browser notifications from Leccy."
                    checked={settings.notifications}
                    onChange={(value) =>
                        updateSetting("notifications", value)
                    }
                />

                <SettingRow
                    title="Booking updates"
                    description="Get notified when your booking status changes."
                    checked={settings.bookingNotifications}
                    disabled={!settings.notifications}
                    onChange={(value) =>
                        updateSetting(
                            "bookingNotifications",
                            value
                        )
                    }
                />

                <SettingRow
                    title="Charging updates"
                    description="Receive updates when your charging session starts, progresses or completes."
                    checked={settings.chargingNotifications}
                    disabled={!settings.notifications}
                    onChange={(value) =>
                        updateSetting(
                            "chargingNotifications",
                            value
                        )
                    }
                />
            </section>

            {/* Location */}
            <section className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-[#071A2D]">
                        Location
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Control how Leccy uses your location.
                    </p>
                </div>

                <SettingRow
                    title="Location access"
                    description="Allow Leccy to use your current location to find nearby charging stations."
                    checked={settings.locationAccess}
                    onChange={(value) =>
                        updateSetting("locationAccess", value)
                    }
                />

                <SettingRow
                    title="Automatically detect location"
                    description="Use your current location automatically when Find Charger opens."
                    checked={settings.autoDetectLocation}
                    disabled={!settings.locationAccess}
                    onChange={(value) =>
                        updateSetting(
                            "autoDetectLocation",
                            value
                        )
                    }
                />
            </section>

            {/* Charging */}
            <section className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-[#071A2D]">
                        Charging Preferences
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Customize how Leccy recommends charging stations.
                    </p>
                </div>

                <SettingRow
                    title="Smart recommendations"
                    description="Let Leccy's recommendation engine consider distance, waiting time, charging speed and price."
                    checked={settings.smartRecommendations}
                    onChange={(value) =>
                        updateSetting(
                            "smartRecommendations",
                            value
                        )
                    }
                />

                <SettingRow
                    title="Show unavailable stations"
                    description="Display stations that currently have no available chargers."
                    checked={settings.showUnavailableStations}
                    onChange={(value) =>
                        updateSetting(
                            "showUnavailableStations",
                            value
                        )
                    }
                />
            </section>

            {/* Appearance */}
            <section className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-[#071A2D]">
                        Appearance
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Control the appearance of Leccy.
                    </p>
                </div>

                <SettingRow
                    title="Dark mode"
                    description="Enable the dark theme class so your application's dark-mode styles can take effect."
                    checked={settings.darkMode}
                    onChange={(value) =>
                        updateSetting("darkMode", value)
                    }
                />
            </section>

            {/* Account */}
            <section className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                    <h2 className="text-lg font-bold text-[#071A2D]">
                        Account
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your Leccy account.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 px-6 py-6 sm:px-7">
                    <button
                        type="button"
                        onClick={() => navigate("/home/profile")}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#071A2D] transition hover:bg-gray-50"
                    >
                        Edit Profile
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            </section>

            {/* Bottom actions */}
            <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-between gap-4 pb-8">
                <button
                    type="button"
                    onClick={resetSettings}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                    Reset to defaults
                </button>

                <button
                    type="button"
                    onClick={saveSettings}
                    className="rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
