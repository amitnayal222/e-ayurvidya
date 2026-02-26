"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CanvasViewer({ imageUrls, zoom = 1, userId }) {
  const canvasRefs = useRef([]);

  // Draw a single canvas
  const drawCanvas = useCallback((imgUrl, canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    //img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = () => {

      const width = img.width * zoom; const height = img.height * zoom;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Watermark
      ctx.font = `${20 * zoom}px Arial`;
      ctx.fillStyle = "rgba(255,0,0,0.2)";
      ctx.textAlign = "right";
      ctx.fillText(userId, width - 10, height - 10);
    };
      
  }, [zoom, userId]);

  // Draw all images
  useEffect(() => {
    if (!imageUrls || !imageUrls.length) return;
    imageUrls.forEach((url, i) => {
      if (url) drawCanvas(url, canvasRefs.current[i]);
    });
  }, [imageUrls, drawCanvas]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {imageUrls.map((url, i) => (
        <canvas
          key={i}
          ref={(el) => (canvasRefs.current[i] = el)}
          style={{ width: "100%",height: "auto", borderRadius: 12, pointerEvents: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        />
      ))}
    </div>
  );
}


