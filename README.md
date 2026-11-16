# Rise — Offline Clan Strategy Prototype

A Persian RTL, single-device strategy game prototype. It runs as a static site, stores each local account and game save in the browser, and needs no server. It is **not multiplayer** and the local password screen is only a convenience gate, not real security. Never reuse a real password here. For a real online release, move authentication, player data, economy, training, combat and season results to a trusted server.

## Play locally

Serve this folder over localhost (ES modules and Web Crypto require a secure context):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. On first launch, create a local username and password (8+ characters). The password hash uses PBKDF2-SHA-256 with a random salt. The account only exists in this browser; clearing browser storage removes it.

## Current gameplay

- World map and private castle map, with five NPC clans.
- Construction upgrades, resource production, training queue, troop capacity, battles, loot and seasonal reset.
- Offline production and training use the same simulation step as active play, capped at 72 hours.
- Starting resources are 1,000× the previous prototype values; storage capacity was raised so initial stock is not immediately truncated.
- Local SVG icons and procedural terrain are bundled in `assets/icons`, no remote asset requests are needed.

## Tests

```bash
node --test
```

## Online migration notes

The browser must be treated as untrusted. The local username/password feature is not an authentication system for a public game. Use server-side password hashing, sessions, authorization, authoritative resource and battle calculations, database-backed saves, rate limiting, and server-controlled season rollover before enabling real players or purchases.
