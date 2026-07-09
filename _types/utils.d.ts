import { NodeEditor, NodeId } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { ExpectedSchemes } from './types';
export declare type Rect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
export declare function intersectRect(r1: Rect, r2: Rect): boolean;
export declare function containsRect(r1: Rect, r2: Rect): boolean;
export declare function nodesBBox<S extends ExpectedSchemes>(editor: NodeEditor<S>, area: BaseAreaPlugin<S, unknown>, ids: NodeId[], margin: number | Rect): {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    getCenter: () => number[];
} | null;
export declare function trackedTranslate<S extends ExpectedSchemes, T>(props: {
    area: BaseAreaPlugin<S, T>;
}): {
    translate: (id: string, x: number, y: number) => Promise<void>;
    isTranslating: (id: NodeId) => boolean;
};
declare type TranslatableComment = {
    id: string;
    translate: (dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
    resize?: () => Promise<void>;
};
export declare function trackedTranslateComment<CommentType extends TranslatableComment>(comments: Map<string, CommentType>): {
    translate: (id: string, dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
    resize: (id: string) => Promise<void>;
    isTranslating: (id: string) => boolean;
    isResizing: (id: string) => boolean;
};
export declare function trackDragging(): {
    start(id: NodeId): void;
    stop(id: NodeId): void;
    isDragging(id: NodeId): boolean;
};
export {};
//# sourceMappingURL=utils.d.ts.map