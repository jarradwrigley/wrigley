"use client";

import React from "react";
import "./css/ImageSlider.css";

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  return (
    <ul className="slides">
      {images.map((img, idx) => {
        const prevIdx = (idx - 1 + images.length) % images.length;
        const nextIdx = (idx + 1) % images.length;
        const radioId = `img-${idx + 1}`;

        return (
          <React.Fragment key={idx}>
            <input
              type="radio"
              name="radio-btn"
              id={radioId}
              defaultChecked={idx === 0}
            />
            <li className="slide-container">
              <div className="slide">
                <img src={img} alt={`slide-${idx + 1}`} />
              </div>
              {/* <div className="nav">
                <label htmlFor={`img-${prevIdx + 1}`} className="prev">
                  &#x2039;
                </label>
                <label htmlFor={`img-${nextIdx + 1}`} className="next">
                  &#x203a;
                </label>
              </div> */}
            </li>
          </React.Fragment>
        );
      })}

      <li className="nav-dots">
        {images.map((_, idx) => (
          <label
            key={idx}
            htmlFor={`img-${idx + 1}`}
            className="nav-dot"
            id={`img-dot-${idx + 1}`}
          />
        ))}
      </li>
    </ul>
  );
};

export default ImageSlider;
