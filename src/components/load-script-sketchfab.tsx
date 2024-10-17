import React, { useEffect } from "react";

export function LoadScript({ children }: { children: React.ReactNode }) {
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  useEffect(() => {
    if (window && document) {
      const script = document.createElement("script");
      const body = document.getElementsByTagName("body")[0];
      script.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.5.2.js";
      body.appendChild(script);
      script.addEventListener("load", () => {
        setScriptLoaded(true);
      });
    }
  }, []);

  return <>{scriptLoaded && children}</>;
}

export default LoadScript;
