import React from "react";

import MyVehicles from "./pages/MyVehicles";
import Bookings from "./pages/Bookings";
import FindCharger from "./pages/FindCharger";
import StationDetails from "./pages/StationDetails";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Feature from "./pages/Feature";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import History from "./pages/History";
import MapTest from "./pages/MapTest";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";


/* ============================================================
   PROTECTED ROUTE
   ============================================================ */

const ProtectedRoute = ({ children }) => {

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};


/* ============================================================
   APP
   ============================================================ */

const App = () => {

    return (
        <BrowserRouter>

            <Routes>

                {/* =================================================
                    PUBLIC PAGES
                   ================================================= */}

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/how-it-works"
                    element={<HowItWorks />}
                />

                <Route
                    path="/pricing"
                    element={<Pricing />}
                />

                <Route
                    path="/contact"
                    element={<Contact />}
                />

                <Route
                    path="/about"
                    element={<About />}
                />

                <Route
                    path="/features"
                    element={<Feature />}
                />

                {/* Keep this public if you still use it for testing */}
                <Route
                    path="/map-test"
                    element={<MapTest />}
                />


                {/* =================================================
                    PROTECTED APPLICATION
                   ================================================= */}

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >

                    <Route
                        index
                        element={<Home />}
                    />

                    <Route
                        path="vehicles"
                        element={<MyVehicles />}
                    />

                    <Route
                        path="bookings"
                        element={<Bookings />}
                    />

                    <Route
                        path="find-charger"
                        element={<FindCharger />}
                    />

                    <Route
                        path="station/:id"
                        element={<StationDetails />}
                    />

                    <Route
                        path="history"
                        element={<History />}
                    />

                    <Route
                        path="support"
                        element={<Support />}
                    />

                    <Route
                        path="profile"
                        element={<Profile />}
                    />

                    <Route
                        path="settings"
                        element={<Settings />}
                    />

                    <Route
                        path="notifications"
                        element={<Notifications />}
                    />

                </Route>


                {/* =================================================
                    UNKNOWN ROUTE
                   ================================================= */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
};

export default App;