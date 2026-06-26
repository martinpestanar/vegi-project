import React, { useState, useEffect, useRef } from 'react'
import { 
  Calculator, ClipboardList, Timer, BookOpen, Sparkles, Plus, Star, 
  Trash, Play, Pause, RotateCcw, FileText, ChevronLeft, ChefHat, 
  Scale, Flame, Hourglass, Award, AlertCircle, CheckCircle2, ChevronRight,
  BookOpenCheck, Info, HelpCircle, Save, Database, Wifi, WifiOff
} from 'lucide-react'
import { supabase } from './supabaseClient'

// Harinas por defecto en caso de fallback offline
const DEFAULT_FLOURS = [
  { id: '1', name: 'Harina de Avena Activa', short_name: 'Avena', emoji: '🌾', is_gluten_free: true, absorption_rate: 85, sattva_energy: 'Sattva', description: 'Masa suave, de sabor sutil y dulce, muy digestiva y rica en fibra. Apta para un leudado medio.' },
  { id: '2', name: 'Harina de Quinua (Lavada)', short_name: 'Quinua', emoji: '✨', is_gluten_free: true, absorption_rate: 90, sattva_energy: 'Sattva', description: 'Masa proteica de sabor terroso y de nuez. Requiere buena hidratación y un reposo óptimo para suavizar la saponina.' },
  { id: '3', name: 'Harina de Cañihua', short_name: 'Cañihua', emoji: '🔴', is_gluten_free: true, absorption_rate: 95, sattva_energy: 'Sattva', description: 'Masa rústica súper-nutritiva de color oscuro y sabor profundo. Alta presencia de antioxidantes. Excelente crocancia al pre-horneo.' },
  { id: '4', name: 'Harina de Trigo (Fuerza o 00)', short_name: 'Trigo (Gluten)', emoji: '🍕', is_gluten_free: false, absorption_rate: 65, sattva_energy: 'Rajas', description: 'Masa clásica italiana (tipo napolitana). El gluten crea una red elástica que atrapa el gas de fermentación.' },
  { id: '5', name: 'Harina de Arroz Integral', short_name: 'Arroz', emoji: '🍚', is_gluten_free: true, absorption_rate: 75, sattva_energy: 'Sattva', description: 'Masa muy neutra y de color claro. Aporta gran ligereza pero requiere ser combinada con otros granos para dar sabor.' },
  { id: '6', name: 'Harina de Sarraceno (Alforfón)', short_name: 'Sarraceno', emoji: '🛡️', is_gluten_free: true, absorption_rate: 80, sattva_energy: 'Sattva', description: 'Harina muy elástica de sabor rústico intenso y oscuro. Excelente para combinaciones crujientes de pizza rústica.' }
]

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
      'Unificación: Agregar al bowl de secos el gel de psyllium, la levadura activa, el resto del agua y el aceite. Amasar hasta homogeneizar completamente.',
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
  }
]

export default function PizzaLabScreen({ onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('calculadora')
  
  // Conectividad de Supabase
  const isSupabaseOnline = !!supabase

  // Harinas dinámicas cargadas de Supabase / Fallback
  const [flours, setFlours] = useState(DEFAULT_FLOURS)
  const [loadingFlours, setLoadingFlours] = useState(false)
  const [showAddFlourForm, setShowAddFlourForm] = useState(false)
  const [newFlour, setNewFlour] = useState({
    name: '',
    short_name: '',
    emoji: '🌾',
    is_gluten_free: true,
    absorption_rate: 75,
    sattva_energy: 'Sattva',
    description: ''
  })

  // Blends guardados en Supabase / Fallback
  const [savedBlends, setSavedBlends] = useState([])
  const [loadingBlends, setLoadingBlends] = useState(false)
  const [newBlendName, setNewBlendName] = useState('')
  const [showSaveBlendModal, setShowSaveBlendModal] = useState(false)

  // Estados de cálculo de panadero
  const [selectedBaseMode, setSelectedBaseMode] = useState('multigrano') // 'avena' | 'quinua' | 'canihua' | 'trigo' | 'multigrano' | 'custom' | o ID de blend de Supabase
  const [targetWeight, setTargetWeight] = useState(400) // gramos de harina total
  const [customHydration, setCustomHydration] = useState(90)
  const [customPsyllium, setCustomPsyllium] = useState(4.5)

  // Mezcla de harinas personalizada: mapea flour.id -> peso/puntos del blend
  const [customBlendRatios, setCustomBlendRatios] = useState({
    '1': 50, // Avena
    '2': 30, // Quinua
    '3': 20  // Cañihua
  })

  // Checklist de Mise en Place
  const [checkedSteps, setCheckedSteps] = useState({})

  // Temporizadores
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0) // segundos
  const [timerMax, setTimerMax] = useState(5400)
  const [timerType, setTimerType] = useState('leudado')
  const timerIntervalRef = useRef(null)

  // Bitácora de Experimentos
  const [experiments, setExperiments] = useState([])
  const [loadingExperiments, setLoadingExperiments] = useState(false)
  
  // Formulario de Experimento
  const [newExp, setNewExp] = useState({
    title: '',
    baseType: 'multigrano',
    hydration: 90,
    fermentationTime: 1.5,
    temperature: 250,
    textureScore: 5,
    flavorScore: 5,
    notes: ''
  })

  // Recetas
  const [recipes, setRecipes] = useState(INITIAL_RECIPES)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [importText, setImportText] = useState('')
  const [newRecipeTitle, setNewRecipeTitle] = useState('')

  // 1. CARGAR DATOS DE SUPABASE AL INICIAR
  useEffect(() => {
    fetchFlours()
    fetchBlends()
    fetchExperiments()
  }, [])

  // 2. CORREGIR VALORES AL CAMBIAR BASE
  useEffect(() => {
    // Si es un ID de blend de Supabase guardado
    const savedBlend = savedBlends.find(b => b.id === selectedBaseMode)
    if (savedBlend) {
      setCustomHydration(savedBlend.hydration)
      setCustomPsyllium(savedBlend.psyllium)
      setCustomBlendRatios(savedBlend.flours)
      return
    }

    // Presets fijos
    if (selectedBaseMode === 'avena') {
      setCustomHydration(85); setCustomPsyllium(4);
    } else if (selectedBaseMode === 'quinua') {
      setCustomHydration(90); setCustomPsyllium(5);
    } else if (selectedBaseMode === 'canihua') {
      setCustomHydration(95); setCustomPsyllium(5);
    } else if (selectedBaseMode === 'trigo') {
      setCustomHydration(65); setCustomPsyllium(0);
    } else if (selectedBaseMode === 'multigrano') {
      setCustomHydration(90); setCustomPsyllium(4.5);
    } else if (selectedBaseMode === 'custom') {
      setCustomHydration(90); setCustomPsyllium(4.5);
    }
  }, [selectedBaseMode, savedBlends])

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

  // --- MÉTODOS DE CONSULTA Y ESCRITURA SUPABASE ---

  const fetchFlours = async () => {
    if (!supabase) return
    try {
      setLoadingFlours(true)
      const { data, error } = await supabase
        .from('pizza_flours')
        .select('*')
        .order('name', { ascending: true })
      if (!error && data && data.length > 0) {
        setFlours(data)
      }
    } catch (e) {
      console.warn("Fallo al conectar con tabla pizza_flours:", e.message)
    } finally {
      setLoadingFlours(false)
    }
  }

  const fetchBlends = async () => {
    if (!supabase) return
    try {
      setLoadingBlends(true)
      const { data, error } = await supabase
        .from('pizza_blends')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setSavedBlends(data)
      }
    } catch (e) {
      console.warn("Fallo al conectar con tabla pizza_blends:", e.message)
    } finally {
      setLoadingBlends(false)
    }
  }

  const fetchExperiments = async () => {
    if (!supabase) {
      // Localstorage fallback
      try {
        const saved = localStorage.getItem('vegi-pizza-experiments')
        if (saved) setExperiments(JSON.parse(saved))
      } catch {}
      return
    }
    try {
      setLoadingExperiments(true)
      const { data, error } = await supabase
        .from('pizza_experiments')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setExperiments(data)
      }
    } catch (e) {
      console.warn("Fallo al conectar con tabla pizza_experiments:", e.message)
    } finally {
      setLoadingExperiments(false)
    }
  }

  const handleCreateFlour = async (e) => {
    e.preventDefault()
    if (!newFlour.name || !newFlour.short_name) return

    if (supabase) {
      try {
        const { error } = await supabase
          .from('pizza_flours')
          .insert([newFlour])
        if (error) throw error
        alert(`🌾 Nueva harina "${newFlour.name}" guardada en Supabase de forma inteligente.`)
        setShowAddFlourForm(false)
        setNewFlour({
          name: '',
          short_name: '',
          emoji: '🌾',
          is_gluten_free: true,
          absorption_rate: 75,
          sattva_energy: 'Sattva',
          description: ''
        })
        fetchFlours()
      } catch (err) {
        alert("Error al guardar harina en Supabase: " + err.message)
      }
    } else {
      // Offline fallback
      const localFlour = { id: Date.now().toString(), ...newFlour }
      setFlours([...flours, localFlour])
      alert(`🌾 Harina "${newFlour.name}" guardada en memoria local temporal.`)
      setShowAddFlourForm(false)
    }
  }

  const handleSaveBlend = async () => {
    if (!newBlendName.trim()) return

    const blendData = {
      name: newBlendName,
      description: `Blend personalizado con hidratación al ${customHydration}%`,
      flours: customBlendRatios,
      hydration: customHydration,
      psyllium: customPsyllium
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('pizza_blends')
          .insert([blendData])
        if (error) throw error
        alert(`💾 Blend "${newBlendName}" guardado en la nube de Supabase.`)
        setShowSaveBlendModal(false)
        setNewBlendName('')
        fetchBlends()
      } catch (err) {
        alert("Error al guardar blend en Supabase: " + err.message)
      }
    } else {
      // Local fallback
      const localBlend = { id: Date.now().toString(), ...blendData, created_at: new Date().toISOString() }
      setSavedBlends([localBlend, ...savedBlends])
      alert(`💾 Blend "${newBlendName}" guardado en local.`)
      setShowSaveBlendModal(false)
      setNewBlendName('')
    }
  }

  const handleSaveExperiment = async (e) => {
    e.preventDefault()
    
    // Obtener descripción de harinas usadas
    let finalBaseType = selectedBaseMode
    const savedBlend = savedBlends.find(b => b.id === selectedBaseMode)
    if (savedBlend) {
      finalBaseType = `Blend: ${savedBlend.name}`
    } else if (selectedBaseMode === 'custom') {
      finalBaseType = 'Blend Custom'
    } else if (DOUGH_PRESETS[selectedBaseMode]) {
      finalBaseType = DOUGH_PRESETS[selectedBaseMode].name
    }

    const experimentData = {
      title: newExp.title.trim() || `Ensayo #${experiments.length + 1} (${finalBaseType})`,
      base_type: finalBaseType,
      hydration: customHydration,
      fermentation_time: newExp.fermentationTime,
      temperature: newExp.temperature,
      texture_score: newExp.textureScore,
      flavor_score: newExp.flavorScore,
      notes: newExp.notes,
      blend_percentages: selectedBaseMode === 'custom' || savedBlend ? customBlendRatios : null
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('pizza_experiments')
          .insert([experimentData])
        if (error) throw error
        alert('📝 Experimento guardado y sincronizado con Supabase.')
        fetchExperiments()
      } catch (err) {
        alert("Fallo al guardar en Supabase. Se guardará localmente: " + err.message)
        saveExperimentLocal(experimentData)
      }
    } else {
      saveExperimentLocal(experimentData)
    }

    // Reset
    setNewExp({
      title: '',
      baseType: selectedBaseMode,
      hydration: customHydration,
      fermentationTime: 1.5,
      temperature: 250,
      textureScore: 5,
      flavorScore: 5,
      notes: ''
    })
  }

  const saveExperimentLocal = (exp) => {
    const localExp = { id: Date.now().toString(), date: new Date().toLocaleDateString(), ...exp }
    const updated = [localExp, ...experiments]
    setExperiments(updated)
    localStorage.setItem('vegi-pizza-experiments', JSON.stringify(updated))
  }

  const handleDeleteExperiment = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de experimentación?')) return

    if (supabase && isNaN(id)) { // los UUID de supabase tienen letras, Date.now() local es numérico
      try {
        const { error } = await supabase
          .from('pizza_experiments')
          .delete()
          .eq('id', id)
        if (error) throw error
        alert('🗑️ Registro eliminado de Supabase.')
        fetchExperiments()
      } catch (err) {
        alert("Error al eliminar de Supabase: " + err.message)
      }
    } else {
      const updated = experiments.filter(e => e.id !== id)
      setExperiments(updated)
      localStorage.setItem('vegi-pizza-experiments', JSON.stringify(updated))
      alert('🗑️ Registro local eliminado.')
    }
  }

  // --- CÁLCULOS DINÁMICOS DE PANADERO CON HARINAS VARIABLES ---
  const presetSelected = DOUGH_PRESETS[selectedBaseMode] || DOUGH_PRESETS.custom
  const isGlutenFreeMode = selectedBaseMode !== 'trigo'

  const flourBaseWeight = Math.round((targetWeight * 70) / 100)
  const starchWeight = isGlutenFreeMode ? Math.round((targetWeight * 30) / 100) : 0

  // Resolver los ratios del blend
  let resolvedFloursGrams = {}
  
  if (selectedBaseMode === 'multigrano') {
    // Avena 50, Quinua 30, Cañihua 20 por defecto
    resolvedFloursGrams['Avena'] = Math.round((flourBaseWeight * 50) / 100)
    resolvedFloursGrams['Quinua'] = Math.round((flourBaseWeight * 30) / 100)
    resolvedFloursGrams['Cañihua'] = Math.round((flourBaseWeight * 20) / 100)
  } else if (selectedBaseMode === 'avena') {
    resolvedFloursGrams['Avena'] = flourBaseWeight
  } else if (selectedBaseMode === 'quinua') {
    resolvedFloursGrams['Quinua'] = flourBaseWeight
  } else if (selectedBaseMode === 'canihua') {
    resolvedFloursGrams['Cañihua'] = flourBaseWeight
  } else if (selectedBaseMode === 'trigo') {
    resolvedFloursGrams['Trigo'] = targetWeight // Trigo es 100%
  } else {
    // Custom blend o blend de Supabase
    let totalPoints = 0
    Object.keys(customBlendRatios).forEach(fid => {
      totalPoints += (customBlendRatios[fid] || 0)
    })

    flours.forEach(fl => {
      const ratio = customBlendRatios[fl.id] || 0
      if (ratio > 0) {
        const pct = totalPoints > 0 ? (ratio / totalPoints) : 0
        resolvedFloursGrams[fl.short_name] = Math.round(flourBaseWeight * pct)
      }
    })
  }

  const waterGrams = Math.round((targetWeight * customHydration) / 100)
  const psylliumGrams = isGlutenFreeMode ? Math.round((targetWeight * customPsyllium) / 100) : 0
  const yeastGrams = Math.round((targetWeight * (isGlutenFreeMode ? 2.5 : 1.5)) / 100)
  const saltGrams = Math.round((targetWeight * (isGlutenFreeMode ? 2.0 : 2.5)) / 100)
  const oilGrams = Math.round((targetWeight * (isGlutenFreeMode ? 3.5 : 2.0)) / 100)
  const totalWeightGrams = targetWeight + waterGrams + psylliumGrams + yeastGrams + saltGrams + oilGrams

  // Cambiar ratio del blend personalizado
  const handleUpdateRatio = (flourId, val) => {
    setCustomBlendRatios(prev => ({
      ...prev,
      [flourId]: parseInt(val) || 0
    }))
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] animate-float-in text-left">
      {/* HEADER */}
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
        
        {/* Indicador de Supabase */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
          isSupabaseOnline 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
        }`}>
          {isSupabaseOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
          {isSupabaseOnline ? 'Supabase Nube' : 'Modo Local'}
        </span>
      </div>

      {/* SUBTABS */}
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                  <Scale size={16} className="text-[var(--accent-mint)]" />
                  Fórmulas y Porcentajes de Panadero
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Calcula la hidratación exacta y mezcla tus harinas favoritas en vivo.
                </p>
              </div>
              
              {/* Botón para abrir el panel de agregar harinas */}
              <button
                onClick={() => setShowAddFlourForm(!showAddFlourForm)}
                className="bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/20 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-0.5 transition-all"
              >
                <Plus size={10} /> Harinas
              </button>
            </div>

            {/* FORMULARIO AGREGAR NUEVA HARINA A SUPABASE */}
            {showAddFlourForm && (
              <form onSubmit={handleCreateFlour} className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-3 shadow-md animate-float-in">
                <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-moss)] pb-2 mb-1">
                  <Database size={13} className="text-[var(--accent-mint)]" /> Agregar Harina Personalizada al Catálogo
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Nombre Completo:</label>
                    <input 
                      type="text" 
                      required
                      value={newFlour.name}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Harina de Sarraceno"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Nombre Corto:</label>
                    <input 
                      type="text" 
                      required
                      value={newFlour.short_name}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, short_name: e.target.value }))}
                      placeholder="Ej: Sarraceno"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Emoji:</label>
                    <input 
                      type="text" 
                      value={newFlour.emoji}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, emoji: e.target.value }))}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Absorción (H2O %):</label>
                    <input 
                      type="number" 
                      value={newFlour.absorption_rate}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, absorption_rate: parseInt(e.target.value) || 70 }))}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Energía Pránica:</label>
                    <select 
                      value={newFlour.sattva_energy}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, sattva_energy: e.target.value }))}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2 py-1.5 text-xs"
                    >
                      <option value="Sattva">🌿 Sattva</option>
                      <option value="Rajas">🔥 Rajas</option>
                      <option value="Tamas">🪨 Tamas</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-primary)] cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newFlour.is_gluten_free}
                      onChange={(e) => setNewFlour(prev => ({ ...prev, is_gluten_free: e.target.checked }))}
                      className="accent-[var(--accent-mint)]"
                    />
                    ¿Es Harina Sin Gluten (GF)?
                  </label>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[var(--text-secondary)] mb-1">Descripción:</label>
                  <textarea 
                    value={newFlour.description}
                    onChange={(e) => setNewFlour(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe sus propiedades, textura o comportamiento..."
                    rows="2"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none resize-none font-sans"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--accent-mint)] text-[var(--bg-primary)] text-xs py-2 rounded-xl font-bold hover:bg-[var(--accent-mint)]/90"
                  >
                    Consagrar Harina
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFlourForm(false)}
                    className="px-4 border border-[var(--border-moss)] text-gray-500 rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* SECTOR NAVEGACIÓN BASES / BLENDS */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)]">Selecciona el tipo de Masa o Blend:</label>
              
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {/* Presets Básicos */}
                {[
                  { id: 'multigrano', emoji: '🌾🔴', name: 'Multigrano' },
                  { id: 'custom', emoji: '🧪', name: 'Blend Custom' },
                  { id: 'avena', emoji: '🌾', name: 'Avena' },
                  { id: 'quinua', emoji: '✨', name: 'Quinua' },
                  { id: 'canihua', emoji: '🔴', name: 'Cañihua' },
                  { id: 'trigo', emoji: '🍕', name: 'Trigo' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedBaseMode(item.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedBaseMode === item.id 
                        ? 'border-[var(--accent-mint)] bg-[var(--accent-mint)]/15 text-[var(--text-primary)]' 
                        : 'border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.emoji} {item.name}
                  </button>
                ))}

                {/* Renders de Blends Cargados de Supabase */}
                {savedBlends.map(blend => (
                  <button
                    key={blend.id}
                    onClick={() => setSelectedBaseMode(blend.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      selectedBaseMode === blend.id 
                        ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)]/15 text-[var(--text-primary)]' 
                        : 'border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                    }`}
                  >
                    💾 {blend.name}
                  </button>
                ))}
              </div>
            </div>

            {/* MOSTRAR DESCRIPCIÓN DEL MODO SELECCIONADO */}
            <div className="p-3 bg-[var(--bg-elevated)]/60 rounded-2xl border border-[var(--border-moss)] text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-[var(--text-primary)] block mb-0.5">
                {presetSelected.name || 'Blend de la Nube'} 
                <Badge color={isGlutenFreeMode ? 'mint' : 'purple'}>
                  {isGlutenFreeMode ? 'Sin Gluten' : 'Con Gluten'}
                </Badge>
              </span>
              <p className="text-[10px] leading-relaxed">
                {DOUGH_PRESETS[selectedBaseMode]?.description || 'Fórmula cargada desde el almacenamiento de tu Pizza Lab.'}
              </p>
            </div>

            {/* SECCIÓN INTERACTIVA DE BLEND PERSONALIZADO */}
            {(selectedBaseMode === 'custom' || savedBlends.some(b => b.id === selectedBaseMode)) && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 space-y-4 shadow-sm animate-float-in">
                <div className="flex justify-between items-center border-b border-[var(--border-moss)] pb-2 mb-1">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    🧪 Alquimia de Blend Dinámica ({flours.length} Harinas Disponibles)
                  </h3>
                  
                  {/* Botón para guardar el blend actual en Supabase */}
                  <button
                    onClick={() => setShowSaveBlendModal(true)}
                    className="bg-[var(--accent-teal)]/10 hover:bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] border border-[var(--accent-teal)]/25 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all"
                  >
                    <Save size={10} /> Guardar Blend
                  </button>
                </div>

                {/* MODAL / INPUT PARA GUARDAR BLEND */}
                {showSaveBlendModal && (
                  <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--accent-teal)]/30 space-y-2 animate-float-in">
                    <label className="block text-[9px] font-bold text-[var(--text-primary)]">Nombre del Blend:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newBlendName}
                        onChange={(e) => setNewBlendName(e.target.value)}
                        placeholder="Ej: Blend Rústico Crujiente"
                        className="flex-1 bg-white border border-[var(--border-moss)] rounded-lg px-2 py-1 text-xs outline-none"
                      />
                      <button
                        onClick={handleSaveBlend}
                        className="bg-[var(--accent-teal)] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-[var(--accent-teal)]/90"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setShowSaveBlendModal(false)}
                        className="px-2 border border-gray-300 text-gray-500 rounded-lg text-xs"
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}

                {/* RENDER DE SLIDERS DE HARINAS EN EL CATÁLOGO */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {flours.map(fl => {
                    const ratioValue = customBlendRatios[fl.id] || 0
                    // Calcular el porcentaje normalizado instantáneo
                    const ratioPct = totalBlendPoints > 0 ? Math.round((ratioValue / totalBlendPoints) * 100) : 0
                    
                    return (
                      <div key={fl.id} className="flex flex-col gap-1 border-b border-[var(--border-moss)]/40 pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {fl.emoji} {fl.name} <span className="text-[9px] text-[var(--text-secondary)] font-normal">({fl.sattva_energy})</span>
                          </span>
                          <span className="text-xs font-black text-[var(--accent-mint)]">{ratioPct}%</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={ratioValue}
                            onChange={(e) => handleUpdateRatio(fl.id, e.target.value)}
                            className="flex-1 accent-[var(--accent-mint)] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={ratioValue}
                            onChange={(e) => handleUpdateRatio(fl.id, e.target.value)}
                            className="w-12 text-center text-xs bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-lg py-0.5"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="text-[9px] text-[var(--text-secondary)] leading-relaxed italic text-center">
                  *Ajusta los deslizadores de tus harinas. El sistema redistribuirá el peso en base al peso total de harina deseado.
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
                  min={isGlutenFreeMode ? 70 : 50} 
                  max={isGlutenFreeMode ? 110 : 80} 
                  step="2"
                  value={customHydration}
                  onChange={(e) => setCustomHydration(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-teal)]"
                />
                <span className="text-[9px] text-[var(--text-muted)] mt-1 block">
                  {isGlutenFreeMode 
                    ? '⚠️ Las masas sin gluten necesitan mayor hidratación (80%+) porque carecen de red elástica natural.' 
                    : '💡 El trigo tradicional requiere menor hidratación (60% a 70%).'}
                </span>
              </div>

              {/* Psyllium Husk */}
              {isGlutenFreeMode ? (
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
                    className="w-full accent(--accent-gold)"
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

            {/* TABLA DE DESGLOSE DE HARINAS EN VIVO */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-[var(--bg-elevated)] border-b border-[var(--border-moss)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">Fórmula de Pesado ({presetSelected.shortName})</span>
                <span className="text-[10px] bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] px-2 py-0.5 rounded-full font-black">
                  Masa total: {totalWeightGrams}g
                </span>
              </div>
              <div className="divide-y divide-[var(--border-moss)] text-xs">
                
                {/* Desglose de Harinas Base */}
                <div className="p-3 bg-[var(--bg-primary)]/50">
                  <span className="font-bold text-[var(--text-primary)] block mb-2">🌾 Harinas Base Culinarias ({presetSelected.ratioFlours}%)</span>
                  <div className="pl-3 space-y-2 text-[11px] text-[var(--text-secondary)] border-l-2 border-[var(--accent-mint)]">
                    {Object.keys(resolvedFloursGrams).map(flourName => (
                      <div key={flourName} className="flex justify-between">
                        <span>Harina de {flourName}:</span>
                        <span className="font-semibold text-[var(--text-primary)]">{resolvedFloursGrams[flourName]} g</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fécula/Almidón */}
                {presetSelected.flours.starch && (
                  <div className="p-3 flex justify-between">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">🍠 Fécula / Almidón ({100 - presetSelected.ratioFlours}%)</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">{presetSelected.flours.starch} (aporta flexibilidad)</span>
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
                {isGlutenFreeMode && (
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
                    <span className="font-bold text-[var(--text-primary)] block">🍞 Levadura Seca ({presetSelected.yeast || 2.5}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Levadura instantánea de panadería</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{yeastGrams} g</span>
                </div>

                {/* Sal */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">🧂 Sal Marina ({presetSelected.salt || 2}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Realzador de sabor</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{saltGrams} g</span>
                </div>

                {/* Aceite */}
                <div className="p-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">🫒 Aceite de Oliva ({presetSelected.oil || 3.5}%)</span>
                    <span className="text-[9px] text-[var(--text-secondary)]">Suavidad y textura rústica</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] self-center">{oilGrams} g</span>
                </div>
              </div>
            </div>

            {/* Advertencia de RLS si está en Supabase Online */}
            {isSupabaseOnline && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-[10px] text-amber-700 leading-normal flex gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold block">⚠️ Alerta de Seguridad (Desarrollo):</span>
                  Las tablas de Supabase tienen deshabilitado **RLS (Row Level Security)**. 
                  Para producción, ejecuta:
                  <code className="block bg-black/5 text-[9px] text-black font-mono p-1 rounded mt-1 overflow-x-auto">
                    ALTER TABLE public.pizza_flours ENABLE ROW LEVEL SECURITY;
                  </code>
                </div>
              </div>
            )}

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
                Sigue el orden del proceso alquímico adaptado a tu masa.
              </p>
            </div>

            {/* Checklist interactivo adaptado */}
            <div className="space-y-2.5">
              {(isGlutenFreeMode 
                ? [
                    { id: 'm1', title: 'Pesar harinas y féculas por separado', details: 'Asegúrate de combinar los porcentajes exactos indicados en el desglose de harinas.' },
                    { id: 'm2', title: 'Gelificar el Psyllium Husk', details: 'Mezcla el psyllium husk con la mitad de agua tibia y reposa 10 min hasta crear un gel gomoso.' },
                    { id: 'm3', title: 'Activar la Levadura', details: 'Disuelve la levadura en 50ml de agua tibia con una pizca de endulzante por 5 min hasta espumar.' },
                    { id: 'm4', title: 'Mezclar Secos', details: 'Unifica las harinas de granos, el almidón de yuca y la sal en un bowl grande.' },
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
                  setTimerMax(isGlutenFreeMode ? 5400 : 7200)
                  setTimeLeft(isGlutenFreeMode ? 5400 : 7200)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Hourglass size={14} /> Leudado ({isGlutenFreeMode ? '1.5h' : '2h'})
              </button>
              <button
                onClick={() => {
                  setTimerType('horneado')
                  setTimerMax(isGlutenFreeMode ? 480 : 300)
                  setTimeLeft(isGlutenFreeMode ? 480 : 300)
                  setActiveSubTab('timer')
                }}
                className="flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white font-bold text-xs py-3 rounded-xl tap-active transition-all flex items-center justify-center gap-1.5"
              >
                <Flame size={14} /> Horneo ({isGlutenFreeMode ? '8m' : '5m'})
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

            {/* Temporizador circular */}
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
                    value={selectedBaseMode}
                    disabled
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none opacity-80"
                  >
                    <option value={selectedBaseMode}>
                      {presetSelected.emoji || '💾'} {presetSelected.shortName}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1">Hidratación (%):</label>
                  <input 
                    type="number" 
                    value={customHydration}
                    disabled
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none opacity-80"
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
              
              {loadingExperiments ? (
                <div className="text-center py-4 text-xs text-[var(--text-secondary)]">Cargando bitácora de Supabase...</div>
              ) : experiments.length === 0 ? (
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
                      <span className="text-[9px] text-[var(--text-muted)] font-medium block">
                        {exp.created_at ? new Date(exp.created_at).toLocaleDateString() : exp.date}
                      </span>
                      <h4 className="text-xs font-black text-[var(--text-primary)]">{exp.title}</h4>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[9px] text-gray-700">
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        🍕 Harina: {exp.base_type || exp.baseType}
                      </span>
                      {exp.blend_percentages && (
                        <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold text-indigo-600">
                          🧪 Ratios: {Object.keys(exp.blend_percentages).map(k => `${exp.blend_percentages[k]}%`).join('/')}
                        </span>
                      )}
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        💧 Hidr: {exp.hydration}%
                      </span>
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        ⏳ Ferm: {exp.fermentation_time || exp.fermentationTime}h
                      </span>
                      <span className="bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full font-bold">
                        🔥 Temp: {exp.temperature}°C
                      </span>
                    </div>

                    <div className="flex gap-4 text-[9px] border-t border-[var(--border-moss)] pt-2 mt-1">
                      <span className="flex items-center gap-0.5 font-bold">Textura: <span className="text-yellow-500">{'⭐'.repeat(exp.texture_score || exp.textureScore)}</span></span>
                      <span className="flex items-center gap-0.5 font-bold">Sabor: <span className="text-yellow-500">{'⭐'.repeat(exp.flavor_score || exp.flavorScore)}</span></span>
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

        {/* SUBTAB 5: RECETARIO */}
        {activeSubTab === 'recetas' && (
          <div className="space-y-4 animate-float-in">
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[var(--accent-mint)]" />
                Recetario & Importador Culinario
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Copia las recetas de IAs o páginas web y guárdalas aquí. Visualízalas en formato "Modo Cocinero" sin apagar la pantalla.
              </p>
            </div>

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
              <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 shadow-sm space-y-4 animate-float-in">
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
