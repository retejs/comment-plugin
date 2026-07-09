import { AreaExtensions } from 'rete-area-plugin';
import { CommentPlugin, ExpectedSchemes } from '..';
declare type Selector = ReturnType<typeof AreaExtensions.selector>;
/**
 * Enables synchronization between comments and the selector
 * @param plugin Comment plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 */
export declare function selectable<S extends ExpectedSchemes, K>(plugin: CommentPlugin<S, K>, selector: Selector, accumulating: {
    active(): boolean;
}): void;
export {};
//# sourceMappingURL=selectable.d.ts.map