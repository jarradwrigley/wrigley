// hooks/useIPLocation.js
// Save this file in your project's hooks directory
import { useState, useEffect } from "react";

export const useIPLocation = () => {
  const [location, setLocation] = useState({
    city: "Loading...",
    state: "",
    country: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getIPLocation = async () => {
      try {
        // Using ipapi.co (free tier: 1000 requests/day)
        const response = await fetch("https://ipapi.co/json/");

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        setLocation({
          city: data.city || "Unknown City",
          state: data.region || "",
          country: data.country_name || "",
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("IP Location error:", error);
        setLocation({
          city: "Lagos", // Fallback
          state: "Lagos",
          country: "Nigeria",
          loading: false,
          error: error.message,
        });
      }
    };

    getIPLocation();
  }, []);

  return location;
};

// Alternative free services you can use:
// 1. https://ipapi.co/json/ (1000 requests/day)
// 2. https://api.ipify.org?format=json (IP only, then use another service)
// 3. http://ip-api.com/json/ (1000 requests/hour, no HTTPS on free tier)
// 4. https://freegeoip.app/json/ (15000 requests/hour)
