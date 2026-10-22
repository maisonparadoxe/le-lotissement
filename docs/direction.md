# Positionnement et direction artistique

## Validé par l'auteur
- **Originalité du jeu** : le téléphone qui se transforme selon l'histoire et implique le joueur. C'est l'argument de vente principal (montrable en quinze secondes) ; le ton sert à choisir le public.
- **Références de ton** : *Desperate Housewives*, *Big Little Lies*, *The White Lotus* (soap de prestige : réalisation soignée, personnages crédibles, plaisir coupable de secrets, de rivalités et d'adultères).
- **Principe : haut concept, exécution mesurée.**
  - Écriture et jeu des personnages mesurés, on joue sur le non-dit.
  - Trois ou quatre excès assumés par épisode (cliffhanger, révélation, gros plan qui s'attarde, SMS qui tombe au pire moment).
  - Clin d'œil léger à la *Desperate Housewives* : le jeu sait qu'il est un feuilleton, sans le dire.
  - Le mot « telenovela » reste un outil interne ; en promotion : « drame de voisinage à suspense », « série interactive ».
- **Sensuel et suggéré, jamais explicite** (voir `ton.md`).

## Public visé (précisé par l'auteur)
- **Majoritairement des femmes, de tous âges**, qui connaissent les références citées (*Desperate Housewives*, *Big Little Lies*, *The White Lotus*) ou qui regardent sur Netflix et ailleurs des séries du même style. Ce ne sont donc pas forcément des joueuses habituées.
- Conséquences à garder en tête :
  - **Peu de friction au démarrage** : lancer le jeu et relier le téléphone doit prendre une minute, sans installer d'outils. Le téléphone en QR code est un atout (rien à installer côté téléphone), mais l'installation côté ordinateur est le point faible à traiter.
  - **Prise en main immédiate** : les gestes du téléphone doivent se comprendre sans explication ; pas de QTE exigeants, temps élargi disponible, texte lisible.
  - **Thèmes adultes** (adultère, séduction, voyeurisme, suggérés) : prévoir un classement 16+ ou 18+ selon les plateformes.
  - **Promotion** : là où ce public regarde et parle de séries (réseaux sociaux, communautés de fans de séries, presse télé), avec des extraits courts du téléphone qui se transforme.

## Style graphique : décision de l'auteur
- **Un seul style, le « comics »** (aplats nets, ombres d'encre noire, palette limitée, fonds clairs unis), généré avec Illustrious en local. L'uniformisation se fait par les prompts (mêmes réglages, mêmes tags de style, même cadrage), puis éventuellement par un traitement commun (fond, noirs, blancs, contraste, grain).
- **Différencier les visages des femmes** par la coiffure, la forme du visage et la couleur de peau.
- Premiers portraits générés : Alice, Béatrice, Monica, Paul, Alban. Points à corriger : âges trop jeunes, visages féminins trop proches, cadrages variables, boucles d'oreilles d'Alice trop proches du losange des *Sims*, cicatrice de trachéotomie d'Alice (cou) à rétablir.

## Couleur principale par personnage (validé)
Une dominante environ aux deux tiers de la tenue (vêtement principal, foulard, bijou), avec de la liberté pour l'histoire. Elle sert aussi à l'interface (nom dans le dialogue, bulle des SMS, jauge de relation), à l'affiche de chaque épisode, et à la couleur sélective des scènes de nuit (la couleur de la personne que le regard d'Alice fixe). Ne pas compter sur la couleur seule : chaque personnage doit aussi se reconnaître à sa silhouette (coiffure, accessoire, forme du visage), pour les joueurs qui confondent certaines couleurs.

| Personnage | Couleur principale |
|---|---|
| Alice | Vert bouteille |
| Béatrice | Bordeaux |
| Paul | Bleu nuit |
| Monica | Noir avec accents dorés |
| Alban | Brun rouille (terre) |
| Lou (plus tard) | Turquoise (proposition) |

## Différenciation des personnages (validé)
- **Alice** : visage anguleux, mâchoire marquée, pommettes hautes, sourcils épais, cheveux courts ébouriffés brun foncé, peau claire à reflet olive, cicatrice de trachéotomie au cou. 41 ans.
- **Béatrice** : visage rond et doux, petit nez, sourcils fins, cheveux blonds bouclés aux épaules, peau très claire, joues roses, perles. 50 ans.
- **Monica** : visage long et étroit, nez fin, sourcils très arqués, cheveux noirs très longs et lisses, **peau olive mate**, rouge à lèvres foncé, bijoux dorés. 45 ans.
- **Paul** : mâchoire carrée, cheveux bruns grisonnants aux tempes, barbe de trois jours poivre et sel, yeux noisette. 45 ans.
- **Alban** : visage creusé et marqué, cheveux et barbe gris courts, peau halée. 58 ans. Rendu rugueux de la version de nuit ; version de jour propre.

## En discussion, pas encore validé
### Moteur d'affichage
Godot comme écran principal sur PC, le téléphone restant une page web reliée par QR code. Recommandation : garder le serveur actuel comme relais (histoire, téléphone, sécurité), Godot s'y connecte et affiche la scène. Prototype d'abord sur le style actuel, avec lumière, mouvement et un viseur au flou réaliste.

### Style graphique
Références citées par l'auteur : *Desperate Housewives*, romans noirs, *Spider-Noir*, *Hellblazer* (John Constantine), *Beck* (manga), *The Walking Dead* (comics), comics *Batman*, et un attrait pour un côté telenovela érotique. (*Silver Pines* : à préciser.)

Piste recommandée : **« noir encré » à deux registres, façade et vérité**.
- Le jour, les scènes sociales : quartier lisse et lumineux, avec de la couleur.
- La nuit, les secrets, le voyeurisme, les souvenirs : noir et blanc, ombres épaisses, grain.
- Une couleur sélective (le bordeaux et la lumière chaude de la bible).
- Des visages toujours expressifs, même dans l'ombre.
- Les deux registres peuvent partager les mêmes illustrations : seul le traitement de couleur et de contraste change.
- Mise en scène « telenovela » : gros plans sur les yeux, petits zooms, halo lumineux, musique qui ponctue les révélations. Signature visuelle proposée : le gros plan sur le regard d'Alice, qui rejoint le viseur du téléphone.
- Lumière des nuits : thrillers érotiques des années 80-90 (stores vénitiens, fumée, néons).
- Pistes de référence : couvertures de romans noirs de poche des années 50-60, *Sin City* (couleur sélective), *Blacksad*.
- On s'inspire sans copier le style d'un dessinateur en particulier.

### Voix (décision de l'auteur)
Pas de voix pour l'instant : le jeu se lit. Les moments où une voix compterait (« Laisse-la. », le message vocal de Paul, l'appel de Lou) passent par le texte, des sons sans paroles et l'écran du téléphone. L'idée des voix est gardée pour plus tard (liste dans `assets-episode1.md`).

### Identité sonore (idées)
- Les sons du téléphone (SMS, touches du digicode, obturateur du viseur) sortent du haut-parleur du téléphone ; musique et ambiance sortent de l'ordinateur.
- Une signature sonore par rôle du téléphone.
- Sons de banlieue trop calme (arrosage, taille-haie, couverts, eau de piscine).
- Musique minimale et tendue, un motif par personnage.
- **Principe validé : utiliser au maximum les sons et vibrations du téléphone comme effets de mise en scène.** Exemple proposé par l'auteur : pour le réveil du coma ou la scène d'hôpital, le bip du moniteur cardiaque (électrocardiogramme) sort du téléphone, qui peut aussi vibrer au rythme du pouls. Autres idées : battement de cœur qui s'accélère pendant un flirt ou une filature, obturateur et mise au point du viseur, claquement des touches du digicode, sonnerie d'un appel manqué, vibration d'un message qui arrive au pire moment.
