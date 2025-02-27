/* eslint-disable */
// code by shaderbytes//

import { TypeSketchfabApi } from './sketchfab-helpers';

const VERSION = '1.5.2';

type TypeSketchfabAPIUtility = {
    animationClips: any;
    animationPreprocessCompleted: any;
    animationTimerIntervalID: any;
    annotationLength: any;
    annotationPreprocessCompleted: any;
    annotations: any;
    api: any;
    client: any;
    clientInitObject: any;
    currentAnnotationIndex: any;
    currentAnnotationObject: any;
    enableDebugLogging: any;
    eventListeners: any;
    gamma: any;
    iframe: any;
    isInitialized: any;
    materialHash: any;
    materialPreprocessCompleted: any;
    materialsUIDPending: any;
    nodeHash: any;
    nodeHashIDMap: any;
    nodePreprocessCompleted: any;
    nodeTypeGeometry: any;
    nodeTypeGroup: any;
    nodeTypeMatrixtransform: any;
    nodeTypeRigGeometry: any;
    sceneTexturesPreprocessCompleted: any;
    textureCache: any;
    urlID: any;
    vectorForward: any;

    EVENT_INITIALIZED: any;
    EVENT_CLICK: any;
    EVENT_MOUSE_ENTER: any;
    EVENT_MOUSE_LEAVE: any;
    EVENT_TEXTURE_APPLIED: any;
    EVENT_TEXTURE_LOADED: any;
    EVENT_ANNOTATION_CHANGED: any;
    EVENT_ANNOTATION_MOUSE_ENTER: any;
    EVENT_ANNOTATION_MOUSE_LEAVE: any;

    // functions
    addEventListener: any;
    addTexture: any;
    annotationChanged: any;
    applyMaterialUIDPending: any;
    create: any;
    dispatchEvent: any;
    generateAnimationControls: any;
    generateAnnotationControls: any;
    generateMaterialHash: any;
    generateNodeHashRecursive: any;
    generateNodeName: any;
    getChannelObject: any;
    getfirstAncestorOfTypeGroup: any;
    getfirstAncestorOfTypeMatrixTransform: any;
    getMaterialObject: any;
    getNodeObject: any;
    getSceneTextures: any;
    gotoAnnotation: any;
    handleNode: any;
    onAnnotationMouseEnter: any;
    onAnnotationMouseLeave: any;
    onClick: any;
    onClientError: any;
    onClientInit: any;
    onNodeMouseEnter: any;
    onNodeMouseLeave: any;
    onViewerReady: any;
    refreshMatrix: any;
    removeEventListener: any;
    setChannelProperties: any;
    setChannelPropertiesActual: any;
    setColor: any;
    setPosition: any;
    setTextureProperties: any;
    setTexturePropertiesActual: any;
    srgbToLinear: any;
    translate: any;
    validateUtilGenerationPreprocess: any;
};

function SketchfabAPIUtility(
    this: TypeSketchfabAPIUtility,
    urlIDRef: string,
    iframeRef: HTMLIFrameElement,
    clientInitObjectRef: {
        [key: string]: any;
    }
) {
    const classScope = this;
    this.api = null;
    this.client = null;
    this.clientInitObject = { merge_materials: 0, graph_optimizer: 0 }; // if you want any default init options hard coded just add them here
    if (clientInitObjectRef) {
        for (var prop in clientInitObjectRef) {
            classScope.clientInitObject[prop] = clientInitObjectRef[prop];
        }
    }

    this.textureCache = {};
    this.isInitialized = false;
    this.iframe = iframeRef;
    this.urlID = urlIDRef;
    this.materialHash = {};
    this.nodeHash = {}; // node hash stores matrix transform nodes by name
    this.materialsUIDPending = {};
    this.nodeTypeMatrixtransform = 'MatrixTransform';
    this.nodeTypeGeometry = 'Geometry';
    this.nodeTypeGroup = 'Group';
    this.nodeTypeRigGeometry = 'RigGeometry';

    classScope.nodeHash[classScope.nodeTypeMatrixtransform] = {};
    classScope.nodeHash[classScope.nodeTypeGeometry] = {};
    classScope.nodeHash[classScope.nodeTypeGroup] = {};
    classScope.nodeHash[classScope.nodeTypeRigGeometry] = {};

    this.nodeHashIDMap = {};
    this.eventListeners = {};
    this.enableDebugLogging = false;

    this.vectorForward = [0, -1, 0];
    this.gamma = 2.4;
    this.annotations = [];
    this.animationClips = {};
    this.annotationLength = 0;
    this.currentAnnotationIndex = -1;
    this.currentAnnotationObject;
    this.animationTimerIntervalID = null;

    //preprocessflags
    this.materialPreprocessCompleted = false;
    this.nodePreprocessCompleted = false;
    this.annotationPreprocessCompleted = false;
    this.animationPreprocessCompleted = false;
    this.sceneTexturesPreprocessCompleted = false;

    this.EVENT_INITIALIZED = 'event_initialized';
    this.EVENT_CLICK = 'event_click';
    this.EVENT_MOUSE_ENTER = 'event_mouse_enter';
    this.EVENT_MOUSE_LEAVE = 'event_mouse_leave';
    this.EVENT_TEXTURE_APPLIED = 'event_texture_applied';
    this.EVENT_ANNOTATION_CHANGED = 'event_annotation_changed';
    this.EVENT_ANNOTATION_MOUSE_ENTER = 'event_annotation_mouse_enter';
    this.EVENT_ANNOTATION_MOUSE_LEAVE = 'event_annotation_mouse_leave';

    this.create = function () {
        classScope.client = new window.Sketchfab(VERSION, classScope.iframe);
        classScope.clientInitObject.success = classScope.onClientInit;
        classScope.clientInitObject.error = classScope.onClientError;
        classScope.client.init(classScope.urlID, classScope.clientInitObject);
    };

    this.onClientError = function () {
        console.error(
            'a call to "init()" on the sketchfab client object has failed'
        );
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onClientInit = function (apiRef: TypeSketchfabApi) {
        classScope.api = apiRef;
        classScope.api.addEventListener(
            'viewerready',
            classScope.onViewerReady
        );
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onViewerReady = function () {
        //prepare data for ease of use

        //for each call into the api that gets used for preprocesing a flag should be created which can be validated to decide that the
        //utility has finished all preprocessing
        classScope.api.getMaterialList(classScope.generateMaterialHash);
        classScope.api.getSceneGraph(classScope.generateNodeHashRecursive);
        classScope.api.getAnnotationList(classScope.generateAnnotationControls);
        classScope.api.getAnimations(classScope.generateAnimationControls);
        classScope.api.getTextureList(classScope.getSceneTextures);
        //possible other calls here ...
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getSceneTextures = function (err: any, textures: any) {
        if (err) {
            console.log('Error when calling getSceneTextures');
            return;
        }

        if (classScope.enableDebugLogging) {
            console.log('textures listing');
            console.log(textures);
        }

        for (let i = 0; i < textures.length; i++) {
            const UIDKey = textures[i].name.split('.')[0];
            classScope.textureCache[UIDKey] = textures[i].uid;
        }

        classScope.sceneTexturesPreprocessCompleted = true;
        classScope.validateUtilGenerationPreprocess();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.validateUtilGenerationPreprocess = function () {
        //validate all used preprocess flags
        if (
            classScope.materialPreprocessCompleted &&
            classScope.nodePreprocessCompleted &&
            classScope.annotationPreprocessCompleted &&
            classScope.animationPreprocessCompleted &&
            classScope.sceneTexturesPreprocessCompleted
        ) {
            classScope.isInitialized = true;
            classScope.dispatchEvent(classScope.EVENT_INITIALIZED, true);
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.generateAnimationControls = function (err: any, animations: any) {
        if (err) {
            console.log('Error when calling getAnimations');
            return;
        }

        if (classScope.enableDebugLogging) {
            console.log('animation listing');
            console.log(animations);
        }

        for (let i = 0; i < animations.length; i++) {
            const ob = (classScope.animationClips[animations[i][1]] = {
                name: '',
                uid: '',
                length: 0,
            });

            ob.name = animations[i][1];
            ob.uid = animations[i][0];
            ob.length = animations[i][2];
        }

        classScope.animationPreprocessCompleted = true;
        classScope.validateUtilGenerationPreprocess();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.generateMaterialHash = function (err: any, materials: any) {
        if (err) {
            console.log('Error when calling getMaterialList');
            return;
        }
        if (classScope.enableDebugLogging) {
            console.log('materials listing');
        }
        for (let i = 0; i < materials.length; i++) {
            classScope.materialHash[materials[i].name] = materials[i];
            if (classScope.enableDebugLogging) {
                console.log('name: ' + materials[i].name);
            }
        }
        classScope.materialPreprocessCompleted = true;
        classScope.validateUtilGenerationPreprocess();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.addEventListener = function (event: any, func: any) {
        if (
            classScope.eventListeners[event] === null ||
            classScope.eventListeners[event] === undefined
        ) {
            classScope.eventListeners[event] = [];
            if (event == classScope.EVENT_CLICK) {
                if (classScope.isInitialized) {
                    classScope.api.addEventListener(
                        'click',
                        classScope.onClick,
                        { pick: 'slow' }
                    );
                } else {
                    console.log(
                        'a call to add a click event listener has been rejected because this utility has not completed initialization'
                    );
                    return;
                }
            }

            if (event == classScope.EVENT_MOUSE_ENTER) {
                if (classScope.isInitialized) {
                    classScope.api.addEventListener(
                        'nodeMouseEnter',
                        classScope.onNodeMouseEnter,
                        { pick: 'slow' }
                    );
                } else {
                    console.log(
                        'a call to add a mouse enter event listener has been rejected because this utility has not completed initialization'
                    );
                    return;
                }
            }

            if (event == classScope.EVENT_MOUSE_LEAVE) {
                if (classScope.isInitialized) {
                    classScope.api.addEventListener(
                        'nodeMouseLeave',
                        classScope.onNodeMouseLeave,
                        { pick: 'slow' }
                    );
                } else {
                    console.log(
                        'a call to add a mouse leave event listener has been rejected because this utility has not completed initialization'
                    );
                    return;
                }
            }

            if (event == classScope.EVENT_ANNOTATION_MOUSE_ENTER) {
                if (classScope.isInitialized) {
                    classScope.api.addEventListener(
                        'annotationMouseEnter',
                        classScope.onAnnotationMouseEnter
                    );
                } else {
                    console.log(
                        'a call to add a annotation enter event listener has been rejected because this utility has not completed initialization'
                    );
                    return;
                }
            }

            if (event == classScope.EVENT_ANNOTATION_MOUSE_LEAVE) {
                if (classScope.isInitialized) {
                    classScope.api.addEventListener(
                        'annotationMouseLeave',
                        classScope.onAnnotationMouseLeave
                    );
                } else {
                    console.log(
                        'a call to add a annotation leave event listener has been rejected because this utility has not completed initialization'
                    );
                    return;
                }
            }
        }
        classScope.eventListeners[event].push(func);
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.removeEventListener = function (event: any, func: any) {
        if (classScope.eventListeners[event] !== null) {
            for (
                let i = classScope.eventListeners[event].length - 1;
                i >= 0;
                i--
            ) {
                if (classScope.eventListeners[event][i] == func) {
                    classScope.eventListeners[event].splice(i, 1);
                }
            }
            if (classScope.eventListeners[event].length === 0) {
                classScope.eventListeners[event] = null;
                if (event == classScope.EVENT_CLICK) {
                    classScope.api.removeEventListener(
                        'click',
                        classScope.onClick
                    );
                }

                if (event == classScope.EVENT_MOUSE_ENTER) {
                    classScope.api.removeEventListener(
                        'nodeMouseEnter',
                        classScope.onNodeMouseEnter
                    );
                }

                if (event == classScope.EVENT_MOUSE_LEAVE) {
                    classScope.api.removeEventListener(
                        'nodeMouseLeave',
                        classScope.onNodeMouseLeave
                    );
                }

                if (event == classScope.EVENT_ANNOTATION_MOUSE_ENTER) {
                    classScope.api.removeEventListener(
                        'annotationMouseEnter',
                        classScope.onAnnotationMouseEnter
                    );
                }

                if (event == classScope.EVENT_ANNOTATION_MOUSE_LEAVE) {
                    classScope.api.removeEventListener(
                        'annotationMouseLeave',
                        classScope.onAnnotationMouseLeave
                    );
                }
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.dispatchEvent = function (eventName: any, eventObject: any) {
        const eventArray = classScope.eventListeners[eventName];
        if (eventArray !== null && eventArray !== undefined) {
            for (let i = 0; i < eventArray.length; i++) {
                eventArray[i](eventObject);
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // this function will bubble the object graph until an object of type group is found
    this.getfirstAncestorOfTypeGroup = function (node: any) {
        let firstAncestorOfTypeGroup = node.parent;
        if (
            firstAncestorOfTypeGroup !== null &&
            firstAncestorOfTypeGroup !== undefined
        ) {
            while (firstAncestorOfTypeGroup.type !== classScope.nodeTypeGroup) {
                firstAncestorOfTypeGroup = firstAncestorOfTypeGroup.parent;
            }
        }
        return firstAncestorOfTypeGroup;
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // this function bubble the object graph until an object of type Matrix Transform is found
    this.getfirstAncestorOfTypeMatrixTransform = function (node: any) {
        let firstAncestorOfTypeMatrixTransform = node.parent;
        if (
            firstAncestorOfTypeMatrixTransform !== null &&
            firstAncestorOfTypeMatrixTransform !== undefined
        ) {
            while (
                firstAncestorOfTypeMatrixTransform.type !==
                classScope.nodeTypeMatrixtransform
            ) {
                firstAncestorOfTypeMatrixTransform =
                    firstAncestorOfTypeMatrixTransform.parent;
            }
        }
        return firstAncestorOfTypeMatrixTransform;
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.onClick = function (e: any) {
        if (
            e.instanceID === null ||
            e.instanceID === undefined ||
            e.instanceID === -1
        ) {
            return;
        }

        const node = classScope.getNodeObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup =
            classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform =
            classScope.getfirstAncestorOfTypeMatrixTransform(node);
        classScope.dispatchEvent(classScope.EVENT_CLICK, e);
    };

    this.onNodeMouseEnter = function (e: any) {
        if (
            e.instanceID === null ||
            e.instanceID === undefined ||
            e.instanceID === -1
        ) {
            return;
        }

        const node = classScope.getNodeObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup =
            classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform =
            classScope.getfirstAncestorOfTypeMatrixTransform(node);
        classScope.dispatchEvent(classScope.EVENT_MOUSE_ENTER, e);
    };

    this.onNodeMouseLeave = function (e: any) {
        if (
            e.instanceID === null ||
            e.instanceID === undefined ||
            e.instanceID === -1
        ) {
            return;
        }

        const node = classScope.getNodeObject(e.instanceID);
        e.node = node;
        e.firstAncestorOfTypeGroup =
            classScope.getfirstAncestorOfTypeGroup(node);
        e.firstAncestorOfTypeMatrixTransform =
            classScope.getfirstAncestorOfTypeMatrixTransform(node);
        classScope.dispatchEvent(classScope.EVENT_MOUSE_LEAVE, e);
    };

    this.onAnnotationMouseEnter = function (index: number) {
        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        classScope.dispatchEvent(
            classScope.EVENT_ANNOTATION_MOUSE_ENTER,
            classScope.annotations[index]
        );
    };

    this.onAnnotationMouseLeave = function (index: number) {
        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        classScope.dispatchEvent(
            classScope.EVENT_ANNOTATION_MOUSE_LEAVE,
            classScope.annotations[index]
        );
    };

    this.generateNodeName = function (node: any) {
        if (
            node.name === null ||
            node.name === undefined ||
            node.name === 'undefined'
        ) {
            return 'undefined_' + node.instanceID;
        } else {
            return node.name;
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.handleNode = function (node: any, types: any, parent: any) {
        if (types.indexOf(node.type) >= 0) {
            const nodeTypeCurrent = node.type;
            const nodeNameCurrent = classScope.generateNodeName(node);
            node.name = nodeNameCurrent;

            const n = classScope.nodeHash[nodeTypeCurrent];

            node.isVisible = true;
            node.localMatrixCached = node.localMatrix;
            node.parent = parent;
            node.index = 0;

            if (
                n[nodeNameCurrent] !== undefined &&
                n[nodeNameCurrent] !== null
            ) {
                if (!Array.isArray(n[nodeNameCurrent])) {
                    const nodeTemp = n[nodeNameCurrent];
                    n[nodeNameCurrent] = null;
                    n[nodeNameCurrent] = [];
                    n[nodeNameCurrent].push(nodeTemp);
                    nodeTemp.index = n[nodeNameCurrent].length - 1;
                    n[nodeNameCurrent].push(node);
                    node.index = n[nodeNameCurrent].length - 1;
                    classScope.nodeHashIDMap[node.instanceID] =
                        n[nodeNameCurrent];
                } else {
                    n[nodeNameCurrent].push(node);
                    node.index = n[nodeNameCurrent].length - 1;
                    classScope.nodeHashIDMap[node.instanceID] =
                        n[nodeNameCurrent];
                }
            } else {
                n[nodeNameCurrent] = node;
                classScope.nodeHashIDMap[node.instanceID] = n[nodeNameCurrent];
            }
            if (node.children === null || node.children === undefined) {
                return;
            }

            if (node.children.length === 0) {
                return;
            } else {
                // recurse through the children
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    this.handleNode(child, types, node);
                }
            }
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.generateNodeHashRecursive = function (err: any, root: any) {
        if (err) {
            console.log('Error when calling getSceneGraph', err);
            return;
        }

        const types = [
            classScope.nodeTypeMatrixtransform,
            classScope.nodeTypeGeometry,
            classScope.nodeTypeGroup,
            classScope.nodeTypeRigGeometry,
        ];

        classScope.handleNode(root, types, null);

        if (classScope.enableDebugLogging) {
            for (let m = 0; m < types.length; m++) {
                console.log(' ');
                console.log('nodes listing ' + types[m]);
                const p = classScope.nodeHash[types[m]];
                for (const key in p) {
                    if (Array.isArray(p[key])) {
                        console.log(
                            'multiple nodes with same name ,use name and index to reference a single instance, if no index is passed in conjunction with this name, all nodes with this name would be affected: '
                        );
                        for (let i = 0; i < p[key].length; i++) {
                            console.log(
                                'name: ' + p[key][i].name + ' index: ' + i
                            );
                        }
                    } else {
                        console.log(
                            'unique node name, use only name to retrieve: '
                        );
                        console.log('name: ' + p[key].name);
                    }
                }
            }
        }

        classScope.nodePreprocessCompleted = true;
        classScope.validateUtilGenerationPreprocess();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.annotationChanged = function (index: number) {
        if (isNaN(index)) {
            return;
        }
        if (index === -1) {
            return;
        }
        classScope.currentAnnotationIndex = index;
        classScope.currentAnnotationObject =
            classScope.annotations[classScope.currentAnnotationIndex];
        classScope.dispatchEvent(
            classScope.EVENT_ANNOTATION_CHANGED,
            classScope.currentAnnotationObject
        );
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.generateAnnotationControls = function (err: any, annotations: any) {
        if (err) {
            console.log('Error when calling getAnnotationList');
            return;
        }
        if (classScope.enableDebugLogging) {
            console.log('annotations listing');
            console.log(annotations);
        }

        classScope.annotations = annotations;
        classScope.annotationLength = annotations.length;
        for (let i = 0; i < annotations.length; i++) {
            classScope.annotations[i].description =
                classScope.annotations[i].content.raw || '';
        }

        classScope.annotationPreprocessCompleted = true;

        if (classScope.annotationLength > 0) {
            classScope.api.addEventListener(
                'annotationSelect',
                classScope.annotationChanged
            );
        }

        classScope.validateUtilGenerationPreprocess();
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.gotoAnnotation = function (index: number) {
        if (classScope.annotationLength === 0) return;
        if (isNaN(index)) {
            console.error(
                'A call to gotoAnnotation requires you pass in a number for the index'
            );
            return;
        }

        //cap the ranges incase they are out of bounds
        if (index >= classScope.annotationLength) {
            index = classScope.annotationLength - 1;
        } else if (index < 0) {
            index = 0;
        }
        classScope.currentAnnotationIndex = index;
        classScope.currentAnnotationObject =
            classScope.annotations[classScope.currentAnnotationIndex];
        classScope.api.gotoAnnotation(classScope.currentAnnotationIndex);
    };

    //--------------------------------------------------------------------------------------------------------------------------
    // key can be a name or an instance id.
    this.getNodeObject = function (
        key: string | number,
        nodeIndex: any,
        currentNodeType: any
    ) {
        let dataObjectRef;
        const nodeTypeCurrent =
            currentNodeType || classScope.nodeTypeMatrixtransform;

        if (typeof key === 'string') {
            dataObjectRef = classScope.nodeHash[nodeTypeCurrent][key];
        } else {
            dataObjectRef = classScope.nodeHashIDMap[key];
        }

        if (dataObjectRef === null || dataObjectRef === undefined) {
            console.error(
                'a call to  getNodeObject using ' +
                    currentNodeType +
                    ' list id and using node name ' +
                    key +
                    ' has failed , no such node found'
            );
            return null;
        }

        if (nodeIndex !== null) {
            if (Array.isArray(dataObjectRef)) {
                if (nodeIndex < 0 || nodeIndex >= dataObjectRef.length) {
                    console.error(
                        'a call to  getNodeObject using node name ' +
                            key +
                            ' has failed , the nodeIndex is out of range. You can pass an array index ranging : 0 - ' +
                            (dataObjectRef.length - 1)
                    );
                    return;
                } else {
                    dataObjectRef = dataObjectRef[nodeIndex];
                }
            }
        }

        // take note the returned object could be a direct reference to the node object if it is unique , or it returns an array of node objects if they share the same name
        //or it could be a direct refrence to the node object within the array if you passed in a nodeIndex and the name is mapped to an array

        return dataObjectRef;
    };

    this.refreshMatrix = function (key: any) {
        console.log('refreshMatrix called');
        const dataObjectRef = classScope.getNodeObject(
            key,
            null,
            classScope.nodeTypeMatrixtransform
        );
        if (dataObjectRef !== null && dataObjectRef !== undefined) {
            function matrixRefreshed(err: any, matrices: any) {
                console.log('matrixRefreshed called');
                if (err) {
                    console.log(
                        'an error occured while called refreshMatrix. Error: ' +
                            err
                    );
                    return;
                }
                for (const prop in matrices) {
                    console.log(prop + ' = ' + matrices[prop]);
                }
                dataObjectRef.localMatrix = matrices.local;
                dataObjectRef.localMatrixisCached = null;
            }
            console.log('about to call getMatrix');
            classScope.api.getMatrix(dataObjectRef.instanceID, matrixRefreshed);
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setPosition = function (
        key: any,
        position: any,
        duration: any,
        easing: any,
        callback: any
    ) {
        if (duration === null || duration === undefined) {
            duration = 1;
        }

        const dataObjectRef = classScope.getNodeObject(
            key,
            null,
            classScope.nodeTypeMatrixtransform
        );
        let dataObjectRefSingle;
        if (dataObjectRef !== null && dataObjectRef !== undefined) {
            if (Array.isArray(dataObjectRef)) {
                console.log(
                    'multiple nodes returned during call to setPosition, first node will be used'
                );
                dataObjectRefSingle = dataObjectRef[0];
            } else {
                dataObjectRefSingle = dataObjectRef;
            }

            function onTranslate(err: any, position: any) {
                if (err) {
                    console.log(
                        'an error occured while called setPosition. Error: ' +
                            err
                    );
                    return;
                }

                classScope.refreshMatrix(key);
                if (callback) {
                    callback(err, position);
                }
            }

            classScope.api.translate(
                dataObjectRefSingle.instanceID,
                position,
                { duration: duration, easing: easing },
                onTranslate
            );
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.translate = function (
        key: any,
        direction: any,
        distance: any,
        duration: any,
        easing: any,
        callback: any
    ) {
        const dataObjectRef = classScope.getNodeObject(
            key,
            null,
            classScope.nodeTypeMatrixtransform
        );
        let dataObjectRefSingle;
        if (dataObjectRef !== null && dataObjectRef !== undefined) {
            if (direction === null || direction === undefined) {
                direction = classScope.vectorForward;
            }
            if (distance === null || distance === undefined) {
                distance = 1;
            }
            if (Array.isArray(dataObjectRef)) {
                console.log(
                    'multiple nodes returned during call to translate, first node will be used'
                );
                dataObjectRefSingle = dataObjectRef[0];
            } else {
                dataObjectRefSingle = dataObjectRef;
            }

            const currentPosition = [
                dataObjectRefSingle.localMatrix[12],
                dataObjectRefSingle.localMatrix[13],
                dataObjectRefSingle.localMatrix[14],
            ];
            const newPosition = [
                currentPosition[0] + direction[0] * distance,
                currentPosition[1] + direction[1] * distance,
                currentPosition[2] + direction[2] * distance,
            ];
            //write new position back into matrix
            dataObjectRefSingle.localMatrix[12] = newPosition[0];
            dataObjectRefSingle.localMatrix[13] = newPosition[1];
            dataObjectRefSingle.localMatrix[14] = newPosition[2];
            classScope.api.translate(
                dataObjectRefSingle.instanceID,
                newPosition,
                { duration: duration, easing: easing },
                callback
            );
        }
    };

    this.getMaterialObject = function (materialName: string) {
        const materialObjectRef = classScope.materialHash[materialName];
        if (materialObjectRef === null || materialObjectRef === undefined) {
            console.error(
                'a call to getMaterialObject using material name ' +
                    materialName +
                    ' has failed , no such material found'
            );
            return null;
        }

        return materialObjectRef;
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getChannelObject = function (
        materialObjectRef: any,
        channelName: string
    ) {
        const channelObjectRef = materialObjectRef.channels[channelName];
        if (channelObjectRef === null || channelObjectRef === undefined) {
            console.error(
                'a call to getChannelObject using channelName name ' +
                    channelName +
                    ' has failed , no such channelName found'
            );
            return null;
        }
        return channelObjectRef;
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setChannelProperties = function (
        materialName: string,
        channelName: string,
        channelObjectDefaults: any
    ) {
        const materialObjectRef = classScope.getMaterialObject(materialName);
        const channelObjectRef = classScope.getChannelObject(
            materialObjectRef,
            channelName
        );
        classScope.setChannelPropertiesActual(
            channelObjectRef,
            channelObjectDefaults
        );
        classScope.api.setMaterial(materialObjectRef); // call to update material added here , for users to see effects without having to call to update the material themselves
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setChannelPropertiesActual = function (
        channelObjectRef: any,
        channelObjectDefaults: any
    ) {
        for (const prop in channelObjectDefaults) {
            channelObjectRef[prop] = channelObjectDefaults[prop];
        }
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setTextureProperties = function (
        materialName: string,
        channelName: string,
        textureObjectDefaults: any
    ) {
        // this function does not update the material , it just sets the new channel values locally , this would then be picked up by some later calls to update material, like with pending material calls for texture handling etc..
        const materialObjectRef = classScope.getMaterialObject(materialName);
        const channelObjectRef = classScope.getChannelObject(
            materialObjectRef,
            channelName
        );
        classScope.setTexturePropertiesActual(
            channelObjectRef,
            textureObjectDefaults
        );
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.setTexturePropertiesActual = function (
        channelObjectRef: any,
        textureObjectDefaults: any
    ) {
        if (
            channelObjectRef.texture !== null &&
            channelObjectRef.texture !== undefined
        ) {
            for (const prop in textureObjectDefaults) {
                channelObjectRef.texture[prop] = textureObjectDefaults[prop];
            }
        }
    };

    this.applyMaterialUIDPending = function (UIDKey: string) {
        if (UIDKey !== null && UIDKey !== undefined && UIDKey !== '') {
            let storage = classScope.materialsUIDPending[UIDKey];
            const uid = classScope.textureCache[UIDKey];
            if (storage !== null && storage !== undefined) {
                for (let i = 0; i < storage.length; i++) {
                    const ob = storage[i];
                    const materialName = ob.materialName;
                    const channelName = ob.channelName;
                    const textureObjectDefaults = ob.textureObjectDefaults;
                    const channelObjectDefaults = ob.channelObjectDefaults;
                    const materialObjectRef =
                        classScope.getMaterialObject(materialName);
                    if (
                        materialObjectRef !== null &&
                        materialObjectRef !== undefined
                    ) {
                        const channelObjectRef = classScope.getChannelObject(
                            materialObjectRef,
                            channelName
                        );
                        if (
                            channelObjectRef !== null &&
                            channelObjectRef !== undefined
                        ) {
                            //remove texture
                            if (uid === '') {
                                //add color if it does not exist
                                if (
                                    channelObjectRef.color === null ||
                                    channelObjectRef.color === undefined
                                ) {
                                    classScope.setColor(
                                        materialName,
                                        channelName,
                                        null,
                                        '#ffffff'
                                    );
                                }

                                channelObjectRef.texture = null;
                                delete channelObjectRef.texture;
                                classScope.api.setMaterial(materialObjectRef);
                            } else {
                                //remove color if it exists
                                if (channelObjectRef.color) {
                                    channelObjectRef.color = null;
                                    delete channelObjectRef.color;
                                }

                                //this is the cache of the original texture
                                if (
                                    channelObjectRef.textureIsCached ===
                                        undefined ||
                                    channelObjectRef.textureIsCached === null
                                ) {
                                    channelObjectRef.textureIsCached = true;
                                    channelObjectRef.textureCached =
                                        channelObjectRef.texture;
                                }

                                //this is to add channel object defaults
                                if (
                                    channelObjectDefaults !== null &&
                                    channelObjectDefaults !== undefined
                                ) {
                                    classScope.setChannelPropertiesActual(
                                        channelObjectRef,
                                        channelObjectDefaults
                                    );
                                }

                                // if no texture property exists , create one , if it does exist, copy it
                                let texob: {
                                    [key: string]: any;
                                } = {};

                                let prop = null;
                                if (
                                    channelObjectRef.textureCached === null ||
                                    channelObjectRef.textureCached === undefined
                                ) {
                                    texob = {};
                                    texob.internalFormat = 'RGB';
                                    texob.magFilter = 'LINEAR';
                                    texob.minFilter = 'LINEAR_MIPMAP_LINEAR';
                                    texob.texCoordUnit = 0;
                                    texob.textureTarget = 'TEXTURE_2D';
                                    texob.uid = 0; // not actual value , the uid still needs to be returned from a succcessful texture upload.
                                    texob.wrapS = 'REPEAT';
                                    texob.wrapT = 'REPEAT';
                                } else {
                                    //deep copy
                                    for (prop in channelObjectRef.textureCached) {
                                        texob[prop] =
                                            channelObjectRef.textureCached[
                                                prop
                                            ];
                                    }
                                }

                                channelObjectRef.texture = texob;

                                //this is to add texture object defaults
                                if (
                                    textureObjectDefaults !== null &&
                                    textureObjectDefaults !== null
                                ) {
                                    classScope.setTexturePropertiesActual(
                                        channelObjectRef,
                                        textureObjectDefaults
                                    );
                                }

                                channelObjectRef.texture.uid = uid;
                                classScope.api.setMaterial(materialObjectRef);
                            }
                        }
                    }
                }

                classScope.materialsUIDPending[UIDKey] = null;
                storage = null;
                delete classScope.materialsUIDPending[UIDKey];

                classScope.dispatchEvent(
                    classScope.EVENT_TEXTURE_APPLIED,
                    UIDKey
                );
            }
        }
    };

    this.addTexture = function (
        url: string,
        UIDKey: string,
        useCashing: boolean
    ) {
        useCashing = useCashing || false;
        if (UIDKey === null || UIDKey === undefined || UIDKey === '') {
            console.error(
                'a call to "addTexture" has been aborted. The argument UIDKey must have a valid string value so this texture has a means to be looked up at a later point'
            );
            return;
        }

        if (useCashing) {
            if (
                classScope.textureCache[UIDKey] !== null &&
                classScope.textureCache[UIDKey] !== undefined
            ) {
                if (classScope.enableDebugLogging) {
                    console.log(
                        'a call to addTexture found an existing textureCache for UIDKey "' +
                            UIDKey +
                            '", applyMaterialUIDPending called immediately.'
                    );
                }
                classScope.applyMaterialUIDPending(UIDKey);
                return;
            }
        }

        function addTextureCallback(err: any, uid: string) {
            classScope.textureCache[UIDKey] = uid;
            classScope.applyMaterialUIDPending(UIDKey);
            classScope.dispatchEvent(classScope.EVENT_TEXTURE_LOADED, {
                UIDKey: UIDKey,
            });
        }

        // validate if the uid exists and if so rather use update texture , otherwise use addTexture
        if (
            classScope.textureCache[UIDKey] !== null &&
            classScope.textureCache[UIDKey] !== undefined
        ) {
            classScope.api.updateTexture(
                url,
                classScope.textureCache[UIDKey],
                addTextureCallback
            );
        } else {
            classScope.api.addTexture(url, addTextureCallback);
        }
    };

    this.setColor = function (
        materialName: string,
        channelName: string,
        channelPropertyName: string,
        hex: string,
        performCacheReset: boolean
    ) {
        channelPropertyName = channelPropertyName || 'color';
        const propertyCacheKey = channelPropertyName + 'cached';

        performCacheReset = performCacheReset || false;
        const materialObjectRef = classScope.getMaterialObject(materialName);
        if (materialObjectRef !== null && materialObjectRef !== undefined) {
            const channelObjectRef = classScope.getChannelObject(
                materialObjectRef,
                channelName
            );
            if (channelObjectRef !== null && channelObjectRef !== undefined) {
                if (performCacheReset) {
                    if (
                        channelObjectRef[propertyCacheKey] !== undefined &&
                        channelObjectRef[propertyCacheKey] !== null
                    ) {
                        channelObjectRef[channelPropertyName][0] =
                            channelObjectRef[propertyCacheKey][0];
                        channelObjectRef[channelPropertyName][1] =
                            channelObjectRef[propertyCacheKey][1];
                        channelObjectRef[channelPropertyName][2] =
                            channelObjectRef[propertyCacheKey][2];
                        classScope.api.setMaterial(materialObjectRef);
                        return;
                    } else {
                        if (classScope.enableDebugLogging) {
                            console.log(
                                'a call to reset a color has been ignored since the color has not changed'
                            );
                        }
                        return;
                    }
                }

                // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
                const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                if (
                    channelObjectRef[channelPropertyName] === null ||
                    channelObjectRef[channelPropertyName] === undefined
                ) {
                    channelObjectRef[channelPropertyName] = [1, 1, 1];
                }

                //since texture and color cannot exist at the same time in the sketchfab API
                //test for texture and remove if needed.
                if (channelObjectRef.texture) {
                    channelObjectRef.texture = null;
                    delete channelObjectRef.texture;
                }

                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                    hex
                );

                if (
                    channelObjectRef[propertyCacheKey] === undefined ||
                    channelObjectRef[propertyCacheKey] === null
                ) {
                    channelObjectRef[propertyCacheKey] = [];
                    channelObjectRef[propertyCacheKey][0] =
                        channelObjectRef[channelPropertyName][0];
                    channelObjectRef[propertyCacheKey][1] =
                        channelObjectRef[channelPropertyName][1];
                    channelObjectRef[propertyCacheKey][2] =
                        channelObjectRef[channelPropertyName][2];
                }

                channelObjectRef[channelPropertyName][0] =
                    classScope.srgbToLinear(
                        result ? parseInt(result[1], 16) : 0 / 255
                    );
                channelObjectRef[channelPropertyName][1] =
                    classScope.srgbToLinear(
                        result ? parseInt(result[2], 16) : 0 / 255
                    );
                channelObjectRef[channelPropertyName][2] =
                    classScope.srgbToLinear(
                        result ? parseInt(result[3], 16) : 0 / 255
                    );
                classScope.api.setMaterial(materialObjectRef);
            }
        }
    };

    this.srgbToLinear = function (c: number) {
        let v = 0.0;
        if (c < 0.04045) {
            if (c >= 0.0) v = c * (1.0 / 12.92);
        } else {
            v = Math.pow((c + 0.055) * (1.0 / 1.055), classScope.gamma);
        }
        return v;
    };
}

export default SketchfabAPIUtility;
