# 02 — Frontend Optimization and Merge

Goal
- Harden TypeScript, reduce initial bundle size, split very large TSX files into smaller components, add lazy loading and memoization, and add basic CI checks.

What to change
1. Move frontend files into `frontend/` (if following canonical layout)
2. Replace `tsconfig.json` with a strict config
3. Add lazy loading for huge components
4. Optimize Vite build with manualChunks
5. Add ESLint + Prettier (recommended)
6. Add bundle analysis in CI

Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": false,
    "sourceMap": false
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Vite build improvements (suggested vite.config.ts snippet)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    brotliSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('jszip')) return 'vendor-ui'
            if (id.includes('@google/genai')) return 'vendor-genai'
            return 'vendor'
          }
          if (id.includes('src/components/VirtualAndroidDevice') || id.includes('VirtualAndroidDevice')) {
            return 'virtual-android-device'
          }
          if (id.includes('src/components/MultiModelCollaborationHub')) {
            return 'multi-model-hub'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200
  },
  optimizeDeps: {
    exclude: ['@google/genai']
  }
})
```

Lazy loading example (App.tsx excerpt)

```tsx
import React, { Suspense } from 'react'
const VirtualAndroidDevice = React.lazy(() => import('./components/VirtualAndroidDevice'))
const MultiModelCollaborationHub = React.lazy(() => import('./components/MultiModelCollaborationHub'))

// in render
{activeTab === 'android-device' && (
  <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading device...</div>}>
    <VirtualAndroidDevice />
  </Suspense>
)}

{activeTab === 'multi-model' && (
  <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading hub...</div>}>
    <MultiModelCollaborationHub />
  </Suspense>
)}
```

Memoization and React.memo guidance
- Wrap heavy child components with React.memo
- Use useCallback/useMemo for stable references to functions/values passed to deep child trees

Splitting large TSX files
- Identify TSX files > 2000 LOC: VirtualAndroidDevice.tsx, MultiModelCollaborationHub.tsx, OperationsHub.tsx, KeyVaultManager.tsx
- For each file, extract subcomponents into `src/components/<Feature>/` subfolder and export a lightweight `index.tsx` that composes them

ESLint & Prettier
- Add ESLint with recommended React/TypeScript rules and Prettier integration
- Add a lint script: "lint": "eslint --ext .ts,.tsx src || true" and enforce it in CI

Bundle-size checks in CI
- Use `rollup-plugin-visualizer` or `source-map-explorer` in a CI job to produce a report and fail when bundle exceeds thresholds

Migration notes when moving `src/` into `frontend/`
- Update tsconfig paths and baseUrl if absolute imports used
- Update package.json scripts to run from `frontend/` directory or update CI paths

Validation
- Run `npm ci` then `npm run lint`, `npm run build`
- Ensure dev server `npm run dev` renders the app

