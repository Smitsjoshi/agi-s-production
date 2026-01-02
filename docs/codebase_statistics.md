# AGI-S Codebase Statistics

This report provides a detailed breakdown of the lines of code (LOC) across the different modules of the AGI-S platform.

## Summary

| Module | Description | Lines of Code |
| :--- | :--- | :--- |
| **Frontend** | UI Components, Pages, Styles, Hooks | **11,249** |
| **Core AI & Backend** | Genkit Flows, Agents, API Routes, Logic | **3,147** |
| **UAL** | Universal Action Layer (Logic & API) | **1,210** |
| **Auth System** | Authentication Pages & Firebase Config | **199** |
| **Shared Types** | TypeScript Definitions | **286** |
| **Total** | | **~16,091** |

---

## Detailed Breakdown

### 1. Frontend (Mobile & Desktop UI)
**Total: 11,249 lines**
- **Locations**: `src/components`, `src/app` (excluding API), `src/styles`.
- **Key Components**:
    - **Interactive Flow Pages**: Blueprint, Cosmos, Catalyst, etc.
    - **Video Generation**: `VideoGenForm` and related UI.
    - **Chat Interface**: Complex chat components, sidebar, and message rendering.
    - **Styling**: Tailwind CSS and Shadcn UI integration.

### 2. Core AI & Backend Logic
**Total: 3,147 lines**
- **Locations**: `src/ai`, `src/app/api` (general), `src/lib` (core).
- **Key Components**:
    - **Genkit Flows**: The "brain" behind the specific AI modes (Synthesis, Deep Dive, etc.).
    - **Video Service**: Integration with ComfyUI and Pollinations.ai.
    - **Agent System**: Definitions for the various personas and their prompts.
    - **Conversation Store**: Logic for managing chat history and state.

### 3. Universal Action Layer (UAL)
**Total: 1,210 lines**
- **Locations**: `src/lib/ual`, `src/app/api/ual`.
- **Key Components**:
    - **Planner**: The logic that decomposes user requests into steps.
    - **Executor**: The system that executes those steps.
    - **API Routes**: Endpoints for planning and execution.

### 4. Authentication System
**Total: 199 lines**
- **Locations**: `src/app/(auth)`, `src/lib/firebase`.
- **Key Components**:
    - **Login Page**: Customized login UI.
    - **Firebase Config**: Connection settings for authentication.

### 5. Configuration & Types
**Total: ~600+ lines**
- **Files**: `next.config.ts`, `tailwind.config.ts`, `src/lib/types.ts`, `package.json`.
- **Description**: Project setup, build configurations, and global type definitions.

*(Note: These counts exclude node_modules, build artifacts, and auto-generated lock files.)*
