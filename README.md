# Smart Home Inventory System

> **Status:** concept  \
> **Stack:** FastAPI + Next.js + React Native (Expo) + PostgreSQL (pgvector)  \
> **UI:** HeroUI (web) + HeroUI Native (mobile)  \
> **Obsidian:** `vault/10_Projects/Smart_Home_Inventory/`

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
