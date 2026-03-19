export const DEVICE_CATEGORIES = [
  "Téléphone",
  "Tablette",
  "Console",
  "Ordinateur Portable",
  "Ordinateur Fixe",
  "Autre"
];

export const DEVICE_DATA: Record<string, Record<string, string[]>> = {
  "Téléphone": {
    "Apple": ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11", "iPhone XR", "iPhone X", "iPhone SE (2022)", "iPhone SE (2020)", "iPhone 8", "Autre"],
    "Samsung": ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22", "Galaxy Z Fold 5", "Galaxy Z Flip 5", "Galaxy Z Fold 4", "Galaxy Z Flip 4", "Galaxy A54", "Galaxy A53", "Galaxy A34", "Galaxy A14", "Autre"],
    "Google": ["Pixel 8 Pro", "Pixel 8", "Pixel 7 Pro", "Pixel 7", "Pixel 7a", "Pixel 6 Pro", "Pixel 6", "Pixel 6a", "Autre"],
    "Xiaomi": ["Xiaomi 14", "Xiaomi 13T", "Xiaomi 13", "Redmi Note 13", "Redmi Note 12", "Poco X6", "Poco X5", "Autre"],
    "Oppo": ["Find X5 Pro", "Find X3 Pro", "Reno 8", "A78", "Autre"],
    "Huawei": ["P60 Pro", "P50 Pro", "Mate 50 Pro", "Autre"],
    "Honor": ["Magic 5 Pro", "Magic 4 Pro", "Autre"],
    "Autre": []
  },
  "Tablette": {
    "Apple": ["iPad Pro 12.9 (M2)", "iPad Pro 11 (M2)", "iPad Air (M1)", "iPad (10e gen)", "iPad (9e gen)", "iPad mini (6e gen)", "iPad Pro 12.9 (Ancien)", "iPad Pro 11 (Ancien)", "iPad Air (Ancien)", "Autre"],
    "Samsung": ["Galaxy Tab S9 Ultra", "Galaxy Tab S9+", "Galaxy Tab S9", "Galaxy Tab S8 Ultra", "Galaxy Tab S8+", "Galaxy Tab S8", "Galaxy Tab A8", "Galaxy Tab S7/S7+", "Autre"],
    "Lenovo": ["Tab P12 Pro", "Tab P11 Pro", "Tab M10 Plus", "Autre"],
    "Xiaomi": ["Pad 6", "Pad 5", "Autre"],
    "Autre": []
  },
  "Console": {
    "Sony": ["PlayStation 5", "PlayStation 5 Édition Digitale", "PlayStation 4 Pro", "PlayStation 4 Slim", "PlayStation 4", "PS Vita", "Autre"],
    "Microsoft": ["Xbox Series X", "Xbox Series S", "Xbox One X", "Xbox One S", "Xbox One", "Autre"],
    "Nintendo": ["Switch OLED", "Switch", "Switch Lite", "Autre"],
    "Autre": []
  },
  "Ordinateur Portable": {
    "Apple": ["MacBook Pro 16\" (M3)", "MacBook Pro 14\" (M3)", "MacBook Air 15\" (M2)", "MacBook Air 13\" (M2)", "MacBook Pro 16\" (M1/M2)", "MacBook Pro 14\" (M1/M2)", "MacBook Air (M1)", "MacBook Pro (Intel)", "MacBook Air (Intel)", "Autre"],
    "HP": ["Spectre x360", "Envy", "Pavilion", "Omen", "Victus", "EliteBook", "ProBook", "Autre"],
    "Dell": ["XPS 13/15/17", "Inspiron", "Alienware", "Latitude", "Precision", "Vostro", "Autre"],
    "Lenovo": ["ThinkPad", "IdeaPad", "Legion", "Yoga", "ThinkBook", "Autre"],
    "Asus": ["ZenBook", "VivoBook", "ROG", "TUF", "ExpertBook", "Autre"],
    "Acer": ["Swift", "Aspire", "Predator", "Nitro", "TravelMate", "Autre"],
    "MSI": ["Raider", "Stealth", "Titan", "Cyborg", "Vector", "Katana", "Autre"],
    "Microsoft": ["Surface Laptop", "Surface Pro", "Surface Book", "Surface Go", "Autre"],
    "Autre": []
  },
  "Ordinateur Fixe": {
    "Apple": ["iMac 24\" (M3)", "iMac 24\" (M1)", "iMac 27\" (Intel)", "Mac Studio", "Mac mini (M2)", "Mac mini (M1)", "Mac Pro", "Autre"],
    "PC Assemblé / Custom": ["Tour Gamer", "Tour Bureautique", "Autre"],
    "HP": ["Omen Desktop", "Pavilion Desktop", "Envy Desktop", "Autre"],
    "Dell": ["Alienware Aurora", "XPS Desktop", "Inspiron Desktop", "Autre"],
    "Lenovo": ["Legion Tower", "IdeaCentre", "ThinkCentre", "Autre"],
    "Asus": ["ROG Strix", "ExpertCenter", "Autre"],
    "Acer": ["Predator Orion", "Aspire Desktop", "Autre"],
    "MSI": ["Aegis", "Trident", "Infinite", "Autre"],
    "Autre": []
  }
};
