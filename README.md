# 🚀 SIH2025 Monorepo

This repo is a **monorepo** containing:

- **Frontend** → Next.js + Tailwind + shadcn/ui
- **Backend** → FastAPI (Python, managed with `uv`)

It uses **pnpm** workspaces + **turbo** for frontend tooling, and **concurrently** for running frontend & backend together.

---

## 🛠 Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) (workspace package manager)
- [uv](https://docs.astral.sh/uv/) (Python package/dependency manager)
- Python ≥ 3.11

---

## ⚡ Setup

Clone the repo and run:

```bash
# Install Node.js dependencies (frontend + tooling)
pnpm install

# Install backend dependencies
cd apps/backend
uv sync
cd ../..
```

Or run the shortcut:

```bash
pnpm run setup
```

---

## ▶️ Development

Run frontend + backend together:

```bash
pnpm dev
```

- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend → [http://localhost:8000](http://localhost:8000)

Run separately:

```bash
pnpm dev:frontend   # Start Next.js frontend
pnpm dev:backend    # Start FastAPI backend
```

---

## 📦 Adding shadcn/ui components

To add a new component to the frontend app:

```bash
pnpm dlx shadcn@latest add button -c apps/frontend
```

Components will be placed in `apps/frontend/components/ui`.

---

## 🎨 Tailwind

The `tailwind.config.ts` and `globals.css` are already set up for shadcn/ui.

---

## ✅ Using Components

Import components directly in your frontend code:

```tsx
import { Button } from "@/components/ui/button";
```

---
