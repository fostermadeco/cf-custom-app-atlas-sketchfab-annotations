'use client';

import { MutableRefObject, useEffect, useState } from 'react';
import SketchfabAPIUtility from './sketchfab-api-utility';
import { TypeSketchfabUtility } from './sketchfab-helpers';

export const useSketchfabUtility = ({
    autoStart,
    iframeRef,
    sketchfabId,
}: {
    autoStart: boolean;
    iframeRef: MutableRefObject<HTMLIFrameElement | null>;
    sketchfabId: string;
}) => {
    const [isSketchfabLoaded, setIsSketchfabLoaded] = useState(false);
    const [sketchfabUtility, setSketchfabUtility] =
        useState<TypeSketchfabUtility>();

    useEffect(() => {
        const utilityInstance = new (SketchfabAPIUtility as any)(
            sketchfabId,
            iframeRef.current,
            {
                autostart: autoStart ? 1 : 0,
                annotations_visible: 1,
                ui_infos: 0,
                ui_help: 0,
                ui_fullscreen: 0,
                ui_watermark: 0,
            }
        );

        const onSketchfabUtilityInitialized = () => {
            setSketchfabUtility(utilityInstance);
            setIsSketchfabLoaded(true);
        };

        utilityInstance.addEventListener(
            utilityInstance.EVENT_INITIALIZED,
            onSketchfabUtilityInitialized
        );

        utilityInstance.create();

        return () => {
            utilityInstance.removeEventListener(
                utilityInstance.EVENT_INITIALIZED,
                onSketchfabUtilityInitialized
            );
        };
    }, [autoStart, iframeRef, sketchfabId]);

    return {
        isSketchfabLoaded,
        sketchfabUtility,
    };
};

export default useSketchfabUtility;
