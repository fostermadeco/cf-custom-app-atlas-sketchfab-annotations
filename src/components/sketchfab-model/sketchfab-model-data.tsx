import Link from 'next/link';
import { get3DModelById } from '@atlas/contentful';
import SketchfabModel from './sketchfab-model';

type SketchfabModelDataProps = {
    id: string;
    showLink?: boolean;
};

export async function SketchfabModelData({
    id,
    showLink,
}: SketchfabModelDataProps) {
    const modelData = await get3DModelById(id);
    return (
        <div>
            <SketchfabModel
                sketchfabId={modelData.sketchfabId}
                slug={modelData.slug}
            />

            {showLink && (
                <div className="mt-2 mb-8">
                    <p className="text-center caption">
                        <Link
                            href={`/3d-models/${modelData.slug}`}
                            target="_blank"
                        >
                            Click here
                        </Link>{' '}
                        to view related content for this model.
                    </p>
                </div>
            )}
        </div>
    );
}
