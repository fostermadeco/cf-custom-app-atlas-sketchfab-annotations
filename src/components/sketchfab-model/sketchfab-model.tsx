"use client";

import { useRef } from "react";
import useSketchfabUtility from "../../helpers/use-sketchfab-utility";
import SketchfabAnnotations from "../sketchfab-annotations/sketchfab-annotations";

export interface SketchfabModelProps {
  sketchfabId: string;
}

export function SketchfabModel({ sketchfabId }: SketchfabModelProps) {
  const iframeRef = useRef(null);
  const { sketchfabUtility } = useSketchfabUtility({
    autoStart: true,
    iframeRef,
    sketchfabId,
  });

  return (
    <div>
      {sketchfabUtility && (
        <SketchfabAnnotations sketchfabUtility={sketchfabUtility} />
      )}

      <iframe
        style={{ position: "relative", height: 500 }}
        ref={iframeRef}
        id={sketchfabId}
        title={sketchfabId}
        width={"900"}
        height="500"
      ></iframe>
    </div>
  );
}

export default SketchfabModel;
