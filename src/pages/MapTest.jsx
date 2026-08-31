import React, { useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapTest = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

    useEffect(() => {
        console.log("================================");
        console.log("MAP TEST");
        console.log("MapTiler key exists:", !!mapTilerKey);
        console.log(
            "MapTiler key length:",
            mapTilerKey?.length
        );
        console.log("================================");

        if (!mapTilerKey) {
            console.error(
                "❌ VITE_MAPTILER_KEY is undefined"
            );
            return;
        }

        if (!mapContainerRef.current) {
            console.error(
                "❌ Map container does not exist"
            );
            return;
        }

        const map = new Map({
            container: mapContainerRef.current,

            style:
                `https://api.maptiler.com/maps/streets-v4/style.json?key=${mapTilerKey}`,

            center: [
                77.2090,
                28.6139,
            ],

            zoom: 10,
        });

        map.addControl(
            new NavigationControl(),
            "top-right"
        );

        map.on("load", () => {
            console.log(
                "✅ MAP LOADED SUCCESSFULLY"
            );
        });

        map.on("error", (event) => {
            console.error(
                "❌ MAPLIBRE ERROR:",
                event
            );

            console.error(
                "❌ MAP ERROR DETAILS:",
                event?.error
            );
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                margin: 0,
                padding: 0,
            }}
        >
            <div
                ref={mapContainerRef}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </div>
    );
};

export default MapTest;