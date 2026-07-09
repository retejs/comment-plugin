import { NodeId } from 'rete';
import { BaseAreaPlugin } from 'rete-area-plugin';
import { FrameComment } from './frame-comment';
import type { Produces } from './index';
import { InlineComment } from './inline-comment';
import type { ExpectedSchemes, Position } from './types';
export declare type CommentHandlerDeps = {
    area: BaseAreaPlugin<ExpectedSchemes, unknown>;
    emit: (signal: Produces) => Promise<unknown>;
    editComment: (id: string) => Promise<void>;
};
export declare function createInlineHandlers(deps: CommentHandlerDeps): {
    contextMenu: ({ id }: InlineComment) => undefined;
    pick: (item: InlineComment) => void;
    translate: ({ id }: InlineComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
    dragged: (item: InlineComment, previous: Position, prevLinks: string[]) => Promise<void>;
};
export declare function createFrameHandlers(deps: CommentHandlerDeps): {
    contextMenu: ({ id }: FrameComment) => undefined;
    pick: (item: FrameComment) => void;
    translate: ({ id }: FrameComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>;
    dragged: (item: FrameComment, previous: Position, prevLinks: string[]) => Promise<void>;
};
//# sourceMappingURL=handlers.d.ts.map