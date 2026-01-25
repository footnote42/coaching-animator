/**
 * Type declarations for gif.js library
 * See: https://github.com/jnordberg/gif.js
 */

declare module 'gif.js' {
    export interface GifOptions {
        workers?: number;
        quality?: number;
        width?: number;
        height?: number;
        workerScript?: string;
        background?: string;
        transparent?: number | string;
        dither?: boolean;
        debug?: boolean;
        repeat?: number; // 0 = infinite loop, -1 = no loop, n = loop n times
    }

    export interface GifFrameOptions {
        delay?: number;
        copy?: boolean;
        dispose?: number;
    }

    export default class GIF {
        constructor(options: GifOptions);

        addFrame(
            image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
            options?: GifFrameOptions
        ): void;

        on(event: 'finished', callback: (blob: Blob) => void): void;
        on(event: 'progress', callback: (percent: number) => void): void;
        on(event: 'error', callback: (error: Error) => void): void;
        on(event: 'abort', callback: () => void): void;
        on(event: 'start', callback: () => void): void;

        render(): void;
        abort(): void;

        running: boolean;
    }
}
