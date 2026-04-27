# Business model overview

This overview is **synthesized from the product narrative and UI** in this repository (marketing pages, signup flows, FAQs, and placeholder dashboard copy). It is not a legal or financial prospectus. Where the app uses mock data (for example payments or trip history), that is called out below.

## What YanaGaman is selling

YanaGaman is positioned as a **premium smart transit / ride-pooling** service for **greater Colombo**: recurring urban mobility with scheduling, route matching, transparency (tracking and pricing clarity), and a safety story (verification, support, vetting described in copy).

The brand emphasizes **efficiency and sustainability** (route optimization, lower footprint, electric-first fleet narrative on the About page) alongside **convenience** (book now or schedule ahead, “dynamic pooling”).

## Customer segments

| Segment | How the product reflects it |
|---------|------------------------------|
| **Passengers (B2C)** | Primary audience: commuters set pickup/drop, route preferences, optional “same evening return,” emergency contacts. Signup and home hero focus on pools and rhythm of travel. |
| **Drivers** | Separate signup path: own vehicle vs company vehicle, vehicle number where relevant—supply side for pooled or assigned trips (exact dispatch model is not specified in code). |
| **Higher-intent / corporate** | FAQ references **Enterprise** and **Daily Max** subscribers getting a **dedicated account manager**; “Book a Demo” appears on marketing CTAs—suggesting **B2B or premium B2C** upsell beyond the base commuter plan. |

## Revenue model (as presented in the product)

1. **Subscriptions (recurring)**  
   The “How it works” flow and dashboard placeholder describe **monthly plans** in LKR:
   - **Commuter** — LKR 4,900 / month (also shown as the active plan in the dashboard UI mock).
   - **Daily Max** — LKR 12,900 / month (positioned as a higher tier; FAQ ties it to account management).

   Copy describes **flexible subscriptions**: pause, upgrade, or change plans—classic **SaaS-style recurring revenue** on mobility access rather than purely pay-per-ride.

2. **Trip-level pricing (illustrative)**  
   The home page shows an example **popular route** with a price (e.g. LKR 140 for “Borella → Fort”), which implies **per-trip or pooled-segment pricing** in addition to or inside subscription logic. The codebase does not implement real pricing engines or payments.

3. **Enterprise (referenced, not implemented)**  
   Enterprise is mentioned in FAQ only; no separate enterprise signup path exists in this repo.

## Operating / value chain (as described, not as built)

The narrative implies:

1. **Demand aggregation** — Users define schedules and corridors; the product speaks of matching people who share **90%+ of a route** (“kinetic” / smart pooling).
2. **Dispatch and routing** — Real-time traffic, ETAs, and “neural” or algorithmic routing are marketing claims; there is no matching or routing backend in this frontend-only flow beyond UI.
3. **Trust and safety** — Background checks, encryption, GPS, SOS are described in FAQ and About-style messaging to support conversion and retention.
4. **Support** — 24/7 concierge for all users; account managers for selected tiers.

## Geography and scale (marketing claims)

- **Primary market:** Greater **Colombo** metropolitan area (regions appear in forms as Colombo areas and nearby suburbs).
- **Trust social proof** in copy: “50,000+” commuters / urban explorers.
- **FAQ** mentions future expansion to **Kandy** and **Galle** (timeline in copy may not match current calendar—treat as product storytelling unless verified separately).

## What this codebase actually implements

- **Authentication and user profiles** (Firebase): passengers vs drivers, route fields, emergency contacts.
- **No** live pooling, payments, subscriptions billing, or trip ledger—those are **UI placeholders or marketing** unless connected elsewhere.

For technical scope, see [PROJECT.md](./PROJECT.md) and [DATABASE.md](./DATABASE.md).
