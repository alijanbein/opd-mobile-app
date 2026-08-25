# OPD AI Unit — Patient Mobile App

Patient-facing companion app for the [OPD AI Unit](../orthopedic-opd-ai-test) orthopedic
clinic system. Built with Expo (React Native) so a single codebase targets iOS and Android.

This is a **separate project from the web app's git repository on purpose** — mobile release
cycles, native tooling, and app-store review are on a different rhythm than the web/backend,
so keeping them decoupled means one doesn't block the other.

## Stack

- Expo SDK 57 + `expo-router` (file-based routing, used for the bottom tab navigator)
- TypeScript, strict mode
- No native backend calls yet — see **Current state** below

## Structure

```
app/
  _layout.tsx           root layout
  (tabs)/
    _layout.tsx          bottom tab bar (Home · Journey · Messages · Profile)
    index.tsx             Home — next appointment, PROM reminder, active care plan
    journey.tsx            Journey — PROM trend + visit timeline with doctor's orders
    messages.tsx            Messages — placeholder shell, chatbot design still pending
    profile.tsx              Profile — account, preferences, logout
components/          Card, Badge, ScreenHeader — shared UI primitives
theme/                colors.ts mirrors the web app's design system 1:1 (light + dark)
types/                 TypeScript shapes matching backend/schemas.py
data/                   mockData.ts — sample data in the exact shape the real API returns
```

## Design system

`theme/colors.ts` is a direct port of the web app's blue-turquoise palette
(`orthopedic-opd-ai-test/frontend/src/index.css`). If the web palette changes, mirror the
same token values here so the two apps stay visually consistent. Dark mode follows the
device's system setting automatically (`useColorScheme()`).

## Current state — what's mocked vs. real

Every screen renders from `data/mockData.ts`, not a live API. Two things need to exist on
the backend before this can go live:

1. **Patient login.** The backend (`orthopedic-opd-ai-test/backend`) only has staff auth
   today (nurse/physician/clerk via `routers/auth.py`) — there's no patient account system.
   The closest thing that exists is the tokenized, no-login PROM link
   (`routers/prom_public.py`) used for a single questionnaire, which isn't a substitute for
   a full patient session.
2. **A patient-facing API surface.** Once patient auth exists, this app would call the same
   FastAPI backend — the `types/` module is already shaped to match `backend/schemas.py`
   so wiring up real fetches later is close to a drop-in replacement for the mock data.

**Messages tab** is intentionally a placeholder — the chatbot's behavior/backend hasn't been
designed yet (separate discussion).

## Running it

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `a` / `i` for an emulator/simulator.

## Next steps

- Design + build patient auth on the backend (new user type, login flow).
- Wire real API calls into each screen (see `data/mockData.ts` for the shapes to replace).
- Design the Messages/chatbot experience.
- Native push notifications for appointment/PROM reminders (currently just a UI toggle on
  the Profile screen with no backend behind it).
