import {
    getAnnotationChips,
    getAnnotations,
    getNodeMap,
    getNodesForVisibility,
    getNodesToHide,
} from './sketchfab-helpers';

const apiMockBase = {
    getAnnotationList: jest.fn(),
    getNodeMap: jest.fn(),
    gotoAnnotation: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    showAnnotation: jest.fn(),
};

const annotationsMock = [
    {
        name: 'Annotation 1',
    },
    {
        name: 'Annotation 2',
    },
    {
        name: 'Annotation 3',
    },
];

const nodeMapMock = {
    node1: {
        instanceID: 1,
        name: 'Node 1',
        type: 'type1',
    },
    node2: {
        instanceID: 2,
        name: 'Node 2',
        type: 'type2',
    },
};

describe('SketchfabHelpers', () => {
    it('should transform annotations to an array of chips', () => {
        const expected = [
            {
                id: '0',
                label: 'Annotation 1',
            },
            {
                id: '1',
                label: 'Annotation 2',
            },
            {
                id: '2',
                label: 'Annotation 3',
            },
        ];

        const result = getAnnotationChips(annotationsMock);
        expect(result).toEqual(expected);
    });

    it('should get annotations from the api', async () => {
        const apiMock = {
            ...apiMockBase,
            getAnnotationList: jest.fn((callback) => {
                callback(null, annotationsMock);
            }),
        };

        const result = await getAnnotations(apiMock);
        expect(result).toEqual(annotationsMock);
    });

    it('should throw an error while getting annotations from the api', async () => {
        const errorMessage = 'This is a fake error';
        const apiMock = {
            ...apiMockBase,
            getAnnotationList: jest.fn((callback) => {
                callback(errorMessage);
            }),
        };

        try {
            await getAnnotations(apiMock);
        } catch (error) {
            expect(error).toEqual(errorMessage);
        }
    });

    it('should get node map from the api', async () => {
        const apiMock = {
            ...apiMockBase,
            getNodeMap: jest.fn((callback) => {
                callback(null, nodeMapMock);
            }),
        };

        const result = await getNodeMap(apiMock);
        expect(result).toEqual(nodeMapMock);
    });

    it('should throw an error while getting node map from the api', async () => {
        const errorMessage = 'This is a fake error';
        const apiMock = {
            ...apiMockBase,
            getNodeMap: jest.fn((callback) => {
                callback(errorMessage);
            }),
        };

        try {
            await getNodeMap(apiMock);
        } catch (error) {
            expect(error).toEqual(errorMessage);
        }
    });

    it('should convert nodes to an array, filtering out the appropriate content', () => {
        const nodes = {
            1: {
                instanceID: 1,
                name: 'Should be included',
                type: 'MatrixTransform',
            },
            2: {
                instanceID: 2,
                name: 'Node 2',
                type: 'Other',
            },
            3: {
                instanceID: 3,
                name: 'RootNode',
                type: 'MatrixTransform',
            },
            4: {
                instanceID: 4,
                name: 'Should be included',
                type: 'MatrixTransform',
            },
            5: {
                instanceID: 5,
                name: 'filterme.fbx',
                type: 'MatrixTransform',
            },
            6: {
                instanceID: 6,
                name: 'filterme_noshow',
                type: 'MatrixTransform',
            },
            7: {
                instanceID: 7,
                name: 'Should be included',
                type: 'MatrixTransform',
            },
            8: {
                instanceID: 8,
                name: 'filterme_moved',
                type: 'MatrixTransform',
            },
        };

        const result = getNodesForVisibility(nodes);
        expect(result).toEqual([nodes[1], nodes[4], nodes[7]]);
    });

    it('should convert nodes to an array, filtering out the root node', () => {
        const nodes = {
            0: {
                instanceID: 1,
                name: 'RootNode',
                type: 'MatrixTransform',
            },
            1: {
                instanceID: 2,
                name: 'Node 2',
                type: 'MatrixTransform',
            },
        };

        const result = getNodesForVisibility(nodes);
        expect(result).toEqual([nodes[1]]);
    });

    it('should get nodes to hide', () => {
        const nodes = {
            1: {
                instanceID: 1,
                name: "Don't hide me",
                type: 'MatrixTransform',
            },
            2: {
                instanceID: 2,
                name: 'filterme_noshow',
                type: 'MatrixTransform',
            },
            3: {
                instanceID: 3,
                name: "Don't hide me",
                type: 'MatrixTransform',
            },
            4: {
                instanceID: 4,
                name: 'filterme_moved',
                type: 'MatrixTransform',
            },
        };

        const result = getNodesToHide(nodes);
        expect(result).toEqual([
            ['2', nodes[2]],
            ['4', nodes[4]],
        ]);
    });
});
