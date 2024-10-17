'use client';

import { useRef } from 'react';
import ChipGroupSelect, {
    TypeChip,
} from '../chip-group-select/chip-group-select';

import useSketchfabAnnotations from '../../helpers/use-sketchfab-annotations';
import useSketchfabUtility from '../../helpers/use-sketchfab-utility';
import { SketchfabModelInner } from '../sketchfab-model-inner/sketchfab-model-inner';

export interface SketchfabModelWithTagsProps {
    autoStart?: boolean;
    selectedTag: TypeChip | null;
    sketchfabId: string;
    slug: string;
    showTags?: boolean;
    onTagSelect: (tag: TypeChip) => void;
}

export function SketchfabModelWithTags({
    autoStart = false,
    selectedTag,
    sketchfabId,
    slug,
    showTags = true,
    onTagSelect,
}: SketchfabModelWithTagsProps) {
    const iframeRef = useRef(null);

    const { sketchfabUtility } = useSketchfabUtility({
        autoStart,
        iframeRef,
        sketchfabId,
    });

    const { annotationChips, showAnnotation } = useSketchfabAnnotations({
        sketchfabUtility,
        onAnnotationSelect: onTagSelect,
    });

    return (
        <div>
            <SketchfabModelInner
                iframeRef={iframeRef}
                sketchfabId={sketchfabId}
                sketchfabUtility={sketchfabUtility}
            />

            {showTags && annotationChips && (
                <div className="pt-6 mt-6 lg:pt-0">
                    <p className="mb-4 text-blue-500 eyebrow dark:text-blue-300">
                        Select Desired Anatomy
                    </p>

                    <ChipGroupSelect
                        chips={annotationChips}
                        selectedChip={selectedTag?.id}
                        onChipSelect={(chip) => {
                            onTagSelect(chip);
                            showAnnotation(parseInt(chip.id));
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default SketchfabModelWithTags;
