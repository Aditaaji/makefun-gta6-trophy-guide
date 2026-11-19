# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Aditaaji/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Aditaaji/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI
(1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden), built for the
[make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade, and a guide in our own
  words: what to do, where and how, and when it can be missed. Each guide names its
  sources beside it (GTA Zone, PowerPyx, GTABase, Planet GTA 6, Output Lag, KeenGamer,
  SixShore, Push Square) — nothing is copied from another guide.
- **A tracker**: tick trophies off, progress is saved in your browser (localStorage),
  and you can export your progress to a file and import it back.
- **Filters** by grade and kind (story, side quests, activities, collectibles, crime,
  exploration, money, one-offs — and online, which correctly shows none: all 55 are
  single-player), plus search, earned/remaining, and a missable-only filter.
- **A spoiler setting** that hides the names, descriptions and guides of story trophies
  until you earn them.
- **A roadmap to the Platinum** in 5 stages (about 200 hours, one playthrough), built
  from the official descriptions, and the one possibly missable trophy flagged:
  **Positive Mental Attitude** — do Lucia's Chapter 1 balcony meditation before the
  chapter ends.
- **Honest about what is not known**: this is not an official Rockstar list (the list is
  PSN/Exophase-derived and labelled Reported by the guide sites), and five trophies
  still have unconfirmed triggers. Their guides say so plainly and invent nothing.

## Run it

No build step, no network needed. The app is plain static files under `app/`.

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any static file server and open `app/index.html`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide and tracker
- `app/data/trophies.json` — all 55 trophies with guides, kinds, roadmap stages,
  missable flags and sources (verified 19 November 2026)
- `screenshots/` — real renders of the guide at 1280×800
- `main.ts` — hands the entry in (copies `app/` + `screenshots/`, writes `dossier.json`)
- `vendor/makefun-frontend.ts` — the kit's library, unchanged

## License

MIT — see [LICENSE](LICENSE). Unofficial fan guide, not affiliated with Rockstar Games
or PlayStation. No Rockstar logo, artwork or game screenshots are used.
