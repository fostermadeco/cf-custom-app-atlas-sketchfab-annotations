import { render } from '@testing-library/react';

import SketchfabModel from './sketchfab-model';

const sketchfabId = 'eecf227153354b979dfd70a4e20e1bcc';

describe('SketchfabModel', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <SketchfabModel sketchfabId={sketchfabId} slug="fake-record" />
        );

        expect(baseElement).toBeTruthy();
    });
});
