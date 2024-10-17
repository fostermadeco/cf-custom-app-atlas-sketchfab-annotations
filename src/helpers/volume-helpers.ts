type RichTextNode = {
    nodeType: string;
    content: {
        value: string;
    }[];
};

export type TableOfContentsItem = {
    listNumber: number | null;
    nodeType: string;
    title: string;
    slug: string;
};

export const generateTableOfContents: (
    volumeContent: any[]
) => TableOfContentsItem[] = (volumeContent) => {
    const tocItems: TableOfContentsItem[] = [];
    let lastItem = { nodeType: '', content: [{ value: '' }] };
    let anchorCounter = 1;
    let listCounter = 1;

    const isTocItem = (item: RichTextNode) =>
        ['heading-2', 'heading-3'].includes(item.nodeType);

    volumeContent.forEach((item) => {
        const isCurrentItemTocItem = isTocItem(item);
        const isLastItemTocItem = isTocItem(lastItem);

        if (isCurrentItemTocItem) {
            const listNumber =
                item.nodeType === 'heading-2' ? listCounter : null;

            tocItems.push({
                listNumber,
                nodeType: item.nodeType,
                title: item.content[0].value,
                slug: `section${anchorCounter}`,
            });

            if (item.nodeType === 'heading-2') {
                listCounter++;
            }
        }

        if (
            isCurrentItemTocItem ||
            (!isCurrentItemTocItem && isLastItemTocItem)
        ) {
            anchorCounter++;
        }

        lastItem = item;
    });

    return tocItems;
};
