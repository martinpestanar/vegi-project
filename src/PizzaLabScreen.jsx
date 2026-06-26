import React, { useState, useEffect, useRef } from 'react'
import { 
  Calculator, ClipboardList, Timer, BookOpen, Sparkles, Plus, Star, 
  Trash, Play, Pause, RotateCcw, FileText, ChevronLeft, ChefHat, 
  Scale, Flame, Hourglass, Award, AlertCircle, CheckCircle2, ChevronRight,
  BookOpenCheck, Info, HelpCircle
} from 'lucide-react'

// CONSTANTES Y PRESETS DE MASAS SIN GLUTEN & TRADICIONALES
const DOUGH_PRESETS = {
  avena: {
    name: 'Base de Avena Activa',
    shortName: 'Avena',
    emoji: '🌾',
    isGlutenFree: true,
    flours: { base: 'Harina de Avena', starch: 'Almidón de Yuca' },
    ratioFlours: 70, // 70% Avena, 30% Yuca
    hydration: 85, // Las harinas sin gluten absorben muchísimo líquido
    psyllium: 4, // % de Psyllium para elasticidad
    yeast: 2.5,
    salt: 2,
    oil: 3,
    description: 'Masa suave, de sabor sutil y dulce, muy digestiva y rica en fibra. Apta para un leudado medio.'
  },
  quinua: {
    name: 'Base Ancestral de Quinua',
    shortName: 'Quinua',
    emoji: '✨',
    isGlutenFree: true,
    flours: { base: 'Harina de Quinua (Lavada)', starch: 'Fécula de Patata' },
    ratioFlours: 65, // 65% Quinua, 35% Fécula
    hydration: 90,
    psyllium: 5,
    yeast: 2.5,
    salt: 2,
    oil: 4,
    description: 'Masa proteica de sabor terroso y de nuez. Requiere buena hidratación y un reposo óptimo para suavizar la saponina.'
  },
  canihua: {
    name: 'Base Pránica de Cañihua',
    shortName: 'Cañihua',
    emoji: '🔴',
    isGlutenFree: true,
    flours: { base: 'Harina de Cañihua', starch: 'Almidón de Yuca' },
    ratioFlours: 60, // 60% Cañihua, 40% Yuca
    hydration: 95,
    psyllium: 5,
    yeast: 2.5,
    salt: 2,
    oil: 4,
    description: 'Masa rústica súper-nutritiva de color oscuro y sabor profundo. Alta presencia de antioxidantes. Excelente crocancia al pre-horneo.'
  },
  multigrano: {
    name: 'Blend Multigrano Culinario (Chef Recomendación)',
    shortName: 'Multigrano',
    emoji: '🌾🔴',
    isGlutenFree: true,
    flours: { base: 'Mezcla Multigrano', starch: 'Almidón de Yuca' },
    ratioFlours: 70, // 70% granos, 30% yuca
    hydration: 90,
    psyllium: 4.5,
    yeast: 2.5,
    salt: 2,
    oil: 3.5,
    description: 'La Santísima Trinidad recomendada por el Chef: 50% Avena (cohesión y suavidad), 30% Quinua (estructura y proteína) y 20% Cañihua (sabor tostado, color y antioxidantes). El balance perfecto de sabor y estructura.'
  },
  custom: {
    name: 'Blend Personalizado de Granos',
    shortName: 'Blend Custom',
    emoji: '🧪',
    isGlutenFree: true,
    flours: { base: 'Mezcla Personalizada', starch: 'Almidón de Yuca' },
    ratioFlours: 70,
    hydration: 90,
    psyllium: 4.5,
    yeast: 2.5,
    salt: 2,
    oil: 3.5,
    description: 'Crea tu propia alquimia. Controla las proporciones exactas de Avena, Quinua y Cañihua en la mezcla base para tus experimentos.'
  },
  trigo: {
    name: 'Masa de Trigo Tradicional',
    shortName: 'Trigo (Gluten)',
    emoji: '🍕',
    isGlutenFree: false,
    flours: { base: 'Harina de Trigo (Fuerza o 00)', starch: null },
    ratioFlours: 100,
    hydration: 65,
    psyllium: 0,
    yeast: 1.5,
    salt: 2.5,
    oil: 2,
    description: 'Masa clásica italiana (tipo napolitana). El gluten crea una red elástica que atrapa el gas de fermentación para un borde alveolado.'
  }
}

// RECETAS PRE-CARGADAS DE LA IA / TRADICIONALES
const INITIAL_RECIPES = [
  {
    id: 'multigrano-chef',
    title: 'Pizza Multigrano con la Santísima Trinidad Culinaria',
    source: 'Chef de Pizzas / Especialista',
    description: 'Masa equilibrada combinando avena, quinua y cañihua con almidón de yuca para máxima elasticidad.',
    ingredients: [
      '150g Harina de Avena (cohesión)',
      '90g Harina de Quinua (proteína y estructura)',
      '60g Harina de Cañihua (sabor tostado y color)',
      '120g Almidón de Yuca (tapioca para el efecto elástico)',
      '360ml Agua tibia',
      '18g Psyllium Husk (aglutinante)',
      '10g Levadura seca',
      '8g Sal fina',
      '14ml Aceite de oliva'
    ],
    steps: [
      'Gelificar: Mezclar el psyllium husk con 220ml del agua templada de la receta. Reposar 10 min hasta obtener una goma densa.',
      'Mezclar Secos: En un bowl, tamizar y juntar la harina de avena, quinua, cañihua, almidón de yuca y sal.',
      'Activar levadura: En 60ml de agua tibia con una pizca de endulzante, activar la levadura por 5 min.',
      'Unificación: Agregar al bowl de secos el gel de psyllium, la levadura espumosa, el resto del agua y el aceite. Amasar hasta homogeneizar completamente.',
      'Fermentación: Cubrir con paño húmedo y leudar por 90 min en ambiente cálido.',
      'Estirado: Colocar la masa húmeda sobre papel vegetal aceitado. Estirar a mano hasta lograr 5-6mm de espesor.',
      'Pre-horneo: Hornear la masa sola a 250°C por 7-8 minutos hasta que se fije la corteza.',
      'Decoración y horneado final: Retirar, colocar salsa de tomate, toppings y hornear 6 minutos extra.'
    ]
  },
  {
    id: 'gf-napolitana',
    title: 'Pizza Faux-Napolitana de Avena y Yuca',
    source: 'Sattva AI',
    description: 'Doble fermentación lenta para desarrollar alveolos rústicos sin gluten.',
    ingredients: [
      '300g Harina de Avena Activa',
      '120g Almidón de Yuca (Tapioca)',
      '360ml Agua tibia (activada)',
      '18g Psyllium Husk entero',
      '8g Levadura seca instantánea',
      '8g Sal marina fina',
      '12ml Aceite de oliva extra virgen'
    ],
    steps: [
      'Gelificar el psyllium husk mezclándolo con 200ml de agua tibia. Dejar reposar 10 min hasta crear un gel gomoso.',
      'En un bowl amplio, mezclar la harina de avena, el almidón de yuca, la sal y la levadura.',
      'Añadir el gel de psyllium, el resto del agua y el aceite. Amasar vigorosamente con las manos húmedas hasta obtener una masa cohesiva y húmeda (no será elástica como el gluten, pero debe mantenerse unida).',
      'Fermentación: Colocar en un bowl aceitado, tapar con un paño húmedo y dejar fermentar por 2 horas a temperatura templada.',
      'Pre-calentado: Calentar el horno al máximo (250°C o más) con la piedra de hornear o bandeja invertida dentro.',
      'Estirado: Estirar la masa directamente sobre papel de horno utilizando las manos aceitadas o un rodillo ligero.',
      'Pre-horneo: Hornear la masa sola (sin ingredientes) durante 6-8 minutos para fijar la estructura sin gluten.',
      'Montaje: Retirar, colocar salsa de tomate artesanal, queso vegetal (de almendras o anacardos) y albahaca fresca.',
      'Horneado final: Hornear 5-7 minutos más hasta que los bordes estén dorados y crujientes.'
    ]
  },
  {
    id: 'napolitana-trigo',
    title: 'Clásica Napolitana de Trigo (65% Hidratación)',
    source: 'Tradición',
    description: 'Masa tradicional con gluten, fermentada en frío por 24 horas.',
    ingredients: [
      '400g Harina de Fuerza (Trigo 00)',
      '260ml Agua fría',
      '6g Levadura seca o 2g levadura fresca',
      '10g Sal fina de mar',
      '8ml Aceite de oliva'
    ],
    steps: [
      'Disolver la levadura en el agua y agregar el 90% de la harina. Mezclar hasta unir todo.',
      'Agregar la sal y el resto de la harina. Amasar por 10-15 minutos en superficie limpia hasta que la masa quede lisa, elástica y pase la prueba de la ventana.',
      'Añadir el aceite de oliva al final del amasado e integrarlo bien.',
      'Dejar reposar la masa tapada a temperatura ambiente por 2 horas, luego formar bollos.',
      'Colocar en un recipiente cerrado y llevar a refrigeración de 24 a 48 horas para una maduración lenta.',
      'Sacar del refrigerador 3 horas antes de estirar para que pierda el frío.',
      'Estirar con las manos empujando el gas hacia el borde (cornicione). Nunca usar rodillo.',
      'Colocar salsa de tomate, mozzarella de búfala, aceite y hornear a temperatura máxima por 4-5 minutos.'
    ]
  }
]

export default function PizzaLabScreen({ onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('calculadora')
  
  // Estados de los Submódulos
  const [selectedBase, setSelectedBase] = useState('multigrano') // Multigrano por defecto ahora
  const [targetWeight, setTargetWeight] = useState(400) // gramos de harina total
  const [customHydration, setCustomHydration] = useState(90)
  const [customPsyllium, setCustomPsyllium] = useState(4.5)

  // Sliders para la mezcla personalizada (Custom Blend)
  const [blendAvena, setBlendAvena] = useState(50)
  const [blendQuinua, setBlendQuinua] = useState(30)
  const [blendCanihua, setBlendCanihua] = useState(20)

  // Calcular porcentajes normalizados del blend
  const totalBlendPoints = blendAvena + blendQuinua + blendCanihua
  const pctAvena = totalBlendPoints > 0 ? Math.round((blendAvena / totalBlendPoints) * 100) : 0
  const pctQuinua = totalBlendPoints > 0 ? Math.round((blendQuinua / totalBlendPoints) * 100) : 0
  const pctCanihua = totalBlendPoints > 0 ? 100 - pctAvena - pctQuinua : 0

  // Checklist de Mise en Place
  const [checkedSteps, setCheckedSteps] = useState({})

  // Temporizadores
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0) // segundos
  const [timerMax, setTimerMax] = useState(5400) // por defecto 1.5 horas
  const [timerType, setTimerType] = useState('leudado')
  const timerIntervalRef = useRef(null)

  // Bitácora de Experimentos
  const [experiments, setExperiments] = useState(() => {
    try {
      const saved = localStorage.getItem('vegi-pizza-experiments')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  
  // Formulario de Experimento
  const [newExp, setNewExp] = useState({
    baseType: 'multigrano',
    hydration: 90,
    fermentationTime: 1.5,
    temperature: 250,
    textureScore: 5,
    flavorScore: 5,
    notes: '',
    title: ''
  })

  // Recetas
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem('vegi-pizza-recipes')
      return saved ? JSON.parse(saved) : INITIAL_RECIPES
    } catch {
      return INITIAL_RECIPES
    }
  })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [importText, setImportText] = useState('')
  const [newRecipeTitle, setNewRecipeTitle] = useState('')

  // Sincronizar bases en la calculadora
  useEffect(() => {
    const preset = DOUGH_PRESETS[selectedBase]
    setCustomHydration(preset.hydration)
    setCustomPsyllium(preset.psyllium)
    setNewExp(prev => ({
      ...prev,
      baseType: selectedBase,
      hydration: preset.hydration
    }))
  }, [selectedBase])

  // Lógica del Temporizador
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            setTimerRunning(false)
            if ('vibrate' in navigator) {
              navigator.vibrate([500, 200, 500])
            }
            alert(`⏳ ¡Tu tiempo de ${timerType} ha finalizado! Alquimia completada.`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [timerRunning, timerType])

  // Guardar datos en localStorage
  useEffect(() => {
    localStorage.setItem('vegi-pizza-experiments', JSON.stringify(experiments))
  }, [experiments])

  useEffect(() => {
    localStorage.setItem('vegi-pizza-recipes', JSON.stringify(recipes))
  }, [recipes])

  // Cálculos de panadero dinámicos
  const preset = DOUGH_PRESETS[selectedBase]
  const flourBaseGrams = Math.round((targetWeight * preset.ratioFlours) / 100)
  const flourStarchGrams = preset.flours.starch 
    ? Math.round((targetWeight * (100 - preset.ratioFlours)) / 100)
    : 0
  
  // Calcular harinas rústicas distribuidas en caso de blends
  let avenaGrams = 0
  let quinuaGrams = 0
  let canihuaGrams = 0

  if (selectedBase === 'multigrano') {
    // 50% Avena, 30% Quinua, 20% Cañihua
    avenaGrams = Math.round((flourBaseGrams * 50) / 100)
    quinuaGrams = Math.round((flourBaseGrams * 30) / 100)
    canihuaGrams = Math.round((flourBaseGrams * 20) / 100)
  } else if (selectedBase === 'custom') {
    avenaGrams = Math.round((flourBaseGrams * pctAvena) / 100)
    quinuaGrams = Math.round((flourBaseGrams * pctQuinua) / 100)
    canihuaGrams = Math.round((flourBaseGrams * pctCanihua) / 100)
  } else if (selectedBase === 'avena') {
    avenaGrams = flourBaseGrams
  } else if (selectedBase === 'quinua') {
    quinuaGrams = flourBaseGrams
  } else if (selectedBase === 'canihua') {
    canihuaGrams = flourBaseGrams
  }

  const waterGrams = Math.round((targetWeight * customHydration) / 100)
  const psylliumGrams = preset.isGlutenFree 
    ? Math.round((targetWeight * customPsyllium) / 100)
    : 0
  const yeastGrams = Math.round((targetWeight * preset.yeast) / 100)
  const saltGrams = Math.round((targetWeight * preset.salt) / 100)
  const oilGrams = Math.round((targetWeight * preset.oil) / 100)
  const totalWeightGrams = targetWeight + waterGrams + psylliumGrams + yeastGrams + saltGrams + oilGrams

  // Formatear tiempo mm:ss o hh:mm:ss
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Guardar Experimento
  const handleSaveExperiment = (e) => {
    e.preventDefault()
    let descBlend = ''
    if (newExp.baseType === 'custom') {
      descBlend = ` (${pctAvena}% Av, ${pctQuinua}% Qn, ${pctCanihua}% Ca)`
    }
    const experiment = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      title: newExp.title.trim() || `Ensayo #${experiments.length + 1} (${DOUGH_PRESETS[newExp.baseType].shortName}${descBlend})`,
      ...newExp,
      blendPercentages: newExp.baseType === 'custom' ? { avena: pctAvena, quinua: pctQuinua, canihua: pctCanihua } : null
    }
    setExperiments([experiment, ...experiments])
    setNewExp({
      baseType: selectedBase,
      hydration: customHydration,
      fermentationTime: 1.5,
      temperature: 250,
      textureScore: 5,
      flavorScore: 5,
      notes: '',
      title: ''
    })
    alert('📝 Experimento consagrado en tu bitácora.')
  }

  const handleDeleteExperiment = (id) => {
    if (confirm('¿Seguro que deseas eliminar este registro de experimentación?')) {
      setExperiments(experiments.filter(e => e.id !== id))
    }
  }

  // Importar Recetas de IA / Web
  const handleImportRecipe = (e) => {
    e.preventDefault()
    if (!newRecipeTitle.trim() || !importText.trim()) return

    const parsedSteps = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 3)

    const newRecipe = {
      id: Date.now().toString(),
      title: newRecipeTitle,
      source: 'Importada / IA',
      description: 'Receta guardada para recordar durante tus preparaciones.',
      ingredients: [
        'Harinas e ingredientes según cálculo de panadero o receta base.'
      ],
      steps: parsedSteps
    }

    setRecipes([newRecipe, ...recipes])
    setNewRecipeTitle('')
    setImportText('')
    setShowRecipeForm(false)
    alert('🍕 Receta guardada en tu recetario.')
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] animate-float-in text-left">
      {/* HEADER DE CABECERA */}
      <div className="p-4 border-b border-[var(--border-moss)] bg-[var(--bg-card)] flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all tap-active"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <span className="text-[10px] text-[var(--accent-mint)] font-bold uppercase tracking-wider block">Estudio Sattva</span>
            <h1 className="text-base font-black text-[var(--text-primary)] flex items-center gap-1.5">
              Laboratorio de Pizzas <ChefHat size={16} className="text-[var(--accent-mint)]" />
            </h1>
          </div>
        </div>
        <Badge color="mint">Modo Pro 🔬</Badge>
      </div>

      {/* SUBTABS DE NAVEGACIÓN */}
      <div className="flex bg-[var(--bg-card)] border-b border-[var(--border-moss)] overflow-x-auto px-2 py-1 gap-1 sticky top-[57px] z-20" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'calculadora', icon: Calculator, label: 'Fórmulas' },
          { id: 'checklist', icon: ClipboardList, label: 'Mise en Place' },
          { id: 'timer', icon: Timer, label: 'Tiempos' },
          { id: 'bitacora', icon: BookOpen, label: 'Bitácora' },
          { id: 'recetas', icon: Sparkles, label: 'Recetario' }
        ].map(tab => {
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id)
                setSelectedRecipe(null)
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all tap-active ${
                isActive 
                  ? 'bg-[var(--accent-mint)] text-[var(--bg-primary)] shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24" style={{ scrollbarWidth: 'thin' }}>
        
        {/* SUBTAB 1: CALCULADORA DE MASAS */}
        {activeSubTab === 'calculadora' && (
          <div className="space-y-4 animate-float-in">
            {/* Cabecera */}
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <Scale size={16} className="text-[var(--accent-mint)]" />
                Fórmulas y Porcentajes de Panadero
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Calcula la hidratación exacta y las proporciones según el grano o harina que uses hoy.
              </p>
            </div>

            {/* Selector de Base */}
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(DOUGH_PRESETS).map(key => {
                const item = DOUGH_PRESETS[key]
                const isSel = selectedBase === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedBase(key)}
                    className={`p-2.5 rounded-2xl border text-center transition-all tap-active flex flex-col items-center justify-center gap-1 min-h-[72px] ${
                      isSel 
                        ? 'border-[var(--accent-mint)] bg-[var(--accent-mint)]/10 text-[var(--text-primary)] font-black shadow-sm' 
                        : 'border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[9px] font-bold leading-tight break-words text-center">
                      {item.shortName}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Info Preset */}
            <div className="p-3 bg-[var(--bg-elevated)]/60 rounded-2xl border border-[var(--border-moss)] text-xs text-[var(--text-secondary)] leading-relaxed flex gap-2.5">
              <Info size={16} className="text-[var(--accent-mint)] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[var(--text-primary)] mb-0.5 flex items-center gap-1.5">
                  {preset.name} 
                  <Badge color={preset.isGlutenFree ? 'mint' : 'purple'}>
                    {preset.isGlutenFree ? 'Sin Gluten' : 'Con Gluten'}
                  </Badge>
                </div>
                <p className="text-[10px] leading-relaxed">{preset.description}</p>
              </div>
            </div>

            {/* SI SELECCIONA BLEND PERSONALIZADO: MOSTRAR SLIDERS DE GRANOS */}
            {selectedBase === 'custom' && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3.5 shadow-sm animate-float-in">
                <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-moss)] pb-2 mb-1.5">
                  🧪 Alquimia de Granos (Mezcla de Harinas Base)
                </h3>
                
                {/* Avena */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-[var(--text-secondary)]">🌾 Harina de Avena:</span>
                    <span className="font-bold text-[var(--text-primary)]">{pctAvena}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={blendAvena}
                    onChange={(e) => setBlendAvena(parseInt(e.target.value))}
                    className="w-full accent-amber-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Quinua */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-[var(--text-secondary)]">✨ Harina de Quinua:</span>
                    <span className="font-bold text-[var(--text-primary)]">{pctQuinua}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={blendQuinua}
                    onChange={(e) => setBlendQuinua(parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Cañihua */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-[var(--text-secondary)]">🔴 Harina de Cañihua:</span>
                    <span className="font-bold text-[var(--text-primary)]">{pctCanihua}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={blendCanihua}
                    onChange={(e) => setBlendCanihua(parseInt(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="text-[9px] text-[var(--text-secondary)] italic pt-1 text-center">
                  *Los porcentajes se normalizan automáticamente para sumar 100%.
                </div>
              </div>
            )}

            {/* Controles numéricos generales de la masa */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3.5 shadow-sm">
              {/* Peso Harina */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[var(--text-primary)]">Peso de Secos Totales (Harina):</span>
                  <span className="font-black text-[var(--accent-mint)]">{targetWeight} g</span>
                </div>
                <input 
                  type="range" 
                  min="150" 
                  max="1000" 
                  step="10"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-mint)]"
                />
              </div>

              {/* Hidratación */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[var(--text-primary)]">Hidratación (Agua / Líquidos):</span>
                  <span className="font-black text-[var(--accent-teal)]">{customHydration} %</span>
                </div>
                <input 
                  type="range" 
                  min={preset.isGlutenFree ? 70 : 50} 
                  max={preset.isGlutenFree ? 110 : 80} 
                  step="2"
                  value={customHydration}
                  onChange={(e) => setCustomHydration(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-teal)]"
                />
                <span className="text-[9px] text-[var(--text-muted)] mt-1 block">
                  {preset.isGlutenFree 
                    ? '⚠️ Las masas sin gluten necesitan mayor hidratación (80%+) porque carecen de red elástica natural.' 
                    : '💡 El trigo tradicional requiere menor hidratación (60% a 70%).'}
                </span>
              </div>

              {/* Psyllium Husk */}
              {preset.isGlutenFree ? (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[var(--text-primary)]">Psyllium Husk (Aglutinante):</span>
                    <span className="font-black text-[var(--accent-gold)]">{customPsyllium} %</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="8" 
                    step="1"
                    value={customPsyllium}
                    onChange={(e) => setCustomPsyllium(parseInt(e.target.value))}
                    className="w-full accent-[var(--accent-gold)]"
                  />
                  <span className="text-[9px] text-[var(--text-muted)] mt-1 block">
                    Aporta la elasticidad y retención de gas necesaria que no tiene la avena/quinua/cañihua.
                  </span>
                </div>
              ) : (
                <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-moss)] text-[10px] text-[var(--text-secondary)]">
                  🚫 **Aglutinantes**: No se requiere **Psyllium Husk**. El trigo ya cuenta con gluten que proporciona la elasticidad de manera natural.
                </div>
              )}
            </div>

            {/* TABLA DE RESULTADO (DESGLOSE DE INGREDIENTES) */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl overflow-hidden shadow-sm animate-float-in">
              <div className="p-3 bg-[var(--bg-elevated)] border-b border-[var(--border-moss)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">Fórmula de Pesado ({preset.shortName})</span>
                <span className="text-[10px] bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] px-2 py-0.5 rounded-full font-black">
                  Masa total: {totalWeightGrams}g
                </span>
              </div>
              <div className="divide-y divide-[var(--border-moss)] text-xs">
                
                {/* Desglose de granos si es blend (Multigrano o Custom) */}
                {(selectedBase === 'multigrano' || selectedBase === 'custom') ? (
                  <>
                    <div className="p-3 bg-[var(--bg-primary)]/50">
                      <span className="font-bold text-[var(--text-primary)] block mb-2">🌾 Desglose de Harinas Base ({preset.ratioFlours}%)</span>
                      <div className="pl-3 space-y-2 text-[11px] text-[var(--text-secondary)] border-l-2 border-[var(--accent-mint)]">
                        <div className="flex justify-between">
                          <span>Harina de Avena ({selectedBase === 'multigrano' ? '50%' : `${pctAvena}%`}):</span>
                          <span className="font-semibold text-[var(--text-primary)]">{avenaGrams} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Harina de Quinua ({selectedBase === 'multigrano' ? '30%' : `${pctQuinua}%`}):</span>
                          <span className="font-semibold text-[var(--text-primary)]">{quinuaGrams} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Harina de Cañihua ({selectedBase === 'multigrano' ? '20%' : `${pctCanihua}%`}):</span>
                          <span className="font-semibold text-[var(--text-primary)]">{canihuaGrams} g</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Harina Base Única */
                  <div className="p-3 flex justify-between">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">🌾 Harina Única Base ({preset.ratioFlours}%)</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">{preset.flours.base}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)] self-center">{flourBaseGrams} g</span>
                  </div>
                )}
                
                {/* Harina / Fécula Secundaria (Si la hay) */}
                {preset.flours.starch && (
                  <div className="p-3 flex justify-between">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">🍠 Fécula / Almidón ({100 - preset.ratioFlours}%)</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">{preset.flours.starch} (aporta elasticidad y suavidad)</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)] self-center">{flourStarchGrams} g</span>
                  </div>
                )}

                {/* Agua */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--accent-teal)] block">💧 Agua Tibia ({customHydration}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Para hidratar e integrar la mezcla</span>
                  </div>
                  <span className="font-bold text-[var(--accent-teal)] self-center">{waterGrams} ml / g</span>
                </div>

                {/* Psyllium Husk (Solo sin gluten) */}
                {preset.isGlutenFree && (
                  <div className="p-3 flex justify-between">
                    <div>
                      <span className="font-bold text-[var(--accent-gold)] block">🌀 Psyllium Husk ({customPsyllium}%)</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">Estructura gomosa y elasticidad</span>
                    </div>
                    <span className="font-bold text-[var(--accent-gold)] self-center">{psylliumGrams} g</span>
                  </div>
                )}

                {/* Levadura */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">🍞 Levadura Seca ({preset.yeast}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Levadura instantánea de panadería</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{yeastGrams} g</span>
                </div>

                {/* Sal */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">🧂 Sal Marina ({preset.salt}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Realzador de sabor</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{saltGrams} g</span>
                </div>

                {/* Aceite */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">🫒 Aceite de Oliva ({preset.oil}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Suavidad y textura rústica</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{oilGrams} g</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('checklist')}
              className="w-full bg-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/90 text-[var(--bg-primary)] font-black text-xs py-3.5 rounded-2xl tap-active transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Iniciar Mise en Place <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* SUBTAB 2: MISE EN PLACE CHECKLIST */}
        {activeSubTab === 'checklist' && (
          <div className="space-y-4 animate-float-in">
            {/* Cabecera */}
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <ClipboardList size={16} className="text-[var(--accent-mint)]" />
                Mise en Place & Pasos Clave
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Las masas {preset.isGlutenFree ? 'sin gluten' : 'tradicionales'} tienen procesos diferentes. Sigue este orden de preparación.
              </p>
            </div>

            {/* Checklist interactivo adaptado */}
            <div className="space-y-2.5">
              {(preset.isGlutenFree 
                ? [
                    { id: 'm1', title: 'Pesar harinas y féculas por separado', details: 'Asegúrate de combinar los porcentajes exactos indicados en el desglose de harinas.' },
                    { id: 'm2', title: 'Gelificar el Psyllium Husk', details: 'Mezcla el psyllium husk con la mitad de agua tibia y reposa 10 min hasta crear un gel gomoso.' },
                    { id: 'm3', title: 'Activar la Levadura', details: 'Disuelve la levadura en 50ml de agua tibia con una pizca de endulzante por 5 min hasta espumar.' },
                    { id: 'm4', title: 'Mezclar Secos', details: 'Unifica las harinas de granos (avena/quinua/cañihua), el almidón de yuca y la sal en un bowl grande.' },
                    { id: 'm5', title: 'Amasar sin Gluten', details: 'Agrega el gel de psyllium, la levadura activa, el resto del agua y el aceite. Amasa. Será húmeda y densa.' },
                    { id: 'm6', title: 'Estirar sobre Papel Manteca', details: 'Añade aceite a tus manos y estira directamente sobre papel de horno. Evita que se desarme.' },
                    { id: 'm7', title: 'Pre-horneo obligatorio', details: 'Hornea la masa sola (sin salsa ni queso) a 240°C por 8 min para fijar estructura.' }
                  ]
                : [
                    { id: 'w1', title: 'Disolver levadura en agua fría', details: 'En trigo es preferible fermentación fría y lenta para desarrollar sabor.' },
                    { id: 'w2', title: 'Integrar harina en 90%', details: 'Mezcla la harina con el agua y la levadura hasta formar una masa rústica.' },
                    { id: 'w3', title: 'Agregar Sal y terminar harina', details: 'La sal endurece el gluten. Añádela a mitad del proceso.' },
                    { id: 'w4', title: 'Amasado de Fuerza', details: 'Amasa enérgicamente por 10-12 min estirando y doblando hasta que quede lisa y elástica.' },
                    { id: 'w5', title: 'Integrar Aceite de Oliva', details: 'Agrega el aceite al final para dar suavidad a la masa.' },
                    { id: 'w6', title: 'Primer reposo a Temp. Ambiente', details: 'Coloca en bowl tapado por 2 horas hasta doblar su tamaño.' },
                    { id: 'w7', title: 'Formar Bollos e ir a Frío', details: 'Divide en porciones individuales de 200g-250g y madura en refrigerador 24 horas.' }
                  ]
              ).map((step, idx) => {
                const isChecked = checkedSteps[step.id] || false
                return (
                  <div 
                    key={step.id}
                    onClick={() => setCheckedSteps(prev => ({ ...prev, [step.id]: !isChecked }))}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${
                      isChecked 
                        ? 'border-[var(--accent-mint)]/40 bg-[var(--accent-mint)]/5 opacity-75' 
                        : 'border-[var(--border-moss)] bg-[var(--bg-card)] hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckCircle2 size={16} className="text-[var(--accent-mint)]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isChecked ? 'line-through text-gray-500' : 'text-[var(--text-primary)]'}`}>
                        {idx + 1}. {step.title}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">{step.details}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTimerType('leudado')
                  setTimerMax(preset.isGlutenFree ? 5400 : 7200)
                  setTimeLeft(preset.isGlutenFree ? 5400 : 7200)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Hourglass size={14} /> Leudado ({preset.isGlutenFree ? '1.5h' : '2h'})
              </button>
              <button
                onClick={() => {
                  setTimerType('horneado')
                  setTimerMax(preset.isGlutenFree ? 480 : 300)
                  setTimeLeft(preset.isGlutenFree ? 480 : 300)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Flame size={14} /> Horneo ({preset.isGlutenFree ? '8m' : '5m'})
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 3: CRONÓMETRO DE LEUDADO & HORNEADO */}
        {activeSubTab === 'timer' && (
          <div className="space-y-4 animate-float-in text-center">
            {/* Cabecera */}
            <div className="text-left">
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <Timer size={16} className="text-[var(--accent-mint)]" />
                Temporizador del Horno y Leudado
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Controla los tiempos de reposo y cocción exactos para obtener resultados profesionales y crujientes.
              </p>
            </div>

            {/* Selector de modo de tiempo */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-3 flex gap-2">
              <button
                onClick={() => {
                  setTimerType('leudado')
                  setTimerMax(5400)
                  setTimeLeft(5400)
                  setTimerRunning(false)
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  timerType === 'leudado' 
                    ? 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30' 
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Fermentación / Leudado
              </button>
              <button
                onClick={() => {
                  setTimerType('horneado')
                  setTimerMax(480)
                  setTimeLeft(480)
                  setTimerRunning(false)
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  timerType === 'horneado' 
                    ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30' 
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Horneado
              </button>
            </div>

            {/* Temporizador circular / display gigante */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4">
              <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-[var(--bg-primary)] border-4 border-[var(--border-moss)] shadow-inner">
                <div className="text-3xl font-black text-[var(--text-primary)] font-['Space_Grotesk'] tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <div className="absolute bottom-6 text-[9px] uppercase tracking-widest font-black text-[var(--text-secondary)]">
                  {timerType}
                </div>
              </div>

              {/* Ajustar tiempos manualmente */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeLeft(prev => Math.max(0, prev - 60))}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] tap-active"
                >
                  -1 min
                </button>
                <button
                  onClick={() => setTimeLeft(prev => prev + 60)}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] tap-active"
                >
                  +1 min
                </button>
                <button
                  onClick={() => setTimeLeft(prev => prev + 300)}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] tap-active"
                >
                  +5 min
                </button>
              </div>

              {/* Botones de acción del timer */}
              <div className="flex gap-3 w-full max-w-xs pt-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all tap-active flex items-center justify-center gap-1.5 shadow-md ${
                    timerRunning 
                      ? 'bg-amber-500 text-white hover:bg-amber-600' 
                      : 'bg-[var(--accent-mint)] text-[var(--bg-primary)] hover:bg-[var(--accent-mint)]/90'
                  }`}
                >
                  {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                  {timerRunning ? 'Pausar' : 'Iniciar'}
                </button>

                <button
                  onClick={() => {
                    setTimerRunning(false)
                    setTimeLeft(timerMax)
                  }}
                  className="px-4 bg-[var(--bg-elevated)] border border-[var(--border-moss)] text-[var(--text-secondary)] rounded-2xl hover:bg-gray-200 tap-active transition-all"
                  title="Reiniciar"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl text-left text-xs leading-relaxed space-y-2">
              <span className="font-bold text-[var(--text-primary)] block">📋 Instrucciones de horneado en piedra:</span>
              <p className="text-[10px] text-[var(--text-secondary)]">
                1. Asegúrate de que el horno esté encendido a su temperatura máxima por al menos 30 minutos antes.
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                2. Si usas masa de trigo tradicional, estira usando sémola para dar una base áspera y súper crocante.
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 4: BITÁCORA DE EXPERIMENTOS */}
        {activeSubTab === 'bitacora' && (
          <div className="space-y-4 animate-float-in">
            {/* Cabecera */}
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <BookOpen size={16} className="text-[var(--accent-mint)]" />
                Bitácora de Ensayos y Experimentos
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Registra tus éxitos y aprendizajes culinarios. Anota la hidratación, harinas utilizadas y resultados de cocción.
              </p>
            </div>

            {/* Formulario de registro de ensayo */}
            <form onSubmit={handleSaveExperiment} className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 border-b border-[var(--border-moss)] pb-2 mb-1">
                <Plus size={14} className="text-[var(--accent-mint)]" />
                Consagrar Nuevo Experimento
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Título del ensayo:</label>
                <input 
                  type="text" 
                  value={newExp.title}
                  onChange={(e) => setNewExp(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`Ej: Quinua con hidratación al 90% y fécula de papa`}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-mint)]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Harina Base:</label>
                  <select 
                    value={newExp.baseType}
                    onChange={(e) => setNewExp(prev => ({ ...prev, baseType: e.target.value }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none"
                  >
                    {Object.keys(DOUGH_PRESETS).map(key => (
                      <option key={key} value={key}>
                        {DOUGH_PRESETS[key].emoji} {DOUGH_PRESETS[key].shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Hidratación (%):</label>
                  <input 
                    type="number" 
                    value={newExp.hydration}
                    onChange={(e) => setNewExp(prev => ({ ...prev, hydration: parseInt(e.target.value) || 80 }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Fermentación (Horas):</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={newExp.fermentationTime}
                    onChange={(e) => setNewExp(prev => ({ ...prev, fermentationTime: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Temperatura Horno (°C):</label>
                  <input 
                    type="number" 
                    value={newExp.temperature}
                    onChange={(e) => setNewExp(prev => ({ ...prev, temperature: parseInt(e.target.value) || 250 }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Calidad Textura (1-5):</label>
                  <select 
                    value={newExp.textureScore}
                    onChange={(e) => setNewExp(prev => ({ ...prev, textureScore: parseInt(e.target.value) }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none"
                  >
                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{'⭐'.repeat(v)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Calidad Sabor (1-5):</label>
                  <select 
                    value={newExp.flavorScore}
                    onChange={(e) => setNewExp(prev => ({ ...prev, flavorScore: parseInt(e.target.value) }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none"
                  >
                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{'⭐'.repeat(v)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Observaciones / Ajustes:</label>
                <textarea 
                  value={newExp.notes}
                  onChange={(e) => setNewExp(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ej: Borde crujiente y alveolado. Para la próxima reducir 5% de agua..."
                  rows="2"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-mint)]/40 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/90 text-[var(--bg-primary)] font-black text-xs py-3 rounded-xl tap-active transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <Plus size={13} /> Guardar Experimento
              </button>
            </form>

            {/* LISTADO DE EXPERIMENTOS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Bitácora de Ensayos ({experiments.length})
              </h3>
              
              {experiments.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-moss)] rounded-2xl p-6 text-center text-xs text-[var(--text-secondary)] shadow-sm">
                  <BookOpenCheck size={24} className="mx-auto mb-2 text-gray-400" />
                  Aún no has registrado ningún ensayo. ¡Inicia con tu primera masa de prueba!
                </div>
              ) : (
                experiments.map(exp => (
                  <div key={exp.id} className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-3.5 shadow-sm space-y-2 relative">
                    <button
                      onClick={() => handleDeleteExperiment(exp.id)}
                      className="absolute top-3.5 right-3.5 p-1 rounded-full text-red-500 hover:bg-red-50 transition-all tap-active"
                      title="Eliminar registro"
                    >
                      <Trash size={12} />
                    </button>

                    <div className="pr-6">
                      <span className="text-[9px] text-[var(--text-muted)] font-medium block">{exp.date}</span>
                      <h4 className="text-xs font-black text-[var(--text-primary)]">{exp.title}</h4>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[9px] text-gray-700">
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        {DOUGH_PRESETS[exp.baseType]?.emoji} Harina: {DOUGH_PRESETS[exp.baseType]?.shortName || exp.baseType}
                      </span>
                      {exp.blendPercentages && (
                        <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold text-indigo-600">
                          🧪 Bl: {exp.blendPercentages.avena}%Av/{exp.blendPercentages.quinua}%Qn/{exp.blendPercentages.canihua}%Ca
                        </span>
                      )}
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        💧 Hidr: {exp.hydration}%
                      </span>
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        ⏳ Ferm: {exp.fermentationTime}h
                      </span>
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        🔥 Temp: {exp.temperature}°C
                      </span>
                    </div>

                    <div className="flex gap-4 text-[9px] border-t border-[var(--border-moss)] pt-2 mt-1">
                      <span className="flex items-center gap-0.5 font-bold">Textura: <span className="text-yellow-500">{'⭐'.repeat(exp.textureScore)}</span></span>
                      <span className="flex items-center gap-0.5 font-bold">Sabor: <span className="text-yellow-500">{'⭐'.repeat(exp.flavorScore)}</span></span>
                    </div>

                    {exp.notes && (
                      <p className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-moss)] italic text-left">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: RECETARIO / IMPORTADOR DE RECETAS */}
        {activeSubTab === 'recetas' && (
          <div className="space-y-4 animate-float-in">
            {/* Cabecera */}
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[var(--accent-mint)]" />
                Recetario & Importador Culinario
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Copia las recetas de IAs o páginas web y guárdalas aquí. Visualízalas en formato "Modo Cocinero" sin apagar la pantalla.
              </p>
            </div>

            {/* Selector de Recetas */}
            {!selectedRecipe ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Recetas Disponibles</h3>
                  <button
                    onClick={() => setShowRecipeForm(!showRecipeForm)}
                    className="bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Plus size={10} /> {showRecipeForm ? 'Cerrar Formulario' : 'Importar Receta'}
                  </button>
                </div>

                {/* Formulario Importar */}
                {showRecipeForm && (
                  <form onSubmit={handleImportRecipe} className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3.5 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Nombre de la Receta:</label>
                      <input 
                        type="text" 
                        required
                        value={newRecipeTitle}
                        onChange={(e) => setNewRecipeTitle(e.target.value)}
                        placeholder="Ej: Masa de avena y quinua crujiente de ChatGPT"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Pega los pasos (uno por línea):</label>
                      <textarea 
                        required
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Pega el paso a paso aquí..."
                        rows="5"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-mint)]/40 resize-none font-sans"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/90 text-[var(--bg-primary)] font-black text-xs py-3 rounded-xl tap-active transition-all"
                    >
                      Guardar en Recetario
                    </button>
                  </form>
                )}

                {/* Lista de Recetas */}
                <div className="grid grid-cols-1 gap-2.5">
                  {recipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 shadow-sm hover:border-[var(--accent-mint)]/40 transition-all flex items-center justify-between group tap-active"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-bold">
                          {recipe.source}
                        </span>
                        <h4 className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-mint)] transition-colors">
                          {recipe.title}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{recipe.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--accent-mint)] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* MODO COCINERO: DETALLE DE RECETA */
              <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 shadow-sm space-y-4 animate-float-in">
                {/* Header detalle */}
                <div className="flex justify-between items-start border-b border-[var(--border-moss)] pb-3">
                  <div>
                    <button 
                      onClick={() => setSelectedRecipe(null)}
                      className="text-xs text-[var(--accent-mint)] font-bold flex items-center gap-1 mb-1 tap-active"
                    >
                      <ChevronLeft size={12} /> Volver a recetas
                    </button>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{selectedRecipe.title}</h3>
                    <p className="text-[10px] text-[var(--text-secondary)]">{selectedRecipe.description}</p>
                  </div>
                </div>

                {/* Ingredientes de la receta */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                    <Scale size={12} className="text-[var(--accent-mint)]" /> Ingredientes Requeridos:
                  </h4>
                  <ul className="text-xs text-[var(--text-secondary)] list-disc pl-5 space-y-1">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                {/* Pasos en Modo Cocinero */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 border-t border-[var(--border-moss)] pt-3">
                    <FileText size={12} className="text-[var(--accent-teal)]" /> Pasos de Preparación:
                  </h4>
                  <div className="space-y-3">
                    {selectedRecipe.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--border-moss)]">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-mint)]/20 text-[var(--accent-mint)] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-[11px] text-[var(--text-primary)] leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 border-t border-[var(--border-moss)] pt-4 mt-2">
                  <button
                    onClick={() => {
                      setTimerType('leudado')
                      setTimerMax(7200)
                      setTimeLeft(7200)
                      setActiveSubTab('timer')
                    }}
                    className="flex-1 bg-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all"
                  >
                    Activar Cronómetro Leudado
                  </button>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="px-4 border border-[var(--border-moss)] text-[var(--text-secondary)] rounded-xl text-xs hover:bg-[var(--bg-elevated)] tap-active"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function Badge({ children, color = 'mint' }) {
  const colorMap = {
    mint: 'bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] border-[var(--accent-mint)]/20',
    teal: 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/20',
    gold: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    gray: 'bg-gray-100 text-gray-600 border-gray-200'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${colorMap[color] || colorMap.mint}`}>
      {children}
    </span>
  )
}
