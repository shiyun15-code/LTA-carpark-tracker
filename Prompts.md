# Project Prompts Log

This document collates all prompts used during the development of the **SG Carpark Live** (Singapore Carpark Real-Time Lot Tracker) application.

---

### Prompt 1: Initial Frontend Application Request

```text
build a singapore based carpark tracker application that tracks real time carpark lot availabilities.  build just the front end for now.  i will integrate the backend connection later.
```

**Scope Delivered:**
- Built full React + Tailwind CSS Singapore Carpark Lot Tracker.
- Interactive Leaflet map with custom lot availability pins across HDB, URA, and Commercial carparks.
- Comprehensive Carpark Directory with multi-faceted search, filters (Area, Agency, EV Charging, Sunday Free Parking, Clearance height), and sorting.
- Real-time lot velocity indicators (*Filling fast*, *Vacating*, *Stable*).
- Detailed Carpark Drawer with breakdown (Cars, Motorcycles, EV bays), official tariff schedules, and built-in parking fee estimator.
- Vehicle gantry clearance height safety tester.
- EV Charging Hub dashboard for SP Group, CDG Engie, Shell Recharge, and Charge+.
- Multi-carpark parking tariff comparison tool.
- Architecture ready for LTA DataMall / custom backend integration with live simulation mode fallback.

---

### Prompt 2: GitHub Repository Push

```text
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/shiyun15-code/LTA-carpark-tracker.git
```

**Scope Delivered:**
- Initialized Git repository, configured author details, created initial commit.
- Corrected URL format and pushed code to `https://github.com/shiyun15-code/LTA-carpark-tracker.git` on the `main` branch.
- Configured remote origin.

---

### Prompt 3: Serverless Backend & LTA DataMall Integration

```text
1) add a serverless coneection that pulls live data from LTA' datamall using the following endpoints: # Live carpark lots (HDB + LTA + URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# All requests need the header:  AccountKey:                                                                    2) store this in /api folder (at project root level) 3) include a /health.ts and /carparkavailability.ts   4) do not hardcode any keys, i will include them later
```

**Scope Delivered:**
- Created `/api/carparkavailability.ts` at project root:
  - Fetches live lots from `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2`.
  - Injects header `AccountKey: process.env.LTA_DATAMALL_API_KEY || process.env.LTA_ACCOUNT_KEY || ''` without hardcoded secrets.
  - Automatically handles LTA batch pagination ($skip) up to 2,000+ carparks.
  - Implemented 30-second in-memory TTL caching to avoid rate limit throttling.
  - Supports query filters (`agency`, `lotType`, `area`, `skip`).
  - Graceful fallback messaging when key is pending configuration.
- Created `/api/health.ts` for service health checks, uptime, and key detection status.
- Mounted endpoints in Express `server.ts` running full-stack on port 3000.
- Documented `LTA_DATAMALL_API_KEY` in `/.env.example`.
- Added interactive test buttons inside the UI's Backend API modal to test `/api/health` and `/api/carparkavailability`.
- Committed and pushed changes to GitHub repository.

---

### Prompt 4: Prompts Documentation

```text
collate all the prompts into filename Prompts.md
```

**Scope Delivered:**
- Created `Prompts.md` documenting all sequential user prompts and their associated deliverables.
