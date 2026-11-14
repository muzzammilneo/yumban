# Yumban

Manipur’s first Muslim matrimony app — find a life partner near you in an easy and 100% halal way.

Built with **React Native**, **Expo SDK 58** and **Expo Router**, from the “Yumban App” Figma file.

## Run it

```bash
npm install
npx expo start        # then press i for iOS, a for Android, w for web
```

Other commands:

```bash
npx tsc --noEmit      # type-check
npx expo lint         # lint
npx expo-doctor       # check dependencies and config
```

> Expo Go works for day-to-day development. For a real build (custom icon, launch screen, store release) use
> `npx expo run:ios` / `npx expo run:android` or EAS Build.

## Features

### Onboarding
- **Splash** → **Welcome** (gold ring screen) → **Start** (“We bring you Yumban…”) → **Login / Sign up**.
- Signed-in users skip straight from Splash to Discover.
- Login with phone or email and password; show/hide password.

### Sign up (4 steps)
1. **Basic information** — I’m a / Seeking a (man or woman), and the age range you’re looking for.
2. **Background** — relationship status (or “I’d rather not say”).
3. **Personal details** — name, address, phone, optional email, date of birth (18+ only), profession, password.
   Then **hobbies** — pick up to 5 (or skip).
4. **Photo** — take one or choose from the library (optional).

Phone numbers and emails must be unique; all fields are validated with inline error messages.

### Discover
- Top bar with the Yumban logo, a **notifications** bell (unread count) and a **filters** button (active filter count).
- Swipeable profile cards (photo, name, verified badge, age · height · town as frosted-glass chips).
  Swipe right / ♥ to favourite, left / ✕ to pass, tap a card to open the full profile.
- Profiles are filtered by your partner preferences and sorted so people with more hobbies in common come first.
- “It’s a match!” pop-up when someone you favourite has already favourited you.
- Free members see **10 profiles a day** (counter shown); Premium is unlimited.
- **Undo** last swipe (Premium).

### Filters (partner preferences)
Opened from Discover or Settings.
- Seeking a man / woman, age range, **verified profiles only**.
- **Faith & Practice** filters (multi-select, “No preference” by default): religious practice, sect, Islamic dress, diet,
  alcohol, smoking, born Muslim.
- **Clear all** and **Apply filters**.

### Your people (Favourites tab)
- **Favourites** — everyone you’ve swiped right on (tap ♥ to remove).
- **Likes you** — people who favourited you. Free members see blurred photos and a count; Premium members see who
  and can favourite them back.
- **Matches** — people who favourited each other.

### Profiles
- Full profile: photo, name + verified badge, age · height · town, about, **hobbies** (shared ones highlighted with
  “N in common”), **faith** chips and details.
- **Call / WhatsApp** — available only for **matches**, and requires **Premium** (locked otherwise, with an explanation).
- **Contact privacy** — if the other person has *Contact requests only* turned on, even a Premium match can’t call or
  WhatsApp them directly. They tap **Request to contact**; the button shows *Request sent* until the person accepts
  (contact unlocks) or declines. Both sides get a notification.
- **⋯ menu → Report or Block.**
  - **Report**: choose a reason (fake profile, inappropriate photos, harassment, scam / asking for money, under 18,
    already married, other), add details, optionally block too. Reports are confidential.
  - **Block**: you and that person disappear from each other’s Discover, Likes, Matches and Favourites.

### My profile (Profile tab)
- Photo (tap to change), name, age, height, town, about.
- Hobbies and “My faith” chips.
- Premium status card.
- Edit profile: personal details, height, about, hobbies (up to 5), relationship status, **My faith** —
  Faith & Practice answers (full-screen pickers; religious practice options include descriptions) and
  **what matters most** tags (up to 8, e.g. “Prays 5 times a day”, “Completed Umrah”).

### Verified badge
Profiles checked by the Yumban team show the verified badge (from Figma) next to their name everywhere. Users can’t
set this themselves — it’s granted by the backend.

### Premium
| | Free | Premium |
|---|---|---|
| Discover | 10 profiles a day | Unlimited |
| See who favourited you | Count only (blurred) | Full list |
| Contact matches (Call / WhatsApp) | Locked | ✓ (or send a request if they keep contact private) |
| Undo a swipe | — | ✓ |

Plans: 1, 3 and 6 months. **Purchases are simulated (demo mode)** — see *Before launch* below.

### Notifications
Bell on Discover → Notifications screen. Currently: welcome message, match alerts, contact requests and replies, and tips when your profile is
missing a photo, faith details or hobbies. Tapping a notification takes you to the right screen; opening the list marks
all as read.

### Settings tab
- **Account:** Subscription, Edit profile, Partner preferences, Notifications
- **Privacy & safety:**
  - **Contact requests only** switch — matches must ask before they can call or WhatsApp you
  - **Contact requests** inbox — accept or decline (shows how many are waiting)
  - **Blocked profiles** (with Unblock)
- **Support:** Help & FAQ, Contact us, Report a problem (opens email with app version)
- **Legal:** Terms of Service, Privacy Policy
- **About:** About Yumban, app version
- **Log out** and **Delete account** (permanent, with confirmation)

## Project structure

```
src/
  app/                    Screens (Expo Router — every file is a route)
    index.tsx             Splash
    welcome.tsx, start.tsx, login.tsx
    signup/               4-step sign-up (+ hobbies)
    (tabs)/               Discover, Favourites (“Your people”), Profile, Settings
    profile/[id].tsx      Someone’s profile (contact, report, block)
    edit-profile.tsx, filters.tsx, notifications.tsx, premium.tsx
    help.tsx, info/[page].tsx (about / terms / privacy), blocked.tsx, requests.tsx
  components/             Shared UI (buttons, fields, chips, pickers, swipe card, faith, safety sheets)
  context/                Auth (signed-in user, Premium) and sign-up draft state
  services/
    backend.ts            The Backend interface — everything the app needs from a server
    local-backend.ts      On-device implementation (AsyncStorage)
    types.ts              Data types, hobbies, report reasons
    faith.ts              Faith & Practice options and faith tags
    premium.ts            Free limit, plans, benefits
    seed.ts               10 demo profiles
  content/app-info.ts     Support email, About, Terms, Privacy and FAQ text
  theme/                  Design tokens (colours, fonts) and Figma assets
assets/
  figma/                  Images and icons exported from Figma
  images/                 App icon, adaptive icon, launch screen, favicon
```

Fonts: **Kalam** (headings, labels) and **Inter**, loaded from `@expo-google-fonts`.

## Data

All data currently lives **on the device** (`src/services/local-backend.ts`, AsyncStorage).
Passwords are salted and SHA-256 hashed. Ten demo profiles are seeded on first launch (`src/services/seed.ts`).

To move to a real backend, implement the `Backend` interface in `src/services/backend.ts` (e.g. Supabase or Firebase)
and swap it in `src/services/index.ts`. Screens only talk to that interface, so no screen code needs to change.

## Before launch

- **Real backend.** Accounts, matches, reports and blocks are per-device today. Connect a server so users can see each
  other across phones.
- **Demo data.** Two demo profiles (Sana, Aamir) keep contact private so the request flow can be tried; demo profiles
  can’t answer requests, so those stay pending.
- **Remove demo likes.** `demoProfileLikes` in `local-backend.ts` makes some demo profiles favourite every user so
  Likes / Matches have content. Delete it once real users exist.
- **In-app purchases.** Replace the demo `activatePremium` with App Store / Google Play billing (e.g. RevenueCat), and
  set real prices in `src/services/premium.ts` (currently placeholders).
- **Moderation.** Send reports to a review queue and give the team tools to warn, suspend or remove accounts — required
  by the App Store and Google Play for dating apps.
- **Legal.** The Terms and Privacy text in `src/content/app-info.ts` are drafts — have them reviewed, remove the “Draft”
  line, and host the Privacy Policy at a public URL for the store listings.
- **Support email.** Replace the placeholder `support@yumban.app` in `src/content/app-info.ts`.
- **Photos.** Demo profiles use placeholder portraits from randomuser.me; the Splash ring image is a GLAMIRA product
  photo — make sure you have the rights or replace it.
