# Village — Two Maps (Offline Prototype)

A static, offline-first prototype for a future online clan strategy game. It runs on GitHub Pages and does not require a server.

## Features

- Two distinct maps: a shared world map and a private castle map.
- Five predefined NPC clans with names, colors, positions, public power and territory labels.
- On the world map, other clans are represented only by castle markers. Their interiors, buildings and troop compositions are not exposed.
- Enter your own castle and return to the world map.
- Basic local construction: farm, lumber camp, quarry, barracks and wall.
- Basic resource production and local autosave using `localStorage`.
- Responsive Persian RTL interface.

## Run locally

Because JavaScript modules are used, run this folder through a local static server rather than opening `index.html` directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Create or open a GitHub repository.
2. Upload the contents of this folder (the `index.html`, `css` and `js` folders, and `README.md`) to the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Open the published Pages URL.

## Project structure

```text
village-two-maps/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── config.js
    ├── renderer.js
    └── state.js
```

## Important prototype limitations

- This is a single-device offline prototype. NPC clans are predefined data, not live players.
- There is no login, multiplayer, server authority, combat, movement orders, payments or leaderboard yet.
- Resources and progress are stored in the browser's local storage. Clearing browser data removes the save.
- The world map is a shared *design concept*, but it is not a shared online world until a backend and database are added.
- The 45-day counter is a prototype indicator; it does not yet implement season rollover or reset logic.

## Architecture notes for the online version

Keep the browser as a presentation/client layer. When the server is introduced, the server should own authentication, player state, resource production, troop composition, battle resolution, purchases and leaderboard calculations. The client must never be trusted to decide gold balances or battle results.
