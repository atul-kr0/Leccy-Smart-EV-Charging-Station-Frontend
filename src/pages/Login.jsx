import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/logo-dark.svg";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove old error as user starts typing again
        if (error) {
            setError("");
        }
    };

    // =========================================================
    // LOGIN
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        // Basic frontend validation
        if (!formData.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!formData.password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password,
                    }),
                }
            );

            // Backend may return JSON or an empty response
            const data = await response.json().catch(() => null);

            console.log("Login response:", data);

            // =================================================
            // LOGIN FAILED
            // =================================================

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    data?.errors ||
                    `Login failed (${response.status}).`
                );
            }

            // =================================================
            // LOGIN SUCCESS
            // =================================================

            if (!data?.token) {
                throw new Error(
                    "Login succeeded, but the server did not return an authentication token."
                );
            }

            /*
             * Your LoginResponseDTO:
             *
             * private String token;
             * private String type;
             * private Long userId;
             * private String fullName;
             * private String email;
             * private Role role;
             */

            // JWT used by authenticated API calls
            localStorage.setItem(
                "token",
                data.token
            );

            // Store useful user information
            localStorage.setItem(
                "user",
                JSON.stringify({
                    userId: data.userId,
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role,
                    type: data.type,
                })
            );

            console.log("Login successful.");

            // =================================================
            // GO TO DASHBOARD
            // =================================================

            navigate("/home");

        } catch (err) {

            console.error(
                "Login failed:",
                err
            );

            setError(
                err.message ||
                "Unable to login. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020605]">

            {/* =================================================
                ANIMATIONS
            ================================================= */}

            <style>{`

                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(25px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-35px);
                    }

                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-12px);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: .25;
                    }

                    50% {
                        transform: scale(1.25);
                        opacity: .8;
                    }
                }

                @keyframes energyMove {
                    0% {
                        transform: translateX(-120%);
                    }

                    100% {
                        transform: translateX(350%);
                    }
                }

                @keyframes glow {
                    0%, 100% {
                        opacity: .25;
                    }

                    50% {
                        opacity: .65;
                    }
                }

                @keyframes blink {
                    0%, 100% {
                        opacity: .35;
                    }

                    50% {
                        opacity: 1;
                    }
                }

                .login-fade-up {
                    animation: fadeUp .75s ease-out both;
                }

                .login-fade-left {
                    animation: fadeLeft .8s ease-out both;
                }

                .login-float {
                    animation: float 4s ease-in-out infinite;
                }

                .login-pulse {
                    animation: pulse 2.8s ease-in-out infinite;
                }

                .login-energy {
                    animation: energyMove 3s linear infinite;
                }

                .login-glow {
                    animation: glow 3s ease-in-out infinite;
                }

                .login-blink {
                    animation: blink 2s ease-in-out infinite;
                }

                .login-input {
                    transition:
                        border-color .25s ease,
                        background-color .25s ease,
                        box-shadow .25s ease,
                        transform .25s ease;
                }

                .login-input:focus {
                    outline: none;
                    border-color: rgba(0, 200, 83, .65);
                    background-color: rgba(7, 25, 15, .9);

                    box-shadow:
                        0 0 0 4px rgba(0, 200, 83, .07),
                        0 0 25px rgba(0, 200, 83, .05);

                    transform: translateY(-1px);
                }

                .login-button {
                    transition:
                        transform .25s ease,
                        box-shadow .25s ease,
                        background-color .25s ease;
                }

                .login-button:hover:not(:disabled) {
                    transform: translateY(-2px);

                    box-shadow:
                        0 15px 35px rgba(0, 200, 83, .22);
                }

                .login-button:active:not(:disabled) {
                    transform: translateY(0);
                }

            `}</style>


            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="pointer-events-none absolute inset-0">

                {/* Grid */}

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                rgba(255,255,255,.6) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                90deg,
                                rgba(255,255,255,.6) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize: "55px 55px",
                    }}
                />

                {/* Green glow */}

                <div
                    className="absolute -left-[300px] top-[100px] h-[650px] w-[650px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,200,83,.14), transparent 68%)",
                        filter: "blur(55px)",
                    }}
                />

                <div
                    className="login-glow absolute -right-[300px] bottom-[-200px] h-[650px] w-[650px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,170,70,.13), transparent 68%)",
                        filter: "blur(55px)",
                    }}
                />

            </div>


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="relative z-20 flex h-[82px] items-center justify-between border-b border-white/[0.06] px-6 sm:px-10 lg:px-16">

                <Link
                    to="/landing"
                    className="transition duration-300 hover:opacity-80"
                >
                    <img
                        src={logo}
                        alt="Leccy"
                        className="w-[125px] sm:w-[140px]"
                    />
                </Link>

                <Link
                    to="/landing"
                    className="
                        group
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        duration-300
                        hover:text-white
                    "
                >
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">
                        ←
                    </span>

                    Back to Home
                </Link>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="relative z-10 mx-auto grid max-w-[1250px] items-center gap-16 px-6 py-12 sm:py-16 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[1fr_460px] lg:px-10 lg:py-12">


                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <section className="login-fade-left hidden lg:block">

                    <div className="max-w-[560px]">

                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.04] px-5 py-2.5">

                            <span className="text-green-400">
                                ⚡
                            </span>

                            <span className="text-sm font-semibold tracking-wide text-green-400">
                                WELCOME BACK, DRIVER
                            </span>

                        </div>


                        <h1 className="text-[64px] font-extrabold leading-[.98] tracking-[-3px] text-white">

                            Charge smarter.

                            <span className="block text-green-500">
                                Every time.
                            </span>

                        </h1>


                        <p className="mt-7 max-w-[480px] text-lg leading-8 text-gray-400">
                            Your charging journey is waiting.
                            Find stations, manage bookings, and
                            keep your EV moving with Leccy.
                        </p>


                        {/* Charging visual */}

                        <div className="relative mt-12 h-[220px] overflow-hidden rounded-[30px] border border-green-500/[0.12] bg-[#06100a]/80">

                            <div className="absolute inset-0 opacity-30">

                                <div className="absolute left-0 right-0 top-1/2 h-px bg-green-500/10" />

                                <div className="absolute bottom-0 left-[25%] top-0 w-px bg-green-500/[0.06]" />

                                <div className="absolute bottom-0 left-1/2 top-0 w-px bg-green-500/[0.06]" />

                                <div className="absolute bottom-0 right-[25%] top-0 w-px bg-green-500/[0.06]" />

                            </div>


                            {/* Station */}

                            <div className="absolute left-[15%] top-[70px]">

                                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-green-500/30 bg-[#082317]">

                                    <div className="login-pulse absolute inset-[-10px] rounded-full border border-green-500/20" />

                                    <span className="text-2xl text-green-400">
                                        ⚡
                                    </span>

                                </div>

                            </div>


                            {/* Energy */}

                            <div className="absolute left-[29%] right-[30%] top-[103px] h-[2px] overflow-hidden bg-green-500/10">

                                <div className="login-energy h-full w-1/4 bg-green-500" />

                            </div>


                            {/* Car */}

                            <div className="login-float absolute right-[13%] top-[56px]">

                                <div className="relative">

                                    <div className="h-[82px] w-[145px] rounded-[28px_28px_15px_15px] border border-green-500/20 bg-[#111a15] p-4">

                                        <div className="h-[34px] w-[55px] rounded-xl border border-green-500/10 bg-green-500/[0.04]" />

                                    </div>

                                    <div className="absolute -bottom-3 left-6 h-7 w-7 rounded-full bg-[#020605] ring-2 ring-green-500/20" />

                                    <div className="absolute -bottom-3 right-6 h-7 w-7 rounded-full bg-[#020605] ring-2 ring-green-500/20" />

                                </div>

                            </div>


                            {/* Network */}

                            <div className="absolute bottom-5 left-6 flex items-center gap-2">

                                <span className="login-blink h-2 w-2 rounded-full bg-green-500" />

                                <span className="text-xs text-gray-500">
                                    Leccy network online
                                </span>

                            </div>


                            <div className="absolute bottom-5 right-6 text-[10px] font-semibold tracking-widest text-gray-700">
                                LIVE • 24/7
                            </div>

                        </div>


                        {/* Stats */}

                        <div className="mt-8 flex gap-12">

                            <div>
                                <p className="text-2xl font-bold text-white">
                                    5K+
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Charging Stations
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-white">
                                    50K+
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Happy Drivers
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold text-green-500">
                                    24/7
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Network
                                </p>
                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <section className="login-fade-up flex justify-center lg:justify-end">

                    <div className="w-full max-w-[460px]">


                        {/* Heading */}

                        <div className="mb-7 text-center lg:text-left">

                            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/[0.07] text-xl text-green-400 lg:mx-0">
                                ⚡
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Sign in and get back on the road.
                            </p>

                        </div>


                        {/* Card */}

                        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07100b]/90 p-6 shadow-[0_35px_100px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-8">

                            {/* Top green line */}

                            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent" />


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (

                                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">

                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-sm font-bold text-red-400">
                                        !
                                    </div>

                                    <p className="pt-0.5 text-sm leading-6 text-red-400">
                                        {error}
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* Email */}

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Email address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        className="
                                            login-input
                                            w-full
                                            rounded-xl
                                            border
                                            border-white/[0.08]
                                            bg-[#0d1511]
                                            px-4
                                            py-3.5
                                            text-sm
                                            text-white
                                            placeholder:text-gray-600
                                        "
                                    />

                                </div>


                                {/* Password */}

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <label
                                            htmlFor="password"
                                            className="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                        >
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError(
                                                    "Password recovery is not implemented yet."
                                                );
                                            }}
                                            className="text-xs font-semibold text-green-500 transition hover:text-green-400"
                                        >
                                            Forgot password?
                                        </button>

                                    </div>


                                    <div className="relative">

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            autoComplete="current-password"
                                            className="
                                                login-input
                                                w-full
                                                rounded-xl
                                                border
                                                border-white/[0.08]
                                                bg-[#0d1511]
                                                px-4
                                                py-3.5
                                                pr-16
                                                text-sm
                                                text-white
                                                placeholder:text-gray-600
                                            "
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            className="
                                                absolute
                                                right-4
                                                top-1/2
                                                -translate-y-1/2
                                                text-xs
                                                font-semibold
                                                text-gray-600
                                                transition
                                                hover:text-green-400
                                            "
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>


                                {/* Remember */}

                                <div className="flex items-center gap-3">

                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer accent-green-500"
                                    />

                                    <label
                                        htmlFor="remember"
                                        className="cursor-pointer text-xs text-gray-500"
                                    >
                                        Keep me signed in
                                    </label>

                                </div>


                                {/* =================================================
                                    LOGIN BUTTON
                                ================================================= */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        login-button
                                        relative
                                        mt-2
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        overflow-hidden
                                        rounded-xl
                                        bg-green-600
                                        px-5
                                        py-4
                                        font-bold
                                        text-white
                                        shadow-[0_12px_35px_rgba(0,190,75,.18)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >

                                    {!loading && (
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
                                    )}


                                    {loading ? (

                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Signing in...
                                        </>

                                    ) : (

                                        <>
                                            Sign in

                                            <span className="text-lg">
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </form>


                            {/* =================================================
                                SIGN UP
                            ================================================= */}

                            <div className="my-7 flex items-center gap-4">

                                <div className="h-px flex-1 bg-white/[0.06]" />

                                <span className="text-[10px] font-semibold tracking-widest text-gray-700">
                                    NEW TO LECCY?
                                </span>

                                <div className="h-px flex-1 bg-white/[0.06]" />

                            </div>


                            <Link
                                to="/register"
                                className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/[0.08]
                                    bg-white/[0.02]
                                    px-5
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-gray-400
                                    transition
                                    duration-300
                                    hover:border-green-500/25
                                    hover:bg-green-500/[0.04]
                                    hover:text-green-400
                                "
                            >

                                Create a Leccy account

                                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>

                            </Link>


                            {/* Security */}

                            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-700">

                                <span className="text-green-500">
                                    ✓
                                </span>

                                Secure account authentication

                            </div>

                        </div>


                        {/* Terms */}

                        <p className="mt-6 text-center text-xs leading-5 text-gray-700">

                            By continuing, you agree to Leccy's

                            <span className="mx-1 text-gray-500">
                                Terms
                            </span>

                            and

                            <span className="mx-1 text-gray-500">
                                Privacy Policy
                            </span>

                        </p>

                    </div>

                </section>

            </div>

        </main>
    );
};

export default Login;