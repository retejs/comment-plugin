import { NodeId } from 'rete';
import { FrameComment } from './frame-comment';
export declare type FrameBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare type FrameMembership = {
    id: FrameComment['id'];
    links: {
        prev: string[];
        next: string[];
    };
    previous: FrameBounds;
    current: FrameBounds;
};
export declare function frameBounds(comment: FrameComment): FrameBounds;
export declare function syncFrameOnNodeDrop(frame: FrameComment, nodeId: NodeId): Promise<{
    id: string;
    links: {
        prev: string[];
        next: string[];
    };
    previous: FrameBounds;
    current: FrameBounds;
} | null>;
export declare function detachNodeFromFrame(frame: FrameComment, nodeId: NodeId): Promise<{
    id: string;
    links: {
        prev: string[];
        next: string[];
    };
    previous: FrameBounds;
    current: FrameBounds;
} | null>;
//# sourceMappingURL=frame-membership.d.ts.map