// Épisode 1 — « Bellécourt ». Prototype de 10 à 15 minutes.
// Quatre personnages, trois décors, et les interactions téléphone de la
// bible : saisie, navigation, choix de dialogue, SMS, digicode, QTE.

import type { Stage, Story, StoryNode } from '../types.ts';
import {
  choice,
  end,
  enter,
  explore,
  iff,
  input,
  keypad,
  leave,
  memory,
  narr,
  qte,
  say,
  seq,
  sms,
  stage,
  title,
  withFx,
} from './builder.ts';

const allee = (time: Stage['time']): Stage => ({ decor: 'allee', time, cast: [] });
const salon = (time: Stage['time']): Stage => ({ decor: 'salon', time, cast: [] });
const pavillon = (time: Stage['time']): Stage => ({ decor: 'pavillon', time, cast: [] });

const nodes: Record<string, StoryNode> = {
  // ─────────────────────────────── Prologue
  ...seq('prologue', allee('nuit'), [
    title('Épisode 1', 'Bellécourt'),
    narr("Dix ans. C'est le temps qu'il a fallu au monde pour vous oublier."),
    narr('Le coma, puis les opérations. Sept interventions pour reconstruire un visage que vous ne reconnaissez toujours pas dans le miroir.'),
    narr("Votre voix aussi a changé : plus grave, éraillée par des mois d'intubation. Les médecins disent que c'est une chance. Vous n'êtes pas sûre de ce qu'ils entendent par là."),
    memory("De la nuit du 21 juin, il ne reste que des éclats. De l'eau froide. Une lumière bleue. Une voix qui disait : « Laisse-la. »"),
    narr("Pour tout le monde, Alice Marchal s'est noyée dans l'étang du Moulin. On n'a jamais retrouvé le corps."),
    narr("Sur le bail de la maison n°9, l'agence a inscrit un autre nom."),
    input('Quel nom porte votre nouvelle identité ?', ['Natasha Lusky', 'Nora Vidal', 'Juliette Armand']),
    narr("{alias}. Traductrice, quarante et un ans, sans enfant, sans passé. Le nom d'une femme qui n'en avait plus besoin, et des papiers qui ont coûté tout ce qui vous restait."),
  ], 's1'),

  // ─────────────────────────────── Scène 1 — Le retour
  ...seq('s1', allee('jour'), [
    title('Scène 1', 'Le retour'),
    narr("Le portail s'ouvre sans un bruit. Les haies sont plus hautes que dans votre souvenir. Tout le reste est exactement pareil, et c'est presque pire."),
    narr('Votre téléphone sert maintenant de manette : déplacez-vous entre les points d’intérêt, puis examinez.'),
  ], 's1.explore'),

  ...seq('s1.explore', allee('jour'), [
    explore('s1.explore', "L'allée des Tilleuls", [
      { id: 'plaque', label: "La plaque de l'entrée", at: [12, 58], icon: 'regarder', next: 's1.plaque' },
      { id: 'vasseur', label: 'La maison des Vasseur (n°11)', at: [29, 52], icon: 'regarder', next: 's1.vasseur' },
      { id: 'jardinier', label: "L'homme au taille-haie", at: [62, 64], icon: 'personne', next: 's1.alban' },
      { id: 'maison', label: 'Rentrer chez vous (n°9)', at: [80, 52], icon: 'porte', next: 's1.beatrice', exit: true },
    ]),
  ]),

  ...seq('s1.plaque', allee('jour'), [
    narr("« Domaine de Bellécourt — 1987 ». Le laiton a été poli récemment. Quelqu'un tient beaucoup à ce que rien ne change ici."),
    memory("Vous avez déjà posé la main sur cette plaque, en riant, un soir d'été. Quelqu'un vous tenait l'autre main. Le visage ne vient pas."),
  ], 's1.explore'),

  ...seq('s1.vasseur', allee('jour'), [
    narr("Volets ouverts, géraniums alignés au cordeau. Sur la terrasse, deux tasses et une théière."),
    narr("Béatrice a toujours reçu à seize heures. Vous le savez sans avoir besoin de vous en souvenir, et ça vous fait peur."),
  ], 's1.explore'),

  ...seq('s1.alban', allee('jour'), [
    enter({ id: 'alban', pos: 'centre', mood: 'neutre' }),
    ...say('alban', 'Bonjour, madame. Vous êtes la nouvelle du 9 ?'),
    choice('Que répondez-vous ?', [
      { id: 'oui', label: "Oui. {alias}. J'emménage tout juste.", tone: 'franchise', effects: { rel: { alban: 1 } }, next: 's1.alban.suite' },
      { id: 'vite', label: 'Les nouvelles vont vite, ici.', tone: 'esquive', next: 's1.alban.suite' },
    ]),
  ]),
  ...seq('s1.alban.suite', { decor: 'allee', time: 'jour', cast: [{ id: 'alban', pos: 'centre', mood: 'sourire' }] }, [
    ...say('alban', "Alban. Je m'occupe des espaces verts. Et des clés, et des fuites, et de tout ce que les autres oublient de faire."),
    narr('Il vous regarde une seconde de trop.'),
    ...say('alban', 'Excusez-moi. Vous me rappelez quelqu’un.', 'trouble'),
    withFx({ exposure: 1, clues: ['alban-regard'] }, narr('Votre cœur cogne. Vous gardez les mains immobiles.')),
    choice('Comment réagissez-vous ?', [
      { id: 'banal', label: "On me le dit souvent. J'ai un visage banal.", tone: 'mensonge', next: 's1.alban.banal' },
      { id: 'qui', label: 'Ah oui ? Qui donc ?', tone: 'retourner', effects: { rel: { alban: 1 }, exposure: 1 }, next: 's1.alban.qui' },
    ]),
  ]),
  ...seq('s1.alban.banal', { decor: 'allee', time: 'jour', cast: [{ id: 'alban', pos: 'centre', mood: 'neutre' }] }, [
    ...say('alban', 'Sûrement. Bonne installation, madame.'),
    leave('alban'),
    narr('Il reprend sa taille. Vous sentez son regard dans votre dos jusqu’au bout de l’allée.'),
  ], 's1.explore'),
  ...seq('s1.alban.qui', { decor: 'allee', time: 'jour', cast: [{ id: 'alban', pos: 'centre', mood: 'trouble' }] }, [
    ...say('alban', "Quelqu'un qui n'est plus là."),
    narr('Il le dit sans tristesse apparente, comme on annonce la pluie. Puis il remet ses gants.'),
    leave('alban'),
  ], 's1.explore'),

  ...seq('s1.beatrice', allee('jour'), [
    narr("Vous n'avez pas fait trois pas qu'une voix vous rattrape."),
    enter({ id: 'beatrice', pos: 'centre', mood: 'sourire' }),
    ...say('beatrice', 'Vous devez être {alias} ! Béatrice Vasseur, la maison juste à côté. Et, pour mes péchés, présidente de l’association syndicale.'),
    ...say('beatrice', "Je vous ai apporté de la confiture d'abricots. C'est la tradition, ici : on accueille les gens."),
    narr("Béatrice. Votre meilleure amie, autrefois. Elle vous serre la main un peu trop longtemps, et ses yeux font l'inventaire : chaussures, sac, mains, visage."),
    ...say('beatrice', "Alors, qu'est-ce qui amène quelqu'un comme vous à Bellécourt ? Personne ne vient ici par hasard."),
    choice('Que dites-vous à Béatrice ?', [
      { id: 'convalescence', label: "J'avais besoin de calme. Je sors d'une longue convalescence.", tone: 'franchise', effects: { rel: { beatrice: 1 }, exposure: 1, flags: { dit_convalescence: true }, log: 'Vous avez parlé de votre convalescence à Béatrice.' }, next: 's1.beatrice.convalescence' },
      { id: 'loyer', label: 'Le loyer, surtout. Et le silence.', tone: 'esquive', next: 's1.beatrice.loyer' },
      { id: 'mutation', label: 'Une mutation. Je traduis pour une entreprise de la région.', tone: 'mensonge', effects: { flags: { mensonge_travail: true } }, next: 's1.beatrice.mutation' },
      { id: 'vous', label: "Et vous, Béatrice ? Qu'est-ce qui vous retient ici ?", tone: 'retourner', effects: { rel: { beatrice: -1 }, flags: { beatrice_testee: true }, log: 'Vous avez retourné la question à Béatrice dès la première rencontre.' }, next: 's1.beatrice.vous' },
    ]),
  ]),
  ...seq('s1.beatrice.convalescence', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'trouble' }] }, [
    ...say('beatrice', "Oh, je suis désolée. Vous verrez, ici, on prend soin les uns des autres. C'est même ce qu'on fait de mieux."),
  ], 's1.beatrice.fin'),
  ...seq('s1.beatrice.loyer', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'neutre' }] }, [
    ...say('beatrice', 'Le silence… Oui. On en a beaucoup, ici.'),
  ], 's1.beatrice.fin'),
  ...seq('s1.beatrice.mutation', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'sourire' }] }, [
    ...say('beatrice', 'Comme c’est intéressant. Il faudra me dire laquelle, je connais tout le monde.'),
  ], 's1.beatrice.fin'),
  ...seq('s1.beatrice.vous', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'froid' }] }, [
    ...say('beatrice', "Moi ? Les souvenirs, j'imagine. Et les gens qui ont besoin de moi."),
  ], 's1.beatrice.fin'),
  ...seq('s1.beatrice.fin', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'sourire' }] }, [
    ...say('beatrice', 'Enfin ! Les Delaunay donnent un dîner ce soir, Paul et Monica, au 14. Vous êtes invitée : j’ai insisté.'),
    ...say('beatrice', 'Donnez-moi votre numéro, je vous envoie tout ça.'),
    narr("Vous le lui dictez. Elle l'enregistre avec une rapidité d'experte, puis s'éloigne en agitant la main."),
    leave('beatrice'),
    sms({
      thread: 'beatrice',
      contact: 'Béatrice Vasseur',
      incoming: [{ text: "Dîner 20 h au 14, allée des Tilleuls. Tenue correcte mais pas guindée 😉 Monica déteste qu'on arrive en avance. — H." }],
      replies: [
        { id: 'merci', text: 'Merci Béatrice, à ce soir.', effects: { rel: { beatrice: 1 } }, next: 's1.soir' },
        { id: 'vin', text: "J'apporterai une bouteille. Rouge ?", effects: { flags: { bouteille: true } }, next: 's1.vin' },
      ],
      dismiss: { label: 'Ne pas répondre', effects: { rel: { beatrice: -1 } }, next: 's1.soir' },
    }),
  ]),
  ...seq('s1.vin', allee('jour'), [
    sms({
      thread: 'beatrice',
      contact: 'Béatrice Vasseur',
      incoming: [{ text: 'Rouge. Paul ne boit que du Saint-Joseph, mais il ne vous le dira jamais. Moi si 😘' }],
      dismiss: { label: 'Ranger le téléphone' },
    }),
  ], 's1.soir'),
  ...seq('s1.soir', allee('soir'), [
    narr('Le soleil descend derrière les haies. Dans la maison n°9, les cartons attendent. Vous ne les ouvrez pas.'),
  ], 's2'),

  // ─────────────────────────────── Scène 2 — Le dîner
  ...seq('s2', salon('soir'), [
    title('Scène 2', 'Le dîner'),
    narr('Chez les Delaunay, tout est blanc, cher et parfaitement éclairé. Une maison qui ressemble à une publicité pour une vie heureuse.'),
    enter({ id: 'monica', pos: 'gauche', mood: 'froid' }),
    ...say('monica', '{alias}. Béatrice nous a tout dit de vous. Ce qui veut dire, je suppose, qu’elle ne sait rien.'),
    enter({ id: 'paul', pos: 'droite', mood: 'sourire' }),
    ...say('paul', 'Monica. Laisse-la au moins entrer. Paul, bienvenue. Je vous sers quelque chose ?'),
    ...iff({ flag: 'bouteille' }, [
      withFx({ rel: { paul: 1 } }, narr('Vous lui tendez la bouteille. Il lit l’étiquette et son sourire change.')),
      ...say('paul', 'Un Saint-Joseph. Enfin quelqu’un qui a du goût dans ce lotissement.'),
      ...say('monica', 'Béatrice, je suppose.', 'froid'),
    ]),
    memory('Sa voix vous traverse comme un courant d’air. Vous connaissez cette voix. Vous ne savez plus d’où, ni si vous l’aimiez.'),
    narr('On attend encore Béatrice. Vous avez quelques minutes pour regarder autour de vous.'),
  ], 's2.explore'),

  ...seq('s2.explore', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    explore('s2.explore', 'Le salon des Delaunay', [
      { id: 'cheminee', label: 'Le cadre sur la cheminée', at: [17, 44], icon: 'objet', next: 's2.cheminee' },
      { id: 'baie', label: 'La baie vitrée', at: [74, 40], icon: 'regarder', next: 's2.baie' },
      { id: 'photos', label: 'Les photos près du bar', at: [45, 38], icon: 'objet', next: 's2.photos' },
      { id: 'table', label: 'Passer à table', at: [50, 78], icon: 'porte', next: 's2.diner', exit: true },
    ]),
  ]),
  ...seq('s2.cheminee', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }] }, [
    withFx({ clues: ['faire-part'] }, narr('Sur la cheminée, un faire-part encadré, en lettres dorées : « Lou Delaunay — née le 14 mars 2009 ».')),
    ...say('monica', "Notre fille. Elle est en internat à Lyon. Elle déteste cette maison. Elle n'a pas tort."),
  ], 's2.explore'),
  ...seq('s2.baie', { decor: 'salon', time: 'soir', cast: [] }, [
    narr('Au fond du jardin commun, derrière la haie, on devine le pavillon de la piscine. Une lumière bleue, immobile.'),
    withFx({ clues: ['lumiere-bleue'] }, memory("De l'eau froide. Une lumière bleue. Vos mains se mettent à trembler ; vous les glissez dans vos poches.")),
  ], 's2.explore'),
  ...seq('s2.photos', { decor: 'salon', time: 'soir', cast: [] }, [
    narr('Des photos de vacances, de remise de diplôme, de barbecue. Et une photo de groupe : la fête de la Saint-Jean, il y a dix ans.'),
    withFx({ clues: ['saint-jean'] }, narr("Béatrice, les Delaunay, Alban en retrait… et, coupée au bord du cadre, une épaule nue et une robe verte. La vôtre. Quelqu'un vous a retirée de la photo.")),
  ], 's2.explore'),

  ...seq('s2.diner', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'beatrice', pos: 'centre', mood: 'sourire' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    narr('Béatrice arrive en retard, avec des excuses que personne ne croit. Le dîner avance : le syndic, les travaux, les impôts, les enfants des autres.'),
    ...say('beatrice', '… et le pavillon de la piscine enfin rénové ! Dix ans qu’on en parlait.'),
    ...say('monica', 'Dix ans que Paul refusait qu’on y touche.', 'froid'),
    ...say('paul', "Parce qu'il n'y avait pas de budget."),
    ...say('monica', 'Bien sûr. Et il a encore mis la date de naissance de Lou comme code sur la porte. Comme sur l’alarme, comme sur sa carte bleue. Un jour, on se fera tout voler.', undefined, { clues: ['code-lou'] }),
    ...say('paul', 'Merci, chérie. Maintenant toute la table le sait.', 'froid'),
    ...say('beatrice', 'Vous savez, {alias}… votre maison, le 9. Il y avait une femme qui vivait là, avant.', 'trouble'),
    narr('Silence. Monica repose son verre. Paul regarde la nappe.'),
    choice('Comment réagissez-vous ?', [
      { id: 'curieuse', label: "Avant ? Qu'est-ce qui lui est arrivé ?", tone: 'franchise', next: 's2.versions' },
      { id: 'savoir', label: "L'agence ne m'a rien dit. Je préfère ne pas savoir.", tone: 'esquive', next: 's2.insiste' },
      { id: 'pourquoi', label: 'Pourquoi me racontez-vous ça, Béatrice ?', tone: 'retourner', effects: { rel: { beatrice: -1 } }, next: 's2.pourquoi' },
    ]),
  ]),
  ...seq('s2.insiste', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'beatrice', pos: 'centre', mood: 'trouble' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    ...say('beatrice', 'Il vaut mieux que vous l’appreniez de nous que des voisins.'),
  ], 's2.versions'),
  ...seq('s2.pourquoi', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'beatrice', pos: 'centre', mood: 'froid' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    ...say('beatrice', 'Parce que, tôt ou tard, quelqu’un vous le dira. Et mal.'),
  ], 's2.versions'),
  ...seq('s2.versions', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'beatrice', pos: 'centre', mood: 'trouble' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    ...say('beatrice', 'Alice. Alice Marchal. Elle est partie une nuit de juin. Elle voyait quelqu’un, un homme de l’extérieur. Elle a pris sa voiture et elle n’est jamais revenue.'),
    ...say('paul', "Ce n'est pas ce qui s'est passé.", 'froid'),
    ...say('paul', "On a retrouvé sa voiture dans l'étang du Moulin. Les gendarmes ont conclu à un accident. Elle s'est noyée. Elle n'est partie avec personne."),
    ...say('beatrice', "On n'a jamais retrouvé le corps, Paul.", 'froid'),
    ...say('monica', 'Et voilà. Dix ans, et ils se disputent encore pour savoir qui la connaissait le mieux.', 'sourire'),
    withFx({ clues: ['deux-versions'] }, narr("Deux versions. Deux personnes qui étaient là. Et vous, au centre de l'histoire, qui ne vous souvenez de rien.")),
    choice('Qui poussez-vous à en dire plus ?', [
      { id: 'paul', label: 'Vous avez l’air sûr de vous, Paul. Vous étiez proches ?', tone: 'franchise', effects: { rel: { paul: -1, monica: 1 }, flags: { pousse_paul: true }, log: 'Au dîner, vous avez mis Paul en difficulté devant sa femme.' }, next: 's2.paul' },
      { id: 'beatrice', label: 'Un homme de l’extérieur ? Vous l’avez vu, Béatrice ?', tone: 'retourner', effects: { rel: { beatrice: -1 }, flags: { pousse_beatrice: true }, log: 'Au dîner, vous avez demandé à Béatrice des preuves de sa version.' }, next: 's2.beatrice' },
      { id: 'silence', label: 'Paix à son âme.', tone: 'esquive', effects: { rel: { monica: 1 } }, next: 's2.silence' },
    ]),
  ]),
  ...seq('s2.paul', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'froid' }, { id: 'beatrice', pos: 'centre', mood: 'neutre' }, { id: 'paul', pos: 'droite', mood: 'trouble' }] }, [
    ...say('paul', 'Nous étions voisins.'),
    ...say('monica', 'Très voisins.', 'sourire', { clues: ['paul-alice'] }),
    narr("Paul se lève pour chercher une bouteille qui n'existe pas."),
  ], 's2.fin'),
  ...seq('s2.beatrice', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'neutre' }, { id: 'beatrice', pos: 'centre', mood: 'froid' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    ...say('beatrice', 'Elle me l’avait dit. On se disait tout.'),
    memory("Vous ne vous souvenez d'aucun homme de l'extérieur. Vous vous souvenez de Béatrice qui pleurait dans votre cuisine, une semaine avant. Ou peut-être était-ce vous qui pleuriez."),
  ], 's2.fin'),
  ...seq('s2.silence', { decor: 'salon', time: 'soir', cast: [{ id: 'monica', pos: 'gauche', mood: 'sourire' }, { id: 'beatrice', pos: 'centre', mood: 'neutre' }, { id: 'paul', pos: 'droite', mood: 'neutre' }] }, [
    ...say('monica', 'Enfin quelqu’un de bien élevé à cette table.'),
  ], 's2.fin'),
  ...seq('s2.fin', { decor: 'salon', time: 'nuit', cast: [{ id: 'paul', pos: 'centre', mood: 'trouble' }] }, [
    narr('La soirée se termine sur des politesses. Sur le pas de la porte, Paul vous retient une seconde.'),
    ...say('paul', 'Faites attention à vous. Les gens d’ici adorent les histoires.'),
  ], 's3'),

  // ─────────────────────────────── Scène 3 — Le message
  ...seq('s3', allee('nuit'), [
    title('Scène 3', 'Le message'),
    narr('Minuit passé. Vous êtes assise sur les marches du 9, dans le noir. Le lotissement dort, ou fait semblant.'),
    narr('Votre téléphone vibre.'),
    sms({
      thread: 'anonyme',
      contact: 'Numéro masqué',
      incoming: [
        { text: "Vous posez beaucoup de questions sur le 21 juin." },
        { photo: 'pavillon-2347' },
        { text: "Elle n'est jamais allée à l'étang ce soir-là." },
      ],
      replies: [
        { id: 'qui', text: 'Qui êtes-vous ?', next: 's3.qui' },
        { id: 'erreur', text: 'Vous vous trompez de numéro.', effects: { flags: { nie_anonyme: true } }, next: 's3.erreur' },
      ],
      dismiss: { label: 'Ne pas répondre', effects: { flags: { ignore_anonyme: true } }, next: 's3.photo' },
    }),
  ]),
  ...seq('s3.qui', allee('nuit'), [
    sms({ thread: 'anonyme', contact: 'Numéro masqué', incoming: [{ text: "Quelqu'un qui était là." }], dismiss: { label: 'Regarder la photo' } }),
  ], 's3.photo'),
  ...seq('s3.erreur', allee('nuit'), [
    sms({ thread: 'anonyme', contact: 'Numéro masqué', incoming: [{ text: 'Non.' }], dismiss: { label: 'Regarder la photo' } }),
  ], 's3.photo'),
  ...seq('s3.photo', { ...allee('nuit'), photo: 'pavillon-2347' }, [
    narr('Vous agrandissez la photo. Le pavillon de la piscine, la nuit. Devant, une petite voiture rouge.'),
    narr('Votre voiture. Celle que les gendarmes ont sortie de l’étang.'),
    withFx({ clues: ['photo-2347'] }, narr("L'horodatage indique 23 h 47. Selon Béatrice, vous étiez partie à 22 h. Selon Paul, vous vous êtes noyée à six kilomètres d'ici. Sur la photo, vous êtes encore là.")),
    narr('Derrière la vitre du pavillon, une silhouette. Impossible de dire qui.'),
    stage({ photo: undefined }),
    memory("De l'eau froide. Une lumière bleue. Le pavillon."),
    narr('Vous vous levez.'),
  ], 's4'),

  // ─────────────────────────────── Scène 4 — Le pavillon
  ...seq('s4', pavillon('nuit'), [
    title('Scène 4', 'Le pavillon'),
    narr('Le jardin commun est désert. La piscine éclaire le pavillon par en dessous, comme une scène de théâtre vide.'),
    narr('La porte est verrouillée. À côté de la poignée, un boîtier à code tout neuf. Quatre chiffres.'),
    keypad('Entrez le code du pavillon', '1403', [
      { after: 2, text: 'Au dîner, Monica se plaignait : Paul met toujours la même date sur tous ses codes.' },
      { after: 4, text: 'La date de naissance de Lou : sur le faire-part de la cheminée, « née le 14 mars 2009 ». Jour, puis mois.' },
      { after: 6, text: 'Le code est 1403.' },
    ]),
    withFx({ log: 'Vous êtes entrée dans le pavillon de la piscine.' }, narr("Un déclic. La porte s'ouvre sur une odeur de chlore et de peinture fraîche.")),
    stage({ time: 'interieur' }),
    narr('Tout a été refait : carrelage neuf, transats neufs. Sauf le local technique, au fond, où personne n’a touché à rien.'),
  ], 's4.explore'),
  ...seq('s4.explore', pavillon('interieur'), [
    explore('s4.explore', 'À l’intérieur du pavillon', [
      { id: 'registre', label: 'Le cahier accroché au mur', at: [28, 46], icon: 'objet', next: 's4.registre' },
      { id: 'local', label: 'Le local technique', at: [72, 52], icon: 'porte', next: 's4.local', exit: true },
    ]),
  ]),
  ...seq('s4.registre', pavillon('interieur'), [
    narr('Un vieux cahier à spirale : le registre des clés de la piscine. Vous remontez les pages jusqu’en juin 2016.'),
    withFx({ clues: ['registre'] }, narr('Le 21 juin : « Clé rendue — 23 h 30 — P.D. ». Et juste en dessous, d’une autre écriture : « 00 h 40 — A.R. »')),
    narr('P.D. : Paul Delaunay. A.R. : Alban Roche. Deux hommes au pavillon, la nuit où vous êtes morte.'),
  ], 's4.explore'),
  ...seq('s4.local', pavillon('interieur'), [
    narr('Derrière la pompe de filtration, une boîte en fer. Dans la boîte, dans un sachet de congélation : un téléphone à la coque turquoise, fendue.'),
    withFx({ clues: ['telephone-alice'], flags: { a_le_telephone: true }, log: "Vous avez trouvé l'ancien téléphone d'Alice." }, narr("Votre téléphone. Celui d'Alice. Quelqu'un l'a gardé pendant dix ans.")),
    narr('Dehors, des pas sur le gravier. Le faisceau d’une lampe torche balaie la vitre.'),
    qte({
      prompt: 'Quelqu’un approche !',
      instruction: 'Restez immobile derrière la pompe : maintenez le bouton appuyé jusqu’à ce que la lumière s’éloigne.',
      hold: 3500,
      window: 8000,
      extendedWindow: 15000,
      success: 's4.cachee',
      fail: 's4.surprise',
    }),
  ]),
  ...seq('s4.cachee', pavillon('interieur'), [
    narr('La lumière s’attarde sur la vitre, puis s’éloigne. Vous comptez jusqu’à cent avant de respirer.'),
    withFx({ flags: { vu_alban: true }, clues: ['veste-verte'] }, narr('Dans l’allée, vous apercevez une veste vert bouteille qui s’éloigne. Alban.')),
  ], 's5'),
  ...seq('s4.surprise', { decor: 'pavillon', time: 'interieur', cast: [{ id: 'alban', pos: 'centre', mood: 'froid' }] }, [
    narr('Le faisceau vous trouve.'),
    ...say('alban', 'Madame {alias} ? Qu’est-ce que vous faites ici, en pleine nuit ?'),
    choice('Le téléphone est dans votre poche. Que dites-vous ?', [
      { id: 'dormir', label: "Je n'arrivais pas à dormir. La porte était ouverte.", tone: 'mensonge', effects: { rel: { alban: -1 }, exposure: 1, flags: { surprise_par_alban: true } }, next: 's4.surprise.mensonge' },
      { id: 'cherche', label: 'Je cherchais quelque chose. Je ne sais pas encore quoi.', tone: 'franchise', effects: { rel: { alban: 1 }, exposure: 1, flags: { surprise_par_alban: true } }, next: 's4.surprise.franchise' },
    ]),
  ]),
  ...seq('s4.surprise.mensonge', { decor: 'pavillon', time: 'interieur', cast: [{ id: 'alban', pos: 'centre', mood: 'froid' }] }, [
    ...say('alban', 'Elle ne l’est jamais. Rentrez chez vous, madame.'),
  ], 's5'),
  ...seq('s4.surprise.franchise', { decor: 'pavillon', time: 'interieur', cast: [{ id: 'alban', pos: 'centre', mood: 'trouble' }] }, [
    narr('Il vous regarde longtemps, la lampe baissée.'),
    ...say('alban', 'Alors faites attention à ce que vous trouvez. Rentrez chez vous.'),
  ], 's5'),

  // ─────────────────────────────── Scène 5 — Le choix
  ...seq('s5', allee('nuit'), [
    title('Scène 5', 'Le choix'),
    narr('Chez vous, sur la table de la cuisine : le vieux téléphone dans son sachet. Il est mort, mais la carte SIM est intacte.'),
    narr("Quelqu'un l'a caché au lieu de le jeter. Pour se protéger, ou pour garder une preuve contre quelqu'un d'autre."),
    narr('Si vous agissez trop tôt, vous perdez votre couverture. Si vous attendez, celui qui l’a caché finira par s’apercevoir qu’il a disparu.'),
    choice('Que faites-vous de la preuve ?', [
      { id: 'confronter', label: 'Aller chez Paul, maintenant. Lui mettre le téléphone sous les yeux.', tone: 'action', effects: { ending: 'confrontation', log: 'Vous avez confronté Paul avec le téléphone.' }, next: 'a' },
      { id: 'cacher', label: 'Le cacher et ne rien dire. Observer qui panique.', tone: 'esquive', effects: { ending: 'silence', log: 'Vous avez caché la preuve.' }, next: 'b' },
      { id: 'alban', label: 'Le confier à Alban. Il était là cette nuit-là, et il a les clés.', tone: 'franchise', effects: { ending: 'alliance', flags: { alban_a_le_telephone: true }, log: 'Vous avez confié le téléphone à Alban.' }, next: 'c' },
    ]),
  ]),

  // Variante A — la confrontation
  ...seq('a', salon('nuit'), [
    narr('Il est une heure du matin quand Paul ouvre la porte, en peignoir, le visage gris.'),
    enter({ id: 'paul', pos: 'centre', mood: 'trouble' }),
    ...say('paul', '{alias} ? Qu’est-ce que…'),
    narr('Vous posez le sachet sur le marbre de l’entrée. Il le reconnaît immédiatement. Ça se voit.'),
    ...say('paul', 'Où avez-vous trouvé ça ?'),
    choice('Que répondez-vous ?', [
      { id: 'cache', label: "Là où vous l'avez caché.", tone: 'franchise', next: 'a.cache' },
      { id: 'envoye', label: "Quelqu'un me l'a envoyé. Il sait ce que vous avez fait.", tone: 'mensonge', effects: { flags: { menti_paul: true } }, next: 'a.envoye' },
    ]),
  ]),
  ...seq('a.cache', { decor: 'salon', time: 'nuit', cast: [{ id: 'paul', pos: 'centre', mood: 'froid' }] }, [
    ...say('paul', "Je ne l'ai pas caché. Je l'ai gardé. Ce n'est pas pareil."),
  ], 'a.aveu'),
  ...seq('a.envoye', { decor: 'salon', time: 'nuit', cast: [{ id: 'paul', pos: 'centre', mood: 'trouble' }] }, [
    ...say('paul', "Ce que j'ai fait ? Je n'ai rien fait ! Je…"),
  ], 'a.aveu'),
  ...seq('a.aveu', { decor: 'salon', time: 'nuit', cast: [{ id: 'paul', pos: 'centre', mood: 'trouble' }] }, [
    ...say('paul', 'Elle est venue au pavillon, ce soir-là. On… on se voyait. Elle voulait tout dire à Monica. On s’est disputés.'),
    ...say('paul', 'Je suis parti à onze heures et demie. Elle était vivante. Je vous le jure.'),
    ...iff({ clue: 'registre' }, narr('« Clé rendue — 23 h 30 — P.D. » Le registre lui donne raison. Sur ce point, au moins.')),
    ...say('paul', "Le lendemain, j'ai trouvé son téléphone au bord du bassin. Sa voiture n'était plus là. Et quand on l'a sortie de l'étang… j'ai eu peur. Il y avait quarante appels de moi là-dedans."),
    enter({ id: 'monica', pos: 'gauche', mood: 'froid' }),
    ...say('monica', 'Paul ? Qui est-ce ?'),
    narr('Monica, en haut de l’escalier. Depuis combien de temps écoute-t-elle ?'),
    choice('Que dites-vous ?', [
      { id: 'proteger', label: "Personne. Une voisine qui s'est trompée de porte.", tone: 'mensonge', effects: { rel: { paul: 2, monica: -1 }, flags: { protege_paul: true }, log: 'Vous avez couvert Paul devant Monica. Il vous doit quelque chose.' }, next: 'a.proteger' },
      { id: 'exposer', label: 'Demandez donc à votre mari.', tone: 'retourner', effects: { rel: { paul: -2, monica: 1 }, exposure: 1, flags: { expose_paul: true }, log: 'Vous avez exposé Paul devant Monica.' }, next: 'a.exposer' },
    ]),
  ]),
  ...seq('a.proteger', { decor: 'salon', time: 'nuit', cast: [{ id: 'monica', pos: 'gauche', mood: 'froid' }, { id: 'paul', pos: 'droite', mood: 'trouble' }] }, [
    ...say('monica', 'À une heure du matin. Bien sûr.'),
    narr('Paul ne dit rien. Mais quand vous repartez, il vous adresse un regard que vous connaissez : celui de quelqu’un qui a une dette.'),
  ], 'a.fin'),
  ...seq('a.exposer', { decor: 'salon', time: 'nuit', cast: [{ id: 'monica', pos: 'gauche', mood: 'sourire' }, { id: 'paul', pos: 'droite', mood: 'trouble' }] }, [
    ...say('monica', "Oh, je n'ai pas besoin de lui demander. Je le sais depuis dix ans."),
    narr('Elle dit ça calmement, sans quitter Paul des yeux. Puis elle remonte. Paul reste au milieu de l’entrée, les bras ballants.'),
  ], 'a.fin'),
  ...seq('a.fin', allee('nuit'), [
    withFx({ exposure: 1 }, narr('Vous repartez avec le téléphone. Derrière vous, la porte des Delaunay se referme sur une dispute qui attend depuis dix ans.')),
    narr('Paul sait maintenant que vous cherchez. Bientôt, il voudra savoir pourquoi.'),
  ], 'cliff'),

  // Variante B — le silence
  ...seq('b', allee('nuit'), [
    narr('Vous glissez le téléphone au fond d’un carton marqué « Livres », sous trois romans que vous n’avez jamais lus. Puis vous attendez le matin.'),
    stage({ time: 'jour' }),
    narr('À huit heures, quelqu’un frappe.'),
    enter({ id: 'beatrice', pos: 'centre', mood: 'sourire' }),
    ...say('beatrice', 'Croissants ! J’ai pensé qu’après le dîner d’hier, vous auriez besoin de reprendre des forces.'),
    narr('Béatrice ne regarde pas la cuisine. Elle regarde les cartons.'),
    ...say('beatrice', 'Vous êtes sortie, cette nuit ? Alban dit avoir vu de la lumière au pavillon.', 'neutre'),
    ...iff({ flag: 'surprise_par_alban' }, narr('Alban lui a donc parlé. Évidemment qu’il lui a parlé.')),
    choice('Que répondez-vous ?', [
      { id: 'dormais', label: "Je dormais. J'ai pris un somnifère.", tone: 'mensonge', effects: { flags: { menti_beatrice: true } }, next: 'b.dormais' },
      { id: 'alban', label: 'Alban vous raconte tout ce qu’il voit ?', tone: 'retourner', effects: { rel: { beatrice: -1 }, clues: ['alban-beatrice'] }, next: 'b.alban' },
      { id: 'promenade', label: "Je suis allée marcher. J'avais besoin d'air.", tone: 'franchise', effects: { rel: { beatrice: 1 } }, next: 'b.promenade' },
    ]),
  ]),
  ...seq('b.dormais', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'sourire' }] }, [
    ...say('beatrice', 'Tant mieux. Les nuits sont longues, ici.'),
    ...iff({ flag: 'surprise_par_alban' }, withFx({ exposure: 1 }, narr('Son sourire ne bouge pas, mais quelque chose se ferme derrière. Elle sait que vous mentez.'))),
  ], 'b.fin'),
  ...seq('b.alban', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'froid' }] }, [
    ...say('beatrice', 'Alban me doit beaucoup. Tout le monde, ici, me doit un peu quelque chose.'),
  ], 'b.fin'),
  ...seq('b.promenade', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'trouble' }] }, [
    ...say('beatrice', 'Prenez garde. Le jardin commun est mal éclairé. Il y a eu… des accidents.'),
  ], 'b.fin'),
  ...seq('b.fin', { decor: 'allee', time: 'jour', cast: [{ id: 'beatrice', pos: 'centre', mood: 'sourire' }] }, [
    ...say('beatrice', 'Ah, et {alias}… Elle aussi, elle avait cette manie de garder ses cartons fermés.'),
    leave('beatrice'),
    narr('Elle s’en va. Vous restez longtemps immobile.'),
    narr("Personne ne sait que vous avez le téléphone. Pour l'instant, c'est votre seul avantage."),
  ], 'cliff'),

  // Variante C — l'alliance
  ...seq('c', allee('nuit'), [
    narr('La lumière est encore allumée dans la loge du gardien. Alban ouvre avant que vous ayez frappé.'),
    enter({ id: 'alban', pos: 'centre', mood: 'trouble' }),
    ...say('alban', 'Vous avez trouvé quelque chose.'),
    narr('Ce n’est pas une question. Vous lui montrez le sachet.'),
    ...say('alban', 'Je savais qu’il était là. Je n’y ai jamais touché.'),
    ...say('alban', "Cette nuit-là, vers minuit et demi, quelqu'un m'a demandé d'aller chercher une clé au pavillon. Quand je suis arrivé, il n'y avait plus personne. Seulement de l'eau partout sur le carrelage."),
    ...iff({ clue: 'registre' }, narr('« 00 h 40 — A.R. » Le registre dit la même chose. Ou alors il a été écrit pour le dire.')),
    choice('Que lui demandez-vous ?', [
      { id: 'qui', label: 'Qui vous a demandé d’y aller ?', tone: 'franchise', next: 'c.qui' },
      { id: 'pourquoi', label: "Pourquoi n'avez-vous rien dit, pendant dix ans ?", tone: 'retourner', effects: { rel: { alban: -1 } }, next: 'c.pourquoi' },
    ]),
  ]),
  ...seq('c.qui', { decor: 'allee', time: 'nuit', cast: [{ id: 'alban', pos: 'centre', mood: 'neutre' }] }, [
    ...say('alban', 'Demain. Pas ce soir. Ce soir, je dois vérifier quelque chose.'),
  ], 'c.fin'),
  ...seq('c.pourquoi', { decor: 'allee', time: 'nuit', cast: [{ id: 'alban', pos: 'centre', mood: 'froid' }] }, [
    ...say('alban', "Parce qu'ici, ceux qui parlent finissent par déménager. Ou pire."),
  ], 'c.fin'),
  ...seq('c.fin', { decor: 'allee', time: 'nuit', cast: [{ id: 'alban', pos: 'centre', mood: 'neutre' }] }, [
    ...say('alban', 'Je le garde en lieu sûr. Personne ne viendra le chercher chez moi.', undefined, { rel: { alban: 2 } }),
    leave('alban'),
    narr("Vous lui laissez le téléphone. C'est la première fois depuis dix ans que vous faites confiance à quelqu'un."),
    narr("Vous espérez que ce n'est pas une erreur."),
  ], 'cliff'),

  // ─────────────────────────────── Cliffhanger
  ...seq('cliff', allee('nuit'), [
    narr('Votre téléphone vibre une dernière fois.'),
    sms({
      thread: 'anonyme',
      contact: 'Numéro masqué',
      incoming: [
        { text: 'Vous avez trouvé mon cadeau.', when: { not: { flag: 'alban_a_le_telephone' } } },
        { text: 'Vous ne devriez pas faire confiance au jardinier.', when: { flag: 'alban_a_le_telephone' } },
        { text: 'Monica vous remercie. Moi aussi.', when: { flag: 'expose_paul' } },
        { text: 'Bon retour à Bellécourt, Alice.' },
      ],
      dismiss: { label: 'Poser le téléphone' },
    }),
    narr('Personne n’a prononcé ce nom depuis dix ans.'),
    narr('Quelqu’un, dans ce lotissement, sait exactement qui vous êtes.'),
    title('À suivre', 'Fin de l’épisode 1'),
    end('Bellécourt'),
  ]),
};

export const episode1: Story = {
  id: 'episode1',
  title: 'Bellécourt',
  start: 'prologue',
  nodes,
  characters: {
    beatrice: { name: 'Béatrice Vasseur', role: 'Voisine du 11, présidente de l’association syndicale' },
    paul: { name: 'Paul Delaunay', role: 'Propriétaire du 14' },
    monica: { name: 'Monica Delaunay', role: 'Épouse de Paul' },
    alban: { name: 'Alban Roche', role: 'Gardien et jardinier du domaine' },
  },
  clues: {
    'alban-regard': { id: 'alban-regard', title: 'Le regard d’Alban', text: 'Le jardinier a cru reconnaître quelqu’un en vous voyant.' },
    'faire-part': { id: 'faire-part', title: 'Faire-part de Lou', text: '« Lou Delaunay — née le 14 mars 2009 », encadré sur la cheminée des Delaunay.' },
    'lumiere-bleue': { id: 'lumiere-bleue', title: 'La lumière bleue', text: 'Le pavillon de la piscine, vu depuis le salon, réveille un fragment de souvenir. Un souvenir n’est pas une preuve.' },
    'saint-jean': { id: 'saint-jean', title: 'La photo de la Saint-Jean', text: 'Sur la photo de groupe d’il y a dix ans, Alice a été coupée du cadre.' },
    'code-lou': { id: 'code-lou', title: 'Les codes de Paul', text: 'Selon Monica, Paul utilise la date de naissance de Lou pour tous ses codes, y compris celui du pavillon.' },
    'deux-versions': { id: 'deux-versions', title: 'Deux versions', text: 'Béatrice : Alice est partie avec un homme. Paul : Alice s’est noyée dans l’étang du Moulin. Le corps n’a jamais été retrouvé.' },
    'paul-alice': { id: 'paul-alice', title: '« Très voisins »', text: 'Monica laisse entendre que Paul et Alice avaient une liaison.' },
    'photo-2347': { id: 'photo-2347', title: 'La photo de 23 h 47', text: 'La voiture d’Alice devant le pavillon à 23 h 47, alors qu’elle est censée être partie à 22 h.' },
    registre: { id: 'registre', title: 'Le registre des clés', text: '21 juin : « Clé rendue — 23 h 30 — P.D. », puis « 00 h 40 — A.R. ».' },
    'telephone-alice': { id: 'telephone-alice', title: 'Le téléphone d’Alice', text: 'Caché dans le local technique du pavillon depuis dix ans. Carte SIM intacte.' },
    'veste-verte': { id: 'veste-verte', title: 'La veste verte', text: 'Alban faisait une ronde au pavillon, la nuit où vous y êtes entrée.' },
    'alban-beatrice': { id: 'alban-beatrice', title: 'Alban et Béatrice', text: '« Alban me doit beaucoup », dit Béatrice.' },
  },
  photos: {
    'pavillon-2347': { title: 'Photo reçue', caption: 'Pavillon de la piscine — 21.06.2016 — 23:47' },
  },
  endings: {
    confrontation: 'La confrontation',
    silence: 'Le silence',
    alliance: 'L’alliance',
  },
};
