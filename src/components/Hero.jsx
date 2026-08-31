import { Link } from "react-router-dom";
import logo from "../assets/logo/logo-dark.svg";
import landingBg from "../assets/images/landing-bg.png";

const Hero = () => {
    return (
        <>
            <style>{`
                @keyframes heroFadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(28px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes phoneFloat {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes pulseGreen {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.15);
                    }
                    50% {
                        box-shadow: 0 0 0 12px rgba(0, 200, 83, 0);
                    }
                }

                @keyframes stationSlide {
                    from {
                        opacity: 0;
                        transform: translateX(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes glow {
                    0%, 100% {
                        opacity: .35;
                    }
                    50% {
                        opacity: .75;
                    }
                }

                .hero-content {
                    animation: heroFadeUp .8s ease-out both;
                }

                .hero-phone {
                    animation: phoneFloat 5s ease-in-out infinite;
                }

                .hero-station-1 {
                    animation: stationSlide .6s .45s ease-out both;
                }

                .hero-station-2 {
                    animation: stationSlide .6s .6s ease-out both;
                }

                .hero-station-3 {
                    animation: stationSlide .6s .75s ease-out both;
                }

                .hero-location-pulse {
                    animation: pulseGreen 2s infinite;
                }

                .hero-glow {
                    animation: glow 4s ease-in-out infinite;
                }
            `}</style>

            <section
                className="relative min-h-[680px] overflow-hidden bg-[#020605] lg:min-h-[720px]"
                style={{
                    backgroundImage: `url(${landingBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center right",
                }}
            >

                {/* =====================================================
                    DARK LEFT-SIDE OVERLAY
                ====================================================== */}

                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                rgba(0,0,0,0.99) 0%,
                                rgba(0,5,3,0.99) 17%,
                                rgba(0,9,5,0.97) 30%,
                                rgba(1,14,8,0.91) 43%,
                                rgba(2,17,10,0.76) 54%,
                                rgba(2,17,10,0.55) 64%,
                                rgba(2,17,10,0.27) 77%,
                                rgba(2,17,10,0.08) 90%,
                                rgba(2,17,10,0) 100%
                            )
                        `,
                    }}
                />

                {/* Additional bottom darkness */}
                <div
                    className="absolute inset-0 z-[2]"
                    style={{
                        background: `
                            linear-gradient(
                                0deg,
                                rgba(0,0,0,0.45) 0%,
                                transparent 35%
                            )
                        `,
                    }}
                />

                {/* Green atmospheric glow */}
                <div
                    className="hero-glow pointer-events-none absolute left-[30%] top-[20%] z-[2] h-[450px] w-[450px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0,180,70,0.13), transparent 68%)",
                        filter: "blur(30px)",
                    }}
                />

                {/* =====================================================
                    HERO CONTENT
                ====================================================== */}

                <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1450px] items-center px-7 py-20 lg:min-h-[720px] lg:px-16">

                    {/* LEFT CONTENT */}

                    <div className="hero-content w-full max-w-[590px]">

                        {/* Badge */}

                        <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-green-500/30 bg-green-950/30 px-5 py-2.5 backdrop-blur-md">
                            <span className="text-lg text-green-400">
                                ⚡
                            </span>

                            <span className="text-sm font-semibold tracking-wide text-green-400">
                                Smart Charging. Zero Hassle.
                            </span>
                        </div>

                        {/* Heading */}

                        <h1 className="text-[48px] font-extrabold leading-[0.98] tracking-[-2px] text-white sm:text-[60px] lg:text-[72px]">

                            <span className="block">
                                Charge Smarter.
                            </span>

                            <span className="block text-green-500">
                                Drive Further.
                            </span>

                        </h1>

                        {/* Description */}

                        <p className="mt-7 max-w-[570px] text-[17px] leading-8 text-gray-300">
                            Leccy helps you find the best EV charging
                            stations, estimate wait times, and book your
                            slot in advance.
                            <br />
                            Save time. Save energy. Go electric.
                        </p>

                        {/* Buttons */}

                        <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                            <Link
                                to="/register"
                                className="
                                    group
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-3
                                    rounded-2xl
                                    bg-green-600
                                    px-8
                                    py-4
                                    text-base
                                    font-bold
                                    text-white
                                    shadow-[0_12px_35px_rgba(0,190,75,0.25)]
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-green-500
                                    hover:shadow-[0_18px_45px_rgba(0,190,75,0.35)]
                                "
                            >
                                Get Started

                                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>

                            <Link
                                to="/features"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-white/60
                                    bg-black/10
                                    px-8
                                    py-4
                                    text-base
                                    font-bold
                                    text-white
                                    backdrop-blur-sm
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-white
                                    hover:text-black
                                "
                            >
                                Explore Features
                            </Link>

                        </div>

                        {/* TRUSTED USERS */}

                        <div className="mt-9 flex items-center gap-5">

                            <div className="flex -space-x-2">

                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div
                                        key={item}
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-full
                                            border-2
                                            border-[#07100b]
                                            bg-gradient-to-br
                                            from-gray-300
                                            to-gray-600
                                            text-[10px]
                                            font-bold
                                            text-white
                                        "
                                    >
                                        {String(item).padStart(2, "0")}
                                    </div>
                                ))}

                            </div>

                            <div>
                                <p className="text-xl font-extrabold text-white">
                                    10K+
                                </p>

                                <p className="text-xs text-gray-400">
                                    Happy Drivers
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        PHONE MOCKUP
                    ====================================================== */}

                    <div className="pointer-events-none absolute left-[61%] top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">

                        <div className="hero-phone relative">

                            {/* Phone glow */}

                            <div
                                className="absolute inset-[-35px] -z-10 rounded-[70px]"
                                style={{
                                    background:
                                        "radial-gradient(circle, rgba(0,200,80,0.16), transparent 65%)",
                                    filter: "blur(25px)",
                                }}
                            />

                            {/* Phone body */}

                            <div
                                className="
                                    relative
                                    h-[570px]
                                    w-[275px]
                                    rounded-[43px]
                                    border-[7px]
                                    border-[#171717]
                                    bg-[#050505]
                                    p-[10px]
                                    shadow-[0_35px_90px_rgba(0,0,0,0.75)]
                                "
                            >

                                {/* Screen */}

                                <div className="relative h-full overflow-hidden rounded-[32px] bg-[#080909]">

                                    {/* Dynamic Island */}

                                    <div className="absolute left-1/2 top-3 h-[25px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

                                    {/* Phone header */}

                                    <div className="px-5 pt-12">

                                        <img
                                            src={logo}
                                            alt="Leccy"
                                            className="w-[82px]"
                                        />

                                        <h3 className="mt-7 text-[14px] font-bold text-white">
                                            Hello, Driver 👋
                                        </h3>

                                        <p className="mt-1 text-[11px] text-gray-400">
                                            Where do you want to charge?
                                        </p>

                                    </div>

                                    {/* Search */}

                                    <div className="mx-5 mt-4 flex items-center rounded-xl bg-[#171818] px-3 py-3">

                                        <span className="mr-2 text-gray-400">
                                            ⌕
                                        </span>

                                        <span className="text-[11px] text-gray-500">
                                            Search location
                                        </span>

                                        <div className="hero-location-pulse ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-green-600/20">
                                            <span className="text-xs text-green-400">
                                                ◎
                                            </span>
                                        </div>

                                    </div>

                                    {/* Nearby */}

                                    <div className="mt-5 flex items-center justify-between px-5">

                                        <span className="text-[13px] font-semibold text-white">
                                            Nearby Stations
                                        </span>

                                        <span className="text-[10px] font-semibold text-green-500">
                                            View all
                                        </span>

                                    </div>

                                    {/* Station cards */}

                                    <div className="mt-3 space-y-2.5 px-5">

                                        {/* Station 1 */}

                                        <div className="hero-station-1 rounded-xl bg-[#171818] p-3">

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <p className="text-[10px] font-semibold text-white">
                                                        GreenCharge Hub
                                                    </p>

                                                    <p className="mt-1 text-[8px] text-gray-500">
                                                        2.4 km away
                                                    </p>
                                                </div>

                                                <span className="rounded-md bg-green-900/70 px-2 py-1 text-[8px] font-bold text-green-400">
                                                    4/6
                                                </span>

                                            </div>

                                            <div className="mt-2 flex justify-between">

                                                <span className="text-[8px] text-green-400">
                                                    ⚡ Fast
                                                </span>

                                                <span className="text-[8px] text-gray-300">
                                                    ₹14.50 / kWh
                                                </span>

                                            </div>

                                        </div>


                                        {/* Station 2 */}

                                        <div className="hero-station-2 rounded-xl bg-[#171818] p-3">

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <p className="text-[10px] font-semibold text-white">
                                                        PowerGrid Station
                                                    </p>

                                                    <p className="mt-1 text-[8px] text-gray-500">
                                                        3.1 km away
                                                    </p>
                                                </div>

                                                <span className="rounded-md bg-green-900/70 px-2 py-1 text-[8px] font-bold text-green-400">
                                                    2/4
                                                </span>

                                            </div>

                                            <div className="mt-2 flex justify-between">

                                                <span className="text-[8px] text-green-400">
                                                    ⚡ Fast
                                                </span>

                                                <span className="text-[8px] text-gray-300">
                                                    ₹13.20 / kWh
                                                </span>

                                            </div>

                                        </div>


                                        {/* Station 3 */}

                                        <div className="hero-station-3 rounded-xl bg-[#171818] p-3">

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <p className="text-[10px] font-semibold text-white">
                                                        EcoCharge Point
                                                    </p>

                                                    <p className="mt-1 text-[8px] text-gray-500">
                                                        4.7 km away
                                                    </p>
                                                </div>

                                                <span className="rounded-md bg-green-900/70 px-2 py-1 text-[8px] font-bold text-green-400">
                                                    3/6
                                                </span>

                                            </div>

                                            <div className="mt-2 flex justify-between">

                                                <span className="text-[8px] text-green-400">
                                                    ⚡ Fast
                                                </span>

                                                <span className="text-[8px] text-gray-300">
                                                    ₹12.80 / kWh
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Bottom navigation */}

                                    <div className="absolute bottom-0 left-0 right-0 flex h-[62px] items-center justify-around border-t border-white/5 bg-[#080909]">

                                        {[
                                            ["⌂", "Home"],
                                            ["▣", "Bookings"],
                                            ["⌖", "Map"],
                                            ["♙", "Profile"],
                                        ].map(([icon, text], index) => (

                                            <div
                                                key={text}
                                                className={`flex flex-col items-center gap-1 ${
                                                    index === 0
                                                        ? "text-green-500"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <span className="text-sm">
                                                    {icon}
                                                </span>

                                                <span className="text-[7px]">
                                                    {text}
                                                </span>
                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MOBILE PHONE — SAFE FALLBACK
                ====================================================== */}

                <div className="relative z-10 mt-[-20px] flex justify-center px-6 lg:hidden">

                    <div className="hero-phone">

                        <div className="relative h-[500px] w-[245px] rounded-[38px] border-[6px] border-[#171717] bg-[#050505] p-2 shadow-2xl">

                            <div className="h-full overflow-hidden rounded-[30px] bg-[#080909]">

                                <div className="px-5 pt-10">

                                    <img
                                        src={logo}
                                        alt="Leccy"
                                        className="w-[75px]"
                                    />

                                    <h3 className="mt-7 text-sm font-bold text-white">
                                        Hello, Driver 👋
                                    </h3>

                                    <p className="mt-1 text-[11px] text-gray-400">
                                        Where do you want to charge?
                                    </p>

                                </div>

                                <div className="mx-5 mt-4 rounded-xl bg-[#171818] px-3 py-3 text-[11px] text-gray-500">
                                    ⌕ &nbsp; Search location
                                </div>

                                <div className="mt-5 px-5 text-sm font-semibold text-white">
                                    Nearby Stations
                                </div>

                                <div className="mt-3 space-y-2 px-5">

                                    {[
                                        ["GreenCharge Hub", "4/6", "₹14.50 / kWh"],
                                        ["PowerGrid Station", "2/4", "₹13.20 / kWh"],
                                        ["EcoCharge Point", "3/6", "₹12.80 / kWh"],
                                    ].map(([name, count, price]) => (

                                        <div
                                            key={name}
                                            className="rounded-xl bg-[#171818] p-3"
                                        >
                                            <div className="flex justify-between">

                                                <span className="text-[10px] font-semibold text-white">
                                                    {name}
                                                </span>

                                                <span className="rounded-md bg-green-900/70 px-2 py-1 text-[8px] text-green-400">
                                                    {count}
                                                </span>

                                            </div>

                                            <div className="mt-2 flex justify-between text-[8px]">

                                                <span className="text-green-400">
                                                    ⚡ Fast
                                                </span>

                                                <span className="text-gray-400">
                                                    {price}
                                                </span>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>
        </>
    );
};

export default Hero;