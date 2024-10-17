"use client";

import { useRef } from "react";
import { SketchfabModelInner } from "../sketchfab-model-inner/sketchfab-model-inner";
import useSketchfabUtility from "../../helpers/use-sketchfab-utility";

export interface SketchfabModelProps {
  autoStart?: boolean;
  openVisibilityMenuByDefault?: boolean;
  showBorder?: boolean;
  showFullHeight?: boolean;
  sketchfabId: string;
}

export function SketchfabModel({
  autoStart = false,
  showFullHeight,
  sketchfabId,
}: SketchfabModelProps) {
  const iframeRef = useRef(null);
  const { sketchfabUtility } = useSketchfabUtility({
    autoStart: true,
    iframeRef,
    sketchfabId,
  });

  return (
      <SketchfabModelInner
        iframeRef={iframeRef}
        sketchfabId={sketchfabId}
        sketchfabUtility={sketchfabUtility}
      />
  );
}

export default SketchfabModel;
