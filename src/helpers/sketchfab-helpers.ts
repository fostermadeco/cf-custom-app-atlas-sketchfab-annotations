const hiddenNodeNameSuffix = '_noshow';
const inactiveNodeNameSuffix = '_moved';

export type TypeSketchfabAnnotation = {
    name: string;
};

export type TypeSketchfabApi = {
    addEventListener: (event: string, callback: (data: any) => void) => void;
    getAnnotationList: (
        callback: (
            error: string,
            annotations: TypeSketchfabAnnotation[]
        ) => void
    ) => void;

    getNodeMap: (
        callback: (error: string, nodes: TypeSketchfabNodeMap) => void
    ) => void;

    gotoAnnotation: (annotationId: number, _: object, __: () => void) => void;
    hide: (nodeId: number) => void;
    removeEventListener: (event: string, callback: (data: any) => void) => void;
    show: (nodeId: number) => void;
    showAnnotation: (annotationId: number) => void;
};

export type TypeSketchfabNode = {
    instanceID: number;
    name: string;
    type: string;
};

export type TypeSketchfabNodeMap = { [key: string]: TypeSketchfabNode };
export type TypeSketchfabUtility = {
    api: TypeSketchfabApi;
};

export const getAnnotationChips = (annotations: TypeSketchfabAnnotation[]) => {
    return annotations.map((annotation, index) => ({
        id: index.toString(),
        label: annotation.name,
    }));
};

export const getAnnotations = (
    api: TypeSketchfabApi
): Promise<TypeSketchfabAnnotation[]> => {
    return new Promise((resolve, reject) => {
        api.getAnnotationList((error, annotations) => {
            if (error) {
                console.log('There was an error getting annotations', error);
                reject(error);
                return;
            }

            resolve(annotations);
        });
    });
};

export const getNodeMap = (
    api: TypeSketchfabApi
): Promise<TypeSketchfabNodeMap> => {
    return new Promise((resolve, reject) => {
        api.getNodeMap((error, nodes) => {
            if (error) {
                console.log(`There was an error retrieving nodes ${error}`);
                reject(error);
                return;
            }

            resolve(nodes);
        });
    });
};

export const getNodesForVisibility = (nodes: TypeSketchfabNodeMap) => {
    const nodesAsArray = Object.entries(nodes);
    const nodesFiltered = nodesAsArray.filter(([_, value]) => {
        const { name = '', type } = value;

        // only use matrix transform nodes, not groups, geometry,etc.
        if (type !== 'MatrixTransform') {
            return false;
        }

        // Exclude RootNode
        if (name === 'RootNode') {
            return false;
        }

        // Exclude items with name like '20f23353947a4cea9d3507bf0fab3742.fbx'
        if (name.includes('.fbx')) {
            return false;
        }

        // Exclude hidden or inactive nodes
        if (
            name.endsWith(hiddenNodeNameSuffix) ||
            name.endsWith(inactiveNodeNameSuffix)
        ) {
            return false;
        }

        return true;
    });

    return nodesFiltered.map((node) => node[1]);
};

export const getNodesToHide = (nodes: TypeSketchfabNodeMap) => {
    const hiddenNodeNameSuffix = '_noshow';
    const inactiveNodeNameSuffix = '_moved';
    const nodesAsArray = Object.entries(nodes);

    return nodesAsArray.filter(([_, value]) => {
        const { name = '' } = value;
        return (
            name.endsWith(hiddenNodeNameSuffix) ||
            name.endsWith(inactiveNodeNameSuffix)
        );
    });
};
