# Smart Home Inventory System

> **Status:** ✅ deployed — backend live, frontend on Vercel  \
> **Stack:** FastAPI + Next.js + React Native (Expo) + PostgreSQL (pgvector)  \
> **UI:** HeroUI v3 (web) + HeroUI Native (mobile)  \
> **Obsidian:** `vault/10_Projects/Smart_Home_Inventory/`

## Deployments

| Layer | URL | Status |
|-------|-----|--------|
| Frontend (Vercel) | https://web-three-pied-55.vercel.app | ✅ Live |
| Backend API | http://localhost:8000 | ✅ Local |
| API Docs | http://localhost:8000/docs | ✅ Swagger UI |
| GitHub | https://github.com/newtonagi-beep/smart-home-inventory | ✅ Pushed |

## API Endpoints (15)

### Locations
- `POST /api/v1/locations` — create location
- `GET /api/v1/locations` — list all
- `GET /api/v1/locations/{id}` — get by ID

### Containers
- `POST /api/v1/containers` — create with QR token
- `GET /api/v1/containers` — list (filter by location_id)
- `GET /api/v1/containers/lookup?token=` — QR scan flow
- `DELETE /api/v1/containers/{id}` — soft-delete (archive)

### Items
- `POST /api/v1/items` — create (NLP → embedding → tags)
- `GET /api/v1/items/search?q=` — hybrid search (BM25 + cosine)
- `GET /api/v1/items/{id}` — get by ID
- `PATCH /api/v1/items/{id}/move` — transfer between containers

### QR + Sync
- `GET /api/v1/qr/parse?raw=` — validate QR URI
- `POST /api/v1/qr/generate` — generate new QR token
- `POST /api/v1/sync` — offline sync (LWW conflict resolution)
- `POST /api/v1/upload` — image upload

### Health
- `GET /health` — `{"status":"ok"}`

## Struktura katalogów

```
smart-home-inventory/
├── api/                 # Backend (FastAPI)
│   ├── routes/          # Endpointy REST
│   ├── models/          # Modele danych (SQLAlchemy)
│   ├── services/        # Logika biznesowa
│   └── middleware/      # Auth, CORS, itp.
├── web/                 # Frontend web (Next.js + HeroUI)
│   ├── app/             # Next.js App Router
│   ├── components/      # Komponenty HeroUI
│   └── lib/             # API client, utils
├── mobile/              # Aplikacja mobilna (Expo + HeroUI Native)
│   ├── app/             # Expo Router
│   ├── components/      # Komponenty HeroUI Native
│   └── services/        # API client, offline sync
├── docs/                # Dokumentacja
├── scripts/             # Skrypty pomocnicze
└── README.md
```

## MCP / AGENTS.md

```bash
# HeroUI (web) — dokumentacja komponentów React
npx -y @heroui/react-mcp@latest

# HeroUI Native (mobile) — dokumentacja komponentów React Native
npx -y @heroui/native-mcp@latest

# AGENTS.md dla AI assystentów
npx heroui-cli@latest agents-md --react
npx heroui-cli@latest agents-md --native
```

## Kluczowe decyzje

| Decyzja | Wybór | Uzasadnienie |
|---------|-------|-------------|
| Backend | FastAPI (Python) | Asynchroniczny, OpenAPI, pgvector support |
| Baza | PostgreSQL + pgvector | ACID, JSONB dla metadanych, wektory |
| Frontend | Next.js + HeroUI | Web dashboard |
| Mobile | Expo + HeroUI Native | QR skanowanie, offline sync |
| Search | Hybrid (BM25 + Cosine) | Lexical + semantyczne |
| QR | UUIDv4 w URI `shi://box/` | Bezkolizyjny, prosty parser |
