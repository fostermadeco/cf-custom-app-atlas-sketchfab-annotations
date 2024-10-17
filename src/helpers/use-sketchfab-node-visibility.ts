'use client';

import uniq from 'lodash.uniq';
import { useEffect, useState } from 'react';
import {
    TypeSketchfabNode,
    TypeSketchfabUtility,
    getNodeMap,
    getNodesForVisibility,
    getNodesToHide,
} from './sketchfab-helpers';

const useSketchfabNodeVisibility = (
    sketchfabUtility?: TypeSketchfabUtility
) => {
    const [hiddenNodeIds, setHiddenNodeIds] = useState<number[]>([]);
    const [nodesForVisibilityToggle, setNodesForVisibilityToggle] =
        useState<TypeSketchfabNode[]>();

    useEffect(() => {
        if (!sketchfabUtility) {
            return;
        }

        (async () => {
            const nodes = await getNodeMap(sketchfabUtility.api);

            setNodesForVisibilityToggle(getNodesForVisibility(nodes));

            const nodesToHide = getNodesToHide(nodes);
            nodesToHide.forEach(([_, node]) => {
                sketchfabUtility.api.hide(node.instanceID);
            });
        })();
    }, [sketchfabUtility]);

    const getIsNodeHidden = (id: number) =>
        !!hiddenNodeIds.find((hiddenNodeId) => hiddenNodeId === id);

    const hideNode = (id: number) => {
        setHiddenNodeIds(uniq([...hiddenNodeIds, id]));

        if (sketchfabUtility) {
            sketchfabUtility.api.hide(id);
        }
    };

    const toggleNodeVisibility = (id: number) => {
        if (getIsNodeHidden(id)) {
            unhideNode(id);
        } else {
            hideNode(id);
        }
    };

    const unhideAllNodes = () => {
        hiddenNodeIds.forEach((id) => {
            if (sketchfabUtility) {
                sketchfabUtility.api.show(id);
            }
        });

        setHiddenNodeIds([]);
    };

    const unhideNode = (id: number) => {
        const foundIndex = hiddenNodeIds.findIndex(
            (hiddenNodeId) => hiddenNodeId === id
        );

        if (foundIndex >= 0) {
            setHiddenNodeIds((prev) => {
                const copy = [...prev];
                copy.splice(foundIndex, 1);
                return copy;
            });
        }

        if (sketchfabUtility) {
            sketchfabUtility.api.show(id);
        }
    };

    return {
        hiddenNodeIds,
        nodesForVisibilityToggle,
        hideNode,
        toggleNodeVisibility,
        unhideAllNodes,
    };
};

export default useSketchfabNodeVisibility;
