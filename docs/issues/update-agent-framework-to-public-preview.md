# Update agent-framework to public preview version

## Description
Update the agent-framework dependency from the GitHub main branch to the public preview version available on PyPI.

## Current State
The agent service currently pulls agent-framework packages from the GitHub repository main branch:
```toml
[tool.uv.sources]
"agent-framework" = { git = "https://github.com/microsoft/agent-framework.git", branch = "main", subdirectory = "python/packages/main" }
"agent-framework-azure" = { git = "https://github.com/microsoft/agent-framework.git", branch = "main", subdirectory = "python/packages/azure" }
"agent-framework-foundry" = { git = "https://github.com/microsoft/agent-framework.git", branch = "main", subdirectory = "python/packages/foundry" }
"agent-framework-workflow" = { git = "https://github.com/microsoft/agent-framework.git", branch = "main", subdirectory = "python/packages/workflow" }
```

## Proposed Changes
Update `agent/pyproject.toml` to use the public preview version from PyPI instead of the GitHub source.

## Benefits
- More stable and predictable dependency management
- Faster installation times
- Better version control and reproducibility
- Alignment with official release cycle

## Tasks
- [ ] Update `agent/pyproject.toml` to use public preview version from PyPI
- [ ] Remove GitHub source references in `[tool.uv.sources]` section
- [ ] Test agent service with updated dependencies
- [ ] Update documentation if needed
- [ ] Verify Azure AI Foundry integration still works correctly

## Testing
- Ensure agent service starts successfully
- Verify chat functionality works with the new version
- Test Aspire integration and OpenTelemetry tracing
- Confirm no breaking changes affect existing functionality

## Labels
- enhancement
- dependencies

## Priority
Medium
