const FEMALE_NAMES = [
  "marie", "sophie", "nathalie", "caroline", "marine", "ludivine", "catherine", "valerie", "stephanie", "sandrine",
  "emilie", "julie", "charlotte", "amandine", "camille", "justine", "alexandra", "sandra", "patricia", "corinne",
  "isabelle", "martine", "brigitte", "danielle", "francoise", "monique", "bernadette", "anne", "nicole", "helene",
  "sylvie", "laurence", "muriel", "florence", "celine", "audrey", "kim", "lina", "mia", "zoe", "emma", "lena",
  "lea", "chloe", "alice", "clara", "anna", "sofia", "lola", "nina", "lucy", "diana", "elena", "ines", "lisa",
  "eva", "iris", "lily", "noa", "luna", "mila", "nora", "ayana", "lucia", "lucie", "amy", "estelle", "erika",
  "sara", "melissa", "nadia", "fanny", "clementine", "adeline", "angelique", "claire", "margaux", "manon",
  "amelie", "melanie", "eleonore", "eleonora", "roxy", "elsa", "elisa", "lise", "celia", "lara", "nour",
  "fatima", "imene", "djeneba", "aicha", "fatou", "khady", "mareme", "ouma", "kadiatou", "mariam", "aminata",
  "fatoumata", "aissata", "mariama", "fanta", "ndeye", "fatou", "coumba", "mame", "aissatou", "marieme",
  "ndeye", "bintou", "assa", "jaimie", "naomi", "lindsay", "charlene", "margot", "pauline", "mathilde",
  "colette", "simone", "ginette", "yvette", "renee", "solange", "odette", "lucienne", "paule", "flore",
  "stella", "livia", "zoe", "eve", "iris", "jade", "lea", "rose", "lili", "mia", "chiara", "elisa",
  "alessia", "giulia", "sarah", "leila", "nour", "yasmine", "sana", "lina", "maryam", "nour",
  "mamed", "solimatic",
];

const MALE_NAMES = [
  "jean", "pierre", "michel", "andre", "jean-luc", "philippe", "patrick", "stephane", "nicolas", "frederic",
  "thomas", "olivier", "alexandre", "antoine", "sebastien", "vincent", "ludovic", "arnaud", "david", "julien",
  "michael", "jerome", "franck", "pascal", "gilles", "yves", "christophe", "bruno", "denis", "jacques",
  "robert", "paul", "henri", "georges", "albert", "emile", "louis", "alexis", "eddy", "edouard",
  "ahmed", "brahim", "youssef", "mamadou", "ousmane", "ibrahima", "abdou", "moussa", "bakary", "ali",
  "modou", "abdoulaye", "moustapha", "souleymane", "issaga", "abdoul", "hamidou", "boubacar", "seydou",
  "drissa", "lassana", "oumar", "birama", "sadibou", "papis", "babacar", "saliou", "karim", "yassine",
  "akram", "imad", "anass", "ayoub", "bilal", "hamza", "imran", "khalid", "mehdi", "nabil", "rashid",
  "sami", "tarik", "walid", "younes", "zaki", "adil", "amine", "ayman", "chakib", "driss", "fouad",
  "hicham", "issam", "jaouad", "khaled", "lotfi", "mounir", "noureddine", "othman", "pierre-yves",
  "qasim", "rachid", "salah", "tahir", "usson", "vladimir", "wilfried", "xavier", "yannick", "zakaria",
  "maxime", "bastien", "florian", "kevin", "lucas", "matteo", "noah", "romain", "ugo", "valentin",
];

export function detectGender(firstName: string): { title: string; gender: "M" | "F" | null } {
  const name = firstName.toLowerCase().trim();
  
  if (FEMALE_NAMES.includes(name)) {
    return { title: "Mme", gender: "F" };
  }
  if (MALE_NAMES.includes(name)) {
    return { title: "Mr", gender: "M" };
  }
  
  return { title: "", gender: null };
}

export function getGenderedGreeting(title: string, firstName: string): string {
  if (title === "Mr") return `Monsieur ${firstName}`;
  if (title === "Mme") return `Madame ${firstName}`;
  if (title === "Mlle") return `Mademoiselle ${firstName}`;
  return firstName;
}

export function formatPhoneFrench(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }
  return phone;
}
