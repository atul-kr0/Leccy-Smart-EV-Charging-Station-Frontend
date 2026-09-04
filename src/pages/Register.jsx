import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo/logo-dark.svg";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // =========================
    // HANDLE INPUT CHANGES
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setSuccess(false);
        setError("");

        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    // =========================
    // HANDLE CONFIRM PASSWORD
    // =========================

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setSuccess(false);
        setError("");

        setFieldErrors((prev) => {
            if (!prev.confirmPassword) return prev;
            const next = { ...prev };
            delete next.confirmPassword;
            return next;
        });
    };

    // =========================
    // HANDLE FORM SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess(false);
        setError("");
        setFieldErrors({});

        if (formData.password !== confirmPassword) {
            setFieldErrors({
                confirmPassword: "Passwords do not match."
            });
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(formData),
                }
            );

            const contentType = response.headers.get("content-type");

            let data;

            if (
                contentType &&
                contentType.includes("application/json")
            ) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                let errorMessage =
                    typeof data === "string"
                        ? data
                        : data?.message || data?.error || "Registration failed.";

                const registrationError = new Error(errorMessage);

                // Bean Validation responses are returned as:
                // { fullName: "...", email: "...", password: "...", phoneNumber: "..." }
                if (
                    data &&
                    typeof data === "object" &&
                    !Array.isArray(data)
                ) {
                    const validationErrors = Object.fromEntries(
                        Object.entries(data).filter(
                            ([, value]) => typeof value === "string"
                        )
                    );

                    if (Object.keys(validationErrors).length > 0) {
                        registrationError.fieldErrors = validationErrors;
                    }
                }

                throw registrationError;
            }

            console.log("Registration successful:", data);

            setSuccess(true);
            setFieldErrors({});

            setFormData({
                fullName: "",
                email: "",
                password: "",
                phoneNumber: "",
            });

            setConfirmPassword("");

        } catch (error) {
            console.error("Registration error:", error);

            if (error.fieldErrors) {
                setFieldErrors(error.fieldErrors);
                setError("");
            } else {
                setError(
                    error.message ||
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020605]">

            {/* =====================================================
                GLOBAL ANIMATIONS
            ====================================================== */}

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
                        opacity: .35;
                    }

                    50% {
                        transform: scale(1.25);
                        opacity: .75;
                    }
                }

                @keyframes energyMove {
                    0% {
                        transform: translateX(-120%);
                    }

                    100% {
                        transform: translateX(300%);
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

                .register-fade-up {
                    animation: fadeUp .75s ease-out both;
                }

                .register-fade-left {
                    animation: fadeLeft .8s ease-out both;
                }

                .register-float {
                    animation: float 4s ease-in-out infinite;
                }

                .register-pulse {
                    animation: pulse 2.8s ease-in-out infinite;
                }

                .register-energy {
                    animation: energyMove 3s linear infinite;
                }

                .register-glow {
                    animation: glow 3s ease-in-out infinite;
                }

                .register-input {
                    transition:
                        border-color .25s ease,
                        background-color .25s ease,
                        box-shadow .25s ease,
                        transform .25s ease;
                }

                .register-input.field-error {
                    border-color: rgba(248, 113, 113, .7);
                    box-shadow: 0 0 0 4px rgba(248, 113, 113, .07);
                }

                .register-field-error {
                    display: block;
                    margin-top: 7px;
                    font-size: 12px;
                    line-height: 1.4;
                    color: rgb(248, 113, 113);
                }

                .register-input:focus {
                    outline: none;
                    border-color: rgba(0, 200, 83, .65);
                    background-color: rgba(7, 25, 15, .9);
                    box-shadow:
                        0 0 0 4px rgba(0, 200, 83, .07),
                        0 0 25px rgba(0, 200, 83, .05);
                    transform: translateY(-1px);
                }

                .register-button {
                    transition:
                        transform .25s ease,
                        box-shadow .25s ease,
                        background-color .25s ease;
                }

                .register-button:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 15px 35px rgba(0, 200, 83, .2);
                }

                .register-button:active {
                    transform: translateY(0);
                }

            `}</style>


            {/* =====================================================
                BACKGROUND
            ====================================================== */}

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

                {/* Left green glow */}

                <div
                    className="absolute -left-[300px] top-[100px] h-[650px] w-[650px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,200,83,.14), transparent 68%)",
                        filter: "blur(50px)",
                    }}
                />

                {/* Right green glow */}

                <div
                    className="register-glow absolute -right-[300px] bottom-[-200px] h-[650px] w-[650px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,170,70,.13), transparent 68%)",
                        filter: "blur(55px)",
                    }}
                />

            </div>


            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="relative z-20 flex h-[82px] items-center justify-between border-b border-white/[0.06] px-6 sm:px-10 lg:px-16">

                <Link
                    to="/"
                    className="transition duration-300 hover:opacity-80"
                >
                    <img
                        src={logo}
                        alt="Leccy Logo"
                        className="w-[115px] brightness-0 invert sm:w-[130px]"
                    />
                </Link>

                <Link
                    to="/"
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


            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div className="relative z-10 mx-auto grid max-w-[1250px] items-center gap-14 px-6 py-12 sm:py-16 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[1fr_470px] lg:px-10 lg:py-14">


                {/* =================================================
                    LEFT SIDE
                ================================================== */}

                <section className="register-fade-left hidden lg:block">

                    <div className="max-w-[560px]">

                        {/* Badge */}

                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.04] px-5 py-2.5">

                            <span className="text-green-400">
                                ⚡
                            </span>

                            <span className="text-sm font-semibold tracking-wide text-green-400">
                                SMART CHARGING. ZERO HASSLE.
                            </span>

                        </div>


                        {/* Heading */}

                        <h1 className="text-[64px] font-extrabold leading-[0.98] tracking-[-3px] text-white">

                            Start your

                            <span className="block text-green-500">
                                smarter journey.
                            </span>

                        </h1>


                        {/* Description */}

                        <p className="mt-7 max-w-[490px] text-lg leading-8 text-gray-400">
                            Create your Leccy account and take control
                            of your EV charging experience.
                        </p>


                        {/* =================================================
                            CHARGING VISUAL
                        ================================================== */}

                        <div className="relative mt-12 h-[220px] overflow-hidden rounded-[30px] border border-green-500/[0.12] bg-[#06100a]/80">

                            {/* Background grid */}

                            <div className="absolute inset-0 opacity-30">

                                <div className="absolute left-0 right-0 top-1/2 h-px bg-green-500/10" />

                                <div className="absolute bottom-0 left-[25%] top-0 w-px bg-green-500/[0.06]" />

                                <div className="absolute bottom-0 left-1/2 top-0 w-px bg-green-500/[0.06]" />

                                <div className="absolute bottom-0 right-[25%] top-0 w-px bg-green-500/[0.06]" />

                            </div>


                            {/* Station */}

                            <div className="absolute left-[15%] top-[70px]">

                                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-green-500/30 bg-[#082317]">

                                    <div className="register-pulse absolute inset-[-10px] rounded-full border border-green-500/20" />

                                    <span className="text-2xl">
                                        ⚡
                                    </span>

                                </div>

                            </div>


                            {/* Connection */}

                            <div className="absolute left-[29%] right-[30%] top-[103px] h-[2px] overflow-hidden bg-green-500/10">

                                <div className="register-energy h-full w-1/4 bg-green-500" />

                            </div>


                            {/* Car */}

                            <div className="register-float absolute right-[13%] top-[56px]">

                                <div className="relative">

                                    <div className="h-[82px] w-[145px] rounded-[28px_28px_15px_15px] border border-green-500/20 bg-[#111a15] p-4">

                                        <div className="h-[34px] w-[55px] rounded-xl border border-green-500/10 bg-green-500/[0.04]" />

                                    </div>

                                    <div className="absolute -bottom-3 left-6 h-7 w-7 rounded-full bg-[#020605] ring-2 ring-green-500/20" />

                                    <div className="absolute -bottom-3 right-6 h-7 w-7 rounded-full bg-[#020605] ring-2 ring-green-500/20" />

                                </div>

                            </div>


                            {/* Bottom status */}

                            <div className="absolute bottom-5 left-6 flex items-center gap-2">

                                <span className="register-glow h-2 w-2 rounded-full bg-green-500" />

                                <span className="text-xs text-gray-500">
                                    Ready to charge smarter
                                </span>

                            </div>


                            {/* Steps */}

                            <div className="absolute bottom-5 right-6 flex items-center gap-2 text-[10px]">

                                <span className="font-bold text-green-500">
                                    01
                                </span>

                                <span className="text-gray-700">
                                    —
                                </span>

                                <span className="text-gray-600">
                                    02
                                </span>

                                <span className="text-gray-700">
                                    —
                                </span>

                                <span className="text-gray-600">
                                    03
                                </span>

                            </div>

                        </div>


                        {/* Benefits */}

                        <div className="mt-8 grid grid-cols-3 gap-6">

                            <div>

                                <div className="mb-2 text-xl text-green-500">
                                    ⌖
                                </div>

                                <p className="font-semibold text-white">
                                    Find
                                </p>

                                <p className="mt-1 text-xs text-gray-600">
                                    Nearby stations
                                </p>

                            </div>


                            <div>

                                <div className="mb-2 text-xl text-green-500">
                                    ◷
                                </div>

                                <p className="font-semibold text-white">
                                    Book
                                </p>

                                <p className="mt-1 text-xs text-gray-600">
                                    Your charging slot
                                </p>

                            </div>


                            <div>

                                <div className="mb-2 text-xl text-green-500">
                                    ⚡
                                </div>

                                <p className="font-semibold text-white">
                                    Charge
                                </p>

                                <p className="mt-1 text-xs text-gray-600">
                                    Without the hassle
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    REGISTER FORM
                ================================================== */}

                <section className="register-fade-up">

                    <div className="w-full">


                        {/* Mobile / form heading */}

                        <div className="mb-6 text-center lg:text-left">

                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/[0.07] text-xl text-green-400 lg:mx-0">
                                ⚡
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 sm:text-base">
                                Start charging smarter with Leccy.
                            </p>

                        </div>


                        {/* =================================================
                            CARD
                        ================================================== */}

                        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07100b]/90 p-6 shadow-[0_35px_100px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-8">

                            {/* Top energy line */}

                            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent" />


                            {/* Success */}

                            {success && (

                                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                        ✓
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-green-400">
                                            Account created successfully!
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Your Leccy account is ready.
                                        </p>

                                    </div>

                                </div>

                            )}


                            {/* Error */}

                            {error && (

                                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-400">

                                    {error}

                                </div>

                            )}


                            {/* Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >

                                {/* Full Name */}

                                <div>

                                    <label
                                        htmlFor="fullName"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                        autoComplete="name"
                                        className={`
                                            register-input
                                            w-full
                                            rounded-xl
                                            border
                                            ${fieldErrors.fullName ? "field-error border-red-400/60" : "border-white/[0.08]"}
                                            bg-[#0d1511]
                                            px-4
                                            py-3.5
                                            text-sm
                                            text-white
                                            placeholder:text-gray-600
                                        `}
                                        aria-invalid={Boolean(fieldErrors.fullName)}
                                    />

                                    {fieldErrors.fullName && (
                                        <span className="register-field-error">
                                            {fieldErrors.fullName}
                                        </span>
                                    )}

                                </div>


                                {/* Email */}

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Email
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
                                        className={`
                                            register-input
                                            w-full
                                            rounded-xl
                                            border
                                            ${fieldErrors.email ? "field-error border-red-400/60" : "border-white/[0.08]"}
                                            bg-[#0d1511]
                                            px-4
                                            py-3.5
                                            text-sm
                                            text-white
                                            placeholder:text-gray-600
                                        `}
                                        aria-invalid={Boolean(fieldErrors.email)}
                                    />

                                    {fieldErrors.email && (
                                        <span className="register-field-error">
                                            {fieldErrors.email}
                                        </span>
                                    )}

                                </div>


                                {/* Phone */}

                                <div>

                                    <label
                                        htmlFor="phoneNumber"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        required
                                        autoComplete="tel"
                                        className={`
                                            register-input
                                            w-full
                                            rounded-xl
                                            border
                                            ${fieldErrors.phoneNumber ? "field-error border-red-400/60" : "border-white/[0.08]"}
                                            bg-[#0d1511]
                                            px-4
                                            py-3.5
                                            text-sm
                                            text-white
                                            placeholder:text-gray-600
                                        `}
                                        aria-invalid={Boolean(fieldErrors.phoneNumber)}
                                    />

                                    {fieldErrors.phoneNumber && (
                                        <span className="register-field-error">
                                            {fieldErrors.phoneNumber}
                                        </span>
                                    )}

                                </div>


                                {/* Password */}

                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Password
                                    </label>

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
                                            placeholder="Create a password"
                                            required
                                            autoComplete="new-password"
                                            className={`
                                                register-input
                                                w-full
                                                rounded-xl
                                                border
                                                ${fieldErrors.password ? "field-error border-red-400/60" : "border-white/[0.08]"}
                                                bg-[#0d1511]
                                                px-4
                                                py-3.5
                                                pr-16
                                                text-sm
                                                text-white
                                                placeholder:text-gray-600
                                            `}
                                            aria-invalid={Boolean(fieldErrors.password)}
                                        />

                                        {fieldErrors.password && (
                                            <span className="register-field-error">
                                                {fieldErrors.password}
                                            </span>
                                        )}

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


                                {/* Confirm Password */}

                                <div>

                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={
                                                handleConfirmPasswordChange
                                            }
                                            placeholder="Confirm your password"
                                            required
                                            autoComplete="new-password"
                                            className={`
                                                register-input
                                                w-full
                                                rounded-xl
                                                border
                                                ${fieldErrors.confirmPassword ? "field-error border-red-400/60" : "border-white/[0.08]"}
                                                bg-[#0d1511]
                                                px-4
                                                py-3.5
                                                pr-16
                                                text-sm
                                                text-white
                                                placeholder:text-gray-600
                                            `}
                                            aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                        />

                                        {fieldErrors.confirmPassword && (
                                            <span className="register-field-error">
                                                {fieldErrors.confirmPassword}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
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
                                            {showConfirmPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>


                                {/* Terms */}

                                <div className="flex items-start gap-3 pt-1">

                                    <input
                                        type="checkbox"
                                        required
                                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-green-500"
                                    />

                                    <p className="text-xs leading-5 text-gray-600">
                                        I agree to Leccy's{" "}
                                        <span className="text-gray-400">
                                            Terms of Service
                                        </span>{" "}
                                        and{" "}
                                        <span className="text-gray-400">
                                            Privacy Policy
                                        </span>
                                        .
                                    </p>

                                </div>


                                {/* Submit */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        register-button
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
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >

                                    {/* Shine */}

                                    {!loading && (
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
                                    )}

                                    {loading ? (

                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Creating Account...
                                        </>

                                    ) : (

                                        <>
                                            Create Account

                                            <span className="text-lg transition-transform duration-300">
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </form>


                            {/* Divider */}

                            <div className="my-6 flex items-center gap-4">

                                <div className="h-px flex-1 bg-white/[0.06]" />

                                <span className="text-[10px] font-semibold tracking-widest text-gray-700">
                                    OR
                                </span>

                                <div className="h-px flex-1 bg-white/[0.06]" />

                            </div>


                            {/* Login */}

                            <Link
                                to="/login"
                                className="
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
                                Already have an account?{" "}
                                <span className="ml-1 text-green-500">
                                    Login
                                </span>
                            </Link>


                            {/* Security */}

                            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-700">

                                <span className="text-green-500">
                                    ✓
                                </span>

                                Your information stays secure.

                            </div>

                        </div>


                        {/* Footer text */}

                        <p className="mt-5 text-center text-xs text-gray-700">
                            By creating an account, you can start using
                            Leccy's charging network.
                        </p>

                    </div>

                </section>

            </div>

        </main>
    );
};

export default Register;