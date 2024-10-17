"use client";
import { TypeSketchfabUtility } from "../../helpers/sketchfab-helpers";
import useSketchfabAnnotations from "../../helpers/use-sketchfab-annotations";
import {
  Button,
  List,
  Paragraph,
  SectionHeading,
} from "@contentful/f36-components";

export function SketchfabAnnotations({
  sketchfabUtility,
}: {
  sketchfabUtility: TypeSketchfabUtility;
}) {
  const { annotationChips } = useSketchfabAnnotations({
    sketchfabUtility,
  });

  const handleSave = () => {
    console.log("Save annotations and image");
  };

  return (
    <>
      <div style={{ marginTop: 14 }}>
        <Button onClick={() => handleSave()} variant="primary">
          Save Annotations & Image
        </Button>
        <Paragraph marginTop="spacingS">
          Click button after model is loaded to save them to Contentful. Only
          needs to be done once. They are used in search.
        </Paragraph>
      </div>

      <SectionHeading marginTop="spacingS" marginBottom="none">
        Annotations to Save from the model:
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
