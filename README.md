# EventLab.uz — Frontend

Frontend for the EventLab.uz platform — a modern web application for planning
and managing conferences, workshops, and seminars. Built with Vue 3,
TypeScript, Vite, and Tailwind CSS v4.

## Table of contents

- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Application workflow](#application-workflow)
- [Design system](#design-system)
- [Backend integration](#backend-integration)
- [Real-time layer](#real-time-layer)
- [Available scripts](#available-scripts)
- [Notes](#notes)

---

## Tech stack

| Layer | Choice |
|---|---|
| Core framework | **Vue 3** (Composition API + `<script setup>`) |
| Language | **TypeScript** |
| Bundler / dev server | **Vite 8** |
| Styling | **Tailwind CSS v4** (design tokens via `@theme`) |
| Routing | **Vue Router 4** (lazy routes, navigation guards) |
| State management | **Pinia** |
| HTTP client | **axios** (with refresh-token interceptor) |
| Real-time | **socket.io-client** |
| Type checking | **vue-tsc** |

---

## Quick start

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_UPLOADS_URL=http://localhost:3000
```

### 3. Run the dev server

```bash
yarn dev
```

Frontend runs at <http://localhost:5173> (Vite falls back to 5174 if the port
is taken).

### 4. Make sure the backend is running

In the `eventlab-backend` folder, run `yarn start:dev`. The API responds at
<http://localhost:3000/api>.

---

## Project structure

```
src/
├── assets/                Static files (images, icons, etc.)
├── components/
│   ├── admin/             Admin panel components (UserForm, etc.)
│   ├── conference/        Conference card and form
│   │   ├── ConferenceCard.vue
│   │   ├── ConferenceForm.vue
│   │   └── AllMaterialsList.vue
│   ├── layout/            Page chrome
│   │   ├── AppNavbar.vue        Top navigation
│   │   ├── AppFooter.vue
│   │   ├── AppLogo.vue
│   │   ├── AuthLayout.vue       Layout for login/register
│   │   ├── UserMenu.vue         Avatar dropdown
│   │   └── NotificationsBell.vue Notifications bell
│   ├── sections/          Landing page sections
│   │   ├── HeroSection.vue
│   │   ├── FeaturesSection.vue
│   │   ├── UseCasesSection.vue
│   │   ├── HowItWorksSection.vue
│   │   ├── BenefitsSection.vue
│   │   └── CtaFooterSection.vue
│   ├── session/           Session components
│   │   ├── SessionList.vue
│   │   ├── SessionForm.vue      With speaker dropdown
│   │   ├── QuestionsList.vue    Real-time Q&A
│   │   └── MaterialsList.vue    Drag-and-drop file upload
│   └── ui/                Reusable UI primitives
│       ├── BaseButton.vue
│       ├── BaseInput.vue
│       ├── BaseCard.vue
│       ├── BaseBadge.vue
│       ├── BaseModal.vue
│       ├── BaseContainer.vue
│       ├── BaseSection.vue
│       ├── ConfirmDialog.vue    Global confirm dialog
│       ├── ToastContainer.vue   Global toast system
│       ├── FeatureCard.vue
│       ├── StepCard.vue
│       ├── StatBlock.vue
│       ├── LogoTile.vue
│       ├── SectionHeading.vue
│       ├── SectionLabel.vue
│       └── IconBase.vue
│
├── composables/
│   ├── useSocket.ts         Socket lifecycle (auto-attach, reconnect)
│   ├── useToast.ts
│   ├── useConfirm.ts        Promise-based confirm dialog
│   ├── useFormatters.ts     Date/role/status formatters
│   ├── useScrollLock.ts     Body scroll lock when modal opens
│   ├── useSmoothScroll.ts   Smooth in-page scroll for hash links
│   └── useUpvotes.ts        Q&A: per-user/session vote cache (localStorage)
│
├── router/
│   └── index.ts             Lazy routes + auth/role guards
│
├── services/                axios instance and backend calls
│   ├── api.ts               Refresh-token interceptor, FormData handling
│   ├── socket.ts            Socket singleton, lazy connect
│   ├── auth.ts              login, register, refresh, logout
│   ├── users.ts             CRUD + avatar upload + speakers
│   ├── conferences.ts       CRUD + banner upload
│   ├── sessions.ts
│   ├── registrations.ts     Register + ticket PDF download
│   ├── questions.ts
│   ├── notifications.ts
│   ├── materials.ts
│   ├── certificates.ts      Issue + verify + PDF download
│   └── feedback.ts
│
├── stores/                  Pinia stores
│   ├── index.ts             createPinia() and exports
│   ├── auth.ts              user, tokens, login/logout, role getters
│   ├── conferences.ts       list, current, fetch/create/update/remove
│   ├── registrations.ts     mine, isRegistered helper
│   ├── notifications.ts     items, unread, prepend (real-time)
│   ├── toast.ts             success/error/info/warning + auto-dismiss
│   └── confirm.ts           Promise-based dialog opening
│
├── types/
│   └── index.ts             Types matching the backend Prisma schema
│
├── views/
│   ├── HomeView.vue                 Landing page
│   ├── ConferenceListView.vue       Filter + search
│   ├── ConferenceDetailView.vue     Hero + sessions + Q&A + materials
│   ├── ConferenceCreateView.vue
│   ├── ConferenceEditView.vue
│   ├── DashboardView.vue            My conferences, tickets, certificates
│   ├── ProfileView.vue              With avatar upload
│   ├── AdminView.vue                Users and conferences management
│   ├── CertificateVerifyView.vue    Public certificate verification
│   ├── NotFoundView.vue
│   └── auth/
│       ├── LoginView.vue
│       └── RegisterView.vue
│
├── App.vue                  Layout switch + global socket listener
├── main.ts                  Vue + Pinia + Router bootstrap
├── style.css                Tailwind v4 + design tokens
└── env.d.ts                 Vite + Vue type shims
```

---

## Application workflow

### 1. User opens the app

- `App.vue` mounts and calls `auth.fetchMe()` (if a token is present)
- If the token is valid → user data is loaded and `connectSocket()` runs
- The socket gateway joins the user to their personal room `user:${id}`
  (used for private notifications)
- `notifications.refreshUnread()` updates the bell badge

### 2. Conference list

- The `/conferences` page calls `conferences.fetchAll({ status, search })`
- The status filter uses the backend's computed effective status
  (`DRAFT`, `PUBLISHED`, `ONGOING`, `FINISHED`, `CANCELLED`)
- Each card renders the banner via `background-image` (falls back to a green
  gradient placeholder when no banner is set)

### 3. Creating a conference (organizer)

1. `/organizer/conferences/new` opens the `ConferenceForm.vue`
2. Pick a banner image (drag-and-drop or file picker, 5 MB limit)
3. On submit:
   - `POST /api/conferences` creates the record
   - If a banner is selected: `POST /api/conferences/:id/banner`
4. Redirects to `/conferences/:id`

### 4. Sessions and speakers

- `SessionForm.vue` loads the speakers list via `usersApi.speakers()`
  (only ADMIN and ORGANIZER roles have access)
- Selecting a speaker assigns them to the session. Leaving the field empty
  sends `null`, which removes any existing speaker

### 5. Registration

- `POST /api/registrations/conference/:id`
- The backend checks the computed status — registration is rejected for
  `DRAFT`, `CANCELLED`, or `FINISHED` conferences
- On success: a PDF ticket is generated automatically and a new tab opens
  to download it
- A welcome notification is pushed in real time

### 6. The day of the event — selecting a session

- In `ConferenceDetailView`, when a session is clicked:
  - `<MaterialsList :key="session.id">` re-mounts cleanly
  - `<QuestionsList :key="session.id">` re-mounts cleanly
  - `join_session` is emitted on the socket
- The assigned speaker can upload materials (PDF, PPT, DOC, ZIP, image; 25 MB)

### 7. Real-time Q&A

- A participant types a question → `send_question` over socket
- The server stores it and broadcasts `new_question` to that session's room
- Upvotes: `upvote_question` → `question_upvoted` broadcast
- A user can vote on a question only **once** (the `useUpvotes` composable
  persists votes in localStorage)
- The speaker or organizer answers via REST `/answer` → the gateway
  broadcasts `question_answered`

### 8. Notifications

Real-time push triggers:
- Conference cancelled / date changed / removed
- Registration confirmation
- New question (sent to the session speaker)
- Answer to your question (sent to the question author)
- Certificate ready

The `App.vue` global listener (`useSocket({ new_notification })`) does:
- `notifications.prepend(n)` — adds to store and increments `unread`
- `toast.info(...)` — shows a toast at the bottom-right

### 9. Certificates (only for finished events)

- Available when the effective status is `FINISHED` and the user is registered
- An "Issue certificate" button appears
- `POST /api/certificates/issue/:conferenceId` → backend renders a PDF
  (PDFKit + QR code)
- The PDF opens in a new browser tab automatically
- The verify page (`/certificates/:code`) is public — anyone can check
  authenticity

---

## Design system

### Source
[`DESIGN.md`](./DESIGN.md) — Mintlify-inspired documentation-grade design
(white surface, green accent, tight typography, full-pill buttons).

### Design tokens — `src/style.css`

Defined via Tailwind v4 `@theme`:

```css
--color-bg: #ffffff;
--color-text: #0d0d0d;
--color-text-secondary: #333333;
--color-text-muted: #666666;

--color-brand: #18e299;          /* signature green */
--color-brand-light: #d4fae8;    /* soft green surface */
--color-brand-deep: #0fa76e;     /* darker green */

--color-error, --color-warn, --color-info ...

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 9999px;
```

### Typography
- **Inter** — for the UI
- **Geist Mono** — for code, labels, and technical text
- Three weights only: 400 (read), 500 (interact), 600 (announce)
- Display headings scale responsively with `clamp()`
  (mobile: 28px, desktop: 64px)

### Component conventions
- `<BaseButton>` has 5 variants: `primary` | `secondary` | `ghost` | `accent` | `danger`
- `<BaseModal>` becomes a bottom-sheet on mobile
- `<BaseInput>` supports pill or square styles, error/hint slots
- All cards use `1px solid rgba(0,0,0,0.05)` borders + a subtle ambient shadow

### Responsive breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | `<480px` | Body 15px, single column, stacked layout |
| Tablet | `768px` | Two-column grids start |
| Desktop | `1024px+` | Full layout, three-column grids |

Global `body { overflow-x: hidden }` and `max-width: 100%` on every image
and SVG prevent horizontal scrolling.

---

## Backend integration

### Auth flow

```
1. Login/Register → POST /api/auth/login (or /register)
2. Response: { user, tokens: { accessToken, refreshToken } }
3. tokenStorage.set(tokens) — persisted in localStorage
4. Each protected request includes: Authorization: Bearer <accessToken>
5. On 401: pending requests are paused
   → POST /api/auth/refresh { refreshToken }
   → original request is retried with the new token
6. If refresh also returns 401: tokenStorage.clear() + redirect to /auth/login
```

### Refresh-token queue

In `api.ts`, an `isRefreshing` flag plus a `waitingQueue`:
- If five requests get 401 at the same time, **only one** refresh fires
- The rest are retried in order once the new token arrives

### Roles and permissions

| Role | Capabilities |
|---|---|
| `ADMIN` | Everything (user CRUD, statistics) |
| `ORGANIZER` | Create/manage conferences and sessions, banner uploads |
| `SPEAKER` | Upload materials to their session, answer questions |
| `PARTICIPANT` | Register, ask questions, get certificates |
| `GUEST` | View public conferences only |

Routes are protected through `meta.roles`:
```ts
{ path: '/admin', meta: { requiresAuth: true, roles: ['ADMIN'] } }
```

---

## Real-time layer

### Socket.IO singleton

`src/services/socket.ts` keeps a single socket instance. The auth callback
reads the latest token on every connection attempt. On logout the socket
disconnects but listeners are kept so the next login works seamlessly.

### `useSocket` composable

```ts
const { connected, emit } = useSocket(
  {
    new_question: onNewQuestion,
    question_upvoted: onUpvoted,
  },
  { autoConnect: true },
)
```

- `connected` — a reactive ref that tracks the socket state
- Listeners attach immediately during `setup()`
- `onBeforeUnmount` removes only this component's listeners (other
  components are unaffected)

### Client → server events

| Emit | Routed to | Purpose |
|---|---|---|
| `join_conference` | `conference:${id}` room | Conference-wide updates |
| `leave_conference` | leaves the room | |
| `join_session` | `session:${id}` room | Q&A |
| `send_question` | server | New question |
| `upvote_question` | server | Upvote |
| `send_message` | conference room | Chat |

### Server → client events

| Event | When |
|---|---|
| `new_question` | A new question was posted in the session |
| `question_upvoted` | A question received an upvote |
| `question_answered` | The speaker answered |
| `new_notification` | A personal notification arrived (`user:${id}`) |
| `user_joined` | A new participant joined the room |

---

## Available scripts

```bash
yarn dev              # dev server with HMR
yarn build            # production build
yarn preview          # preview the production build locally
yarn vue-tsc -p tsconfig.app.json --noEmit  # type checking
```

---

## Notes

### IDE TypeScript server cache
Vite HMR reloads code instantly, but IDEs (VS Code, JetBrains) sometimes
display stale TypeScript errors until the TS server is restarted. Trust
`vue-tsc` for the source of truth.

### Browser cache
For static files (banners, avatars, certificate PDFs), use a **hard refresh**
(`Ctrl+Shift+R` or `Cmd+Shift+R`).

### CORS and static files
The backend sets `Cross-Origin-Resource-Policy: cross-origin` in Helmet, so
the frontend on port `5173` can load images from the backend on port `3000`
without issues.

### Test accounts
After seeding the backend (`yarn db:seed`):

| Email | Role | Password |
|---|---|---|
| `admin@eventlab.uz` | ADMIN | `Password123!` |
| `organizer@eventlab.uz` | ORGANIZER | `Password123!` |
| `speaker@eventlab.uz` | SPEAKER | `Password123!` |
| `user@eventlab.uz` | PARTICIPANT | `Password123!` |
