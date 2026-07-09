import './style.sass';
import { NodeId, Scope } from 'rete';
import { BaseArea } from 'rete-area-plugin';
import { Comment } from './comment';
import { FrameComment } from './frame-comment';
import type { FrameBounds, FrameMembership } from './frame-membership';
import { InlineComment } from './inline-comment';
import type { CommentRestoreData, ExpectedSchemes, Position } from './types';
export { Comment, FrameComment, InlineComment };
export type { ExpectedSchemes };
export * as CommentExtensions from './extensions';
export type { FrameBounds, FrameMembership } from './frame-membership';
export type { CommentRestoreData } from './types';
/**
 * A union of all possible signals that can be emitted by the comment plugin
 * @priority 9
 */
export declare type Produces = {
    type: 'commentcreated';
    data: Comment;
} | {
    type: 'commentremoved';
    data: Comment;
} | {
    type: 'editcomment';
    data: Comment;
} | {
    type: 'commentedited';
    data: {
        comment: Comment;
        previousText: string;
    };
} | {
    type: 'commentselected';
    data: Comment;
} | {
    type: 'commentunselected';
    data: Comment;
} | {
    type: 'commenttranslated';
    data: {
        id: Comment['id'];
        dx: number;
        dy: number;
        sources?: NodeId[];
    };
} | {
    type: 'commentdragged';
    data: {
        id: Comment['id'];
        previous: Position;
        prevLinks: string[];
    };
} | {
    type: 'commentmembershipchanged';
    data: {
        node?: {
            id: NodeId;
            previous: Position;
            current: Position;
        };
        frames: FrameMembership[];
    };
} | {
    type: 'commentlinktranslate';
    data: {
        id: Comment['id'];
        link: string;
    };
};
/**
 * Comment plugin properties
 */
export declare type Props = {
    /** Edit comment callback */
    edit?: (comment: Comment) => Promise<string>;
};
/**
 * A plugin that provides comments for nodes
 * @priority 8
 */
export declare class CommentPlugin<Schemes extends ExpectedSchemes, K = BaseArea<Schemes>> extends Scope<Produces, [BaseArea<Schemes> | K]> {
    private props?;
    comments: Map<string, Comment>;
    private area;
    private editor;
    private membershipState;
    /**
     * @constructor
     * @param props Optional comment plugin properties
     */
    constructor(props?: Props | undefined);
    setParent(scope: Scope<BaseArea<Schemes> | K>): void;
    /**
     * Trigger edit form for a comment
     * @param id Comment id
     */
    editComment(id: Comment['id']): Promise<void>;
    private handlerDeps;
    /**
     * Restores a comment from serialized state (e.g. undo after delete)
     */
    restoreComment(data: CommentRestoreData): Comment;
    /**
     * Adds an inline comment which is represented by a block with text at certain position, which is attached to the node.
     * When user translates a node, the comment will be translated as well.
     * When user drops a comment on a node, the comment will be linked to the node.
     * @param text Comment text
     * @param position Comment position
     * @param link Node ID the comment is linked with
     * @returns comment that was created
     */
    addInline(text: string, [x, y]: [number, number], link?: string): InlineComment;
    /**
     * Adds a frame comment. Represents a rectangle with a text and nodes linked to it.
     * When user translates a comment, all linked nodes will be translated as well.
     * When user drops a node on a comment, the node will be linked to the comment.
     * @param text Comment text
     * @param links List of node IDs the comment is linked with
     * @returns comment that was created
     */
    addFrame(text: string, links?: string[]): FrameComment;
    add(comment: Comment): void;
    /**
     * Removes a comment
     * @param id Comment id
     */
    delete(id: Comment['id']): void;
    /**
     * Updates comment links and resizes frame comments when needed
     */
    setCommentLinks(id: Comment['id'], links: string[]): Promise<void>;
    /**
     * Restores frame bounds and links without recalculating from linked nodes.
     * Assigns `links` directly instead of `linkTo` to avoid an automatic resize.
     */
    setFrameState(id: Comment['id'], state: FrameBounds & {
        links: string[];
    }): void;
    /**
     * Restores frame membership and node position without triggering auto-resize side effects
     */
    restoreNodeFrameMembership(data: {
        frames: {
            id: Comment['id'];
            state: FrameBounds & {
                links: string[];
            };
        }[];
        node?: {
            id: NodeId;
            position: Position;
        };
    }): Promise<void>;
    /**
     * Translates a comment
     * @param id Comment id
     * @param dx Delta x
     * @param dy Delta y
     */
    translate(id: Comment['id'], dx: number, dy: number): Promise<void>;
    /**
     * Selects a comment
     * @param id Comment id
     */
    select(id: Comment['id']): void;
    /**
     * Unselects a comment
     * @param id Comment id
     */
    unselect(id: Comment['id']): void;
    /**
     * Removes all comments
     */
    clear(): void;
}
//# sourceMappingURL=index.d.ts.map