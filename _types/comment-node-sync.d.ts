import { NodeId } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { Comment } from './comment';
import type { Produces } from './index';
import type { ExpectedSchemes, MembershipState, Position } from './types';
export declare type CommentNodeSyncDeps<Schemes extends ExpectedSchemes, K> = {
    area: BaseAreaPlugin<Schemes, K>;
    comments: Map<Comment['id'], Comment>;
    membershipState: MembershipState;
    emit: (signal: Produces) => Promise<unknown>;
};
export declare function createCommentNodeSync<Schemes extends ExpectedSchemes, K>(deps: CommentNodeSyncDeps<Schemes, K>): {
    beginNodeDrag(nodeId: NodeId): void;
    reorderLinkedComments(element: HTMLElement): void;
    onNodeTranslated(data: {
        id: NodeId;
        position: Position;
        previous: Position;
    }): Promise<void>;
    onCommentTranslated(data: {
        id: Comment['id'];
        dx: number;
        dy: number;
        sources?: string[] | undefined;
    }): Promise<void>;
    finalizeNodeDrag(nodeId: NodeId): Promise<void>;
    cleanupOnNodeRemoved(nodeId: NodeId): Promise<void>;
};
//# sourceMappingURL=comment-node-sync.d.ts.map