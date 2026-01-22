# AI Agent Best Practices Checklist

To maintain code quality and project stability, all AI coding assistants should follow these guidelines:

## 🚀 Development Workflow

- [ ] **Branching Strategy**: Always create a new branch when starting a new implementation/plan.
    - Branch names MUST be prefixed with `feature/` or `bug/` (e.g., `feature/add-login`).
- [ ] **No Direct Commits**: Never commit directly to the `main` branch.
- [ ] **Pull Requests**: After finishing work on a branch, raise a Pull Request (PR) to `main` using the GitHub CLI (`gh pr create`).
    - Follow the [GitHub flow](https://docs.github.com/en/get-started/using-git/github-flow) principles.
    - MUST follow the [pull_request_template.md](file:///Users/marty/git/snake-arena-live/.github/pull_request_template.md) when raising a PR.
- [ ] **Publish Branch**: Make sure to publish the created branch to GitHub (`git push -u origin <branch-name>`) after committing changes.
- [ ] **Run Tests Before Finalizing**: Always run the test suite before declaring a task complete.
- [ ] **Explicit Permission**: NEVER make code changes or updates to files unless specifically asked by the user. If unsure, ask for clarification first.
- [ ] **Commit Regularly**: Make small, logical commits after each reasonable step rather than one giant commit at the end.
- [ ] **Use Imperative Commits**: Write commit messages in the imperative mood (e.g., "Add sound utility" instead of "Added sound utility").
- [ ] **Verify Build**: Ensure the development server (`npm run dev`) starts without warnings or errors.

## 📁 Project Structure Awareness

- [ ] **Frontend context**: Most commands (npm, vitest, playwright) must be run from the `/frontend` directory.
- [ ] **Source vs Root**: Be careful not to mix root-level config with frontend-specific code.

## 🛠 Coding Standards

- [ ] **Synthesized Assets**: When adding simple assets (like UI sounds), prefer browser-native APIs (e.g., Web Audio API) over external binary files to keep the repo lightweight.
- [ ] **CSS Hygiene**: Keep all `@import` statements at the very top of CSS files to avoid build warnings.
- [ ] **Testing Protocol**:
    - Use `src/test/setup.ts` to add global mocks (like `localStorage`).
    - Prefer `vitest` for logic/component tests and `playwright` for E2E flows.
- [ ] **Error Handling**: Use the existing `toast` system for user-facing feedback.

## 📋 Documentation

- [ ] **Update artifacts**: Maintain the `implementation_plan.md`, `task.md`, and `walkthrough.md` in the `.gemini/antigravity/brain` directory to keep the user informed.

## 🐍 Backend / Python (uv)

- [ ] **Dependency Management**: Use `uv` for backend python management.
    ```bash
    # Sync dependencies from lockfile
    uv sync

    # Add a new package
    uv add <PACKAGE-NAME>

    # Run Python files
    uv run python <PYTHON-FILE>
    ```