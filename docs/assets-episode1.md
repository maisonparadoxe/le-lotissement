# Épisode 1 — Images, sons et voix à produire

Liste de tout ce que l'épisode 1 affiche ou fait entendre, avec le nom de fichier à utiliser.
Le jeu tourne déjà sans ces fichiers (dessins SVG et sons synthétisés). Il suffit de déposer les fichiers dans les dossiers indiqués : je les brancherai au fur et à mesure.

**Priorités**
- **P1** : indispensable pour que l'épisode change vraiment de visage.
- **P2** : nettement mieux avec.
- **P3** : bonus, à faire s'il reste du temps.

**Conventions**
- Noms en minuscules, sans accents ni espaces, avec des tirets.
- Images en PNG. Sons en WAV ou OGG (je convertis). Pas de voix pour l'instant (voir partie 3).
- Dossiers :
  - `assets/images/personnages/`
  - `assets/images/decors/`
  - `assets/images/photos/`
  - `assets/images/objets/`
  - `assets/sons/telephone/`
  - `assets/sons/ambiances/`
  - `assets/sons/effets/`
  - `assets/sons/musique/`

---

## 1. Images (Illustrious)

### Réglages communs

**Bloc de style « comics »**, à mettre au début de chaque prompt (repéré `[STYLE]` ci-dessous) :
```
masterpiece, best quality, comic book style, western comics, graphic novel illustration, bold black ink lineart, flat colors, cel shading, heavy black shadows, limited color palette
```

**Négatif commun** :
```
child, young, teenager, loli, shota, chibi, moe, big anime eyes, smooth plastic skin, 3d, photorealistic, blurry, lowres, bad anatomy, extra fingers, text, watermark, signature, logo, diamond earrings
```
Pour les décors et les objets, ajoutez au négatif : `1girl, 1boy, people, person`.

**Formats conseillés** (résolutions natives d'Illustrious, à agrandir ensuite x1,5 ou x2) :

| Type | Taille de génération | Taille finale |
|---|---|---|
| Portraits | 832 × 1216 | environ 1024 × 1434 |
| Décors | 1344 × 768 | 1920 × 1080 |
| Vue du viseur | 1344 × 768 | 2560 × 1440 (on zoome jusqu'à x3 dedans) |
| Photos du dossier | 1152 × 896 | 1600 × 1200 |

**Pour la cohérence des personnages**
1. Générez d'abord l'expression neutre.
2. Gardez la même graine (seed) et ne changez que les mots de l'expression. Mieux encore : retouchez seulement le visage (inpainting) à partir de l'image neutre.
3. Tout le monde regarde dans la même direction (trois-quarts), cadré buste.
4. Fond uni clair, puis détourage (fond transparent) : les personnages se posent sur les décors.

**Mots d'expression** (repérés `[EXPRESSION]`) :

| Humeur dans le jeu | Mots à ajouter |
|---|---|
| neutre | `neutral expression, closed mouth, calm` |
| sourire | `smile, warm smile, soft eyes` |
| froid | `cold stare, narrowed eyes, slight frown, tight lips` |
| trouble | `troubled expression, worried eyes, slightly parted lips, looking away, light blush` |

**Les nuits** : pas de deuxième série de portraits pour l'épisode 1. Le jeu assombrit et désature lui-même les personnages la nuit. Les décors de nuit, eux, sont générés à part (voir plus bas).

### 1.1 Personnages — 16 images

Cadrage commun, à ajouter après `[STYLE]` : `upper body, three-quarter view, looking at viewer, centered, plain light grey background`

| Fichier | Prio | Expressions à produire |
|---|---|---|
| `beatrice-neutre.png`, `beatrice-sourire.png`, `beatrice-froid.png`, `beatrice-trouble.png` | P1 | les 4 |
| `paul-neutre.png`, `paul-sourire.png`, `paul-froid.png`, `paul-trouble.png` | P1 | les 4 |
| `monica-neutre.png`, `monica-sourire.png`, `monica-froid.png` | P1 | 3 (pas de « trouble » dans l'épisode 1) |
| `alban-neutre.png`, `alban-sourire.png`, `alban-froid.png`, `alban-trouble.png` | P1 | les 4 |
| `alice-clinique.png` | P1 | 1 (le visage du miroir) |

**Béatrice Vasseur** — bordeaux. Chaleureuse en façade, le regard évalue.
```
[STYLE], upper body, three-quarter view, looking at viewer, plain light grey background, 1girl, solo, mature female, adult, 50 years old, voluminous curly blonde hair, shoulder length, blue-grey eyes, round soft face, small nose, thin light eyebrows, rosy cheeks, very fair skin, pearl earrings, pearl necklace, burgundy cardigan over cream blouse, faint crow's feet, nasolabial folds, [EXPRESSION]
```

**Paul Delaunay** — bleu nuit. Charmeur, fatigué, évasif.
```
[STYLE], upper body, three-quarter view, looking at viewer, plain light grey background, 1boy, solo, mature male, adult, 45 years old, short brown hair with grey at the temples, salt-and-pepper stubble, hazel eyes, strong square jaw, navy blue blazer over light blue open-collar shirt, slightly tired eyes, laugh lines, handsome, [EXPRESSION]
```

**Monica Delaunay** — noir et or. Froide, lucide, ironique.
```
[STYLE], upper body, three-quarter view, looking at viewer, plain light grey background, 1girl, solo, mature female, adult, 45 years old, very long straight black hair, dark brown eyes, long narrow face, high cheekbones, thin nose, strongly arched eyebrows, olive-tan skin, matte skin, dark red lipstick, black dress, thin gold necklace, gold earrings, faint crow's feet, [EXPRESSION]
```

**Alban Roche** — brun rouille. Usé, attentif, peu de mots.
```
[STYLE], upper body, three-quarter view, looking at viewer, plain light grey background, 1boy, solo, mature male, adult, 58 years old, short grey hair, short grey beard, gaunt weathered face, deep-set eyes, heavy eyelids, tanned skin, deep wrinkles, rust brown canvas work jacket with corduroy collar over dark shirt, clean lineart, [EXPRESSION]
```

**Alice, à la clinique** — c'est l'image du miroir sur le téléphone. Cadrage de face, comme un reflet.
```
[STYLE], portrait, front view, looking at viewer, face and shoulders, plain pale blue-grey background, 1girl, solo, mature female, adult, 41 years old, short tousled dark brown hair, brown eyes, strong jawline, defined high cheekbones, thick eyebrows, light skin with olive undertone, no makeup, tired eyes, faint crow's feet, pale tracheotomy scar at the base of the throat, pale blue hospital gown, neutral expression, closed mouth, quiet shock
```

### 1.2 Décors — 10 images

Pour tous les décors, à ajouter après `[STYLE]` : `no humans, scenery, wide shot, eye level`

Je recalerai moi-même les points d'intérêt sur vos images. Les placements indiqués ne sont que des conseils de composition.

| Fichier | Prio | Moment du jeu |
|---|---|---|
| `hopital-nuit.png` | P2 | Écran noir du réveil |
| `hopital-jour.png` | P1 | La chambre qui sort du flou |
| `allee-jour.png` | P1 | Scène 1, l'arrivée |
| `allee-soir.png` | P2 | Fin de la scène 1 |
| `allee-nuit.png` | P1 | Scènes 3, 4 et 6 |
| `salon-soir.png` | P1 | Le dîner |
| `salon-nuit.png` | P2 | Fin du dîner, confrontation avec Paul |
| `pavillon-nuit.png` | P1 | Devant le pavillon, le digicode |
| `pavillon-interieur.png` | P1 | Registre, local technique, cachette |
| `viseur-allee-nuit.png` | P1 | La vue zoomable du viseur photo |

**Chambre d'hôpital, nuit** — presque tout noir, juste la lueur d'un moniteur.
```
[STYLE], no humans, scenery, hospital room at night, pitch black room, only the green glow of a heart monitor screen on the right, faint reflection on bed rail, high contrast, mostly black image, film noir
```

**Chambre d'hôpital, jour** — vue depuis le lit : plafond, néon, perfusion, fenêtre à stores, et une silhouette floue de soignante au centre.
```
[STYLE], hospital room seen from the patient's bed, low angle, white ceiling with fluorescent tube light, IV drip pole, heart monitor with green line on the right, window with venetian blinds on the left, pale green walls, bed rail in foreground, blurry silhouette of a nurse in pale blue scrubs leaning in the center, out of focus, cold clinical light
```

**Allée des Tilleuls, jour** — lotissement chic, trop parfait.
- À gauche, une plaque en laiton à l'entrée (« Domaine de Bellécourt »).
- Au quart gauche, la maison n°11 : volets ouverts, géraniums, terrasse avec deux tasses.
- À droite, la maison n°9, plus terne.
- Haies taillées au cordeau, tilleuls, allée de gravier.
```
[STYLE], no humans, scenery, upscale french gated housing estate, 1980s detached houses, tree-lined gravel lane, linden trees, perfectly trimmed hedges, brass entrance plaque on stone pillar on the left, house with open shutters and red geraniums on the left, plainer house with closed shutters on the right, manicured lawns, sunny summer afternoon, too perfect, suburban, wide shot, eye level
```

**Allée, soir** — même prompt, en remplaçant la fin par :
```
golden hour, sunset behind hedges, long shadows, warm orange light, first lit windows
```

**Allée, nuit** — même prompt, en remplaçant la fin par :
```
night, street lamps, pools of warm light, deep black shadows, dark hedges, one lit window, film noir, high contrast, limited palette, spot color warm yellow
```

**Salon des Delaunay, soir** — tout est blanc, cher, parfaitement éclairé, « publicité pour une vie heureuse ».
- À gauche, une cheminée avec un faire-part encadré.
- Au centre, un bar avec des photos.
- À droite, une baie vitrée : jardin et lueur bleue de la piscine au loin.
- Au premier plan, une table dressée.
```
[STYLE], no humans, scenery, luxurious modern white living room, white sofas, fireplace on the left with framed card on mantel, home bar in the center with framed family photos, large bay window on the right showing dark garden and distant blue glow of a pool, dinner table set in foreground with wine glasses and candles, warm evening light, immaculate, expensive, cold perfection
```

**Salon, nuit** — même prompt, avec en fin de prompt :
```
night, lights dimmed, single lamp, long shadows, blue moonlight through bay window, high contrast
```

**Pavillon de la piscine, extérieur, nuit** — un pavillon vitré neuf, éclairé par en dessous par la piscine. Un boîtier à code tout neuf à côté de la porte.
```
[STYLE], no humans, scenery, glass pool house at night, rectangular swimming pool lit from below with turquoise light, light reflecting on glass walls, new modern keypad lock next to the door, dark garden and hedges around, empty, theatrical lighting, film noir, high contrast, spot color turquoise
```

**Pavillon, intérieur** — tout est refait (carrelage neuf, transats empilés), sauf le local technique au fond. Un cahier à spirale accroché au mur à gauche, la porte du local technique au fond à droite. Nuit, lueur bleue de l'eau.
```
[STYLE], no humans, scenery, interior of a renovated pool house at night, new white tiles, stacked sun loungers, spiral notebook hanging on a nail on the left wall, old metal door of a pump room at the back right, contrast between new and old, blue light from the pool rippling on the ceiling, dark, high contrast, film noir, spot color turquoise
```

**Vue du viseur, allée de nuit** — vue en plongée depuis une fenêtre. L'allée de nuit et, sous le dernier lampadaire (un peu à droite du centre), deux silhouettes très proches : une femme aux cheveux blonds bouclés et un homme en veste rouille. Elle lui tend une enveloppe. Prévoir une grande résolution : le joueur zoome jusqu'à x3 dedans. La version floue est calculée par le jeu.
```
[STYLE], high angle view from a window, night, suburban gravel lane, last street lamp slightly right of center, under the lamp a woman with curly blonde hair in a burgundy coat and an older man in a rust brown work jacket standing very close, she hands him an envelope, secretive, small figures in a wide shot, deep shadows, film noir, high contrast, voyeur point of view, telephoto
```

### 1.3 Photos du dossier — 3 à 4 images

Pas de texte dans les images : le jeu ajoute lui-même l'horodatage orange.

| Fichier | Prio | Contenu |
|---|---|---|
| `photo-pavillon-2347.png` | P1 | La photo de 23 h 47, reçue de l'inconnu |
| `photo-bea-alban.png` | P2 | La photo prise au viseur (si le jeu ne la recadre pas lui-même dans la vue du viseur) |
| `photo-alice-2016.png` | P1 | Le visage d'avant, montré sur l'écran pendant le miroir |
| `photo-saint-jean-groupe.png` | P3 | La photo de groupe où Alice a été coupée du cadre |

**Photo de 23 h 47** — photo d'amateur, prise de nuit au téléphone, au flash, depuis les haies. Le pavillon, une petite voiture rouge devant, une silhouette de femme derrière la vitre.
```
[STYLE], no humans, amateur night photo taken with an old phone, harsh flash, grainy, glass pool house at night lit turquoise from below, small old red hatchback car parked in front, dark silhouette of a woman standing behind the glass, hedge leaves blurred in the foreground corner, slightly tilted framing, vignette
```
(Si la silhouette disparaît avec `no humans`, retirez-le et ajoutez `silhouette, faceless`.)

**Alice, Saint-Jean 2016** — son visage d'avant les opérations, 31 ans. Visage plus rond et doux, cheveux longs ondulés, sourire franc. Gardez les mêmes yeux que sur `alice-clinique.png` : en épisode 3, Monica la reconnaît à ses yeux, le seul trait qu'on n'a pas pu changer.
```
[STYLE], upper body, looking at viewer, 1girl, solo, adult woman, 31 years old, long wavy dark brown hair, brown eyes, soft round face, natural eyebrows, light skin with olive undertone, genuine open smile, bottle green summer dress with thin straps, bare shoulders, small gold hoop earrings, garden party at night, colorful paper lanterns in the background, warm bokeh, happy, snapshot
```

**Photo de groupe de la Saint-Jean** (P3) — cinq adultes en fête dans un jardin. Au bord droit, coupés par le cadre : une épaule nue et un bout de robe verte. Le plus simple est de générer le groupe, puis de rogner vous-même le bord.
```
[STYLE], group photo of five adults at a summer garden party at night, paper lanterns, a blonde woman with curly hair in burgundy, a dark-haired man in navy, a woman with very long black hair in a black dress, an older man in a rust jacket standing apart in the background, glasses raised, warm flash photo, cropped at the right edge showing only a bare shoulder and part of a bottle green dress
```

### 1.4 Objets en gros plan — P2 et P3

| Fichier | Prio | Contenu |
|---|---|---|
| `objet-confiture.png` | P2 | Le pot de Béatrice : couvercle en vichy, étiquette manuscrite **vierge** |
| `etiquette-abricots.png` | **P1** | L'étiquette « Abricots — juin », **écrite à la main**, voir ci-dessous |
| `objet-registre.png` | P2 | Le cahier à spirale du registre des clés, page vierge |
| `registre-21-juin.png` | P2 | Les deux lignes du 21 juin, **écrites à la main** |
| `objet-telephone-alice.png` | P2 | Le vieux téléphone dans sa boîte en fer |
| `objet-enveloppe.png` | P3 | L'enveloppe sans expéditeur, la carte SIM, la photo |
| `menu-fond.png` | P2 | Image de fond du menu principal |

**À écrire vous-même plutôt que générer.** Illustrious écrit mal, et ces écritures sont des indices.
- **`etiquette-abricots.png`** : écrivez « Abricots — juin » au stylo bleu, en écriture penchée aux boucles très rondes, sur une étiquette ou un papier, puis photographiez ou scannez. **C'est l'écriture de Béatrice** : elle devra être identique à celle de la lettre anonyme de 2016 (épisode 4) et sera comparée lettre à lettre en épisode 6. Gardez le stylo et le modèle.
- **`registre-21-juin.png`** : sur une page de cahier, « Clé rendue — 23 h 30 — P.D. » dans une première écriture, puis juste en dessous « 00 h 40 — A.R. » dans une **autre** écriture, plus raide et appuyée (celle d'Alban).

**Pot de confiture**
```
[STYLE], no humans, still life, close-up, glass jar of apricot jam, red and white gingham cloth cover tied with string, blank handwritten-style paper label, on a wooden kitchen table, warm afternoon light
```

**Registre des clés**
```
[STYLE], no humans, close-up, old spiral notebook hanging on a nail on a tiled wall, yellowed pages, handwritten columns, pen on a string, dim blue light
```

**Le vieux téléphone d'Alice**
```
[STYLE], no humans, close-up, old rusty metal box opened, inside a smartphone with a cracked turquoise case sealed in a clear freezer bag, dust, pump room, flashlight beam, film noir, spot color turquoise
```

**L'enveloppe**
```
[STYLE], no humans, close-up, plain white envelope without sender, a prepaid SIM card and a printed night photo slipping out, small handwritten note, on a hospital bedside table, cold light
```

**Fond du menu** — l'affiche de l'épisode : l'allée au crépuscule, une femme de dos (Alice) devant le portail, le pavillon bleu au loin.
```
[STYLE], 1girl, from behind, woman with short tousled dark brown hair, bottle green coat, standing at the gate of an upscale housing estate at dusk, tree-lined lane, perfect houses, one window lit, distant blue glow of a pool house, cinematic, poster composition, empty space at the top for a title, film noir, spot color bottle green
```

---

## 2. Sons

Deux familles, selon d'où sortent les sons :
- **Le téléphone** : ses propres sons, à travers le haut-parleur du téléphone. C'est la signature du jeu.
- **L'ordinateur** : ambiances, effets et musique.

Banques libres conseillées : freesound.org (licence CC0 ou CC-BY, notez l'auteur), ou un générateur de sons.

### 2.1 Téléphone — `assets/sons/telephone/`

Courts (moins d'une seconde, sauf mention), secs, sans réverbération.

| Fichier | Prio | Description |
|---|---|---|
| `bip-moniteur.wav` | **P1** | Le bip du moniteur cardiaque d'hôpital, un seul bip. Le jeu le répète au rythme du cœur. |
| `sms-ligne1.wav` | P1 | Notification d'un SMS normal (Béatrice, Paul). Discret, doux. |
| `sms-ligne2-inconnu.wav` | **P1** | Notification de la ligne de l'inconnu. **Différente et inquiétante** : plus grave, un peu désaccordée. Le joueur doit savoir qui écrit avant de regarder. |
| `sms-envoi.wav` | P2 | Message envoyé (petit « swoosh »). |
| `obturateur.wav` | P1 | Déclencheur d'appareil photo. |
| `mise-au-point.wav` | P2 | Petit « tic » de mise au point, joué quand l'image devient nette. |
| `digicode-touche.wav` | P1 | Bip de touche de digicode (boîtier électronique, pas un clavier de téléphone). |
| `digicode-ok.wav` | P1 | Déverrouillage : double bip et déclic de gâche. |
| `digicode-erreur.wav` | P1 | Code refusé : bip grave. |
| `buee-essuyer.wav` | P2 | Doigt qui frotte sur un miroir embué (léger crissement, en boucle de 2 s). |
| `changement-mode.wav` | P2 | Le téléphone change de rôle : petite transition (2 notes). |
| `tap.wav` | P3 | Appui sur un bouton, très court. |

### 2.2 Ambiances en boucle — `assets/sons/ambiances/`

De 30 à 60 secondes, bouclables sans coupure audible.

| Fichier | Prio | Description |
|---|---|---|
| `hopital.ogg` | P1 | Ventilation, néon qui grésille, pas lointains dans un couloir. |
| `allee-jour.ogg` | P1 | Oiseaux, taille-haie au loin, arrosage automatique : la banlieue trop calme. |
| `allee-soir.ogg` | P2 | Premiers grillons, un chien au loin, une fenêtre qui se ferme. |
| `allee-nuit.ogg` | P1 | Grillons, bourdonnement de lampadaire, silence lourd. |
| `salon-diner.ogg` | P1 | Couverts, verres, tintements, musique d'ambiance très basse dans une autre pièce. |
| `pavillon-exterieur.ogg` | P1 | Filtre de piscine, clapotis, grillons. |
| `pavillon-interieur.ogg` | P1 | Ronronnement de pompe, gouttes, écho carrelé. |

### 2.3 Effets ponctuels (ordinateur) — `assets/sons/effets/`

| Fichier | Prio | Moment |
|---|---|---|
| `portail.wav` | P2 | Le portail du domaine s'ouvre (scène 1). |
| `vibreur-table.wav` | P1 | Le téléphone de Monica vibre sur la table : « Lou » (dîner). |
| `verre-pose.wav` | P2 | Monica repose son verre (le silence après « une femme qui vivait là »). |
| `porte-pavillon.wav` | P1 | Déclic de la porte du pavillon. |
| `pas-gravier.wav` | P1 | Des pas sur le gravier qui approchent (avant la cachette). |
| `lampe-torche.wav` | P2 | Clic d'une lampe torche. |
| `soignante-court.wav` | P2 | Pas qui s'éloignent en courant, porte battante (réveil). |
| `interrupteur.wav` | P3 | Alice éteint la lampe (scène 4). |
| `souffle-sous-l-eau.wav` | **P1** | Remplace la voix du souvenir « Laisse-la. » : un souffle étouffé, comme entendu sous l'eau, 2 à 3 s, sans aucun mot. Le texte s'affiche à l'écran et le téléphone vibre. |

### 2.4 Musique — `assets/sons/musique/`

Minimale et tendue : piano, cordes, basse, un peu d'électronique. Pas de paroles.

| Fichier | Prio | Description |
|---|---|---|
| `theme-menu.ogg` | P1 | Thème du jeu, 1 à 2 min en boucle : élégant, vénéneux, une valse lente déréglée. |
| `jingle-titre.ogg` | P1 | 3 à 5 s, pour les cartons « Scène 1 — Le retour ». Clin d'œil feuilleton. |
| `tension.ogg` | P1 | Boucle sourde pour le pavillon et la cachette (pulsation, cordes basses). |
| `seduction.ogg` | P2 | Boucle lente et sensuelle pour l'échange avec Paul (basse, balais, saxophone feutré). |
| `souvenir.ogg` | P1 | 5 à 8 s, pour les souvenirs fragmentaires : son étouffé, comme sous l'eau. |
| `revelation.ogg` | P2 | 2 à 3 s, accord qui frappe (la photo de 23 h 47, le registre). |
| `cliffhanger.ogg` | P1 | 20 à 30 s, fin d'épisode, « à suivre ». |

---

## 3. Voix — reportées

**Décision de l'auteur : pas de voix pour l'instant, mais l'idée est gardée pour plus tard.**
Les répliques sont affichées en texte, accompagnées de sons sans paroles. Si des voix sont enregistrées un jour, elles s'ajouteront sans rien changer d'autre.

| Plus tard | Texte | En attendant |
|---|---|---|
| `voix-laisse-la.wav` (épisode 1) | « Laisse-la. » | Texte du souvenir + `souffle-sous-l-eau.wav` + vibration. C'est la voix de Béatrice : si elle est doublée un jour, ce sera la même comédienne, méconnaissable ici. |
| `voix-elle-revient.wav` (épisode 1) | « Elle revient ! Appelez le médecin : la patiente du 21 juin revient ! » | Texte + `soignante-court.wav`. |
| `voix-paul-messagerie.wav` (épisode 2) | « Rappelle-moi. Je t'en supplie. Ne fais pas ça. » | Écran de messagerie (21 juin 2016, 23 h 52), onde sonore, transcription mot à mot, et un son de messagerie abîmée sans paroles. |
| `voix-lou-appel.wav` (épisode 4) | L'appel de la ligne de l'inconnu | Écran d'appel en cours, sous-titres, ligne qui grésille ; le joueur répond par des choix. |

**Sons sans paroles à prévoir pour les épisodes suivants** (pas pour l'épisode 1) :
- `messagerie-abimee.wav` (épisode 2, téléphone) : bip de messagerie, grésillements, souffle, une respiration, 8 à 10 s, sans mot ;
- `ligne-gresille.wav` (épisode 4, téléphone) : ligne téléphonique instable en boucle, petits silences, sans mot.

---

## Récapitulatif

| | P1 | P2 | P3 |
|---|---|---|---|
| Images | 25 (16 portraits, 7 décors, 2 photos) + 1 étiquette écrite à la main | 9 | 2 |
| Sons | 22 | 11 | 2 |
| Voix | reportées | | |

**Ordre conseillé**
1. Les 16 portraits : c'est ce qui change le plus l'impression du jeu.
2. Les décors de jour, puis de nuit.
3. L'étiquette écrite à la main.
4. Les sons du téléphone.
5. Les ambiances.
6. Le souffle sous l'eau du souvenir.
