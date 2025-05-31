"use client"

import React from "react";
import Image from "next/image";
import { useStore } from "../../../store/store";
import { useSession } from "next-auth/react";

interface GlobalLoadingScreenProps {
  iconSrc?: string;
  iconAlt?: string;
}

const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  iconSrc = "/images/log.avif",
  iconAlt = "",
}) => {
  const { loading, loadingText,
    //  hasAnyLoading
     } = useStore();
       const { data: session, status } = useSession();
     

  // Show loading if either global loading or any specific loading state is active
  const showLoading = loading 
  // || hasAnyLoading();

  if (!showLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-icon">
          <Image src={iconSrc} alt={iconAlt} width={80} height={80} priority />
        </div>
        <div className="loading-text">{loadingText}</div>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-icon {
          animation: pulse 2s ease-in-out infinite;
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1));
        }

        .loading-text {
          color: #333;
          font-size: 18px;
          font-weight: 500;
          opacity: 0.8;
          animation: fadeInOut 2s ease-in-out infinite;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoadingScreen;