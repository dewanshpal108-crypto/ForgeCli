# Project: ForgeCLI

## Overview
This project is a command-line interface (CLI) tool called ForgeCLI that simplifies the management of Forge-based projects. It provides features for:

1. **Agent-Based Workflows**
   - Run AI agents (like agents/orchestrator.ts) to automate tasks through conversational interfaces
   - Supports modes: Agent Mode (default), Plan Mode (sequential tasks), Ask Mode (complex tasks)

2. **TUI Interaction**
   - Interactive terminal user interface (modes/cli.ts) for mode selection
   - Plugins: modeling integration, diff-viewing, action tracking (modes/agent/orchestrator.ts)

3. **Approval System**
   - Operations (AI/CLI mode actions) are staged until user approves (e.g., batch commits to files
   - Commands execute with shadows/icons (modes/tui/wakeup.ts: shadow effect for visual feedback

4. **Tool Execution**
   - Executes AI operations through `@openrouter/ai-sdk-provider`
   - Uses `__tui_mode` parameter (https://github.com/cursor-c/sdk-ai-sdk-provider#parameter-control)

5. **Plugins & Safety** 
   - Validates tool usage via `createAgentTools()` and runs type-safe checks via `util:`
   - Prevents magic operations through `runApprovalFlow()` approval checks (avoids magic/stealth mechanics)

6. **Tool Safety**
   - Enforces clear permissions via `tui/terminal-md` (Markdown rendering with shadows)
   - Ensures mutations are staged in approval flow (via `runApprovalFlow()`)

7. **Clean Staging**
   - File operations are staged until approval
   - Results show green ✓ Applied. mark/red mark -red errors

8. **UI Implementation**
   - Renders results in terminal using Ḟ§§ (shadow echo) and other TUI widgets

Run with:
```bash
cargo run -- [commands]
```

ForgeCLI provides a safe, structured workflow for Forge project management through:
- Approval-gated agent tools
- Type-safe AI operations via `ai-sdk-provider`
- Clear visual feedback through TUI implementations
- Prevention of starlight leaks (unauthorized mutations)

Under MIT License.