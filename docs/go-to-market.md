# Smart Home Inventory — Go-To-Market Strategy

> **Phase:** concept → MVP  \
> **Target:** domowy użytkownik (B2C) + garaż/majsterkowicz  \
> **Channel:** App Store + web search + builder communities

---

## Fazy rozwoju

### Phase 1: MVP (4-6 tygodni)
**Cel:** Działający prototyp dla pojedynczego domu.

| Komponent | Co | Priorytet |
|-----------|-----|-----------|
| **Backend** | FastAPI + PostgreSQL + pgvector | 🟢 must |
| **Web** | Dashboard (Next.js + HeroUI) | 🟢 must |
| **Mobile** | Expo + HeroUI Native + QR scan | 🟢 must |
| **Auth** | Google/Apple OAuth + guest mode | 🟡 should |
| **Offline** | SQLite queue + LWW sync | 🟡 should |
| **Search** | Hybrid (BM25 + cosine) | 🟢 must |

**KPI:** 10 domów testowych, 500+ przedmiotów, <2s search latency.

### Phase 2: Social (8-12 tygodni)
**Cel:** Udostępnianie, współdzielenie domu.

- Zaproszenia dla domowników (role: admin/editor/viewer)
- Historia zmian (audit log)
- Export PDF/CSV spisu inwentarza

**KPI:** 3+ użytkowników na dom, 20% MAU growth.

### Phase 3: Pro (12-16 tygodni)
**Cel:** Monetyzacja.

- **Free tier:** 5 kontenerów, 50 przedmiotów, brak offline
- **Pro ($4.99/mies.):** nieograniczone, offline sync, API access
- **Family ($9.99/mies.):** do 5 członków, priorytetowe wsparcie

**KPI:** 5% konwersji free→paid, <5% churn.

---

## Kanały dystrybucji

| Kanał | Koszt | Efekt | Kiedy |
|-------|-------|-------|-------|
| App Store (iOS + Android) | $0 | organic | Phase 1 |
| Reddit r/selfhosted, r/homeautomation | $0 | viral | Phase 1 |
| Product Hunt launch | $0 | traffic | Phase 2 |
| YouTube (setup tutorial) | $0 | SEO | Phase 2 |
| Google Ads ("home inventory app") | $50/mies | paid | Phase 3 |

---

## Konkurencja

| Produkt | Typ | Cena | Gap |
|---------|-----|------|-----|
| Sortly | IMS | $14.99/mies | drogi, brak offline sync |
| Home Contents | app | $4.99 one-time | brak QR, brak wyszukiwania |
| Encircle | IMS | $29/mies | dla firm, overkill |
| **MyHome (nasz)** | IMS | $4.99/mies | QR + hybrid search + offline |

**Moat:** Hybrydowe wyszukiwanie (znajdź "buty zimowe" → znajdzie "śniegowce" nawet gdy nie ma tagów). Offline-first. Otwarty API.

---

## Ryzyka

| Ryzyko | Prawdopodobieństwo | Mitygacja |
|--------|-------------------|-----------|
| Niska adopcja offline sync | średnie | Testy w piwnicach/garazach |
| Koszt embeddingów (sentence-transformers) | niskie | Cache, batch processing |
| QR etykiety się ścierają | niskie | QR z korekcją błędów (ECC H) |
| Konkurencja skopiuje | średnie | Open source core → community lock-in |
