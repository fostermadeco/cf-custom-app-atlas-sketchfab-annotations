import type { Meta, StoryObj } from '@storybook/react';
import { SketchfabModelWithTags } from './sketchfab-model-with-tags';
import { useState } from 'react';

const meta: Meta<typeof SketchfabModelWithTags> = {
    component: SketchfabModelWithTags,
    title: 'Components/SketchfabModelWithTags',
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SketchfabModelWithTags>;

const SketchfabModelWithTagsStory = () => {
    const [selectedTag, setSelectedTag] = useState<{
        id: string;
        label: string;
    } | null>(null);

    return (
        <div style={{ marginTop: '40px', width: '700px' }}>
            <SketchfabModelWithTags
                selectedTag={selectedTag}
                sketchfabId="eecf227153354b979dfd70a4e20e1bcc"
                slug="not-real"
                onTagSelect={setSelectedTag}
            />
        </div>
    );
};

export const Default: Story = {
    render: () => <SketchfabModelWithTagsStory />,
};
