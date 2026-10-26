import type { Ingredient } from "@/lib/types";

export const ingredients: Ingredient[] = [
  // Vegetables
  { id: "onion", name: "Onion", aliases: ["pyaz", "pyaaz", "kanda"], category: "vegetables" },
  { id: "tomato", name: "Tomato", aliases: ["tamatar"], category: "vegetables" },
  { id: "potato", name: "Potato", aliases: ["aloo", "alu", "batata"], category: "vegetables" },
  { id: "cauliflower", name: "Cauliflower", aliases: ["gobi", "phool gobi"], category: "vegetables" },
  { id: "spinach", name: "Spinach", aliases: ["palak"], category: "vegetables" },
  { id: "okra", name: "Okra", aliases: ["bhindi", "lady finger", "bhinda"], category: "vegetables" },
  { id: "carrot", name: "Carrot", aliases: ["gajar"], category: "vegetables" },
  { id: "eggplant", name: "Eggplant", aliases: ["baingan", "brinjal", "vankaya"], category: "vegetables" },
  { id: "drumstick", name: "Drumstick", aliases: ["moringa", "murungakkai", "sahjan"], category: "vegetables", specialty: true },
  { id: "green-peas", name: "Green Peas", aliases: ["matar", "peas"], category: "vegetables" },
  { id: "bell-pepper", name: "Bell Pepper", aliases: ["capsicum", "shimla mirch"], category: "vegetables" },
  { id: "cabbage", name: "Cabbage", aliases: ["patta gobi", "band gobi"], category: "vegetables" },

  // Herbs & aromatics
  { id: "ginger", name: "Ginger", aliases: ["adrak", "allam"], category: "herbs-aromatics" },
  { id: "garlic", name: "Garlic", aliases: ["lahsun", "lehsun", "vellulli"], category: "herbs-aromatics" },
  { id: "green-chili", name: "Green Chili", aliases: ["hari mirch", "green chilli", "serrano"], category: "herbs-aromatics" },
  { id: "cilantro", name: "Cilantro", aliases: ["coriander leaves", "dhania", "kothimbir", "kothamalli"], category: "herbs-aromatics" },
  { id: "curry-leaves", name: "Curry Leaves", aliases: ["kadi patta", "karivepaku", "kariveppila"], category: "herbs-aromatics", specialty: true },
  { id: "mint", name: "Mint", aliases: ["pudina"], category: "herbs-aromatics" },
  { id: "lemon", name: "Lemon", aliases: ["nimbu", "lime"], category: "herbs-aromatics" },

  // Meat, seafood, eggs
  { id: "chicken", name: "Chicken", aliases: ["murgh", "kodi"], category: "meat-poultry" },
  { id: "mutton", name: "Goat Meat", aliases: ["mutton", "goat"], category: "meat-poultry" },
  { id: "shrimp", name: "Shrimp", aliases: ["prawns", "jhinga", "royyalu"], category: "seafood" },
  { id: "fish", name: "Fish", aliases: ["machli", "meen", "chepa"], category: "seafood" },
  { id: "eggs", name: "Eggs", aliases: ["egg", "anda", "anday"], category: "eggs" },

  // Dairy
  { id: "paneer", name: "Paneer", aliases: ["cottage cheese", "indian cheese"], category: "dairy", specialty: true },
  { id: "yogurt", name: "Yogurt", aliases: ["curd", "dahi", "perugu"], category: "dairy" },
  { id: "ghee", name: "Ghee", aliases: ["clarified butter", "neyyi"], category: "dairy" },
  { id: "milk", name: "Milk", aliases: ["doodh", "paalu"], category: "dairy" },
  { id: "cream", name: "Cream", aliases: ["malai", "heavy cream"], category: "dairy" },
  { id: "butter", name: "Butter", aliases: ["makhan", "makkhan"], category: "dairy" },

  // Dals & lentils
  { id: "toor-dal", name: "Toor Dal", aliases: ["arhar dal", "tuvar dal", "pigeon peas", "kandi pappu"], category: "dals-lentils", specialty: true },
  { id: "moong-dal", name: "Moong Dal", aliases: ["yellow moong", "split mung beans", "pesara pappu"], category: "dals-lentils", specialty: true },
  { id: "urad-dal", name: "Urad Dal", aliases: ["black gram", "minapappu", "ulundu"], category: "dals-lentils", specialty: true },
  { id: "chana-dal", name: "Chana Dal", aliases: ["bengal gram", "split chickpeas", "senaga pappu"], category: "dals-lentils", specialty: true },
  { id: "masoor-dal", name: "Masoor Dal", aliases: ["red lentils"], category: "dals-lentils" },

  // Beans & legumes
  { id: "chickpeas", name: "Chickpeas", aliases: ["kabuli chana", "chole", "garbanzo beans", "chana"], category: "beans-legumes" },
  { id: "kidney-beans", name: "Kidney Beans", aliases: ["rajma"], category: "beans-legumes" },
  { id: "black-chickpeas", name: "Black Chickpeas", aliases: ["kala chana", "desi chana"], category: "beans-legumes", specialty: true },

  // Rice & grains
  { id: "basmati-rice", name: "Basmati Rice", aliases: ["basmati"], category: "rice-grains" },
  { id: "white-rice", name: "White Rice", aliases: ["rice", "sona masoori", "chawal", "biyyam"], category: "rice-grains" },
  { id: "poha", name: "Poha", aliases: ["flattened rice", "beaten rice", "aval", "atukulu"], category: "rice-grains", specialty: true },
  { id: "rava", name: "Rava", aliases: ["sooji", "suji", "semolina", "bombay rava"], category: "rice-grains" },

  // Flours
  { id: "atta", name: "Atta", aliases: ["whole wheat flour", "chapati flour", "godhuma pindi"], category: "flours", specialty: true },
  { id: "besan", name: "Besan", aliases: ["gram flour", "chickpea flour", "senaga pindi"], category: "flours", specialty: true },
  { id: "maida", name: "Maida", aliases: ["all-purpose flour", "all purpose flour"], category: "flours" },

  // Whole spices
  { id: "cumin-seeds", name: "Cumin Seeds", aliases: ["jeera", "jeelakarra"], category: "whole-spices" },
  { id: "mustard-seeds", name: "Mustard Seeds", aliases: ["rai", "sarson", "avalu"], category: "whole-spices" },
  { id: "bay-leaf", name: "Bay Leaf", aliases: ["tej patta"], category: "whole-spices" },
  { id: "cloves", name: "Cloves", aliases: ["laung", "lavangam"], category: "whole-spices" },
  { id: "cinnamon", name: "Cinnamon", aliases: ["dalchini"], category: "whole-spices" },
  { id: "green-cardamom", name: "Green Cardamom", aliases: ["elaichi", "yelakulu"], category: "whole-spices" },
  { id: "dried-red-chili", name: "Dried Red Chili", aliases: ["sukhi lal mirch", "endu mirapakaya"], category: "whole-spices" },
  { id: "fenugreek-seeds", name: "Fenugreek Seeds", aliases: ["methi dana", "menthulu"], category: "whole-spices" },

  // Ground spices
  { id: "turmeric", name: "Turmeric Powder", aliases: ["haldi", "pasupu"], category: "ground-spices" },
  { id: "red-chili-powder", name: "Red Chili Powder", aliases: ["lal mirch", "kashmiri chili powder", "cayenne"], category: "ground-spices" },
  { id: "coriander-powder", name: "Coriander Powder", aliases: ["dhania powder"], category: "ground-spices" },
  { id: "cumin-powder", name: "Cumin Powder", aliases: ["jeera powder"], category: "ground-spices" },
  { id: "asafoetida", name: "Asafoetida", aliases: ["hing", "inguva"], category: "ground-spices", specialty: true },
  { id: "amchur", name: "Amchur", aliases: ["dry mango powder", "amchoor"], category: "ground-spices", specialty: true },
  { id: "kasuri-methi", name: "Kasuri Methi", aliases: ["dried fenugreek leaves"], category: "ground-spices", specialty: true },

  // Masala blends
  { id: "garam-masala", name: "Garam Masala", aliases: [], category: "masala-blends" },
  { id: "chana-masala", name: "Chana Masala Powder", aliases: ["chole masala"], category: "masala-blends", specialty: true },
  { id: "sambar-powder", name: "Sambar Powder", aliases: ["sambar masala"], category: "masala-blends", specialty: true },

  // Nuts & seeds
  { id: "peanuts", name: "Peanuts", aliases: ["moongphali", "groundnuts", "palli"], category: "nuts-seeds" },
  { id: "cashews", name: "Cashews", aliases: ["kaju", "jeedipappu"], category: "nuts-seeds" },
  { id: "sesame-seeds", name: "Sesame Seeds", aliases: ["til", "nuvvulu"], category: "nuts-seeds" },

  // Oils
  { id: "oil", name: "Cooking Oil", aliases: ["vegetable oil", "sunflower oil", "canola oil", "tel"], category: "oils-fats" },
  { id: "mustard-oil", name: "Mustard Oil", aliases: ["sarson ka tel"], category: "oils-fats", specialty: true },
  { id: "coconut-oil", name: "Coconut Oil", aliases: ["nariyal tel"], category: "oils-fats" },

  // Sweeteners & souring agents
  { id: "sugar", name: "Sugar", aliases: ["cheeni", "chakkera"], category: "sweeteners" },
  { id: "jaggery", name: "Jaggery", aliases: ["gur", "bellam", "vellam"], category: "sweeteners", specialty: true },
  { id: "tamarind", name: "Tamarind", aliases: ["imli", "chintapandu", "puli"], category: "souring-agents", specialty: true },

  // Basics
  { id: "salt", name: "Salt", aliases: ["namak", "uppu"], category: "basics", staple: true },
  { id: "water", name: "Water", aliases: ["pani", "neeru"], category: "basics", staple: true },
];
