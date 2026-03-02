# Nightly Librarian

A nightly knowledge graph pipeline. Auto-collects daily insights → review UI → GPT-4o consolidation → Supabase graph + Weaviate vectors + email brief.

## Quick Start (Local)

```bash
git clone https://github.com/rgeertsema/nightly-librarian.git
cd nightly-librarian
npm install
cp .env.example .env
# Fill in your .env values
npm run schedule
```

## Deploy Setup Wizard (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rgeertsema/nightly-librarian)

1. Click the button above
2. Follow the setup wizard at your Vercel URL
3. The wizard guides you through all configuration

## Architecture

```
inbox/YYYY-MM-DD.json     ← daily material (auto-collected)
       ↓ 05:30             review email sent
review UI (localhost:4242) ← approve / reject / edit
       ↓ 02:00             nightly pipeline runs
GPT-4o consolidation
       ↓
Supabase (graph)  +  Weaviate (vectors)  +  artifacts/*.md
       ↓
morning brief email
```

## Configuration

See `.env.example` for all options.

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | GPT-4o + embeddings |
| `SUPABASE_URL` | Graph storage |
| `WEAVIATE_HOST` | Vector storage |
| `SMTP_*` | Email (Gmail app password recommended) |
| `LIBRARIAN_REVIEW_CRON` | Review email time (default `30 5 * * *`) |
| `LIBRARIAN_CRON` | Pipeline run time (default `0 2 * * *`) |

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run nightly` | One-off manual pipeline run |
| `npm run schedule` | Start cron daemon |
| `npm run review` | Start local review server |

## Governance

Architect301 / AEGO ecosystem — CHG-2026-073
