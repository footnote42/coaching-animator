import { Save, FolderOpen, FilePlus, Video } from 'lucide-react';
import { useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { downloadJson, readJsonFile, generateProjectFilename } from '../../utils/fileIO';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/ConfirmDialog';


/**
 * ProjectActions Component
 * 
 * Provides New, Open, Save, and Export buttons for project management.
 * Handles unsaved changes warnings and file I/O operations.
 */
export interface ProjectActionsProps {
    onExport?: () => void;
    exportStatus?: 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';
    exportProgress?: number;
    exportError?: string | null;
    canExport?: boolean;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({
    onExport,
    exportStatus = 'idle',
    exportProgress = 0,
    exportError = null,
    canExport = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const project = useProjectStore((state) => state.project);
    const isDirty = useProjectStore((state) => state.isDirty);
    const saveProject = useProjectStore((state) => state.saveProject);
    const loadProject = useProjectStore((state) => state.loadProject);
    const newProject = useProjectStore((state) => state.newProject);

    const unsavedChangesDialog = useUIStore((state) => state.unsavedChangesDialog);
    const showUnsavedChangesDialog = useUIStore((state) => state.showUnsavedChangesDialog);
    const confirmPendingAction = useUIStore((state) => state.confirmPendingAction);
    const cancelPendingAction = useUIStore((state) => state.cancelPendingAction);

    /**
     * Handle New Project button click
     */
    const handleNewProject = () => {
        if (isDirty) {
            showUnsavedChangesDialog({ type: 'new-project' });
        } else {
            newProject();
        }
    };

    /**
     * Handle Open button click
     */
    const handleOpen = () => {
        if (isDirty) {
            // Store the file input click as the pending action
            // We'll trigger it after confirmation
            showUnsavedChangesDialog({ type: 'load-project', data: null });
        } else {
            fileInputRef.current?.click();
        }
    };

    /**
     * Handle file selection
     */
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            const result = loadProject(data);

            if (!result.success) {
                // Show error dialog or toast
                alert(`Failed to load project:\n${result.errors.join('\n')}`);
            } else if (result.warnings.length > 0) {
                // Show warnings
                console.warn('Project loaded with warnings:', result.warnings);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to load project: ${message}`);
        }

        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

    /**
     * Handle Save button click
     */
    const handleSave = () => {
        if (!project) return;

        const jsonContent = saveProject();
        const filename = generateProjectFilename(project.name);

        try {
            downloadJson(filename, jsonContent);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to save project: ${message}`);
        }
    };

    /**
     * Execute the pending action after user confirmation
     */
    const handleConfirmUnsavedChanges = () => {
        const action = unsavedChangesDialog.pendingAction;
        confirmPendingAction();

        if (!action) return;

        if (action.type === 'new-project') {
            newProject();
        } else if (action.type === 'load-project') {
            // Trigger file input after confirmation
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="flex flex-col gap-2 p-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Project
            </h3>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewProject}
                    className="flex-1"
                >
                    <FilePlus className="w-4 h-4 mr-2" />
                    New
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpen}
                    className="flex-1"
                >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open
                </Button>
            </div>

            <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={!project}
                className="w-full"
            >
                <Save className="w-4 h-4 mr-2" />
                Save
            </Button>

            {/* Export button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!canExport || exportStatus !== 'idle'}
                className="w-full"
            >
                <Video className="w-4 h-4 mr-2" />
                Export Video
            </Button>

            {/* Export progress indicator */}
            {exportStatus !== 'idle' && (
                <div className="mt-2 p-2 bg-tactical-mono-100 border border-tactical-mono-300">
                    <div className="text-xs font-mono text-tactical-mono-700 mb-1">
                        {exportStatus === 'preparing' && 'Preparing...'}
                        {exportStatus === 'recording' && 'Recording...'}
                        {exportStatus === 'processing' && 'Processing...'}
                        {exportStatus === 'complete' && '✓ Complete!'}
                        {exportStatus === 'error' && '✗ Error'}
                    </div>
                    {exportStatus !== 'error' && (
                        <div className="w-full h-2 bg-tactical-mono-200">
                            <div
                                className="h-full bg-pitch-green transition-all duration-300"
                                style={{ width: `${exportProgress}%` }}
                            />
                        </div>
                    )}
                    {exportStatus === 'error' && exportError && (
                        <div className="text-xs text-red-600 mt-1">
                            {exportError}
                        </div>
                    )}
                </div>
            )}

            {/* Hidden file input for opening projects */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select project file to open"
            />

            {/* Unsaved changes confirmation dialog */}
            <ConfirmDialog
                open={unsavedChangesDialog.isOpen}
                onConfirm={handleConfirmUnsavedChanges}
                onCancel={cancelPendingAction}
                title="Unsaved Changes"
                description="You have unsaved changes. If you continue, you will lose your work. Are you sure?"
                confirmLabel="Discard Changes"
                cancelLabel="Keep Editing"
                variant="destructive"
            />
        </div>
    );
};
