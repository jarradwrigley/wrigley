// import React, { useRef, useEffect, useState } from "react";

// const VideoMaskedText = ({
//   text = "JARRAD",
//   videoSrc = "https://video.wixstatic.com/video/11062b_7b74302e4df94b11b1dc248b27cb6b6f/480p/mp4/file.mp4",
//   fontSize = "4rem",
//   fontFamily = "Oswald, Arial, sans-serif",
//   fontWeight = "bold",
//   letterSpacing = "0.1em",
//   textTransform = "uppercase",
//   width = "100%",
//   height = "100%",
//   // Video positioning props
//   videoZoom = 1.2, // How much to zoom (1.0 = no zoom, 1.2 = 20% zoom)
//   videoPosition = "right center", // Where to focus (left/center/right + top/center/bottom)
//   ...props
// }) => {
//   const containerRef = useRef(null);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
//   const maskId = `text-mask-${Math.random().toString(36).substr(2, 9)}`;

//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const rect = containerRef.current.getBoundingClientRect();
//         setDimensions({ width: rect.width, height: rect.height });
//       }
//     };

//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   // Simplified font size calculation that prioritizes fitting within container
//   const calculateFontSize = () => {
//     if (!dimensions.width || !dimensions.height) return 48;

//     // Use container height as the primary constraint
//     // Aim for text to be about 70% of container height
//     const heightBasedSize = dimensions.height * 0.7;

//     // Also consider width to prevent overflow
//     // Rough estimate: each character takes about 0.6em width in Oswald
//     const estimatedTextWidth = text.length * heightBasedSize * 0.6;
//     const widthBasedSize =
//       estimatedTextWidth > dimensions.width
//         ? (dimensions.width / text.length) * 0.8
//         : heightBasedSize;

//     // Use the smaller of the two to ensure it fits
//     return Math.min(heightBasedSize, widthBasedSize);
//   };

//   const adjustedFontSize = calculateFontSize();

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         position: "relative",
//         width: width,
//         height: height,
//         overflow: "hidden",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#000",
//         // zIndex: 1,
//         ...props.style,
//       }}
//       {...props}
//     >
//       {dimensions.width && dimensions.height && (
//         <svg
//           width="100%"
//           height="100%"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//           }}
//           viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
//         >
//           <defs>
//             <mask id={maskId}>
//               {/* Black background hides everything */}
//               <rect width="100%" height="100%" fill="black" />
//               {/* White text reveals the video */}
//               <text
//                 x="50%"
//                 y="50%"
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 fill="white"
//                 fontSize={adjustedFontSize}
//                 fontFamily={fontFamily}
//                 fontWeight={fontWeight}
//                 letterSpacing={letterSpacing}
//                 style={{ textTransform: textTransform }}
//               >
//                 {text}
//               </text>
//             </mask>
//           </defs>

//           {/* Video as foreignObject with mask applied */}
//           <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
//             <video
//               autoPlay
//               loop
//               muted
//               playsInline
//               style={{
//                 width: `${videoZoom * 100}%`, // Zoom in by making video larger
//                 height: `${videoZoom * 100}%`, // Zoom in by making video larger
//                 objectFit: "cover",
//                 objectPosition: videoPosition, // Focus on specified area of video
//                 display: "block",
//                 transform: `translate(${-(videoZoom - 1) * 50}%, ${
//                   -(videoZoom - 1) * 50
//                 }%)`, // Center after zoom
//               }}
//             >
//               <source src={videoSrc} type="video/mp4" />
//             </video>
//           </foreignObject>
//         </svg>
//       )}
//     </div>
//   );
// };

import React, { useRef, useEffect, useState } from "react";

const VideoMaskedText = ({
  text = "JARRAD",
  videoSrc = "https://video.wixstatic.com/video/11062b_7b74302e4df94b11b1dc248b27cb6b6f/480p/mp4/file.mp4",
  fontSize = "5rem",
  fontFamily = "Oswald, Arial, sans-serif",
  fontWeight = "bold",
  letterSpacing = "0.1em",
  textTransform = "uppercase",
  width = "100%",
  height = "100%",
  videoZoom = 1.2,
  videoPosition = "right center",
  ...props
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const maskId = `text-mask-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const calculateFontSize = () => {
    if (!dimensions.width || !dimensions.height) return 48;

    const heightBasedSize = dimensions.height * 0.7;
    const estimatedTextWidth = text.length * heightBasedSize * 0.6;
    const widthBasedSize =
      estimatedTextWidth > dimensions.width
        ? (dimensions.width / text.length) * 0.8
        : heightBasedSize;

    return Math.min(heightBasedSize, widthBasedSize);
  };

  const adjustedFontSize = calculateFontSize();

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: width,
        height: height,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        ...props.style,
      }}
      {...props}
    >
      {dimensions.width && dimensions.height && (
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="black" />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={adjustedFontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                letterSpacing={letterSpacing}
                style={{ textTransform: textTransform }}
              >
                {text}
              </text>
            </mask>
          </defs>

          <foreignObject width="100%" height="100%" mask={`url(#${maskId})`}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: `${videoZoom * 100}%`,
                height: `${videoZoom * 100}%`,
                objectFit: "cover",
                objectPosition: videoPosition,
                display: "block",
                transform: `translate(${-(videoZoom - 1) * 50}%, ${
                  -(videoZoom - 1) * 50
                }%)`,
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </foreignObject>
        </svg>
      )}
    </div>
  );
};

export default VideoMaskedText;
