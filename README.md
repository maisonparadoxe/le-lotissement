# Le Lotissement

Jeu narratif interactif jouable dans le navigateur. Le téléphone du joueur, relié par QR code, sert de **manette contextuelle** : son interface change selon la scène.

Ce dépôt contient le **prototype de l'épisode 1, « Bellécourt »** (section 8 de la bible de concept) : une partie de 10 à 15 minutes, quatre personnages, trois décors, un embranchement majeur et trois conclusions.

## Lancer le jeu

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

1. Ouvrez `http://localhost:3000` sur l'ordinateur, de préférence en plein écran.
2. Scannez le QR code avec le téléphone. **Les deux appareils doivent être sur le même réseau Wi-Fi.** Le QR code pointe vers l'adresse réseau locale de l'ordinateur, pas vers `localhost`.
3. Appuyez sur « Commencer » sur le téléphone.

Pour développer : `npm run dev` (Vite en middleware, rechargement à chaud).
Pour lancer les tests : `npm test`. Pour vérifier les types : `npm run typecheck`.

Pour changer de port : `PORT=8080 npm start`.
Pour journaliser les parties de test (section 11) : `PLAYTEST_LOG=1 npm start`. Chaque nœud atteint est ajouté à `logs/playtests.jsonl`, avec la session, l'horodatage et la fin obtenue. Ce journal ne contient aucune donnée personnelle.

> Pour jouer hors du réseau local, il faut déployer le serveur derrière HTTPS (n'importe quel hébergeur Node), ou passer par un tunnel. Le QR code utilise alors automatiquement l'adresse publique.

## Ce que fait le téléphone

| Contexte | Rôle du téléphone | Dans l'épisode 1 |
|---|---|---|
| Narration | Télécommande | Bouton « Continuer » |
| Création d'identité | Terminal de saisie | Choisir le nom de la nouvelle identité |
| Exploration | Manette de navigation | Flèches pour passer d'un point d'intérêt à l'autre, bouton « Examiner ». Le point sélectionné s'allume sur l'écran. |
| Dialogue | Choix de répliques | Franchise, esquive, mensonge, retourner la question |
| Téléphone de l'héroïne | SMS et photos | Écran verrouillé, notification, conversation, réponses. Une photo ouverte sur le téléphone s'affiche aussi en grand sur l'écran. |
| Digicode | Saisie directe | Les chiffres tapés s'affichent sur le boîtier, à l'écran. Après des erreurs, des indices de plus en plus précis apparaissent. |
| QTE | Action | Bouton à maintenir. Si on relâche, la jauge redescend doucement au lieu de repartir à zéro. Option « temps élargi ». |
| Dossier | Enquête | Indices et messages déjà obtenus, réglages |

Chaque transformation est annoncée : animation et vibration sur le téléphone, bandeau « Votre téléphone devient : … » sur l'écran.

**Mode sans téléphone** : depuis l'accueil ou le menu, « Jouer sans téléphone » affiche la manette dans un cadre à côté de la scène. Ce mode sert aussi de point de comparaison pour la validation (« utilité perçue du téléphone par rapport à une version où les choix se font sur l'ordinateur »).

## Architecture

```
shared/                 code partagé serveur / clients
  types.ts              modèle de données narratif
  engine.ts             moteur pur : (histoire, état, entrée) → nouvel état
  protocol.ts           messages WebSocket
  story/builder.ts      petit DSL pour écrire les scènes
  story/episode1.ts     le script de l'épisode 1 (données, sans interface)
server/
  index.ts              HTTP + WebSocket (/ws), Vite en dev, dist/ en prod
  sessions.ts           sessions, jetons, reconnexion, limitation
src/
  host/                 écran principal (scène, dialogues, accueil, QR code)
  controller/           manette (téléphone), réutilisée en mode sans téléphone
  common/art/           décors, portraits et photo en SVG
tests/                  graphe narratif, chemins, digicode, QTE, serveur
```

- **Le serveur fait autorité.** Il exécute le moteur narratif et diffuse l'état de partie à l'écran et au téléphone, qui ne sont que deux vues. Si l'un des deux se recharge ou perd le réseau, il retrouve exactement la même situation.
- **La narration est séparée de l'interface.** Une scène est une suite de « beats » (`narr`, `say`, `choice`, `explore`, `sms`, `keypad`, `qte`…) compilée en nœuds de données. Les conditions (`iff`) et les effets (`rel`, `flags`, `clues`, `exposure`) sont aussi déclaratifs.
- **Pas de jauge morale.** L'état suit la relation avec chaque personnage (de −3 à +3), le risque d'être reconnue (exposition, de 0 à 5), les indices et les choix marquants. Le tout est repris dans le bilan de fin.

### Sécurité des sessions (section 10 de la bible)

- Pas de compte. Une session est créée à l'ouverture de l'écran.
- Le QR code contient un **jeton d'appairage de 128 bits**, à usage unique, qui **expire au bout de 10 minutes** (un nouveau code s'affiche alors automatiquement). Le jeton est placé dans le fragment de l'URL (`/m#…`), qui n'est jamais envoyé au serveur HTTP.
- Une fois appairé, le téléphone reçoit une **clé d'appareil de 256 bits**. Elle lui permet de se reconnecter de lui-même après une coupure réseau (reconnexion automatique avec backoff exponentiel).
- Depuis le menu, l'écran peut **révoquer** la manette et générer un nouveau code.
- Les tentatives d'appairage ou de reconnexion échouées sont **limitées à 10 par minute et par IP**.
- Les sessions inactives expirent au bout de 30 minutes, et toutes les sessions au bout de 12 heures.

## Choix narratifs provisoires

La bible laisse plusieurs décisions ouvertes (section 13). Pour rendre l'épisode jouable, le prototype tranche provisoirement les points suivants. Tout se modifie dans `shared/story/episode1.ts`.

- **L'héroïne** est Alice Marchal, ancienne habitante du n°9. Elle était la meilleure amie de Béatrice et l'amante de Paul.
- **Pourquoi personne ne la reconnaît** : sept opérations de reconstruction, dix ans de plus, et une voix abîmée par l'intubation. Antoine a pourtant un doute dès la première scène. Cette exposition est un risque que le jeu suit.
- **La fausse identité** : le nom d'une femme décédée, avec des papiers achetés. Le joueur choisit le nom au début.
- **Le 21 juin 2016** : Béatrice affirme qu'Alice est partie avec un homme ; Paul, qu'elle s'est noyée dans l'étang du Moulin. La photo de 23 h 47, le registre des clés (« P.D. 23 h 30 », « A.R. 00 h 40 ») et le téléphone caché contredisent les deux versions sans désigner de coupable. **L'épisode 1 ne répond pas à la question « qui l'a laissée pour morte ? »**
- **Le digicode** (1403) se déduit de deux indices du dîner : Isabelle dit que Paul utilise la date de naissance de Lou pour tous ses codes, et le faire-part sur la cheminée indique « née le 14 mars ».
- **Les trois conclusions** : *La confrontation* (montrer le téléphone à Paul), *Le silence* (cacher la preuve) et *L'alliance* (la confier à Antoine). Le cliffhanger commun (« Bon retour à Bellécourt, Alice. ») varie selon les choix.

## Art

Les décors (l'allée, le salon des Delaunay, le pavillon de la piscine) et les quatre portraits sont des illustrations SVG stylisées dans la palette de la bible : ivoire, bordeaux, vert bouteille, gris bleuté et lumière chaude. Chaque portrait a quatre expressions. Ce sont des **placeholders de production** : on peut les remplacer par des illustrations définitives sans toucher au moteur, en modifiant `src/common/art/`.
