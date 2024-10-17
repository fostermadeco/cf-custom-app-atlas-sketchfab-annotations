import React, { useEffect, useRef } from "react";
import { FieldAppSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import SketchfabModel from "../components/sketchfab-model/sketchfab-model";
import LoadScript from "../components/load-script-sketchfab";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const debounceInterval: any = useRef(false);
  const detachExternalChangeHandler: any = useRef(null);
  const [sketchfabId, setSketchfabId] = React.useState(false);

  useEffect(() => {
    sdk.window.updateHeight(600);
  }, []);

  useEffect(() => {
    const listener = sdk.entry.fields.sketchfabId.onValueChanged(
      "en-US",
      () => {
        if (debounceInterval.current) {
          clearInterval(debounceInterval.current);
        }
        debounceInterval.current = setTimeout(() => {
          setSketchfabId(sdk.entry.fields.sketchfabId.getValue());
        }, 500);
      }
    );
    return () => {
      // Remove debounce interval
      if (debounceInterval.current) {
        clearInterval(debounceInterval.current);
      }

      // Remove external change listener
      if (detachExternalChangeHandler.current) {
        detachExternalChangeHandler.current();
      }

      listener?.();
    };
  }, []);

  if (!sketchfabId) {
    return <div>Add Sketchfab ID to save the model annotations as tags.</div>;
  }

  return (
    <>
      <LoadScript>
        <SketchfabModel />
      </LoadScript>
    </>
  );
};

export default Field;
