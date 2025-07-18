
```
Gemini
├─ backend
│  ├─ .env
│  ├─ .prettierrc
│  ├─ dist
│  │  ├─ app.controller.d.ts
│  │  ├─ app.controller.js
│  │  ├─ app.controller.js.map
│  │  ├─ app.module.d.ts
│  │  ├─ app.module.js
│  │  ├─ app.module.js.map
│  │  ├─ app.service.d.ts
│  │  ├─ app.service.js
│  │  ├─ app.service.js.map
│  │  ├─ auth
│  │  │  ├─ auth.controller.d.ts
│  │  │  ├─ auth.controller.js
│  │  │  ├─ auth.controller.js.map
│  │  │  ├─ auth.module.d.ts
│  │  │  ├─ auth.module.js
│  │  │  ├─ auth.module.js.map
│  │  │  ├─ auth.service.d.ts
│  │  │  ├─ auth.service.js
│  │  │  ├─ auth.service.js.map
│  │  │  ├─ dto
│  │  │  │  ├─ login.dto.d.ts
│  │  │  │  ├─ login.dto.js
│  │  │  │  ├─ login.dto.js.map
│  │  │  │  ├─ register.dto.d.ts
│  │  │  │  ├─ register.dto.js
│  │  │  │  └─ register.dto.js.map
│  │  │  ├─ guards
│  │  │  │  ├─ jwt-auth.guard.d.ts
│  │  │  │  ├─ jwt-auth.guard.js
│  │  │  │  └─ jwt-auth.guard.js.map
│  │  │  └─ strategies
│  │  │     ├─ jwt.strategy.d.ts
│  │  │     ├─ jwt.strategy.js
│  │  │     └─ jwt.strategy.js.map
│  │  ├─ candidates
│  │  │  ├─ candidates.module.d.ts
│  │  │  ├─ candidates.module.js
│  │  │  ├─ candidates.module.js.map
│  │  │  └─ entities
│  │  │     ├─ candidate.entity.d.ts
│  │  │     ├─ candidate.entity.js
│  │  │     └─ candidate.entity.js.map
│  │  ├─ groups
│  │  │  ├─ entities
│  │  │  │  ├─ group.entity.d.ts
│  │  │  │  ├─ group.entity.js
│  │  │  │  └─ group.entity.js.map
│  │  │  ├─ groups.module.d.ts
│  │  │  ├─ groups.module.js
│  │  │  └─ groups.module.js.map
│  │  ├─ import
│  │  │  ├─ dto
│  │  │  │  ├─ import.dto.d.ts
│  │  │  │  ├─ import.dto.js
│  │  │  │  └─ import.dto.js.map
│  │  │  ├─ import.controller.d.ts
│  │  │  ├─ import.controller.js
│  │  │  ├─ import.controller.js.map
│  │  │  ├─ import.module.d.ts
│  │  │  ├─ import.module.js
│  │  │  ├─ import.module.js.map
│  │  │  ├─ import.service.d.ts
│  │  │  ├─ import.service.js
│  │  │  └─ import.service.js.map
│  │  ├─ leaders
│  │  │  ├─ entities
│  │  │  │  ├─ leader.entity.d.ts
│  │  │  │  ├─ leader.entity.js
│  │  │  │  └─ leader.entity.js.map
│  │  │  ├─ leaders.module.d.ts
│  │  │  ├─ leaders.module.js
│  │  │  └─ leaders.module.js.map
│  │  ├─ locations
│  │  │  ├─ entities
│  │  │  │  ├─ location.entity.d.ts
│  │  │  │  ├─ location.entity.js
│  │  │  │  └─ location.entity.js.map
│  │  │  ├─ locations.module.d.ts
│  │  │  ├─ locations.module.js
│  │  │  └─ locations.module.js.map
│  │  ├─ main.d.ts
│  │  ├─ main.js
│  │  ├─ main.js.map
│  │  ├─ planillados
│  │  │  ├─ dto
│  │  │  │  ├─ planillado.dto.d.ts
│  │  │  │  ├─ planillado.dto.js
│  │  │  │  └─ planillado.dto.js.map
│  │  │  ├─ entities
│  │  │  │  ├─ planillado.entity.d.ts
│  │  │  │  ├─ planillado.entity.js
│  │  │  │  └─ planillado.entity.js.map
│  │  │  ├─ planillados.controller.d.ts
│  │  │  ├─ planillados.controller.js
│  │  │  ├─ planillados.controller.js.map
│  │  │  ├─ planillados.module.d.ts
│  │  │  ├─ planillados.module.js
│  │  │  ├─ planillados.module.js.map
│  │  │  ├─ planillados.service.d.ts
│  │  │  ├─ planillados.service.js
│  │  │  └─ planillados.service.js.map
│  │  ├─ tsconfig.build.tsbuildinfo
│  │  ├─ users
│  │  │  ├─ entities
│  │  │  │  ├─ user.entity.d.ts
│  │  │  │  ├─ user.entity.js
│  │  │  │  └─ user.entity.js.map
│  │  │  ├─ users.controller.d.ts
│  │  │  ├─ users.controller.js
│  │  │  ├─ users.controller.js.map
│  │  │  ├─ users.module.d.ts
│  │  │  ├─ users.module.js
│  │  │  ├─ users.module.js.map
│  │  │  ├─ users.service.d.ts
│  │  │  ├─ users.service.js
│  │  │  └─ users.service.js.map
│  │  └─ voters
│  │     ├─ entities
│  │     │  ├─ voter.entity.d.ts
│  │     │  ├─ voter.entity.js
│  │     │  └─ voter.entity.js.map
│  │     ├─ voters.module.d.ts
│  │     ├─ voters.module.js
│  │     └─ voters.module.js.map
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ data
│  │     └─ barranquilla-barrios.geojson
│  ├─ README.md
│  ├─ src
│  │  ├─ app.controller.spec.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  ├─ app.service.ts
│  │  ├─ auth
│  │  │  ├─ auth.controller.spec.ts
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.service.spec.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ dto
│  │  │  │  ├─ login.dto.ts
│  │  │  │  └─ register.dto.ts
│  │  │  ├─ guards
│  │  │  │  └─ jwt-auth.guard.ts
│  │  │  └─ strategies
│  │  │     └─ jwt.strategy.ts
│  │  ├─ candidates
│  │  │  ├─ candidates.module.ts
│  │  │  └─ entities
│  │  │     └─ candidate.entity.ts
│  │  ├─ groups
│  │  │  ├─ entities
│  │  │  │  └─ group.entity.ts
│  │  │  └─ groups.module.ts
│  │  ├─ import
│  │  │  ├─ dto
│  │  │  │  └─ import.dto.ts
│  │  │  ├─ import.controller.ts
│  │  │  ├─ import.module.ts
│  │  │  └─ import.service.ts
│  │  ├─ leaders
│  │  │  ├─ entities
│  │  │  │  └─ leader.entity.ts
│  │  │  └─ leaders.module.ts
│  │  ├─ locations
│  │  │  ├─ entities
│  │  │  │  └─ location.entity.ts
│  │  │  └─ locations.module.ts
│  │  ├─ main.ts
│  │  ├─ planillados
│  │  │  ├─ data
│  │  │  ├─ dto
│  │  │  │  └─ planillado.dto.ts
│  │  │  ├─ entities
│  │  │  │  └─ planillado.entity.ts
│  │  │  ├─ planillados.controller.ts
│  │  │  ├─ planillados.module.ts
│  │  │  └─ planillados.service.ts
│  │  ├─ users
│  │  │  ├─ entities
│  │  │  │  └─ user.entity.ts
│  │  │  ├─ users.controller.spec.ts
│  │  │  ├─ users.controller.ts
│  │  │  ├─ users.module.ts
│  │  │  ├─ users.service.spec.ts
│  │  │  └─ users.service.ts
│  │  └─ voters
│  │     ├─ entities
│  │     │  └─ voter.entity.ts
│  │     └─ voters.module.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ auth
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  ├─ ProtectedRoute.tsx
│  │  │  │  └─ RegisterForm.tsx
│  │  │  ├─ common
│  │  │  │  └─ NotificationContainer.tsx
│  │  │  ├─ import
│  │  │  │  ├─ DownloadTemplateButton.tsx
│  │  │  │  ├─ SimpleDownloadButton.tsx
│  │  │  │  └─ TemplateInfoCard.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Layout.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  └─ planillados
│  │  │     ├─ BulkActionsBar.tsx
│  │  │     ├─ PlanilladoModal.tsx
│  │  │     ├─ PlanilladosCharts.tsx
│  │  │     ├─ PlanilladosFilters.tsx
│  │  │     ├─ PlanilladosList.tsx
│  │  │     ├─ PlanilladosMap.css
│  │  │     ├─ PlanilladosMap.tsx
│  │  │     └─ PlanilladosStats.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ AuthPage.tsx
│  │  │  ├─ campaign
│  │  │  │  ├─ CampaignPage.tsx
│  │  │  │  └─ PlanilladosPage.tsx
│  │  │  ├─ ComingSoon.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  └─ operations
│  │  │     └─ ImportPage.tsx
│  │  ├─ services
│  │  │  ├─ authService.ts
│  │  │  ├─ geographicService.ts
│  │  │  ├─ importService.ts
│  │  │  └─ planilladosService.ts
│  │  ├─ store
│  │  │  ├─ hooks.ts
│  │  │  ├─ index.ts
│  │  │  └─ slices
│  │  │     ├─ appSlice.ts
│  │  │     └─ authSlice.ts
│  │  ├─ types
│  │  │  └─ index.ts
│  │  ├─ utils
│  │  │  └─ templateDownload.ts
│  │  └─ vite-env.d.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
└─ README.md

```