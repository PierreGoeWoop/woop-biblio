import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "Purple ");
const outputFile = path.join(__dirname, "..", "src", "catalog.json");

// ─── Dictionnaire Anglais → Synonymes Français ────────────────────────────────
// Chaque clé est un tag anglais tiré du nom de fichier.
// Les valeurs sont des tags français ajoutés automatiquement.
const FR_TAGS = {
  // Livraison / commerce
  delivery: ["livraison", "expedition", "envoi"],
  delivered: ["livré", "livraison"],
  shipping: ["expedition", "livraison"],
  fast: ["rapide", "express"],
  cargo: ["fret", "cargaison"],
  truck: ["camion"],
  bike: ["vélo", "moto"],
  courier: ["coursier", "livreur"],
  warehouse: ["entrepôt", "stockage"],
  parcel: ["colis", "paquet"],
  parcels: ["colis"],
  fragile: ["fragile"],
  tracking: ["suivi", "traçabilité"],
  overload: ["surcharge"],
  worldwide: ["mondial", "international"],

  // Paiement / finance
  payment: ["paiement", "règlement"],
  cash: ["espèces", "argent"],
  cashback: ["remboursement"],
  cashless: ["sans espèces", "paiement digital"],
  finance: ["finance", "argent"],
  financial: ["financier"],
  banking: ["banque", "bancaire"],
  bank: ["banque"],
  transfer: ["virement", "transfert"],
  wallet: ["portefeuille", "porte-monnaie"],
  money: ["argent"],
  crypto: ["cryptomonnaie", "cryptographie"],
  nft: ["nft", "jeton"],
  trading: ["trading", "bourse"],
  investment: ["investissement"],
  invoice: ["facture"],
  invoices: ["factures"],
  discount: ["réduction", "remise", "promo"],
  discounts: ["réductions", "promos"],
  sale: ["vente", "soldes"],
  price: ["prix", "tarif"],
  purchase: ["achat"],
  subscription: ["abonnement"],
  paylater: ["paiement différé"],
  stock: ["stock", "bourse"],
  profit: ["bénéfice", "profit"],
  currency: ["devise", "monnaie"],
  budget: ["budget"],
  insurance: ["assurance"],
  freedom: ["liberté"],

  // Technologie / informatique
  computer: ["ordinateur", "informatique"],
  server: ["serveur"],
  database: ["base de données", "bdd"],
  cloud: ["nuage", "cloud"],
  network: ["réseau"],
  internet: ["internet", "web"],
  api: ["interface", "api"],
  algorithm: ["algorithme"],
  programming: ["programmation", "code"],
  coding: ["programmation", "code", "développement"],
  software: ["logiciel"],
  hardware: ["matériel"],
  processor: ["processeur", "puce"],
  motherboard: ["carte mère"],
  disk: ["disque"],
  drive: ["disque", "stockage"],
  ssd: ["disque solide", "stockage"],
  hdd: ["disque dur", "stockage"],
  screen: ["écran"],
  keyboard: ["clavier"],
  mouse: ["souris"],
  printer: ["imprimante"],
  scanner: ["scanner"],
  monitor: ["moniteur", "écran"],
  laptop: ["ordinateur portable"],
  mobile: ["mobile", "téléphone", "portable"],
  phone: ["téléphone"],
  domain: ["domaine"],
  website: ["site web", "site"],
  seo: ["référencement", "seo"],
  vga: ["carte graphique"],
  gpu: ["carte graphique"],
  console: ["console"],
  projector: ["projecteur"],
  configuration: ["configuration", "paramètres"],

  // Intelligence artificielle
  ai: ["intelligence artificielle", "ia"],
  machine: ["machine"],
  learning: ["apprentissage"],
  neural: ["neuronal", "réseau neuronal"],
  deepfake: ["faux", "trucage"],
  fake: ["faux", "trucage"],
  deep: ["profond"],
  generative: ["génératif", "génération"],
  automation: ["automatisation", "automatique"],
  robot: ["robot", "automate"],
  robotic: ["robotique"],
  chatbot: ["chatbot", "robot conversationnel"],
  vision: ["vision"],
  recognition: ["reconnaissance"],
  face: ["visage", "facial"],
  eye: ["oeil", "oculaire"],

  // Sécurité
  security: ["sécurité"],
  cyber: ["cyber", "numérique"],
  antivirus: ["antivirus", "protection"],
  hacker: ["hacker", "pirate", "cybercriminel"],
  phishing: ["hameçonnage", "escroquerie"],
  spam: ["spam", "pourriel"],
  vpn: ["vpn", "réseau privé"],
  protection: ["protection", "sécurité"],
  firewall: ["pare-feu"],

  // Marketing / communication
  marketing: ["marketing", "publicité"],
  advertising: ["publicité", "annonce"],
  branding: ["marque", "identité"],
  email: ["email", "courriel", "mail"],
  newsletter: ["newsletter", "lettre info"],
  social: ["social", "réseau social"],
  media: ["médias"],
  influencer: ["influenceur"],
  seo2: ["référencement"],
  megaphone: ["mégaphone", "communication"],
  presentation: ["présentation"],
  discussion: ["discussion", "échange"],
  feedback: ["retour", "avis", "commentaire"],
  review: ["avis", "évaluation"],
  rating: ["note", "évaluation"],
  audience: ["audience", "public"],
  notification: ["notification", "alerte"],
  message: ["message"],
  chat: ["chat", "discussion"],

  // E-commerce / boutique
  shop: ["boutique", "magasin"],
  shopping: ["course", "achat", "shopping"],
  cart: ["panier"],
  basket: ["panier"],
  ecommerce: ["commerce en ligne", "e-commerce"],
  product: ["produit"],
  seller: ["vendeur"],
  deal: ["offre", "affaire"],
  grocery: ["épicerie", "courses", "alimentation"],

  // Éducation
  school: ["école", "éducation"],
  student: ["étudiant", "élève"],
  teacher: ["professeur", "enseignant"],
  learning2: ["apprentissage"],
  book: ["livre"],
  books: ["livres", "bibliothèque"],
  dictionary: ["dictionnaire"],
  graduation: ["diplôme", "remise des diplômes"],
  scholarship: ["bourse", "récompense"],
  audiobook: ["livre audio"],
  education: ["éducation", "formation"],
  knowledge: ["connaissance", "savoir"],

  // Santé / médecine
  medical: ["médical", "médecine"],
  health: ["santé"],
  healthcare: ["soins", "santé"],
  doctor: ["médecin", "docteur"],
  hospital: ["hôpital", "clinique"],
  syringe: ["seringue", "injection"],
  drug: ["médicament", "drogue"],
  thermometer: ["thermomètre"],
  stethoscope: ["stéthoscope"],
  ambulance: ["ambulance", "urgences"],
  cardiogram: ["cardiogramme", "coeur"],
  ultrasound: ["échographie", "ultrasons"],
  infusion: ["perfusion"],
  glucometer: ["glycémie"],
  ventilator: ["ventilateur médical"],
  sphygmomanometer: ["tensiomètre"],

  // Créativité / design
  design: ["design", "conception"],
  creative: ["créatif", "créativité"],
  idea: ["idée", "concept"],
  innovation: ["innovation"],
  brainstorming: ["brainstorming", "remue-méninges"],
  thinking: ["réflexion", "pensée"],
  imagination: ["imagination"],
  painting: ["peinture"],
  painter: ["peintre"],
  photo: ["photo", "photographie"],
  camera: ["appareil photo", "caméra"],
  art: ["art"],

  // Espace / astronomie
  space: ["espace", "cosmos"],
  rocket: ["fusée", "roquette"],
  satellite: ["satellite"],
  astronaut: ["astronaute", "cosmonaute"],
  planet: ["planète"],
  planetary: ["planétaire"],
  galaxy: ["galaxie"],
  moon: ["lune"],
  earth: ["terre"],
  solar: ["solaire"],
  meteor: ["météore", "météorite"],
  comet: ["comète"],
  blackhole: ["trou noir"],
  spaceship: ["vaisseau spatial", "navette"],
  telescope: ["télescope"],
  observatory: ["observatoire"],
  sputnik: ["spoutnik", "satellite"],
  ufo: ["ovni", "soucoupe volante"],
  alien: ["extraterrestre", "alien"],
  constellation: ["constellation"],
  constellations: ["constellations"],

  // Voyage / transport
  travel: ["voyage", "transport"],
  car: ["voiture", "automobile"],
  train: ["train"],
  bus: ["bus", "autobus"],
  airplane: ["avion"],
  airplanes: ["avions"],
  boat: ["bateau"],
  cruise: ["croisière"],
  yacht: ["yacht"],
  ship: ["navire", "bateau"],
  helicopter: ["hélicoptère"],
  jetpack: ["jetpack", "propulseur"],
  passport: ["passeport", "voyage"],
  suitcase: ["valise", "bagages"],
  hotel: ["hôtel", "hébergement"],
  map: ["carte", "plan"],
  tour: ["visite", "circuit"],
  guide: ["guide"],

  // Jeux vidéo
  game: ["jeu", "jeu vidéo"],
  gaming: ["gaming", "jeux vidéo"],
  gamer: ["joueur"],
  arcade: ["arcade"],
  racing: ["course", "racing"],
  fps: ["fps", "jeu de tir"],
  vr: ["vr", "réalité virtuelle"],
  gamepad: ["manette"],
  headset: ["casque"],
  streamer: ["streamer", "diffusion"],

  // Fête / célébration
  party: ["fête", "célébration"],
  celebration: ["célébration", "fête"],
  birthday: ["anniversaire"],
  cake: ["gâteau"],
  balloons: ["ballons"],
  champagne: ["champagne"],
  firework: ["feu d'artifice"],
  carnival: ["carnaval", "fête"],
  gift: ["cadeau"],
  trophy: ["trophée", "récompense"],
  champion: ["champion"],
  cheers: ["santé", "félicitations"],

  // Cuisine / food
  food: ["nourriture", "alimentation"],
  cooking: ["cuisine", "cuisson"],
  chef: ["chef", "cuisinier"],
  recipe: ["recette"],
  kitchen: ["cuisine"],
  oven: ["four"],
  blender: ["mixeur"],
  mixer: ["batteur", "mixeur"],
  pan: ["poêle"],
  pot: ["casserole"],
  pizza: ["pizza"],
  cheese: ["fromage"],
  coffee: ["café"],
  tea: ["thé"],

  // Métavers / réalité augmentée
  metaverse: ["métavers", "monde virtuel"],
  virtual: ["virtuel"],
  reality: ["réalité"],
  augmented: ["augmenté"],
  hologram: ["hologramme"],
  avatar: ["avatar", "personnage"],

  // Podcast / audio
  podcast: ["podcast", "émission"],
  audio: ["audio", "son"],
  recording: ["enregistrement"],
  music: ["musique"],
  sound: ["son", "audio"],
  speaker: ["haut-parleur", "conférencier"],

  // Management / travail
  management: ["gestion", "management"],
  organization: ["organisation"],
  collaboration: ["collaboration", "travail en équipe"],
  office: ["bureau", "bureau"],
  employee: ["employé", "salarié"],
  ceo: ["directeur", "pdg", "chef"],
  project: ["projet"],
  report: ["rapport"],
  strategy: ["stratégie"],
  target: ["cible", "objectif"],
  goal: ["objectif"],
  goals: ["objectifs"],
  analysis: ["analyse"],
  research: ["recherche"],
  data: ["données"],
  chart: ["graphique"],
  flowchart: ["organigramme", "diagramme"],
  wireframe: ["maquette", "wireframe"],
  startup: ["startup", "jeune pousse"],
  incubator: ["incubateur"],

  // Nature / environnement
  forest: ["forêt"],
  mountain: ["montagne"],
  beach: ["plage"],
  nature: ["nature"],
  island: ["île"],
};

// Normalise un mot français pour le stocker en tag ASCII simple
function normalizeFr(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function extractInfo(filename) {
  const nameWithoutExt = filename.replace(
    /\.(png|jpg|jpeg|gif|svg|webp)$/i,
    "",
  );

  const underscoreIdx = nameWithoutExt.lastIndexOf("_");
  const rawName =
    underscoreIdx !== -1
      ? nameWithoutExt.slice(underscoreIdx + 1)
      : nameWithoutExt;

  const name = rawName.replace(/-/g, " ").replace(/\s+/g, " ").trim();

  // English tags from filename
  const enTags = rawName
    .split(/[-\s°°()&/,+]+/)
    .map((w) =>
      w
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim(),
    )
    .filter((w) => w.length >= 2)
    .filter((v, i, a) => a.indexOf(v) === i);

  // French tags derived from the dictionary
  const frTags = [];
  for (const enTag of enTags) {
    const translations = FR_TAGS[enTag];
    if (translations) {
      for (const fr of translations) {
        const parts = normalizeFr(fr).split(/\s+/).filter((p) => p.length >= 2);
        frTags.push(...parts);
      }
    }
  }

  // Merge and deduplicate
  const tags = [...new Set([...enTags, ...frTags])];

  return { filename, name, tags };
}

const files = fs
  .readdirSync(imagesDir)
  .filter((f) => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

const catalog = files.map(extractInfo);

// Stats
const allTags = [...new Set(catalog.flatMap((img) => img.tags))].sort();
console.log(`✓ ${catalog.length} images indexées`);
console.log(`✓ ${allTags.length} tags uniques générés`);

fs.writeFileSync(outputFile, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`✓ Catalogue écrit dans src/catalog.json`);
