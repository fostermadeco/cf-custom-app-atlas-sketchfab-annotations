import React, { useEffect, useRef, useState } from "react";
import { Paragraph, TextInput } from "@contentful/f36-components";
import { FieldAppSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import SketchfabModel from "../components/sketchfab-model/sketchfab-model";
import LoadScript from "../components/load-script-sketchfab";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();

  const iframeRef = useRef(null);

  const [value, setValue] = useState<string | undefined>(
    sdk.field.getValue() || ""
  );

  useEffect(() => {
    sdk.window.updateHeight(600)
  }, []);

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  return (
    <>
      {value && (
          <LoadScript>
            <SketchfabModel sketchfabId={value} />
          </LoadScript>
      )}
      <TextInput
        value={value}
        aria-label="sketchfabId"
        id={sdk.field.id}
        onChange={onInputChange}
        isRequired
      />
    </>
  );
};

export default Field;
