export const VEHICLE_DB: Record<string, Record<string, [number, number]>> = {
  "Alfa Romeo": { "Giulia": [2016, 2023], "Giulietta": [2010, 2020], "Stelvio": [2017, 2023] },
  "Audi": { "A1": [2010, 2023], "A3": [2003, 2023], "A4": [2000, 2023], "A5": [2007, 2023], "A6": [2004, 2023], "Q2": [2016, 2023], "Q3": [2011, 2023], "Q5": [2008, 2023], "Q7": [2006, 2023] },
  "BMW": { "Série 1": [2004, 2023], "Série 2": [2014, 2023], "Série 3": [1998, 2023], "Série 5": [2003, 2023], "X1": [2009, 2023], "X3": [2003, 2023], "X5": [2000, 2023] },
  "Citroën": { "Berlingo": [1996, 2023], "C1": [2005, 2014], "C3": [2002, 2023], "C3 Aircross": [2017, 2023], "C4": [2004, 2023], "C4 Cactus": [2014, 2021], "C4 Picasso": [2007, 2018], "C5": [2001, 2017], "C5 Aircross": [2018, 2023], "Dispatch": [2016, 2023], "Jumpy": [2007, 2023] },
  "Dacia": { "Dokker": [2012, 2022], "Duster": [2010, 2023], "Jogger": [2021, 2023], "Logan": [2004, 2023], "Lodgy": [2012, 2022], "Sandero": [2008, 2023], "Spring": [2021, 2023] },
  "Fiat": { "500": [2007, 2023], "500X": [2015, 2023], "Ducato": [1994, 2023], "Panda": [2003, 2023], "Punto": [1999, 2018], "Tipo": [2016, 2023] },
  "Ford": { "C-Max": [2003, 2019], "EcoSport": [2013, 2022], "Fiesta": [2002, 2023], "Focus": [1998, 2023], "Kuga": [2008, 2023], "Puma": [2019, 2023], "Ranger": [2006, 2023], "Transit": [2000, 2023] },
  "Honda": { "Civic": [2001, 2023], "CR-V": [2002, 2023], "HR-V": [2015, 2023], "Jazz": [2002, 2023] },
  "Hyundai": { "i10": [2008, 2023], "i20": [2009, 2023], "i30": [2007, 2023], "Kona": [2017, 2023], "Tucson": [2004, 2023] },
  "Jeep": { "Compass": [2017, 2023], "Renegade": [2014, 2023] },
  "Kia": { "Ceed": [2007, 2023], "Niro": [2016, 2023], "Picanto": [2004, 2023], "Sportage": [2004, 2023], "Stonic": [2017, 2023] },
  "Land Rover": { "Discovery Sport": [2015, 2023], "Range Rover Evoque": [2011, 2023], "Range Rover Sport": [2005, 2023] },
  "Mazda": { "2": [2007, 2023], "3": [2004, 2023], "CX-5": [2012, 2023] },
  "Mercedes": { "Classe A": [2004, 2023], "Classe B": [2005, 2023], "Classe C": [2000, 2023], "Classe E": [2002, 2023], "GLA": [2013, 2023], "GLC": [2015, 2023], "Sprinter": [2000, 2023], "Vito": [2003, 2023] },
  "Mini": { "Clubman": [2007, 2023], "Countryman": [2010, 2023], "Mini": [2001, 2023] },
  "Mitsubishi": { "ASX": [2010, 2023], "Outlander": [2003, 2023] },
  "Nissan": { "Juke": [2010, 2023], "Leaf": [2011, 2023], "Micra": [2003, 2022], "Qashqai": [2007, 2023], "X-Trail": [2001, 2023] },
  "Opel": { "Astra": [1998, 2023], "Corsa": [2000, 2023], "Crossland": [2017, 2023], "Grandland": [2017, 2023], "Mokka": [2012, 2023], "Movano": [2003, 2023], "Vivaro": [2001, 2023], "Zafira": [1999, 2019] },
  "Peugeot": { "107": [2005, 2014], "207": [2006, 2014], "208": [2012, 2023], "301": [2012, 2021], "307": [2001, 2008], "308": [2007, 2023], "3008": [2008, 2023], "407": [2004, 2011], "408": [2022, 2023], "508": [2011, 2023], "5008": [2009, 2023], "Expert": [2007, 2023], "Partner": [1996, 2023], "Rifter": [2018, 2023] },
  "Porsche": { "Cayenne": [2002, 2023], "Macan": [2014, 2023] },
  "Renault": { "Arkana": [2019, 2023], "Austral": [2022, 2023], "Captur": [2013, 2023], "Clio": [1998, 2023], "Kangoo": [1997, 2023], "Kadjar": [2015, 2022], "Koleos": [2008, 2023], "Laguna": [2001, 2015], "Master": [2003, 2023], "Mégane": [1996, 2023], "Scenic": [1996, 2023], "Trafic": [2001, 2023], "Twingo": [1993, 2023], "Zoe": [2012, 2023] },
  "Seat": { "Arona": [2017, 2023], "Ateca": [2016, 2023], "Ibiza": [2002, 2023], "Leon": [2000, 2023], "Tarraco": [2019, 2023] },
  "Skoda": { "Fabia": [2000, 2023], "Kamiq": [2019, 2023], "Karoq": [2017, 2023], "Kodiaq": [2017, 2023], "Octavia": [2000, 2023], "Superb": [2002, 2023] },
  "Smart": { "Fortwo": [2007, 2023] },
  "Subaru": { "Forester": [2003, 2023], "Outback": [2004, 2023] },
  "Suzuki": { "Ignis": [2017, 2023], "Swift": [2005, 2023], "Vitara": [2015, 2023] },
  "Tesla": { "Model 3": [2017, 2023], "Model S": [2012, 2023], "Model Y": [2020, 2023] },
  "Toyota": { "Auris": [2007, 2019], "Aygo": [2005, 2022], "C-HR": [2016, 2023], "Corolla": [2002, 2023], "Proace": [2016, 2023], "RAV4": [2006, 2023], "Yaris": [2000, 2023] },
  "Volkswagen": { "Caddy": [2004, 2023], "Golf": [1997, 2023], "ID.3": [2020, 2023], "ID.4": [2021, 2023], "Passat": [1997, 2023], "Polo": [1995, 2023], "T-Cross": [2019, 2023], "T-Roc": [2017, 2023], "Tiguan": [2007, 2023], "Touran": [2003, 2023], "Transporter": [2003, 2023] },
  "Volvo": { "V60": [2010, 2023], "XC40": [2017, 2023], "XC60": [2008, 2023], "XC90": [2002, 2023] }
};

export interface ServiceCategory {
  id: string;
  g: string; // group
  n: string; // name
  ttc: number;
  q?: number;
}

export const SERVICES_CAT: ServiceCategory[] = [
  { id: "d1", g: "Déplacement", n: "Déplacement ≤ 20 km", ttc: 40 },
  { id: "d2", g: "Déplacement", n: "Déplacement ≤ 40 km", ttc: 65 },
  { id: "u1", g: "Duplication", n: "Programmation IMMO (spare key)", ttc: 70 },
  { id: "u2", g: "Duplication", n: "Taillage de la clé", ttc: 10 },
  { id: "p1", g: "Perte totale", n: "Ouverture / décodage serrure", ttc: 80 },
  { id: "p2", g: "Perte totale", n: "Décodage neiman", ttc: 50 },
  { id: "p3", g: "Perte totale", n: "All keys lost (G3)", ttc: 130 },
  { id: "f1", g: "Fournitures", n: "Clé vierge lame + transpondeur", ttc: 30, q: 1 },
  { id: "f2", g: "Fournitures", n: "Clé vierge télécommande", ttc: 45, q: 1 },
  { id: "f3", g: "Fournitures", n: "Pile télécommande", ttc: 5, q: 1 },
  { id: "m1", g: "Majorations", n: "Soirée 18h – 22h", ttc: 48 },
  { id: "m2", g: "Majorations", n: "Nuit / Week-end / Férié", ttc: 96 },
  { id: "m3", g: "Majorations", n: "Véhicule haut de gamme", ttc: 36 },
  { id: "ms1", g: "Micro-soudure", n: "Soudure connecteur de charge", ttc: 60 },
  { id: "ms2", g: "Micro-soudure", n: "Soudure puce BGA", ttc: 120 },
  { id: "ms3", g: "Micro-soudure", n: "Réparation carte mère (diagnostic)", ttc: 40 },
  { id: "ms4", g: "Micro-soudure", n: "Réparation lecteur SIM", ttc: 80 }
];
