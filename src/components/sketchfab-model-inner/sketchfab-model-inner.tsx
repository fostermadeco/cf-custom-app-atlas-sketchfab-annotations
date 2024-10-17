import { RefObject, useRef } from "react";
import { TypeSketchfabUtility } from "../../helpers/sketchfab-helpers";
import useSketchfabAnnotations from "../../helpers/use-sketchfab-annotations";

export interface SketchfabModelInnerProps {
  iframeRef: RefObject<HTMLIFrameElement>;
  sketchfabId: string;
  sketchfabUtility?: TypeSketchfabUtility;
}

export function SketchfabModelInner({
  iframeRef,
  sketchfabId,
  sketchfabUtility,
}: SketchfabModelInnerProps) {
  const containerRef = useRef(null);
  const { annotationChips, showAnnotation } = useSketchfabAnnotations({
    sketchfabUtility,
  });

  return (
    <div className="" ref={containerRef}>
      <div>
        {annotationChips?.map((chip) => (
          <span>{chip.label}</span>
        ))}
        <iframe
          style={{ position: "relative", height: 500 }}
          ref={iframeRef}
          id={sketchfabId}
          title={sketchfabId}
          width={"900"}
          height="500"
        ></iframe>
      </div>
    </div>
  );
}
