# YanaGaman — scope & effort estimate

*Plain-language summary for stakeholders.*

**Purpose:** A simple, non-technical overview of effort for moving YanaGaman to a dedicated back office (secure server, proper database) while keeping the current website look and feel. Hours are **indicative** and should be confirmed after a short discovery call.

**Rough total:** about **80–130 hours** (roughly **2–3.5 weeks** of full-time focus, or a bit longer at part-time). This assumes **efficient delivery with modern tooling and AI-assisted development**—faster on boilerplate and wiring, with time still reserved for **integration, testing, and a smooth handover**.

Add about **10–20%** if you want extra buffer for client review rounds or last-minute changes.

---

## What the client gets

| What | In plain terms |
|------|----------------|
| New “brain” for the app | A professional server application that stores accounts and data safely in a real database (not only on the current third-party system). |
| Same front end, smarter wiring | The existing YanaGaman website stays; it will talk to the new system through standard, well-defined connections. |
| Three user types | **Passengers**, **drivers**, and **administrators**—each with the right access. |
| Moving existing users | A planned switch from the current sign-in and profile setup to the new one, with a safe path for people who already have accounts. |
| Foundation for growth | A structure that later supports booking, payments, and reporting without redesigning the basics. |

---

## Phases and hours (indicative)

| Phase | What happens (no jargon) | Hours |
|--------|---------------------------|------:|
| **1. Setup and foundation** | New project for the server side, connection to the database, basic security, and a “health check” so we know the system is running. | 10–16 |
| **2. Data design and first version in the database** | Tables and rules for users, passengers, drivers, and emergency contacts—clean and ready to grow. | 12–18 |
| **3. Sign-up, sign-in, sign-out** | New accounts, login, session handling, and “who is this user?” for the app—matching what the site needs today. | 14–22 |
| **4. Profiles and emergency contacts** | Save and update profile details and emergency contacts the way the dashboard expects; permissions so each role only sees what it should. | 12–18 |
| **5. Connect the current website** | Point the existing YanaGaman screens to the new system; remove dependency on the old data store for new traffic; test main flows. | 16–26 |
| **6. Admin basics** | A first version of staff-only tools (for example: see users, basic account status). *Optional: can be trimmed for a smaller v1.* | 6–12 |
| **7. Data move and go-live** | Plan for existing users, import or invite flow, final checks, and switching production use to the new system. | 8–14 |
| **8. Handover, docs, and polish** | Short guides for the team, deployment notes, and a small list of “what to build next” for trips and payments. | 4–8 |

**Sum of the ranges:** **about 80–130 hours** (before buffer).

---

## What is *not* included in the numbers above (unless you add it)

- New trip booking, live maps, or payment collection (only the **foundation** is in scope for this phase).
- Mobile apps (iOS/Android)—this estimate assumes the **web** product only.
- Ongoing **monthly** maintenance, hosting bills, or third-party service fees.
- Big design or marketing changes to the public pages.
- Large compliance projects (e.g. full legal audit) beyond normal security good practice for an MVP.

These can be quoted separately if needed.

---

## Assumptions behind the hours

- Delivery uses **efficient tools and focused implementation** (including AI where it helps) to avoid unnecessary manual repetition.
- One product owner is available to answer questions and approve direction within a few business days.
- Test environments, domains, and integration access are available when needed.
- “Admin basics” is a **light** first version unless you ask for more.
- The ranges still allow for **end-to-end testing** and a clean **go-live**—the parts that shouldn’t be rushed.

---

## How to use this with a client

- Share the **phases and hour bands**; attach your **day rate** or **fixed-fee** formula if you work that way.  
- State that **80–130 hours** is planning guidance until discovery locks scope.  
- Offer a **phases 1–4** “foundation” subtotal and **phases 5–7** “launch” subtotal if the client wants to stage payment.

*Internal reference: technical detail and sprint breakdown live in* `docs/EXPANSION-ROADMAP.md`*.*
