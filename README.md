# OPD AI Unit — Patient Mobile App

Patient-facing companion app for the [OPD AI Unit](../orthopedic-opd-ai-test) orthopedic
clinic system. Built with Expo (React Native) so a single codebase targets iOS and Android.

This is a **separate project from the web app's git repository on purpose** — mobile release
cycles, native tooling, and app-store review are on a different rhythm than the web/backend,
so keeping them decoupled means one doesn't block the other.

## Stack

- Expo SDK 57 + `expo-router` (file-based routing; `Stack.Protected` gates the tabs behind login)
- TypeScript, strict mode
- `axios` for API calls, `expo-secure-store` (native) / `localStorage` (web) for the session
  token, `expo-file-system` + `expo-sharing` for authenticated document download/view,
  `react-native-webview` to embed the web app's existing PROM fill-in page

## Structure

```
app/
  _layout.tsx           root layout — SessionProvider + Stack.Protected auth gate
  (auth)/
    mrn.tsx                 MRN entry -> requests an OTP
    otp.tsx                 6-digit code entry -> verifies, stores the session
  (tabs)/
    _layout.tsx          bottom tab bar (Home · Journey · Messages · Profile)
    index.tsx             Home — next appointment, notification bell, PROM reminder, care plan
    journey.tsx             Journey — PROM trend graph + visit-report timeline
    messages.tsx              Messages — real chat with the clinic (shown as "Care Assistant")
    profile.tsx                Profile — real patient identity, preferences, logout
  report/[id].tsx        Visit report detail — SOAP note sections, attached documents
  document/[id].tsx      Full-screen image viewer for an attached document
  notifications.tsx     In-app inbox — one row per "a report was sent to you" event
  prom-fill.tsx           Embeds the web app's /prom/:token fill-in page in a WebView
api/                  client.ts (axios instance + auth interceptor), patient.ts (typed calls)
context/              AuthContext.tsx — SessionProvider/useSession
lib/                    downloadDocument.ts, tokenStorage.ts (SecureStore w/ web fallback)
components/          Card, Badge, ScreenHeader — shared UI primitives
theme/                colors.ts mirrors the web app's design system 1:1 (light + dark)
```

Every screen reads from the backend — there is no mock data or `types/`/`data/` sample-data
module in this project.

## Design system

`theme/colors.ts` is a direct port of the web app's blue-turquoise palette
(`orthopedic-opd-ai-test/frontend/src/index.css`). If the web palette changes, mirror the
same token values here so the two apps stay visually consistent. Dark mode follows the
device's system setting automatically (`useColorScheme()`).

## Current state

All screens are wired to the backend (`../Orthopedic OPD AI/backend`, routers
`patient_auth.py` / `patient_self.py`):
- MRN + OTP login, with a patient-scoped JWT (audience-separated from the staff token —
  see `backend/auth.py`'s `get_current_patient`). MRN identifies the patient (unique per
  `models.Patient`); the OTP itself still goes to the phone number on file.
- Home: next appointment (`Patient.appointmentDate/Time` + most recent evaluation's
  physician), PROM check-in reminder (real `PROMAssignment` status), active care plan
  (active `Treatment`s + pending `Diagnostic`s), and a progress stat derived from the real
  PROM trend.
- Journey: the real PROM trend graph (same fixed-timepoint logic the staff dashboard uses —
  `backend/routers/prom_trend.py`'s `compute_prom_trend`, reused rather than duplicated) and
  the visit-report timeline.
- Report detail: diagnosis, SOAP note sections, physician/surgeon name + date, attached
  document download/view (images render full-screen in-app; PDFs go through the system share
  sheet since Android's WebView has no built-in PDF renderer), an AI-generated plain-language
  summary (`backend/patient_summary.py`, generated once at the moment staff clicks "Send to
  Patient" — reuses the diagnosis + SOAP note's assessment/plan, never invents details beyond
  what's on file), and a PDF export of the whole report (`expo-print` + `expo-sharing` on
  native; opens the browser's print dialog on web, since `expo-print` has no real web PDF
  generation of its own).
- PROM fill-in: tapping "Start" on a due self-completion PROM opens the web app's own
  `/prom/:token` page (dynamic form + scoring, already built and tested there) in a WebView,
  rather than re-implementing that form/scoring logic natively — needs
  `EXPO_PUBLIC_WEB_APP_BASE_URL` set (see `.env.example`). A PROM routed as clerk-assisted or
  physician-assisted shows as informational only (no "Start" button — that one gets done with
  staff in person, not through the app).
- In-app notification inbox — a row is created server-side the moment a doctor/surgeon marks
  a report "sent to patient", surfaced via the bell icon on Home and `/notifications`.
- Messages: real two-way chat with the clinic, backed by a shared `chat_messages` table (also
  consumed by a dashboard-side "Messages" page in the web app — any logged-in nurse/physician
  can open a patient's thread and reply). The patient always sees replies simply as "Care
  Assistant," never an individual staff name. Send-only (no edit/delete); the screen polls for
  new messages every 8s while open, and a new message either direction fires the existing
  notification mechanism (patient's bell / staff's dashboard toast).

**Push notifications** are in-app only for now — real device push (Expo push service) is
deferred because Expo Go can't receive remote push on Android since SDK 53; wiring it up
needs a `expo-dev-client` build. The server-side trigger point already exists
(`backend/notifications.py`), so adding real push later is additive, not a redesign.

**Profile preferences** (Notifications/Appointment Reminders toggles, Language, Appearance)
are still local-only UI state — there's no per-patient preference storage or i18n in the
backend yet, so these aren't backed by anything to "de-mock."

## Running it

1. Nothing to configure for the common case: `api/host.ts` reads the LAN IP straight off the
   Metro dev server (`Constants.expoConfig.hostUri`, the address your phone/emulator already
   used to load the JS bundle) and builds `http://<that-ip>:8000` (backend) and
   `http://<that-ip>:5173` (web app, for the PROM fill-in WebView) from it automatically. Just
   run `npx expo start` — it keeps working after switching WiFi/hotspot networks since the
   host is re-detected on every dev server start, with nothing to edit by hand.

   Only set `.env` (copy from `.env.example`) if you need to override this — e.g. the backend
   isn't running on the same machine as Metro, or a production/EAS build where there is no dev
   server to introspect at all. `EXPO_PUBLIC_API_BASE_URL`/`EXPO_PUBLIC_WEB_APP_BASE_URL`, when
   set, always take priority over the auto-detected host.

   > **Node version note:** Expo SDK 57's `.env` loader requires Node ≥ 20.19.4 (uses
   > `node:util.parseEnv`, added in that release). On an older Node, merely having a `.env`
   > file present crashes `expo start`/`expo export` outright. If you can't upgrade Node and
   > need the override above, export the vars in your shell instead before running Expo, e.g.
   > (PowerShell)
   > `$env:EXPO_PUBLIC_API_BASE_URL="http://<lan-ip>:8000"; npx expo start`.
   > For a lasting fix (works in every new terminal without retyping), set them once with
   > `setx` instead, then reopen the terminal.

2. Start the backend (`../Orthopedic OPD AI/backend`): `uvicorn main:app --reload --host 0.0.0.0`
   (`--host 0.0.0.0` so it's reachable from a phone on the same LAN, not just localhost).

3. If you want the in-app PROM fill-in to work, also start the web frontend
   (`../Orthopedic OPD AI/frontend`): `npm run dev` (Vite, port 5173).

4. ```
   npm install
   npx expo start
   ```

   Scan the QR code with Expo Go (iOS/Android), or press `a` / `i` for an emulator/simulator.
   Log in with a patient's MRN on file in the backend — since no SMS provider is configured
   (`OTP_DEV_MODE=true` by default), the code is shown directly on the OTP screen and printed
   to the backend console.

## Next steps

- Real device push notifications once a dev-client build is in place.
- Per-patient notification preferences and app language, if/when the backend grows a place
  to store them.
