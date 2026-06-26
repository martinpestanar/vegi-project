import React, { useState, useEffect, useRef } from 'react'
import { 
  Calculator, ClipboardList, Timer, BookOpen, Sparkles, Plus, Star, 
  Trash, Play, Pause, RotateCcw, FileText, ChevronLeft, ChefHat, 
  Scale, Flame, Hourglass, Award, AlertCircle, CheckCircle2, ChevronRight,
  BookOpenCheck
} from 'lucide-react'

// CONSTANTES Y PRESETS DE MASAS SIN GLUTEN & VEGANAS
const DOUGH_PRESETS = {
  avena: {
    name: 'Base de Avena Activa',
    emoji: '🌾',
    flours: { base: 'Harina de Avena', starch: 'Almidón de Yuca' },
    ratioFlours: 70, // 70% Avena, 30% Yuca
    hydration: 85, // Las harinas sin gluten absorben muchísima agua
    psyllium: 4, // % de Psyllium para elasticidad
    yeast: 2.5,
    salt: 2,
    oil: 3,
    description: 'Masa suave, rica en fibra soluble. Ideal para digestión tranquila. Apta para un leudado medio.'
  },
  quinua: {
    name: 'Base Ancestral de Quinua',
    emoji: '✨',
    flours: { base: 'Harina de Quinua (Lavada)', starch: 'Fécula de Patata' },
    ratioFlours: 65, // 65% Quinua, 35% Fécula
    hydration: 90, // Alta absorción
    psyllium: 5,
    yeast: 2.5,
    salt: 2,
    oil: 4,
    description: 'Masa proteica de sabor terroso y nuez. Requiere buena hidratación y un reposo óptimo para atenuar las saponinas.'
  },
  canihua: {
    name: 'Base Pránica de Cañihua',
    emoji: '🔴',
    flours: { base: 'Harina de Cañihua', starch: 'Almidón de Yuca' },
    ratioFlours: 60, // 60% Cañihua, 40% Yuca (la cañihua es más densa y rústica)
    hydration: 95, // Altísima hidratación
    psyllium: 5,
    yeast: 2.5,
    salt: 2,
    oil: 4,
    description: 'Masa rústica súper-nutritiva de color oscuro y sabor profundo. Alta presencia de antioxidantes. Excelente crocancia al pre-horneo.'
  }
}

// RECETAS PRE-CARGADAS DE LA IA / TRADICIONALES
const INITIAL_RECIPES = [
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
    id: 'canihua-florentina',
    title: 'Pizza Silvestre de Cañihua con Hongos y Pesto',
    source: 'Oráculo Culinario',
    description: 'Masa densa, crujiente y cargada de prana mineral.',
    ingredients: [
      '250g Harina de Cañihua',
      '170g Almidón de Yuca',
      '400ml Agua tibia',
      '20g Psyllium Husk',
      '9g Levadura seca',
      '8g Sal marina',
      '15ml Aceite de oliva'
    ],
    steps: [
      'Mezclar and activar el psyllium con la mitad del agua templada hasta crear el gel aglutinante.',
      'Unificar los secos en un recipiente: harina de cañihua, almidón de yuca, levadura y sal.',
      'Incorporar el gel de psyllium y el agua restante. Amasar hasta homogeneizar la mezcla.',
      'Hacer un leudado en bloque de 90 minutos en un espacio oscuro y cálido.',
      'Estirar la masa fina sobre papel manteca. Esta masa de cañihua es rústica, por lo que un espesor de 5mm es ideal.',
      'Pre-hornear a 240°C por 8-10 minutos hasta que la superficie se sienta seca y firme.',
      'Decorar con pesto de albahaca y espinacas, champiñones salteados y piñones activados.',
      'Hornear por 6 minutos más hasta que la base esté completamente crujiente.'
    ]
  }
]

export default function PizzaLabScreen({ onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('calculadora')
  
  // Estados de los Submódulos
  const [selectedBase, setSelectedBase] = useState('avena')
  const [targetWeight, setTargetWeight] = useState(400) // gramos de harina total
  const [customHydration, setCustomHydration] = useState(85)
  const [customPsyllium, setCustomPsyllium] = useState(4)

  // Checklist de Mise en Place
  const [checkedSteps, setCheckedSteps] = useState({})

  // Temporizadores
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0) // segundos
  const [timerMax, setTimerMax] = useState(7200) // por defecto 2 horas
  const [timerType, setTimerType] = useState('leudado') // 'leudado' o 'horneado'
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
    baseType: 'avena',
    hydration: 85,
    fermentationTime: 2, // horas
    temperature: 250, // °C
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
            // Vibrar o alertar si es posible
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
  const flourStarchGrams = Math.round((targetWeight * (100 - preset.ratioFlours)) / 100)
  const waterGrams = Math.round((targetWeight * customHydration) / 100)
  const psylliumGrams = Math.round((targetWeight * customPsyllium) / 100)
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
    const experiment = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      title: newExp.title.trim() || `Ensayo #${experiments.length + 1} (${DOUGH_PRESETS[newExp.baseType].name})`,
      ...newExp
    }
    setExperiments([experiment, ...experiments])
    // Reset form
    setNewExp({
      baseType: selectedBase,
      hydration: customHydration,
      fermentationTime: 2,
      temperature: 250,
      textureScore: 5,
      flavorScore: 5,
      notes: '',
      title: ''
    })
    // Scroll a la bitácora
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

    // Estructurar pasos sencillos dividiendo por saltos de línea
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
      <div className="flex bg-[var(--bg-card)] border-b border-[var(--border-moss)] overflow-x-auto px-2 py-1 gap-1 sticky top-[57px] z-20">
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
                Calcula la hidratación exacta y las proporciones necesarias para tu harina sin gluten base.
              </p>
            </div>

            {/* Selector de Base */}
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(DOUGH_PRESETS).map(key => {
                const item = DOUGH_PRESETS[key]
                const isSel = selectedBase === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedBase(key)}
                    className={`p-3 rounded-2xl border text-center transition-all tap-active flex flex-col items-center gap-1 ${
                      isSel 
                        ? 'border-[var(--accent-mint)] bg-[var(--accent-mint)]/10 text-[var(--text-primary)] font-black' 
                        : 'border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[10px] whitespace-nowrap">{item.name.split(' ')[2]}</span>
                  </button>
                )
              })}
            </div>

            {/* Info Preset */}
            <div className="p-3 bg-[var(--bg-elevated)]/60 rounded-2xl border border-[var(--border-moss)] text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-[var(--text-primary)] block mb-0.5">💡 Prescripción de Alquimia:</span>
              {preset.description}
            </div>

            {/* Controles numéricos */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3.5 shadow-sm">
              {/* Peso Harina */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[var(--text-primary)]">Harina Deseada (Secos totales):</span>
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
                  <span className="font-bold text-[var(--text-primary)]">Hidratación (Agua):</span>
                  <span className="font-black text-[var(--accent-teal)]">{customHydration} %</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="110" 
                  step="5"
                  value={customHydration}
                  onChange={(e) => setCustomHydration(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-teal)]"
                />
              </div>

              {/* Psyllium Husk */}
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
              </div>
            </div>

            {/* TABLA DE RESULTADO */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-[var(--bg-elevated)] border-b border-[var(--border-moss)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">Mise en Place (Harina base: {targetWeight}g)</span>
                <span className="text-[10px] bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] px-2 py-0.5 rounded-full font-black">
                  Masa total: {totalWeightGrams}g
                </span>
              </div>
              <div className="divide-y divide-[var(--border-moss)] text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🌾 {preset.flours.base} ({preset.ratioFlours}%)</span>
                  <span className="font-bold text-[var(--text-primary)]">{flourBaseGrams} g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🍠 {preset.flours.starch} ({100 - preset.ratioFlours}%)</span>
                  <span className="font-bold text-[var(--text-primary)]">{flourStarchGrams} g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">💧 Agua tibia ({customHydration}%)</span>
                  <span className="font-bold text-[var(--accent-teal)]">{waterGrams} ml / g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🌀 Psyllium Husk ({customPsyllium}%)</span>
                  <span className="font-bold text-[var(--accent-gold)]">{psylliumGrams} g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🍞 Levadura seca instantánea ({preset.yeast}%)</span>
                  <span className="font-bold text-[var(--text-primary)]">{yeastGrams} g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🧂 Sal marina fina ({preset.salt}%)</span>
                  <span className="font-bold text-[var(--text-primary)]">{saltGrams} g</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">🫒 Aceite de Oliva ({preset.oil}%)</span>
                  <span className="font-bold text-[var(--text-primary)]">{oilGrams} g</span>
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
                Las masas sin gluten requieren de una estructura gelatinosa previa. Sigue los pasos para asegurar el éxito.
              </p>
            </div>

            {/* Checklist interactivo */}
            <div className="space-y-2.5">
              {[
                { id: 'm1', title: 'Pesar harinas y féculas por separado', details: 'Asegúrate de combinar los porcentajes exactos.' },
                { id: 'm2', title: 'Gelificar el Psyllium Husk', details: 'Pesa el psyllium, mézclalo con la mitad de agua tibia de la fórmula y déjalo reposar por 10 min hasta que forme un gel espeso y gomoso.' },
                { id: 'm3', title: 'Activar levadura seca', details: 'Disuelve la levadura en 50ml de agua tibia con una pizca de azúcar o sirope por 5 min hasta que espume.' },
                { id: 'm4', title: 'Integración de Secos', details: 'Mezcla bien las harinas, el almidón de yuca y la sal en un bowl grande.' },
                { id: 'm5', title: 'Unificación y Amasado', details: 'Agrega el gel de psyllium, la levadura activa, el resto del agua y el aceite. Amasa con manos húmedas. La consistencia es más parecida a una arcilla húmeda.' },
                { id: 'm6', title: 'Estirar en papel manteca', details: 'Al no tener gluten, la masa es difícil de trasladar. Estírala con aceite directamente sobre papel para hornear.' },
                { id: 'm7', title: 'Pre-calentado del horno al máximo', details: 'El calor intenso inicial es fundamental para inflar los bordes y formar estructura.' }
              ].map((step, idx) => {
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
                  setTimerMax(5400) // 1.5 Horas por defecto
                  setTimeLeft(5400)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Hourglass size={14} /> Leudado (1.5h)
              </button>
              <button
                onClick={() => {
                  setTimerType('horneado')
                  setTimerMax(480) // 8 minutos
                  setTimeLeft(480)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Flame size={14} /> Pre-horneo (8m)
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
                {/* Círculo de progreso sutil */}
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
                  onClick={() => {
                    setTimeLeft(prev => Math.max(0, prev - 60))
                  }}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] tap-active"
                >
                  -1 min
                </button>
                <button
                  onClick={() => {
                    setTimeLeft(prev => prev + 60)
                  }}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] tap-active"
                >
                  +1 min
                </button>
                <button
                  onClick={() => {
                    setTimeLeft(prev => prev + 300)
                  }}
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
                2. Si usas masa de cañihua o avena, el pre-horneado directo del disco sin toppings evita que la humedad de la salsa ablande el centro.
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
                  placeholder={`Ej: Cañihua crujiente con hidratación del 90%`}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-mint)]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Grano Base:</label>
                  <select 
                    value={newExp.baseType}
                    onChange={(e) => setNewExp(prev => ({ ...prev, baseType: e.target.value }))}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="avena">🌾 Avena</option>
                    <option value="quinua">✨ Quinua</option>
                    <option value="canihua">🔴 Cañihua</option>
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
                  placeholder="Ej: Bordes esponjosos, pero requiere 10 gramos adicionales de psyllium..."
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
                        🌾 Base: {DOUGH_PRESETS[exp.baseType]?.name.split(' ')[2] || exp.baseType}
                      </span>
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
