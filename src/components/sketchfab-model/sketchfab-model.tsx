"use client";

import { useRef, useState } from "react";
import useSketchfabUtility from "../../helpers/use-sketchfab-utility";
import SketchfabAnnotations from "../sketchfab-annotations/sketchfab-annotations";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";

export interface SketchfabModelProps {
  sketchfabId: string;
}

export function SketchfabModel() {
  const sdk = useSDK<FieldAppSDK>();

  const sketchfabId = sdk.entry.fields.sketchfabId.getValue();
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
