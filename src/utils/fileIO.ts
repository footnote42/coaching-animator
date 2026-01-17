/**
 * File I/O Utilities: Rugby Animation Tool
 *
 * Utilities for saving and loading project files.
 */

/**
 * Downloads a JSON file to the user's device.
 * @param filename - Name of the file (e.g., 'my-play.json')
 * @param content - JSON string content
 */
export const downloadJson = (filename: string, content: string): void => {
    try {
        // Create a Blob from the JSON content
        const blob = new Blob([content], { type: 'application/json' });

        // Create a temporary download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download JSON file:', error);
        throw new Error('Failed to download file');
    }
};

/**
 * Reads a JSON file and parses it.
 * @param file - The File object to read
 * @returns Promise resolving to the parsed JSON data
 */
export const readJsonFile = (file: File): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.name.endsWith('.json')) {
            reject(new Error('Invalid file type. Please select a .json file.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);
                resolve(data);
            } catch (error) {
                reject(new Error('Failed to parse JSON file. The file may be corrupted.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file.'));
        };

        reader.readAsText(file);
    });
};

/**
 * Generates a sanitized filename for a project.
 * @param projectName - The project name
 * @returns A safe filename with .json extension
 */
export const generateProjectFilename = (projectName: string): string => {
    // Remove special characters and spaces, replace with hyphens
    const sanitized = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Fallback to default name if sanitization results in empty string
    const filename = sanitized || 'rugby-play';

    // Add timestamp to make filenames unique
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return `${filename}-${timestamp}.json`;
};
