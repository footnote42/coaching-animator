import { Save, FolderOpen, FilePlus, Video, Loader2, Beaker } from 'lucide-react';
import { useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { downloadJson, readJsonFile, generateProjectFilename } from '../../utils/fileIO';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SportSelector } from './SportSelector';
import { ShareButton } from './ShareButton';
import { SportType, ExportStatus } from '../../types';


/**
 * ProjectActions Component
 * 
 * Provides New, Open, Save, and Export buttons for project management.
 * Handles unsaved changes warnings and file I/O operations.
 */
export interface ProjectActionsProps {
    currentSport: SportType;
    onSportChange: (sport: SportType) => void;
    onExport?: () => void;
    exportStatus?: ExportStatus;
    exportProgress?: number;
    exportError?: string | null;
    canExport?: boolean;
    onGifSpikeTest?: () => void;
    gifSpikeInProgress?: boolean;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({
    currentSport,
    onSportChange,
    onExport,
    exportStatus = 'idle',
    exportProgress = 0,
    exportError = null,
    canExport = false,
    onGifSpikeTest,
    gifSpikeInProgress = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const project = useProjectStore((state) => state.project);
    const isDirty = useProjectStore((state) => state.isDirty);
    const saveProject = useProjectStore((state) => state.saveProject);
    const loadProject = useProjectStore((state) => state.loadProject);
    const newProject = useProjectStore((state) => state.newProject);
    const updateProjectSettings = useProjectStore((state) => state.updateProjectSettings);

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
                // Show error dialog or toast
                alert(`Failed to load project:\n${result.errors.join('\n')}`);
            } else if (result.warnings.length > 0) {
                // Show warnings
                console.warn('Project loaded with warnings:', result.warnings);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to load project: ${message}`);
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
            {/* Field Settings Section */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Field Settings
                </h3>
                <SportSelector
                    currentSport={currentSport}
                    onSportChange={onSportChange}
                />
            </div>

            {/* Project Actions Section */}
            <div>
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
                    className="w-full"
                >
                    {isLoading.save ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                </Button>
            </div>

            {/* Share Section */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Share
                </h3>
                <ShareButton />
            </div>

            {/* Export Settings Section */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Export Settings
                </h3>

                {/* Resolution Selector */}
                <div className="flex flex-col gap-1 mb-3">
                    <label className="text-xs font-semibold text-tactical-mono-700">
                        Export Resolution
                    </label>
                    <div className="flex gap-2">
                        <Button
                            variant={project?.settings.exportResolution === '720p' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateProjectSettings({ exportResolution: '720p' })}
                            disabled={!project}
                            className="flex-1"
                        >
                            {project?.settings.exportResolution === '720p' && '✓ '}720p
                        </Button>
                        <Button
                            variant={project?.settings.exportResolution === '1080p' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateProjectSettings({ exportResolution: '1080p' })}
                            disabled={!project}
                            className="flex-1"
                        >
                            {project?.settings.exportResolution === '1080p' && '✓ '}1080p
                        </Button>
                    </div>
                </div>

                {/* SPIKE: GIF Export Test Button */}
                {onGifSpikeTest && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onGifSpikeTest}
                        disabled={!canExport || gifSpikeInProgress}
                        className="w-full mb-2 bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
                    >
                        {gifSpikeInProgress ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Beaker className="w-4 h-4 mr-2" />
                        )}
                        🧪 Test GIF Spike
                    </Button>
                )}

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
                            {exportStatus === 'capturing' && 'Capturing frames...'}
                            {exportStatus === 'encoding' && 'Encoding video...'}
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
        </div>
    );
};
