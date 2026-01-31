import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { VALIDATION } from '../constants/validation';

/**
 * Check localStorage available space (estimates remaining capacity)
 * Returns approximate percentage used (0-100)
 */
const checkLocalStorageQuota = (): number => {
    try {
        // Most browsers limit localStorage to 5MB-10MB
        let currentSize = 0;

        // Estimate current usage
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                currentSize += localStorage[key].length + key.length;
            }
        }

        // Assume standard 5MB quota for most browsers
        const quotaSize = 5 * 1024 * 1024; // 5MB

        // Return percentage used (estimate)
        const percentUsed = (currentSize / quotaSize) * 100;
        return Math.min(percentUsed, 100);
    } catch (error) {
        console.error('Failed to check localStorage quota:', error);
        return 0;
    }
};

/**
 * Auto-save hook
 *
 * Automatically saves the project to localStorage at a regular interval.
 * Also adds a beforeunload event listener to warn about unsaved changes.
 * Monitors localStorage quota and warns user if near limit.
 */
export const useAutoSave = () => {
    const project = useProjectStore((state) => state.project);
    const isDirty = useProjectStore((state) => state.isDirty);
    const saveProject = useProjectStore((state) => state.saveProject);
    const [quotaWarningShown, setQuotaWarningShown] = useState(false);

    // Auto-save to localStorage every 30 seconds
    useEffect(() => {
        if (!project) return;

        const interval = setInterval(() => {
            const jsonString = saveProject();

            // Check quota before saving
            const quotaPercent = checkLocalStorageQuota();
            if (quotaPercent > 80 && !quotaWarningShown) {
                console.warn('localStorage quota is nearly full (>80%). Autosave may fail.');
                alert(
                    'Warning: Your browser storage is nearly full. ' +
                    'Please save your animation to the cloud or export it to avoid data loss.'
                );
                setQuotaWarningShown(true);
            }

            try {
                localStorage.setItem('rugby_animator_autosave', jsonString);
                localStorage.setItem('rugby_animator_autosave_timestamp', new Date().toISOString());
                console.log('Auto-saved project to localStorage');
            } catch (error) {
                console.error('Failed to auto-save project:', error);

                // Handle quota exceeded error
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    // Show critical warning to user
                    alert(
                        'CRITICAL: Your browser storage is full. Autosave has failed.\n\n' +
                        'Please save your animation to the cloud immediately or export it to prevent data loss.'
                    );

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
    }, [project, saveProject, quotaWarningShown]);

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
