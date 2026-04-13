<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Platform Overview

`Platform_Game` is a mobile-first Whiteout Survival alliance platform built with:
- Next.js App Router (`src/app`)
- Tailwind CSS
- Supabase client-side integration (`@supabase/supabase-js`)
- No custom backend API; read/write directly to Supabase

Primary theme/focus:
- Alliance: `[EVE] Everlasting`
- State-centric dashboard and alliance management
- Admin-managed master data that drives public pages

## Stack Information

### Frontend
- `next` (App Router)
- `react`
- `react-dom`
- `tailwindcss`
- TypeScript

### Data Layer
- Supabase Postgres (master data + transactional data)
- Supabase RLS (row-level policy)
- Supabase client SDK (`@supabase/supabase-js`)

### Runtime / Tooling
- Node.js + npm
- ESLint (`npm run lint`)

### Architecture Constraints
- No custom backend API (direct client read/write to Supabase)
- Admin auth currently hardcoded in frontend (temporary)
- Mobile-first UI with desktop adaptation

## Folder Structure

```text
Platform_Game/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                       # Home
│  │  ├─ layout.tsx                     # Global layout + nav
│  │  ├─ state/page.tsx                 # Public state page
│  │  ├─ alliance/page.tsx              # Public alliance page
│  │  ├─ players/page.tsx               # Public players page
│  │  ├─ leaderboard/page.tsx           # Public leaderboard page
│  │  ├─ register/page.tsx              # Public registration page
│  │  └─ admin/
│  │     ├─ page.tsx                    # Admin login + summary
│  │     ├─ state/page.tsx              # Master Data: State
│  │     ├─ alliance/page.tsx           # Master Data: Alliance + Events
│  │     ├─ quick-stats/page.tsx        # Master Data: Quick Stats
│  │     ├─ latest-update/page.tsx      # Master Data: Latest Update
│  │     └─ registrations/page.tsx      # Registration management
│  ├─ components/
│  │  ├─ site-nav.tsx                   # Top nav + mobile nav
│  │  ├─ home/
│  │  │  ├─ home-hero.tsx               # Home hero (master data driven)
│  │  │  ├─ quick-stats.tsx             # Home quick stats (Supabase)
│  │  │  ├─ latest-updates.tsx          # Home latest updates (Supabase)
│  │  │  └─ alliance-carousel.tsx       # Alliance image carousel
│  │  └─ forms/
│  │     └─ registration-form.tsx       # Registration submit form
│  └─ lib/
│     ├─ supabase-client.ts             # Supabase client init
│     ├─ admin-auth.ts                  # Temporary hardcoded admin auth
│     └─ content.ts                     # Static content (carousel/seed-like)
├─ public/
│  └─ images/                           # Hero and gallery assets
├─ supabase/
│  └─ schema.sql                        # Full idempotent schema + policies
├─ AGENTS.md                            # Internal project implementation guide
└─ package.json
```

## Database Schema (Supabase)

Schema source of truth:
- `supabase/schema.sql` (idempotent: create + alter + policy recreation)

### Main Tables

1. `states`
- `id` (uuid, pk)
- `name` (text, required)
- `description` (text)
- `commander_in_charge` (text)
- `reset_event` (text)
- `state_age` (text)
- `status` (text)
- `cover_image_url` (text)
- `updated_at` (timestamptz)

2. `state_updates`
- `id` (uuid, pk)
- `state_id` (uuid, fk -> `states.id`)
- `title` (text, required)
- `content` (text, required)
- `image_url` (text)
- `is_published` (boolean)
- `created_at` (timestamptz)

3. `alliances`
- `id` (uuid, pk)
- `name` (text, required)
- `tag` (text, required)
- `slogan` (text)
- `description` (text)
- `requirements` (text)
- `timezone` (text)
- `banner_url` (text)

4. `alliance_events`
- `id` (uuid, pk)
- `alliance_id` (uuid, fk -> `alliances.id`)
- `title` (text, required)
- `subtitle` (text)
- `event_time` (text, HH:mm)
- `event_timestamp` (timestamptz, backward compatibility/fallback)
- `is_published` (boolean)
- `created_at` (timestamptz)

5. `quick_stats`
- `id` (uuid, pk)
- `label` (text, required)
- `value` (text, required)
- `note` (text)
- `sort_order` (integer)
- `is_active` (boolean)
- `updated_at` (timestamptz)

6. `registrations`
- `id` (uuid, pk)
- `name` (text)
- `game_id` (text)
- `note` (text)
- `power_image_url` (text)
- `status` (text)
- `created_at` (timestamptz)
- `reviewed_by` (uuid, fk -> `auth.users.id`)

7. Supporting tables
- `players`
- `leaderboards`
- `profiles`

### Policy Model (Current)
- Public read policies for published/public-facing data.
- Temporary permissive admin policies for:
  - `states`
  - `state_updates`
  - `alliances`
  - `alliance_events`
  - `quick_stats`
- These temporary policies exist to support hardcoded frontend admin login.

## Infrastructure

### Environment
- Runtime: Node.js
- Framework: Next.js (App Router)
- Package manager: npm
- Host target: Vercel-compatible (standard Next.js deployment)

### Services
- Supabase Postgres:
  - all application data and master data
  - row-level policies (RLS)
- Supabase Storage:
  - registration proof images (`registration-proof`)
  - optional media buckets for state/alliance assets

### Frontend Architecture
- Client-heavy data access using `@supabase/supabase-js`.
- No custom server/backend API layer.
- Session for admin hardcoded auth stored in browser `localStorage`.

### Operational Flow
1. Change schema in `supabase/schema.sql`.
2. Run SQL in Supabase SQL Editor.
3. Run local verification:
   - `npm run lint`
4. Validate pages:
   - public routes (`/`, `/state`, `/alliance`, etc.)
   - admin routes (`/admin/*`)

### Reliability / Security Notes
- Current hardcoded admin auth is temporary and not production-grade.
- Planned hardening path:
  1. migrate to Supabase Auth
  2. map roles in `profiles`
  3. remove temporary permissive policies
  4. enforce strict role-based RLS only

## Current Route Map

Public:
- `/` Home (hero, quick stats, carousel, latest update)
- `/state` State details + timeline update
- `/alliance` Alliance profile + alliance events
- `/players` Player cards
- `/leaderboard` Leaderboard cards
- `/register` Registration form

Admin:
- `/admin` Admin login + admin summary dashboard
- `/admin/state` Master Data State + State Timeline manager
- `/admin/alliance` Master Data Alliance + Alliance Events manager
- `/admin/quick-stats` Master Data Quick Stats manager
- `/admin/latest-update` Master Data Latest Update manager
- `/admin/registrations` Registration list

## Data Source Responsibilities

### Home (`/`)
- Hero branding and banner: Supabase `alliances` + `states`
  - component: `src/components/home/home-hero.tsx`
- Quick stats: Supabase `quick_stats`
  - component: `src/components/home/quick-stats.tsx`
- Latest update: Supabase `state_updates` (published only)
  - component: `src/components/home/latest-updates.tsx`
- Gallery carousel: static config in `src/lib/content.ts`

### State (`/state`)
- State fields from `states`:
  - `name`
  - `description`
  - `commander_in_charge`
  - `reset_event`
  - `state_age`
- Timeline from `state_updates` (published only)

### Alliance (`/alliance`)
- Alliance fields from `alliances`:
  - `name`
  - `tag`
  - `slogan`
  - `description`
- Event list from `alliance_events`:
  - `title`
  - `subtitle`
  - `event_time` (time-only HH:mm)

## Admin Authentication Model (Current)

Temporary frontend-only hardcoded auth:
- file: `src/lib/admin-auth.ts`
- username: `eveadmin`
- password: `eve3302`
- session key: `eve-admin-session` in `localStorage`

Behavior:
- Login persists between page refreshes.
- Logout clears local session.
- Section pages redirect to `/admin` if session invalid.

> Important: this is not production-safe security. It is intentionally temporary while using direct Supabase access without real Auth role binding.

## Master Data Sections

### 1) Master Data: State (`/admin/state`)
- Save/update state detail fields.
- Create timeline records in `state_updates`.
- Set publish flag and backdate timeline timestamp.
- Toggle publish / delete timeline rows.

### 2) Master Data: Alliance (`/admin/alliance`)
- Save/update alliance profile:
  - `name`, `tag`, `slogan`, `description`, `banner_url`
- Manage alliance events:
  - `title`, `subtitle`, `event_time` (HH:mm), publish status

### 3) Master Data: Quick Stats (`/admin/quick-stats`)
- Add quick stats (`label`, `value`, `note`, `sort_order`, `is_active`)
- Toggle active status
- Delete rows

### 4) Master Data: Latest Update (`/admin/latest-update`)
- Add updates (`title`, `content`, optional image URL, publish flag)
- Optional backdate via timestamp input
- Toggle publish / delete rows

### 5) Registrations (`/admin/registrations`)
- Read registration submissions and status data

## Supabase Schema and Policies

Single source SQL:
- `supabase/schema.sql`

Core tables currently used:
- `states`
- `state_updates`
- `alliances`
- `alliance_events`
- `quick_stats`
- `players`
- `leaderboards`
- `registrations`
- `profiles`

Policy strategy currently in repository:
- Public read policies for published/public data.
- Temporary `for all using (true) with check (true)` policies for admin-managed tables to support hardcoded frontend login flow.

## Required Operational Step After Schema Change

After any schema update, run:
- `supabase/schema.sql` in Supabase SQL Editor

This is required so new columns/tables/policies are actually applied in the database.

## Implementation Notes for Future Agents

- Prefer master data from Supabase for public page content; avoid reintroducing hardcoded profile data.
- Keep admin pages section-scoped (one domain per admin page).
- Preserve mobile-first UI behavior and styling conventions (`ice-panel`, frost theme classes).
- Avoid manual picker invocation (`showPicker`) on input controls unless absolutely needed; browser gesture restrictions can throw runtime errors.
- For sortable timestamp lists, enforce descending order both in query and client fallback sorting when consistency matters.

## Known Security Debt / Next Migration Target

Replace hardcoded admin auth with Supabase Auth + role-based RLS:
1. Authenticate admin users through Supabase Auth.
2. Store roles in `profiles`.
3. Remove temporary permissive policies.
4. Keep only role-checked policies (`admin/recruiter`).
