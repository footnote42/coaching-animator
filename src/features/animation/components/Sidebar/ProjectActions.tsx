import { Save, FolderOpen, FilePlus, Loader2, Cloud, Settings } from 'lucide-react';
import { useRef, useState } from 'react';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { downloadJson, readJsonFile, generateProjectFilename } from '@/core/utils/fileIO';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ShareButton } from './ShareButton';
import { MetadataSheet } from './MetadataSheet';

import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/lib/error-messages';



/**
 * ProjectActions Component
 *
 * Provides New, Open, Save, and Export buttons for project management.
 * Handles unsaved changes warnings and file I/O operations.
 */
export interface ProjectActionsProps {
    isAuthenticated?: boolean;
    onSaveToCloud?: () => void;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({
    isAuthenticated = false,
    onSaveToCloud,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMetadataSheetOpen, setIsMetadataSheetOpen] = useState(false);

    const project = useProjectStore((state) => state.project);
    const isDirty = useProjectStore((state) => state.isDirty);
    const saveProject = useProjectStore((state) => state.saveProject);
    const loadProject = useProjectStore((state) => state.loadProject);
    const newProject = useProjectStore((state) => state.newProject);

    const isLoading = useUIStore((state) => state.isLoading);
    const setLoadingState = useUIStore((state) => state.setLoadingState);
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

        setLoadingState('load', true);
        try {
            const data = await readJsonFile(file);
            const result = loadProject(data);

            if (!result.success) {
                // Show error toast
                toast.error(`Failed to load project:\n${result.errors.join('\n')}`);
            } else if (result.warnings.length > 0) {
                // Show warnings
                console.warn('Project loaded with warnings:', result.warnings);
            }
        } catch (error) {
            toast.error(`Failed to load project: ${getFriendlyErrorMessage(error)}`);
        } finally {
            setLoadingState('load', false);
        }

        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

    /**
     * Handle Save button click
     */
    const handleSave = () => {
        if (!project) return;

        setLoadingState('save', true);
        try {
            const jsonContent = saveProject();
            const filename = generateProjectFilename(project.name);
            downloadJson(filename, jsonContent);
            toast.success('Project saved locally');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to save project: ${message}`);
        } finally {
            // Reset loading state after a short delay to ensure user sees feedback
            setTimeout(() => setLoadingState('save', false), 300);
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
        <div className="flex flex-col gap-4 p-4 border-b border-[var(--color-border)]">
            {/* Metadata Section */}
            <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">
                    Metadata
                </h3>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMetadataSheetOpen(true)}
                    disabled={!project}
                    className="w-full"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Metadata
                </Button>
            </div>

            {/* Project Actions Section */}
            <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">
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
                        disabled={isLoading.load}
                        className="flex-1"
                    >
                        {isLoading.load ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <FolderOpen className="w-4 h-4 mr-2" />
                        )}
                        Open
                    </Button>
                </div>

                <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={!project || isLoading.save}
                    className="w-full bg-[var(--color-accent-warm)] hover:bg-[var(--color-accent-hover)] text-white"
                >
                    {isLoading.save ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Local
                </Button>

                {isAuthenticated && onSaveToCloud && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onSaveToCloud}
                        disabled={!project}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white mt-2"
                    >
                        <Cloud className="w-4 h-4 mr-2" />
                        Save to Cloud
                    </Button>
                )}

                {!isAuthenticated && (
                    <a
                        href="/login?redirect=/app"
                        className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-warm)] transition-colors"
                    >
                        <Cloud className="w-4 h-4 mr-2" />
                        Sign in to Save
                    </a>
                )}
            </div>

            {/* Share Section */}
            <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">
                    Share
                </h3>
                <ShareButton />
            </div>

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
            
            <MetadataSheet 
                open={isMetadataSheetOpen} 
                onOpenChange={setIsMetadataSheetOpen} 
            />
        </div>
    );
};
