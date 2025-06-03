// import React from "react";
// import { useSpring, animated, config } from "@react-spring/web";
// import SecureIcon from "./icons/SecureIcon";

// const pi = Math.PI;
// const tau = 2 * pi;

// const map = (
//   value: number,
//   inMin: number,
//   inMax: number,
//   outMin: number,
//   outMax: number
// ) => {
//   return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
// };

// type SubscriptionProps = {
//   percentage: number; // e.g., 97.78
// };

// const Subscription: React.FC<SubscriptionProps> = ({ percentage }) => {
//   const maxDash = 785.4;
//   const offset = maxDash * (1 - percentage / 100);

//   const { dashOffset } = useSpring({
//     dashOffset: offset,
//     from: { dashOffset: maxDash },
//     config: config.molasses,
//   });

//   return (
//     <div className="p-4 h-full">
//       <div className="flex justify-between items-center">
//         <div className="text-white font-bold">Subscription</div>
//       </div>

//       <div className="flex justify-center">
//         <svg viewBox="0 0 700 380" fill="none" width="300">
//           {/* Background path */}
//           <path
//             d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
//             stroke="#2d2d2d"
//             strokeWidth="40"
//             strokeLinecap="round"
//           />
//           {/* Animated progress path */}
//           <animated.path
//             d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
//             stroke="#2f49d0"
//             strokeWidth="40"
//             strokeLinecap="round"
//             strokeDasharray={maxDash}
//             strokeDashoffset={dashOffset}
//           />
//           {/* Circular indicator */}
//           <animated.circle
//             cx={dashOffset.to(
//               (x) => 350 + 250 * Math.cos(map(x, maxDash, 0, pi, tau))
//             )}
//             cy={dashOffset.to(
//               (x) => 350 + 250 * Math.sin(map(x, maxDash, 0, pi, tau))
//             )}
//             r="12"
//             fill="#fff"
//           />

//           {/* Secure Icon centered */}
//           <g transform="translate(280, 200)">
//             <g transform="translate(-24, -24)">
//               <SecureIcon size={200} />
//             </g>
//           </g>
//         </svg>
//       </div>

//       <div className="flex justify-center">
//         <div className="flex justify-between mt-2" style={{ width: "300px" }}>
//           <div
//             className="text-gray-400"
//             style={{ width: "50px", paddingLeft: "16px" }}
//           >
//             0%
//           </div>
//           <div className="text-center" style={{ width: "150px" }}>
//             <div className="font-bold text-blue-500 text-lg">
//               {percentage.toFixed(2)}%
//             </div>
//             <div className="text-gray-400">Mobile Only v4</div>
//           </div>
//           <div className="text-gray-400" style={{ width: "50px" }}>
//             100%
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;

import React from "react";
import { useSpring, animated, config } from "@react-spring/web";
import SecureIcon from "./icons/SecureIcon";

const pi = Math.PI;
const tau = 2 * pi;

const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

type SubscriptionProps = {
  percentage: number; // e.g., 97.78
  title: string;
};

const Subscription: React.FC<SubscriptionProps> = ({ percentage, title }) => {
  const maxDash = 785.4;
  const offset = maxDash * (1 - percentage / 100);

  // Determine color based on percentage
  const getColor = (percentage: number) => {
    if (percentage <= 33) return "#ef4444"; // red
    if (percentage <= 66) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  const color = getColor(percentage);

  const { dashOffset } = useSpring({
    dashOffset: offset,
    from: { dashOffset: maxDash },
    config: config.molasses,
  });

  return (
    <div className="p-4 h-full ">
      <div className="flex justify-between items-center">
        <div className="text-white font-bold">{title}</div>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 700 380" fill="none" width="300">
          {/* Background path */}
          <path
            d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
            stroke="#2d2d2d"
            strokeWidth="40"
            strokeLinecap="round"
          />
          {/* Animated progress path */}
          <animated.path
            d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
            stroke={color}
            strokeWidth="40"
            strokeLinecap="round"
            strokeDasharray={maxDash}
            strokeDashoffset={dashOffset}
          />
          {/* Circular indicator */}
          <animated.circle
            cx={dashOffset.to(
              (x) => 350 + 250 * Math.cos(map(x, maxDash, 0, pi, tau))
            )}
            cy={dashOffset.to(
              (x) => 350 + 250 * Math.sin(map(x, maxDash, 0, pi, tau))
            )}
            r="12"
            fill="#fff"
          />

          {/* Secure Icon centered */}
          <g transform="translate(280, 200)">
            <g transform="translate(-24, -24)">
              <SecureIcon size={200} color={color} />
            </g>
          </g>
        </svg>
      </div>

      <div className="flex justify-center">
        <div className="flex justify-between mt-2" style={{ width: "300px" }}>
          <div
            className="text-gray-400"
            style={{ width: "50px", paddingLeft: "16px" }}
          >
            0%
          </div>
          <div className="text-center" style={{ width: "150px" }}>
            <div className="font-bold text-lg" style={{ color }}>
              {percentage.toFixed(2)}%
            </div>
            {/* <div className="text-gray-400">Mobile Only v4</div> */}
          </div>
          <div className="text-gray-400" style={{ width: "50px" }}>
            100%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
