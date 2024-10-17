"use client";
import { useSDK } from "@contentful/react-apps-toolkit";
import { TypeSketchfabUtility } from "../../helpers/sketchfab-helpers";
import useSketchfabAnnotations from "../../helpers/use-sketchfab-annotations";
import {
  FormControl,
  List,
  SectionHeading,
  Textarea,
} from "@contentful/f36-components";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useEffect, useState } from "react";

export function SketchfabAnnotations({
  sketchfabUtility,
}: {
  sketchfabUtility: TypeSketchfabUtility;
}) {
  const sdk = useSDK<FieldAppSDK>();
  const [tags, setTags] = useState<string | undefined>(
    sdk.field.getValue() || ""
  );
  const { annotationChips } = useSketchfabAnnotations({
    sketchfabUtility,
  });

  useEffect(() => {
    const newTags = annotationChips?.map((chip) => chip.label).join("|");
    setTags(newTags);
  }, [annotationChips]);

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.currentTarget.value);
  };

  return (
    <>
      <Textarea
        value={tags}
        aria-label="tags"
        id={sdk.field.id}
        onChange={onInputChange}
        isReadOnly
        isDisabled
      />
      <div style={{ marginTop: 14 }}>
        <FormControl.HelpText marginTop="spacingS">
          Annotations from model will save in the tags field after model is
          loaded. They are used in search. Note: Annotations are only available
          through the Sketchfab Viewer API, so must load the model in browser to
          get them. This field is read-only.
        </FormControl.HelpText>
      </div>

      <SectionHeading marginTop="spacingS" marginBottom="none">
        Annotations from model:
      </SectionHeading>
      <List>
        {annotationChips?.map((chip) => (
          <List.Item>{chip.label}</List.Item>
        ))}
      </List>
    </>
  );
}

export default SketchfabAnnotations;
