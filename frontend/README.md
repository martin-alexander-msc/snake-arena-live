# Snake Arena Frontend

The core game logic and UI for Snake Arena.

## Quick Start

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Configuring the Port**:
    By default, the server runs on port `8082`. To change this, you can modify the `port` value in `vite.config.ts` or use the `--port` flag:
    ```bash
    npm run dev -- --port 3000
    ```

## Testing

Run unit and component tests using Vitest:
```bash
npm test
```

Run E2E tests using Playwright:
```bash
npx playwright test
```

## Built With

- **React** + **Vite**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Sonner** (notifications)
