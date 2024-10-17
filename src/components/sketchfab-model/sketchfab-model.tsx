"use client";

import { useRef } from "react";
import useSketchfabUtility from "../../helpers/use-sketchfab-utility";
import useSketchfabAnnotations from "../../helpers/use-sketchfab-annotations";
import { Paragraph } from "@contentful/f36-components";

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
  const { annotationChips } = useSketchfabAnnotations({
    sketchfabUtility,
  });

  return (
    <div>
      <div>
        <h3>Annotations</h3>
        <Paragraph>
          <ul>
            {annotationChips?.map((chip) => (
              <li>{chip.label}</li>
            ))}
          </ul>
        </Paragraph>
      </div>

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
