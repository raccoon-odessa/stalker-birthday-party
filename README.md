# Birthday in the Zone

A S.T.A.L.K.E.R. 2 themed party site: personal invitation links, pixel-art stalkers,
artefact backpacks and Kingdom Come style dice between guests' phones.

- Hosted on GitHub Pages, data in Firebase Firestore (`config.js`).
- Each guest opens `?id=<code>`; the host creates codes on the Host tab.
- `firestore.rules` holds the database rules to paste into the Firebase console.
- Open the site with `?mock` to run it against an in-browser test database.
