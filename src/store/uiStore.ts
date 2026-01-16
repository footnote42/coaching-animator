import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    SidebarPanel,
    ExportStatus,
    PendingAction,
    ExportResult,
    ExportStatus as ExportStatusType
} from '../types';

export interface UIStoreState {
    selectedEntityId: string | null;
    showGhosts: boolean;
    showGrid: boolean;
    activeSidebarPanel: SidebarPanel;
    exportDialog: {
        isOpen: boolean;
        progress: number;
        status: ExportStatus;
        error?: string;
    };
    unsavedChangesDialog: {
        isOpen: boolean;
        pendingAction: PendingAction | null;
    };

    selectEntity: (entityId: string | null) => void;
    deselectAll: () => void;
    toggleGhosts: () => void;
    toggleGrid: () => void;
    setSidebarPanel: (panel: SidebarPanel) => void;
    startExport: () => void;
    setExportProgress: (progress: number) => void;
    completeExport: (result: ExportResult) => void;
    closeExportDialog: () => void;
    showUnsavedChangesDialog: (pendingAction: PendingAction) => void;
    confirmPendingAction: () => void;
    cancelPendingAction: () => void;
}

export const useUIStore = create<UIStoreState>()(
    devtools(
        (set) => ({
            selectedEntityId: null,
            showGhosts: false,
            showGrid: false,
            activeSidebarPanel: 'entities',
            exportDialog: {
                isOpen: false,
                progress: 0,
                status: 'idle',
            },
            unsavedChangesDialog: {
                isOpen: false,
                pendingAction: null,
            },

            selectEntity: () => { },
            deselectAll: () => { },
            toggleGhosts: () => { },
            toggleGrid: () => { },
            setSidebarPanel: () => { },
            startExport: () => { },
            setExportProgress: () => { },
            completeExport: () => { },
            closeExportDialog: () => { },
            showUnsavedChangesDialog: () => { },
            confirmPendingAction: () => { },
            cancelPendingAction: () => { },
        }),
        { name: 'UIStore' }
    )
);
