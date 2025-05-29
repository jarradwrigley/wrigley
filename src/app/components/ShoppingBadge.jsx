"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useStore } from "../../../store/store";

const ShoppingBadge = () => {
  const { total, cart } = useStore();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        zIndex: 10,
        // marginBottom: "2rem",
      }}
    >
      <div style={{ position: "relative" }}>
        <ShoppingCart
          size={24}
          style={{
            color: "#ffffff",
            cursor: "pointer",
            transition: "color 0.2s ease-in-out",
            zIndex: 10,
          }}
          //   onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")} // blue-700
          //   onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
        />
        {/* {cartCount > 0 && ( */}
        <span
          style={{
            position: "absolute",
            top: "-80%",
            right: "25%",
            //   backgroundColor: "#ef4444", // red-500
            zIndex: 10,
            lineHeight: "2rem",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
            //   borderRadius: "9999px",
            //   height: "1.5rem",
            //   width: "1.5rem",
            //   minWidth: "1.5rem",
            //   display: "flex",
            //   alignItems: "center",
            //   justifyContent: "center",
          }}
        >
          {cart.length > 99 ? "99+" : cart.length}
        </span>
        {/* )} */}
      </div>
    </div>
  );
};

export default ShoppingBadge;
