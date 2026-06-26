export function enrichIngredient(item) {
  if (!item) return null;

  // Evitar sobre-enriquecer si ya fue decorado
  if (item.enriched) return item;

  const category = item.category || '';
  const energy = item.energy || '';
  const nutrientsStr = item.nutrients || '';
  const pairingStr = item.pairing || '';
  const originStr = item.origin || 'Tierras Ancestrales';

  // 1. MACROS POR CATEGORÍA
  let calories = 100;
  let protein = { amount: "2g", pct: 4 };
  let carbs = { amount: "15g", pct: 5 };
  let fiber = { amount: "2g", pct: 8 };
  let fat = { amount: "1g", pct: 2 };

  switch (category) {
    case "Granos Ancestrales":
      calories = 120;
      protein = { amount: "4.5g", pct: 9 };
      carbs = { amount: "21g", pct: 7 };
      fiber = { amount: "3g", pct: 12 };
      fat = { amount: "1.5g", pct: 2 };
      break;
    case "Semillas":
      calories = 145;
      protein = { amount: "5g", pct: 10 };
      carbs = { amount: "4g", pct: 1 };
      fiber = { amount: "6g", pct: 24 };
      fat = { amount: "12g", pct: 18 };
      break;
    case "Frutos Secos":
      calories = 175;
      protein = { amount: "6g", pct: 12 };
      carbs = { amount: "5g", pct: 2 };
      fiber = { amount: "3g", pct: 12 };
      fat = { amount: "15g", pct: 23 };
      break;
    case "Especias":
      calories = 8;
      protein = { amount: "0.3g", pct: 1 };
      carbs = { amount: "1.5g", pct: 1 };
      fiber = { amount: "0.8g", pct: 3 };
      fat = { amount: "0.2g", pct: 0 };
      break;
    case "Fermentos":
      calories = 35;
      protein = { amount: "2.5g", pct: 5 };
      carbs = { amount: "3.5g", pct: 1 };
      fiber = { amount: "1.2g", pct: 5 };
      fat = { amount: "0.4g", pct: 1 };
      break;
    case "Hongos":
      calories = 22;
      protein = { amount: "3.1g", pct: 6 };
      carbs = { amount: "2.8g", pct: 1 };
      fiber = { amount: "2.1g", pct: 8 };
      fat = { amount: "0.3g", pct: 0 };
      break;
    case "Superalimentos":
      calories = 55;
      protein = { amount: "2.2g", pct: 4 };
      carbs = { amount: "9.5g", pct: 3 };
      fiber = { amount: "2.8g", pct: 11 };
      fat = { amount: "0.6g", pct: 1 };
      break;
    case "Proteínas":
      calories = 110;
      protein = { amount: "12g", pct: 24 };
      carbs = { amount: "2.5g", pct: 1 };
      fiber = { amount: "1.5g", pct: 6 };
      fat = { amount: "5.8g", pct: 9 };
      break;
    case "Tubérculos":
      calories = 90;
      protein = { amount: "1.8g", pct: 4 };
      carbs = { amount: "20g", pct: 7 };
      fiber = { amount: "2.5g", pct: 10 };
      fat = { amount: "0.1g", pct: 0 };
      break;
    case "Hierbas y Aceites":
      if (item.name.toLowerCase().includes("aceite")) {
        calories = 120;
        protein = { amount: "0g", pct: 0 };
        carbs = { amount: "0g", pct: 0 };
        fiber = { amount: "0g", pct: 0 };
        fat = { amount: "14g", pct: 22 };
      } else {
        calories = 5;
        protein = { amount: "0.2g", pct: 0 };
        carbs = { amount: "0.8g", pct: 0 };
        fiber = { amount: "0.5g", pct: 2 };
        fat = { amount: "0.1g", pct: 0 };
      }
      break;
    default:
      calories = 80;
      protein = { amount: "2g", pct: 4 };
      carbs = { amount: "12g", pct: 4 };
      fiber = { amount: "2g", pct: 8 };
      fat = { amount: "1g", pct: 2 };
  }

  // 2. PARSEAR MICRONUTRIENTES
  const microsMap = {
    "hierro": { name: "Hierro vegetal", pct: 25, benefit: "Oxigenación y vitalidad" },
    "calcio": { name: "Calcio biodisponible", pct: 20, benefit: "Salud ósea e impulso nervioso" },
    "magnesio": { name: "Magnesio", pct: 30, benefit: "Relajación muscular y anti-estrés" },
    "zinc": { name: "Zinc", pct: 22, benefit: "Inmunidad y regeneración celular" },
    "omega 3": { name: "Omega 3 ALA", pct: 45, benefit: "Salud cerebral y antiinflamatorio" },
    "omega 6": { name: "Omega 6", pct: 15, benefit: "Energía celular y estructura" },
    "antioxidantes": { name: "Polifenoles", pct: 50, benefit: "Antienvejecimiento y protección celular" },
    "antocianinas": { name: "Antocianinas puras", pct: 60, benefit: "Protección cardiovascular y ocular" },
    "silicio": { name: "Silicio orgánico", pct: 35, benefit: "Salud de la piel, uñas y cabello" },
    "fósforo": { name: "Fósforo", pct: 25, benefit: "Soporte de ATP y energía celular" },
    "vitamina e": { name: "Vitamina E", pct: 40, benefit: "Antioxidante de membranas celulares" },
    "vitamina c": { name: "Vitamina C", pct: 55, benefit: "Síntesis de colágeno e inmunidad" },
    "potasio": { name: "Potasio", pct: 18, benefit: "Presión arterial y equilibrio hídrico" },
    "proteína": { name: "Aminoácidos esenciales", pct: 20, benefit: "Construcción y reparación de tejidos" },
    "fibra": { name: "Fibra soluble", pct: 30, benefit: "Salud del microbioma y saciedad" },
    "enzimas": { name: "Enzimas activas", pct: 35, benefit: "Mejora digestiva y absorción" },
    "clorofila": { name: "Clorofila viva", pct: 45, benefit: "Depuración sanguínea y alcalinidad" }
  };

  const parsedMicros = [];
  const lowercaseNutrients = nutrientsStr.toLowerCase();
  
  Object.keys(microsMap).forEach(key => {
    if (lowercaseNutrients.includes(key)) {
      parsedMicros.push(microsMap[key]);
    }
  });

  // Si no se detecta nada específico, agregar 2 por defecto basados en la categoría
  if (parsedMicros.length === 0) {
    if (category === "Especias") {
      parsedMicros.push({ name: "Fitoquímicos medicinales", pct: 30, benefit: "Modulador de la inflamación" });
      parsedMicros.push({ name: "Minerales traza", pct: 15, benefit: "Co-factores enzimáticos" });
    } else if (category === "Granos Ancestrales") {
      parsedMicros.push({ name: "Vitaminas del grupo B", pct: 25, benefit: "Metabolismo de energía" });
      parsedMicros.push({ name: "Magnesio", pct: 20, benefit: "Relajación muscular" });
    } else {
      parsedMicros.push({ name: "Minerales del suelo", pct: 15, benefit: "Soporte homeostático" });
      parsedMicros.push({ name: "Antioxidantes naturales", pct: 20, benefit: "Combate del estrés oxidativo" });
    }
  }

  // 3. ÍNDICE GLUCÉMICO (GI)
  let giValue = 15;
  let giCategory = "Bajo";

  if (category === "Granos Ancestrales") {
    giValue = 54;
    giCategory = "Bajo-Medio";
  } else if (category === "Tubérculos") {
    giValue = 65;
    giCategory = "Moderado";
  } else if (category === "Semillas" || category === "Frutos Secos" || category === "Proteínas" || category === "Hongos" || category === "Especias" || category === "Hierbas y Aceites") {
    giValue = 15;
    giCategory = "Muy Bajo";
  } else {
    giValue = 35;
    giCategory = "Bajo";
  }

  // 4. ALÉRGENOS & PRECAUCIONES
  const nameLower = item.name.toLowerCase();
  const hasGluten = nameLower.includes("trigo") || nameLower.includes("centeno") || nameLower.includes("kamut") || nameLower.includes("espelta") || nameLower.includes("cebada");
  const hasSoy = category === "Proteínas" && (nameLower.includes("soya") || nameLower.includes("tofu") || nameLower.includes("tempeh"));
  const hasNuts = category === "Frutos Secos" || nameLower.includes("almendra") || nameLower.includes("avellana") || nameLower.includes("pistacho") || nameLower.includes("cajú") || nameLower.includes("nuez");

  let precautionText = "Consumo seguro. Se aconseja almacenar en un frasco hermético en un lugar fresco y oscuro.";
  if (nameLower.includes("quinua") || nameLower.includes("quinoa")) {
    precautionText = "Contiene saponinas amargas protectoras. Debe lavarse y frotarse enérgicamente con abundante agua fría antes de hervir.";
  } else if (category === "Semillas" || category === "Frutos Secos") {
    precautionText = "Contiene fitatos bloqueadores de minerales. Activar remojando en agua durante 4 a 8 horas para optimizar su digestibilidad y biodisponibilidad.";
  } else if (nameLower.includes("jengibre") || nameLower.includes("khing") || nameLower.includes("pimienta") || nameLower.includes("ají")) {
    precautionText = "Alimento altamente termogénico (caliente). Consumir con moderación en caso de acidez estomacal, inflamación o exceso de Pitta.";
  }

  // 5. AYURVEDA: RASA & DOSHAS
  // Rasa (sabores): dulce, ácido, salado, amargo, picante, astringente (escala 1 a 5)
  let rasa = { dulce: 2, acido: 1, salado: 1, amargo: 1, picante: 1, astringente: 1 };
  let temperature = "Templado";
  let doshaText = "Equilibra Vata, Pitta y Kapha de manera tridóshica.";
  let doshas = { vata: "equilibra", pitta: "equilibra", kapha: "equilibra" };

  switch (category) {
    case "Granos Ancestrales":
      rasa = { dulce: 4, acido: 1, salado: 1, amargo: 1, picante: 1, astringente: 3 };
      temperature = energy.includes("Refrescante") ? "Frío" : "Templado";
      doshas = { vata: "equilibra", pitta: "equilibra", kapha: "aumenta" };
      doshaText = "Excelente para nutrir y calmar Vata y Pitta. En exceso, puede elevar Kapha por su cualidad pesada.";
      break;
    case "Semillas":
    case "Frutos Secos":
      rasa = { dulce: 3, acido: 1, salado: 1, amargo: 1, picante: 1, astringente: 2 };
      temperature = "Caliente";
      doshas = { vata: "equilibra", pitta: "aumenta", kapha: "aumenta" };
      doshaText = "Alimento oleoso de enraizamiento profundo. Calma Vata, pero su fuego y densidad elevan Pitta y Kapha.";
      break;
    case "Especias":
      if (nameLower.includes("cúrcuma")) {
        rasa = { dulce: 1, acido: 1, salado: 1, amargo: 5, picante: 3, astringente: 4 };
        temperature = "Templado";
        doshas = { vata: "equilibra", pitta: "equilibra", kapha: "equilibra" };
        doshaText = "Tridóshico por excelencia. Su amargor depura la sangre y desinflama los tres doshas.";
      } else {
        rasa = { dulce: 1, acido: 1, salado: 1, amargo: 2, picante: 5, astringente: 1 };
        temperature = "Caliente";
        doshas = { vata: "equilibra", pitta: "aumenta", kapha: "equilibra" };
        doshaText = "Enciende el Agni (fuego digestivo). Altamente depurativo para Vata y Kapha, pero eleva Pitta.";
      }
      break;
    case "Fermentos":
      rasa = { dulce: 1, acido: 5, salado: 3, amargo: 1, picante: 1, astringente: 1 };
      temperature = "Caliente";
      doshas = { vata: "equilibra", pitta: "aumenta", kapha: "aumenta" };
      doshaText = "Altamente ácido. Estimula el flujo digestivo para Vata, pero incrementa el calor corporal (Pitta).";
      break;
    default:
      if (energy.includes("Refrescante")) {
        rasa = { dulce: 2, acido: 1, salado: 1, amargo: 3, picante: 1, astringente: 2 };
        temperature = "Frío";
        doshas = { vata: "aumenta", pitta: "equilibra", kapha: "equilibra" };
        doshaText = "Cualidad refrescante y sutil. Calma la inflamación de Pitta, pero en exceso puede enfriar y agitar Vata.";
      } else {
        rasa = { dulce: 2, acido: 1, salado: 1, amargo: 2, picante: 1, astringente: 2 };
        temperature = "Templado";
        doshas = { vata: "equilibra", pitta: "equilibra", kapha: "equilibra" };
        doshaText = "Tridóshico equilibrante, ideal para sostener la meditación y el prana diario.";
      }
  }

  // 6. PLATOS Y RECETAS DINÁMICAS
  const cleanName = item.name.replace(/\s*\(.*\)\s*/, "").trim(); // Quitar paréntesis
  
  let finalImage = item.image;
  if (item.image && item.image.includes("photo-1615485290382-441e4d049cb5")) {
    finalImage = null;
  }

  const dishes = [
    {
      name: `Guiso Sagrado de ${cleanName}`,
      type: "Ancestral",
      description: `Una cocción lenta de fuego suave combinando ${cleanName} con hierbas frescas locales y vegetales de raíz según la sabiduría de ${originStr}.`,
      benefit: "Sostiene el calor del Agni y nutre los tejidos profundos.",
      time: "30 min"
    },
    {
      name: `Bowl Pránico de ${cleanName}`,
      type: "Moderno",
      description: `Un tazón nutritivo y vistoso que combina ${cleanName} activado, aguacate maduro, germinados frescos de la estación y un aderezo cítrico sutil.`,
      benefit: "Energía celular instantánea de asimilación ligera.",
      time: "15 min"
    }
  ];

  // Si hay un pairing específico ya escrito, lo integramos
  if (pairingStr) {
    dishes.push({
      name: `Maridaje: ${pairingStr}`,
      type: "Sinergia",
      description: `Combina idealmente ${cleanName} con: ${pairingStr}. Esta asociación potencia la asimilación del prana de ambos alimentos.`,
      benefit: "Absorción sinérgica de nutrientes clave.",
      time: "5 min"
    });
  }

  return {
    ...item,
    image: finalImage,
    enriched: true,
    nutrition: {
      portion: category === "Especias" ? "1 cucharadita (5g)" : "100g cocido",
      calories,
      macros: {
        protein,
        carbs,
        fiber,
        fat
      },
      micros: parsedMicros,
      glycemicIndex: { value: giValue, category: giCategory },
      allergens: { gluten: hasGluten, soy: hasSoy, nuts: hasNuts },
      precautions: precautionText
    },
    ayurveda: {
      temperature,
      doshaText,
      doshas,
      rasa
    },
    dishes
  };
}
