import { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SketchfabModel } from './sketchfab-model';

const sketchfabId = 'eecf227153354b979dfd70a4e20e1bcc';
const slug = 'fake-record';

const meta: Meta<typeof SketchfabModel> = {
    component: SketchfabModel,
    title: 'Components/SketchfabModel',
};

export default meta;
type Story = StoryObj<typeof SketchfabModel>;

const Container = ({ children }: { children: ReactNode }) => (
    <div style={{ paddingTop: '20px', width: '600px' }}>{children}</div>
);

export const Default: Story = {
    render: () => (
        <Container>
            <SketchfabModel sketchfabId={sketchfabId} slug={slug} />
        </Container>
    ),
};

export const WithBorder: Story = {
    render: () => (
        <Container>
            <SketchfabModel showBorder sketchfabId={sketchfabId} slug={slug} />
        </Container>
    ),
};

export const FullHeight: Story = {
    render: () => (
        <div>
            <SketchfabModel
                showFullHeight
                sketchfabId={sketchfabId}
                slug={slug}
            />
        </div>
    ),
};

export const WithOpenVisibilityMenu: Story = {
    render: () => (
        <SketchfabModel
            openVisibilityMenuByDefault
            showFullHeight
            sketchfabId={sketchfabId}
            slug={slug}
        />
    ),
};
