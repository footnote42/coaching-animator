# Contracts: Rugby Animation Tool

This directory contains TypeScript interface specifications for the Rugby Animation Tool.

## Purpose

Since this is a **fully client-side application with no backend**, there are no REST/GraphQL API contracts. Instead, this directory defines the internal contracts that govern:

1. **Store Contracts** - Zustand store state and action interfaces
2. **Component Contracts** - React component prop interfaces
3. **Core Types** - Shared type definitions used across the codebase

## Files

| File | Description |
|------|-------------|
| `types.ts` | Core data model types (Project, Frame, Entity, etc.) and constants |
| `store-contracts.ts` | Zustand store interfaces (ProjectStore, UIStore) |
| `component-contracts.ts` | React component prop interfaces |

## Usage

These files serve as specifications during the planning phase. During implementation:

1. Core types from `types.ts` → copy to `src/types/index.ts`
2. Store contracts → implement in `src/store/projectStore.ts` and `src/store/uiStore.ts`
3. Component contracts → implement in respective component files under `src/components/`

## Note on API Contracts

This application follows **Constitution V: Offline-First Privacy**, which mandates:

- No network calls
- No backend API
- All data stored locally

Therefore, traditional API contracts (OpenAPI, GraphQL schemas) are not applicable. The "API" of this application is:

1. **File Format**: JSON schema for save/load (defined in `types.ts`)
2. **Store Actions**: Public methods on Zustand stores (defined in `store-contracts.ts`)
3. **Component Props**: Interfaces for component composition (defined in `component-contracts.ts`)
