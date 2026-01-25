/**
 * SPIKE: GIF Export Proof of Concept
 *
 * This file tests gif.js library integration with Konva canvas capture.
 * Validates that gif.js can encode frames from our canvas setup.
 *
 * DELETE after Phase 2 research is complete.
 */

import GIF from 'gif.js';

export interface GifSpikeMetrics {
    encodingTimeMs: number;
    fileSizeBytes: number;
    frameCount: number;
    width: number;
    height: number;
    quality: number;
    workerCount: number;
    memoryUsageMB?: number;
}

/**
 * Create a GIF from an array of image blobs (PNG frames)
 *
 * @param frames - Array of PNG blobs captured from canvas
 * @param width - Output GIF width
 * @param height - Output GIF height
 * @param fps - Frames per second
 * @param quality - GIF quality (1-20, lower is better, 10 recommended)
 * @returns Promise with the GIF blob and performance metrics
 */
export async function createGifFromFrames(
    frames: Blob[],
    width: number,
    height: number,
    fps: number,
    quality: number = 10
): Promise<{ blob: Blob; metrics: GifSpikeMetrics }> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;

    return new Promise((resolve, reject) => {
        // Determine worker count (use all available cores)
        const workerCount = navigator.hardwareConcurrency || 2;

        // Initialize gif.js encoder
        const gif = new GIF({
            workers: workerCount,
            quality: quality,
            width: width,
            height: height,
            workerScript: '/gif-worker/gif.worker.js',
            repeat: 0, // 0 = infinite loop (NETSCAPE2.0 extension) - required for WhatsApp Web
        });

        let processedFrames = 0;

        // Convert blobs to ImageData and add to GIF
        const processFrame = async (index: number) => {
            if (index >= frames.length) {
                // All frames processed, render the GIF
                gif.render();
                return;
            }

            const blob = frames[index];
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                // Create canvas to extract ImageData
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    URL.revokeObjectURL(url);
                    return;
                }

                // Draw image to canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Extract ImageData
                const imageData = ctx.getImageData(0, 0, width, height);

                // Add frame to GIF (delay in ms = 1000 / fps)
                const delay = Math.round(1000 / fps);
                gif.addFrame(imageData, { delay });

                // Clean up
                URL.revokeObjectURL(url);

                processedFrames++;

                // Process next frame
                processFrame(index + 1);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(`Failed to load frame ${index}`));
            };

            img.src = url;
        };

        // Handle GIF completion
        gif.on('finished', (gifBlob: Blob) => {
            const endTime = performance.now();
            const endMemory = (performance as any).memory?.usedJSHeapSize;

            const metrics: GifSpikeMetrics = {
                encodingTimeMs: Math.round(endTime - startTime),
                fileSizeBytes: gifBlob.size,
                frameCount: frames.length,
                width,
                height,
                quality,
                workerCount,
            };

            // Calculate memory usage if available (Chrome only)
            if (startMemory && endMemory) {
                metrics.memoryUsageMB = Math.round((endMemory - startMemory) / (1024 * 1024) * 100) / 100;
            }

            resolve({ blob: gifBlob, metrics });
        });

        gif.on('error', (error: Error) => {
            reject(error);
        });

        // Start processing frames
        processFrame(0);
    });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Format metrics for console logging
 */
export function formatMetrics(metrics: GifSpikeMetrics): string {
    const fileSizeMB = (metrics.fileSizeBytes / (1024 * 1024)).toFixed(2);
    const encodingTimeSec = (metrics.encodingTimeMs / 1000).toFixed(2);

    return `
GIF Export Metrics:
- Encoding time: ${encodingTimeSec}s (${metrics.encodingTimeMs}ms)
- File size: ${fileSizeMB}MB (${metrics.fileSizeBytes} bytes)
- Frame count: ${metrics.frameCount}
- Resolution: ${metrics.width}x${metrics.height}
- Quality: ${metrics.quality} (1-20 scale, lower is better)
- Workers: ${metrics.workerCount}
${metrics.memoryUsageMB ? `- Memory delta: ${metrics.memoryUsageMB}MB` : ''}
    `.trim();
}
