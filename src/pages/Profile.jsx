import React, { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/users/me`;

const getToken = () => {
    return localStorage.getItem("token");
};

const apiFetch = async (url, options = {}) => {

    const token = getToken();

    if (!token) {
        throw new Error(
            "Your session has expired. Please log in again."
        );
    }

    const response = await fetch(url, {
        ...options,

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {

        let message = `Request failed (${response.status})`;

        try {
            const data = await response.json();

            message =
                data?.message ||
                data?.error ||
                message;

        } catch {
            // Backend may return an empty response
        }

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            message =
                "Authentication failed. Please log in again.";
        }

        throw new Error(message);
    }

    return response.json();
};


const Profile = () => {

    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const fetchProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await apiFetch(API_URL);

            console.log(
                "Profile:",
                data
            );

            setProfile(data);

            setFormData({
                name: data.name || "",
                phone: data.phone || "",
            });

            /*
             * Keep localStorage user information
             * synchronized with backend.
             */

            const storedUser =
                JSON.parse(
                    localStorage.getItem("user") || "{}"
                );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    userId: data.id,
                    fullName: data.name,
                    email: data.email,
                    role: data.role,
                })
            );

        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            setError(
                error.message ||
                "Unable to load your profile."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchProfile();

    }, []);


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const updatedProfile =
                await apiFetch(
                    API_URL,
                    {
                        method: "PUT",

                        body: JSON.stringify({
                            name:
                                formData.name.trim(),

                            phone:
                                formData.phone.trim(),
                        }),
                    }
                );

            setProfile(
                updatedProfile
            );

            setFormData({
                name:
                    updatedProfile.name || "",

                phone:
                    updatedProfile.phone || "",
            });


            /*
             * Keep sidebar/header user data
             * synchronized.
             */

            const storedUser =
                JSON.parse(
                    localStorage.getItem("user") || "{}"
                );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    userId:
                        updatedProfile.id,

                    fullName:
                        updatedProfile.name,

                    email:
                        updatedProfile.email,

                    role:
                        updatedProfile.role,
                })
            );


            setSuccess(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            setError(
                error.message ||
                "Unable to update your profile."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="px-6 py-8 lg:px-14">

                <div className="animate-pulse">

                    <div className="h-8 w-40 rounded bg-gray-200" />

                    <div className="mt-3 h-4 w-72 rounded bg-gray-200" />

                    <div className="mt-8 h-[520px] rounded-2xl bg-gray-200" />

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="px-6 py-8 lg:px-14">

            {/* HEADER */}

            <div>

                <p className="text-sm font-medium text-green-600">
                    Account
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#071A2D]">
                    Profile
                </h1>

                <p className="mt-2 max-w-xl text-gray-500">
                    Manage your personal information
                    and Leccy account details.
                </p>

            </div>


            {/* ERROR */}

            {error && (

                <div className="
                    mt-6
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-600
                ">
                    {error}
                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div className="
                    mt-6
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    px-4
                    py-3
                    text-sm
                    text-green-700
                ">
                    {success}
                </div>

            )}


            {/* PROFILE CARD */}

            <div className="
                mt-8
                max-w-3xl
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-sm
            ">

                {/* PROFILE HEADER */}

                <div className="
                    border-b
                    border-gray-100
                    px-6
                    py-6
                    sm:px-8
                ">

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        {/* Avatar */}

                        <div className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-green-50
                            text-2xl
                            font-bold
                            text-green-600
                        ">
                            {(
                                profile?.name ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>


                        <div>

                            <h2 className="
                                text-xl
                                font-bold
                                text-[#071A2D]
                            ">
                                {profile?.name || "User"}
                            </h2>

                            <p className="
                                mt-1
                                text-sm
                                text-gray-500
                            ">
                                {profile?.email}
                            </p>

                        </div>

                    </div>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-6 sm:px-8"
                >

                    <div className="
                        grid
                        gap-6
                        sm:grid-cols-2
                    ">

                        {/* NAME */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            ">
                                Full Name
                            </label>

                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    px-4
                                    py-3
                                    text-gray-900
                                    outline-none
                                    transition
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-500/20
                                "
                            />

                        </div>


                        {/* PHONE */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            ">
                                Phone Number
                            </label>

                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                maxLength={10}
                                placeholder="9876543210"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    px-4
                                    py-3
                                    text-gray-900
                                    outline-none
                                    transition
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-500/20
                                "
                            />

                        </div>


                        {/* EMAIL */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            ">
                                Email
                            </label>

                            <input
                                type="email"
                                value={
                                    profile?.email || ""
                                }
                                disabled
                                className="
                                    w-full
                                    cursor-not-allowed
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    px-4
                                    py-3
                                    text-gray-500
                                "
                            />

                            <p className="
                                mt-1.5
                                text-xs
                                text-gray-400
                            ">
                                Email cannot be changed.
                            </p>

                        </div>


                        {/* ROLE */}

                        <div>

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-700
                            ">
                                Account Type
                            </label>

                            <div className="
                                flex
                                h-[50px]
                                items-center
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                px-4
                                text-sm
                                font-semibold
                                text-[#071A2D]
                            ">
                                {profile?.role || "USER"}
                            </div>

                        </div>

                    </div>


                    {/* ACCOUNT CREATED */}

                    {profile?.createdAt && (

                        <div className="
                            mt-6
                            rounded-xl
                            bg-gray-50
                            px-4
                            py-3
                        ">

                            <p className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wide
                                text-gray-400
                            ">
                                Account Created
                            </p>

                            <p className="
                                mt-1
                                text-sm
                                font-medium
                                text-[#071A2D]
                            ">
                                {new Date(
                                    profile.createdAt
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </p>

                        </div>

                    )}


                    {/* SAVE */}

                    <div className="
                        mt-8
                        flex
                        justify-end
                    ">

                        <button
                            type="submit"
                            disabled={saving}
                            className="
                                rounded-xl
                                bg-green-600
                                px-6
                                py-3
                                font-semibold
                                text-white
                                transition
                                hover:bg-green-700
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default Profile;