import { useState, useEffect } from "react";

export const useLocation = () => {
  const [location, setLocation] = useState({
    city: "Loading...",
    state: "",
    country: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported");
        }

        // Get user's coordinates
        const position = await new Promise<any>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
          });
        });

        const { latitude, longitude } = position.coords;

        // Reverse geocoding using a free service (OpenStreetMap Nominatim)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();
        const address = data.address;

        setLocation({
          city:
            address.city || address.town || address.village || "Unknown City",
          state: address.state || address.region || "",
          country: address.country || "",
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Location error:", error);
        setLocation({
          city: "Location unavailable",
          state: "",
          country: "",
          loading: false,
          error: error.message,
        });
      }
    };

    getLocation();
  }, []);

  return location;
};
