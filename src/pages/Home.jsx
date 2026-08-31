import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <section className="min-h-[calc(100vh-5rem)] bg-gray-50 px-5 py-7 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* Welcome */}
                <div>
                    <p className="text-sm font-semibold text-green-600">
                        Welcome back
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Ready to charge smarter?
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Find nearby charging stations, manage your vehicles,
                        and keep track of every charging session from one place.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <Link
                        to="/home/find-charger"
                        className="group rounded-2xl bg-green-600 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                <span className="text-xl">⚡</span>
                            </div>

                            <span className="text-lg transition group-hover:translate-x-1">
                                →
                            </span>
                        </div>

                        <h2 className="mt-5 text-lg font-semibold">
                            Find a charger
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-green-100">
                            Discover charging stations near you and find the
                            right charger for your vehicle.
                        </p>
                    </Link>

                    <Link
                        to="/home/bookings"
                        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                                🎟️
                            </div>

                            <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600">
                                →
                            </span>
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-gray-900">
                            Manage bookings
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            Check your current charging session and manage
                            your upcoming bookings.
                        </p>
                    </Link>

                    <Link
                        to="/home/vehicles"
                        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                🚗
                            </div>

                            <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600">
                                →
                            </span>
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-gray-900">
                            Your vehicles
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            View your registered EVs and keep your vehicle
                            information up to date.
                        </p>
                    </Link>
                </div>

                {/* Dashboard */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">

                    {/* Get Started */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                    GET STARTED
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                                    Your charging journey
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Everything you need for a smoother EV
                                    charging experience.
                                </p>
                            </div>

                            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg sm:flex">
                                ⚡
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="text-lg font-semibold text-green-600">
                                    01
                                </div>

                                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                                    Find a station
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Search for available chargers around your
                                    location.
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="text-lg font-semibold text-green-600">
                                    02
                                </div>

                                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                                    Make a booking
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Reserve a suitable charger before you
                                    arrive.
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="text-lg font-semibold text-green-600">
                                    03
                                </div>

                                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                                    Start charging
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Use your booking token to start your
                                    charging session.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Charging Tip */}
                    <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white">
                        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-green-500/10" />

                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
                            💡
                        </div>

                        <p className="relative mt-6 text-xs font-semibold uppercase tracking-wider text-green-400">
                            CHARGING TIP
                        </p>

                        <h2 className="relative mt-2 text-xl font-semibold">
                            Plan before you plug in.
                        </h2>

                        <p className="relative mt-2 text-sm leading-6 text-gray-400">
                            Checking charger availability before leaving can
                            help you avoid unnecessary waiting at busy stations.
                        </p>

                        <Link
                            to="/home/find-charger"
                            className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-400 transition hover:text-green-300"
                        >
                            Find a charger
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                YOUR ACTIVITY
                            </p>

                            <h2 className="mt-1 text-xl font-semibold text-gray-900">
                                Recent charging activity
                            </h2>
                        </div>

                        <Link
                            to="/home/history"
                            className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                            View history →
                        </Link>
                    </div>

                    <div className="mt-5 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                        <div className="text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                                ⚡
                            </div>

                            <p className="mt-3 text-sm font-medium text-gray-700">
                                No recent activity
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Your completed charging sessions will appear
                                here.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-green-800">
                            Ready for your next charge?
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            Find an available charging station and get back
                            on the road.
                        </p>
                    </div>

                    <Link
                        to="/home/find-charger"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                        Find a charger
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default Home;
