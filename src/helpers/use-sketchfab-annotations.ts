import { useCallback, useEffect, useState } from 'react';
import {
    TypeSketchfabUtility,
    getAnnotationChips,
    getAnnotations,
} from './sketchfab-helpers';

type TypeAnnotationChip = {
    id: string;
    label: string;
};

const useSketchfabAnnotations = ({
    sketchfabUtility,
    onAnnotationSelect,
}: {
    sketchfabUtility?: TypeSketchfabUtility;
    onAnnotationSelect?: (annotationChip: TypeAnnotationChip) => void;
}) => {
    const [annotationChips, setAnnotationChips] =
        useState<TypeAnnotationChip[]>();

    const showAnnotation = useCallback(
        (annotationId: number) => {
            if (!sketchfabUtility) {
                return;
            }

            sketchfabUtility.api.showAnnotation(annotationId);
            sketchfabUtility?.api?.gotoAnnotation(annotationId, {}, () => null);
        },
        [sketchfabUtility]
    );

    // Fetch annotations from API on mount
    useEffect(() => {
        if (!sketchfabUtility) {
            return;
        }

        (async () => {
            const annotations = await getAnnotations(sketchfabUtility.api);
            setAnnotationChips(getAnnotationChips(annotations));
        })();
    }, [sketchfabUtility]);

    // Add event listener for annotation select
    useEffect(() => {
        if (!sketchfabUtility) {
            return;
        }

        const handleAnnotationSelect = (annotationId: number) => {
            if (annotationChips && onAnnotationSelect) {
                const selectedAnnotation = annotationChips.find(
                    (chip) => chip.id === annotationId.toString()
                );

                if (selectedAnnotation) {
                    onAnnotationSelect(selectedAnnotation);
                }
            }
        };

        sketchfabUtility.api.addEventListener(
            'annotationSelect',
            handleAnnotationSelect
        );

        return () => {
            sketchfabUtility.api.removeEventListener(
                'annotationSelect',
                handleAnnotationSelect
            );
        };
    }, [sketchfabUtility, annotationChips, onAnnotationSelect]);

    return {
        annotationChips,
        showAnnotation,
    };
};

export default useSketchfabAnnotations;
