# CorpAI Portal — Agent Handoff Guide

> Next.js dashboard that visualizes the CorpAI org standard. Any coding agent picking this up: read this first.

---

## What This Is

A **public-facing web portal** that fetches the CorpAI spec from GitHub and renders it as an interactive org chart. Currently read-only/exploratory. Future: client dashboard where businesses manage their AI company.

**GitHub:** https://github.com/Arigitshub/corpai-portal  
**Version:** 0.1.0  
**Stack:** Next.js 16, React 19, Tailwind CSS, ReactFlow, Framer Motion

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — role count, dept count, role explorer cards |
| `/map` | Interactive org chart with ReactFlow — drag/zoom nodes |
| `/api/org` | Server route — reads local CorpAI roles dir (dev only) |

---

## Data Flow

**Production (pages fetch directly from GitHub API):**
```
page.tsx / map/page.tsx
  → fetch("https://api.github.com/repos/Arigitshub/CorpAI/contents/roles")
  → iterates departments → fetches files per dept
  → builds Role[] array
  → renders dashboard / OrgMap
```

**Local dev API route (`/api/org`):**
- Reads `d:/Ari/CorpAI/roles/` (hardcoded local path — dev only)
- Parses .md files via regex
- Returns `{ roles: Role[] }`
- NOT used by production pages (they hit GitHub directly)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main dashboard — fetches from GitHub, renders stats + role cards |
| `src/app/map/page.tsx` | Org chart page — fetches from GitHub, passes to OrgMap |
| `src/components/OrgMap.tsx` | ReactFlow visualizer — custom RoleNode, auto-layout, animated edges |
| `src/app/api/org/route.ts` | Local dev API — reads local role files |

---

## Known Issues

1. **Role parsing is simplified** — ranks default to `L4` for Directors, `L2` for everyone else. Should parse from Identity table in .md content.
2. **reportsTo defaults to "OWNER"** — edges between nodes won't render real hierarchy. Fix: parse "Reports to" field from each .md file content.
3. **ReactFlow layout is basic** — column-by-department layout. Improve with dagre/elkjs for proper tree layout.
4. **Share/Export buttons** — UI only, not implemented.
5. **Not deployed to Vercel yet** — needs `vercel --prod` from this directory.

---

## What Needs to Be Built

Priority order:
1. Deploy to Vercel
2. Fix role parsing (rank + reportsTo from .md content)
3. Hierarchical layout with dagre
4. Auth + client accounts (future: pay-to-deploy model)

---

## Related Repos

- [CorpAI](https://github.com/Arigitshub/CorpAI) — the spec (source of role data)
- [corpai-cli](https://github.com/Arigitshub/corpai-cli) — Python CLI validator
