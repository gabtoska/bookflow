# BookFlow

Piattaforma SaaS per la gestione appuntamenti con prenotazioni online e promemoria WhatsApp.

## Stack

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Database:** PostgreSQL + Prisma v7
- **Auth:** Auth.js v5 (Credentials)
- **UI:** Tailwind CSS v4, shadcn/ui (Base UI)
- **Linguaggio:** TypeScript 5, React 19

## Quickstart

```bash
# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue credenziali database

# Genera il client Prisma e applica le migrazioni
npx prisma generate
npx prisma db push

# (Opzionale) Popola il database con dati di esempio
npx tsx prisma/seed.ts

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Struttura del Progetto

```
src/
├── app/
│   ├── (marketing)/      # Landing page, pricing
│   ├── (auth)/            # Login, signup
│   ├── (dashboard)/       # Dashboard, appuntamenti, clienti, servizi, impostazioni
│   └── book/[slug]/       # Pagina prenotazione pubblica
├── actions/               # Server Actions (CRUD, auth, booking, reminders)
├── components/
│   ├── layout/            # Shell, sidebar, header, mobile nav
│   ├── shared/            # Componenti condivisi (empty-state, badges, dialogs)
│   ├── appointments/      # Form e lista appuntamenti
│   ├── clients/           # Form e lista clienti
│   ├── services/          # Form e lista servizi
│   ├── settings/          # Form impostazioni attività
│   └── booking/           # Wizard prenotazione pubblica
├── lib/
│   ├── auth.ts            # Configurazione Auth.js
│   ├── db.ts              # Prisma client singleton
│   ├── validators.ts      # Schemi Zod
│   ├── slots.ts           # Generazione slot orari
│   └── reminders/         # Sistema promemoria (provider, builder, service)
└── generated/prisma/      # Client Prisma generato
```

## Funzionalità

- **Dashboard** con statistiche giornaliere e link prenotazione
- **Gestione Appuntamenti** con filtri, creazione, modifica, cancellazione
- **Gestione Clienti** con ricerca e conteggio appuntamenti
- **Catalogo Servizi** con durata, prezzo, stato attivo/inattivo
- **Impostazioni** attività e orari di apertura per giorno
- **Prenotazione Pubblica** wizard 4 step con slot liberi in tempo reale
- **Promemoria WhatsApp** (mock provider, pronto per integrazione reale)
- **Loading Skeleton** su tutte le pagine dashboard
- **Error Boundary** e pagine 404 personalizzate
