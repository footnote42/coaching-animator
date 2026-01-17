import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { VALIDATION } from '../constants/validation';

/**
 * Auto-save hook
 * 
 * Automatically saves the project to localStorage at a regular interval.
 * Also adds a beforeunload event listener to warn about unsaved changes.
 */
export const useAutoSave = () => {
    const project = useProjectStore((state) => state.project);
    const isDirty = useProjectStore((state) => state.isDirty);
    const saveProject = useProjectStore((state) => state.saveProject);

    // Auto-save to localStorage every 30 seconds
    useEffect(() => {
        if (!project) return;

        const interval = setInterval(() => {
            const jsonString = saveProject();

            try {
                localStorage.setItem('rugby_animator_autosave', jsonString);
                localStorage.setItem('rugby_animator_autosave_timestamp', new Date().toISOString());
                console.log('Auto-saved project to localStorage');
            } catch (error) {
                console.error('Failed to auto-save project:', error);

                // Handle quota exceeded error
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    // Try to clear old autosave and retry
                    try {
                        localStorage.removeItem('rugby_animator_autosave');
                        localStorage.removeItem('rugby_animator_autosave_timestamp');
                        localStorage.setItem('rugby_animator_autosave', jsonString);
                        localStorage.setItem('rugby_animator_autosave_timestamp', new Date().toISOString());
                        console.log('Cleared old autosave and saved successfully');
                    } catch (retryError) {
                        console.error('Failed to save even after clearing:', retryError);
                    }
                }
            }
        }, VALIDATION.STORAGE.AUTOSAVE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [project, saveProject]);

    // Warn about unsaved changes before leaving the page
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                // Modern browsers require returnValue to be set
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
};
