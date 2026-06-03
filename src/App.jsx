// ============================================================
// VEGI — "Duolingo + Jarvis" de Gastronomía Plant-Based
// Fase 3 — Orquestación de IA con n8n, Prompts de El Oráculo y Flujos Reales
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Home, MessageCircle, Globe, ChefHat,
  Flame, Star, Zap, Lock, Unlock,
  Camera, Mic, Send, X, Check,
  ChevronRight, Award, Leaf, Sparkles,
  BarChart3, Clock, Calendar, Search,
  MicOff, Image, RefreshCw, Sun, Moon, WifiOff, BookOpen
} from 'lucide-react'
import { supabase } from './supabaseClient'
import { useVegiSync } from './useVegiSync'
import { useCountryMedia } from './useCountryMedia'

// ============================================================
// DATOS DE SIMULACIÓN (FALLBACK Y RESPUESTAS DEL ORÁCULO)
// ============================================================

const VEGI_STRUCTURED_MOCKS = {
  palta: {
    message: "### ✨ Tiradito Pránico de Palta y Emulsión de Huacatay\n\nMartín, percibo una hermosa energía en tus ingredientes. La palta es un regalo directo del sol 🥑. Propongo balancear sus grasas puras sattva con acidez cítrica y la potencia aromática de la hierba sagrada de los andes.\n\n* **⏳ Dimensión Temporal:** 20 minutos de preparación activa.\n* **⚡ Nivel Prana:** Alto (Nutrición celular y vitalidad inmediata).",
    suggestions: [
      "¿Cómo preparo la emulsión de Huacatay?",
      "Agendar este plato para el Jueves",
      "Propiedades sattva de la Palta"
    ]
  },
  platano: {
    message: "### ✨ Ceviche Ancestral de Plátano de la Selva\n\nEl plátano maduro almacena el prana del viento y del sol 🍌. Propongo marinarlo con leche de coco fresca, zumo de limón sutil y un toque de ají charapita para despertar tu tercer chakra digestivo.\n\n* **⏳ Dimensión Temporal:** 15 minutos.\n* **⚡ Nivel Prana:** Medio-Alto (Fácil asimilación).",
    suggestions: [
      "¿Qué ajíes de la selva puedo usar?",
      "Agendar este plato para el Sábado",
      "Propiedades del Plátano de la Selva"
    ]
  },
  receta: {
    message: "### ✨ Causa Sagrada de los Andes con Hongos Ahumados\n\nInvocando la abundancia de la Pachamama para ti, Chef Martín 🌎:\n\n* **🛒 Insumos de la Tierra:** Papa amarilla prensada, cúrcuma activadora, tartar de hongos silvestres (Porcón o Shiitake) y crema de palta.\n* **🌀 El Proceso Alquímico:** Prensa las papas con aceite de oliva y cúrcuma; coloca una base, rellena con palta y corona con tus hongos salteados.\n\n* **⏳ Dimensión Temporal:** 35 minutos de cocina consciente.",
    suggestions: [
      "¿Cómo ahumo los hongos silvestres?",
      "Agendar causa para el Martes",
      "Sustitutos para la papa amarilla"
    ]
  },
  quinua: {
    message: "### ✨ Risotto Sagrado de Quinua y Trufa Andina\n\nLa quinua es el grano madre andino 🌾. Al cocinarla, recuerda revolver en sentido de las manecillas del reloj para infundir armonía geométrica en cada grano.\n\n* **⏳ Dimensión Temporal:** 25 minutos activos + 12 horas de remojo.\n* **⚡ Nivel Prana:** Máximo (Contiene todos los aminoácidos vitales).",
    suggestions: [
      "¿Por qué es importante activar la quinua?",
      "Agendar risotto para el Miércoles",
      "Cómo hacer caldo de verduras sagrado"
    ]
  },
  champiñon: {
    message: "### ✨ Caldo Sagrado de Ramen Fungi y Algas\n\nLos hongos son los mensajeros del reino subterráneo 🍄. Aportan un umami místico que nutre el sistema inmunitario y te enraíza a la tierra.\n\n* **⏳ Dimensión Temporal:** 40 minutos de infusión lenta.\n* **⚡ Nivel Prana:** Alto (Nutrición profunda).",
    suggestions: [
      "¿Cómo potencio el sabor umami?",
      "Agendar ramen para el Viernes",
      "Beneficios de las algas en la cocina"
    ]
  },
  default: {
    message: "### 🌿 El Oráculo de la Cocina Sagrada\n\nPercibo una hermosa energía en tus manos, Chef Martín. Sintoniza con los ingredientes locales que tienes a tu alcance. ¿Qué deseas preparar o aprender hoy?\n\n* **Sugerencias de Alquimia Culinaria:**",
    suggestions: [
      "Tengo palta y plátano peruano",
      "Receta rápida peruana plant-based",
      "Técnica de Activación de semillas"
    ]
  }
}

const WEEKLY_MEALS = [
  { day: 'Lun', emoji: '🫘', recipe: 'Tacu tacu de pallares', detail: 'Con salsa de hongos cremini y aceite de huacatay' },
  { day: 'Mar', emoji: '🥬', recipe: 'Causa de quinua tricolor', detail: 'Con tartar de champiñones ahumados y crema de ají' },
  { day: 'Mié', emoji: '🍜', recipe: 'Sopa seca vegana', detail: 'Fideos integrales con basil pesto andino y rúcula' },
  { day: 'Jue', emoji: '🥑', recipe: 'Tiradito de palta', detail: 'Leche de tigre verde, ají amarillo y cebolla morada' },
  { day: 'Vie', emoji: '🌽', recipe: 'Chupe de maíz morado', detail: 'Caldo reconstituyente con papas criollas y hierbas' },
  { day: 'Sáb', emoji: '🍄', recipe: 'Lomo saltado fungi', detail: 'Shiitake y portobello salteados, papas nativas fritas' },
  { day: 'Dom', emoji: '🌿', recipe: 'Descanso consciente', detail: 'Caldo mineral de vegetales + práctica de gratitud' },
]

const COOKING_TECHNIQUES = [
  {
    id: 'fermentacion',
    name: 'Fermentación',
    emoji: '🧫',
    duration: '24-72 horas',
    level: 'Avanzado',
    description: 'El arte sagrado de la transformación microbiana.',
    mystical: 'En la quietud de la fermentación, los microorganismos danzan una coreografía milenaria. Cada burbuja es un mantra, cada aroma es la respiración de la vida misma. Fermentar es confiar en el proceso invisible, es fe culinaria en estado puro. Tus ancestros fermentaban la mashua y el olluco mucho antes de que la ciencia nombrara los lactobacilos.',
    color: 'from-purple-950/20 to-purple-900/5',
    border: 'border-purple-500/20',
    accent: '#A855F7',
  },
  {
    id: 'activacion',
    name: 'Activación de Semillas',
    emoji: '🌱',
    duration: '8-24 horas',
    level: 'Intermedio',
    description: 'Despertar la vida latente en cada semilla.',
    mystical: 'Una semilla dormida es un universo en pausa. Al remojarla, pronuncias el mantra del agua sobre la tierra. Los inhibidores enzimáticos se disuelven como la niebla matutina sobre el lago Titicaca. Cada semilla activada es un niño que despierta con todos sus nutrientes biodisponibles, listos para nutrir tu consciencia.',
    color: 'from-emerald-950/20 to-emerald-900/5',
    border: 'border-emerald-500/20',
    accent: '#2EE59D',
  },
  {
    id: 'umami',
    name: 'Umami Vegetal',
    emoji: '✨',
    duration: '15-30 min',
    level: 'Fundamental',
    description: 'El quinto sabor: la esencia del placer consciente.',
    mystical: 'El umami es el idioma secreto que hablan los ingredientes entre sí. En el mundo plant-based, lo encuentras en el miso añejado, en el tomate confitado lentamente, en el alga kombu que ha bebido el océano durante años. Dominar el umami vegetal es aprender el lenguaje del sabor profundo, el que transforma una comida en una meditación.',
    color: 'from-amber-950/20 to-amber-900/5',
    border: 'border-amber-500/20',
    accent: '#F59E0B',
  },
  {
    id: 'ahumado',
    name: 'Ahumado en Frío',
    emoji: '💨',
    duration: '2-4 horas',
    level: 'Avanzado',
    description: 'Infusionar con el espíritu del fuego sin calor.',
    mystical: 'El humo es el elemento invisible que conecta el fuego con el aire. Ahumar en frío un trozo de tofu o unos champiñones es un ritual chamánico culinario. El humo de madera de cerezo o manzano no solo transforma el sabor, imprime memorias ancestrales en cada fibra del ingrediente. Es el beso del fuego sagrado.',
    color: 'from-sky-950/20 to-sky-900/5',
    border: 'border-sky-500/20',
    accent: '#0EA5E9',
  },
]

const COUNTRIES = [
  {
    id: 'peru',
    name: 'Perú',
    flag: '🇵🇪',
    level: 1,
    locked: false,
    xp: 250,
    challenge: {
      title: 'Ceviche de Champiñones y Camote Ancestral',
      description: 'La fusión perfecta del mar y la tierra andina, transformada en un festín plant-based de vibración altísima.',
      ingredients: ['King Oyster Mushrooms', 'Camote morado', 'Limón sutil', 'Ají amarillo', 'Leche de coco', 'Cebolla morada', 'Hierbabuena', 'Maíz cancha'],
      prepTime: '1 día de anticipación para marinar',
      cookTime: '30 minutos activos',
      pranaLevel: 4,
      difficulty: 'Intermedio',
    }
  },
  {
    id: 'mexico',
    name: 'México',
    flag: '🇲🇽',
    level: 2,
    locked: true,
    xp: 500,
    challenge: {
      title: 'Tacos de Barbacoa de Setas y Tortilla de Maíz Criollo',
      description: 'Una reverencia al espíritu sagrado del maíz de la milpa y a la alquimia de los condimentos tatemados a las brasas.',
      ingredients: ['Setas desmechadas', 'Maíz criollo para tortillas', 'Chiles guajillo', 'Cebolla asada', 'Ajo tatemado', 'Cilantro fresco', 'Limón verde', 'Aguacate'],
      prepTime: '45 minutos de tatemado y cocción',
      cookTime: '20 minutos activos',
      pranaLevel: 5,
      difficulty: 'Intermedio',
    }
  },
  {
    id: 'tailandia',
    name: 'Tailandia',
    flag: '🇹🇭',
    level: 3,
    locked: true,
    xp: 900,
    challenge: {
      title: 'Curry Verde Sattva de Vegetales y Galanga',
      description: 'Una meditación en movimiento que busca la armonía total entre lo dulce, salado, amargo, ácido y picante.',
      ingredients: ['Pasta de curry verde artesanal', 'Leche de coco fresca', 'Berenjena tailandesa', 'Hojas de lima kaffir', 'Hierba limón', 'Jengibre galanga', 'Albahaca sagrada', 'Tofu orgánico'],
      prepTime: '30 minutos de infusión de especias',
      cookTime: '15 minutos de ebullición suave',
      pranaLevel: 5,
      difficulty: 'Avanzado',
    }
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    level: 4,
    locked: true,
    xp: 1400,
    challenge: null,
  },
  {
    id: 'japon',
    name: 'Japón',
    flag: '🇯🇵',
    level: 5,
    locked: true,
    xp: 2000,
    challenge: null,
  },
]

// ============================================================
// COMPONENTES DE UI REUTILIZABLES
// ============================================================

function VegiButton({ children, onClick, variant = 'primary', className = '', disabled = false, id }) {
  const base = 'relative flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 select-none tap-active active:scale-95'
  const variants = {
    primary: 'bg-[var(--accent-mint)] text-[var(--bg-primary)] px-5 py-3 shadow-[0_0_20px_rgba(46,229,157,0.2)] hover:shadow-[0_0_30px_rgba(46,229,157,0.4)] hover:opacity-90',
    secondary: 'bg-[var(--bg-card)] border border-[var(--border-moss)] text-[var(--accent-mint)] px-5 py-3 hover:bg-[var(--bg-elevated)]',
    ghost: 'text-[var(--text-secondary)] px-4 py-2 hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
    mint: 'bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/30 text-[var(--accent-teal)] px-5 py-3 hover:bg-[var(--accent-teal)]/20',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-3 hover:bg-red-500/20',
  }
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  )
}

function VegiCard({ children, className = '', glow = false }) {
  return (
    <div className={`rounded-2xl bg-[var(--bg-card)] border border-[var(--border-moss)] ${glow ? 'border-glow-spiritual' : ''} ${className} text-[var(--text-primary)]`}>
      {children}
    </div>
  )
}

function Badge({ children, color = 'mint', className = '' }) {
  const colors = {
    mint: 'bg-[var(--accent-mint)]/10 text-[var(--accent-mint)] border-[var(--accent-mint)]/20',
    teal: 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/20',
    gold: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}

function PranaCircle({ value, size = 120 }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="rotate-[-90deg]">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-moss)" strokeWidth="6" />
        <defs>
          <linearGradient id="pranaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-mint)" />
            <stop offset="100%" stopColor="var(--accent-teal)" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="url(#pranaGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gradient-spiritual">{value}%</span>
        <span className="text-xs text-[var(--text-secondary)] mt-0.5">prana</span>
      </div>
    </div>
  )
}

// ============================================================
// PANTALLAS ESPECÍFICAS
// ============================================================

function DashboardScreen({ state, dispatch, isSyncing }) {
  const { streak, xp, level, pranaEnergy, streakBoosted } = state
  const xpForNextLevel = (level + 1) * 300
  const xpProgress = Math.min(((xp - (level * 300)) / 300) * 100, 100)
  const [showXPAnimate, setShowXPAnimate] = useState(false)

  useEffect(() => {
    setShowXPAnimate(true)
    const t = setTimeout(() => setShowXPAnimate(false), 800)
    return () => clearTimeout(t)
  }, [xp])

  const handleMeditationCheck = useCallback(() => {
    if (!streakBoosted) {
      dispatch({ type: 'BOOST_STREAK' })
    }
  }, [streakBoosted, dispatch])

  const levelTitles = [
    '', 'Chef de Planta Amnésico', 'Cocinero Consciente', 'Alquimista Vegetal',
    'Maestro del Prana', 'Guardián Sattva', 'Oráculo de la Tierra'
  ]

  return (
    <div className="flex flex-col gap-4 p-4 pb-2 animate-float-in">
      <div className="flex items-center justify-between pt-2 pr-12">
        <div>
          <p className="text-xs text-[var(--accent-teal)] font-semibold tracking-widest uppercase font-['Space_Grotesk'] flex items-center gap-1">
            Sadhana Diario 
            {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-mint)] animate-ping" />}
          </p>
          <h1 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Chef Martín 🌿</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-teal)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm shadow-md">
          L{level}
        </div>
      </div>

      <VegiCard glow={showXPAnimate} className={`p-4 transition-all duration-500 ${showXPAnimate ? 'scale-[1.02] border-[var(--accent-mint)]/40 shadow-lg' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Tu nivel actual</p>
            <h2 className="text-sm font-bold text-[var(--accent-mint)] mt-0.5">{levelTitles[level] || 'Maestro Vegi'}</h2>
          </div>
          <Badge color="mint"><Star size={10} /> Nivel {level}</Badge>
        </div>
        <div className="w-full h-3 bg-[var(--border-moss)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${xpProgress < 0 ? 0 : xpProgress}%`,
              background: 'linear-gradient(90deg, var(--accent-mint), var(--accent-teal))',
              boxShadow: '0 0 10px rgba(46, 229, 157, 0.4)'
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[var(--text-secondary)] font-medium">{xp} XP</span>
          <span className="text-xs text-[var(--text-secondary)]">→ Nivel {level + 1}: {xpForNextLevel} XP</span>
        </div>
      </VegiCard>

      <div className="grid grid-cols-3 gap-3">
        <VegiCard className="p-3 flex flex-col items-center gap-1">
          <div className="text-2xl">🔥</div>
          <span className="text-xl font-bold text-[var(--text-primary)]">{streak}</span>
          <span className="text-[10px] text-[var(--text-secondary)] text-center leading-tight">Racha</span>
        </VegiCard>

        <VegiCard className="p-3 flex flex-col items-center gap-1">
          <Zap size={22} className="text-[var(--accent-teal)]" />
          <span className="text-xl font-bold text-[var(--text-primary)]">{xp}</span>
          <span className="text-[10px] text-[var(--text-secondary)] text-center leading-tight">XP Total</span>
        </VegiCard>

        <VegiCard className="p-3 flex flex-col items-center gap-1">
          <Award size={22} className="text-[var(--accent-gold)]" />
          <span className="text-xl font-bold text-[var(--text-primary)]">{state.completedChallenges}</span>
          <span className="text-[10px] text-[var(--text-secondary)] text-center leading-tight">Retos</span>
        </VegiCard>
      </div>

      <VegiCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Leaf size={14} className="text-[var(--accent-mint)]" />
              <p className="text-xs text-[var(--accent-mint)] uppercase tracking-wider font-semibold">Energía Sattva / Prana</p>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-medium">Tu vitalidad de hoy</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {pranaEnergy >= 80 ? '✨ Frecuencia alta — Estás en sintonía total' :
               pranaEnergy >= 60 ? '🌿 Equilibrio moderado — Mantén el ritmo' :
               '🌱 Recargar — Ingiere alimentos vivos y agua'}
            </p>
            <div className="flex gap-2 mt-3">
              <Badge color="teal">🥗 {pranaEnergy >= 70 ? '3' : pranaEnergy >= 50 ? '2' : '1'} comidas conscientes</Badge>
            </div>
          </div>
          <PranaCircle value={pranaEnergy} size={100} />
        </div>
      </VegiCard>

      <VegiCard className={`p-4 ${streakBoosted ? 'border-[var(--accent-mint)]/40 bg-[var(--accent-mint)]/5' : ''}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🧘</span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Práctica Diaria Consciente</p>
            <p className="text-xs text-[var(--text-secondary)]">Medité y comí conscientemente hoy</p>
          </div>
        </div>
        {streakBoosted ? (
          <div className="flex items-center gap-2 bg-[var(--accent-mint)]/10 rounded-xl p-3">
            <Check size={16} className="text-[var(--accent-mint)]" />
            <span className="text-sm text-[var(--accent-mint)] font-medium">¡Racha incrementada! +1 día de consciencia 🌟</span>
          </div>
        ) : (
          <VegiButton
            id="btn-meditation-check"
            onClick={handleMeditationCheck}
            variant="primary"
            className="w-full"
          >
            <Sparkles size={16} />
            Registrar práctica de hoy
          </VegiButton>
        )}
      </VegiCard>

      <div className="rounded-2xl bg-gradient-to-br from-[var(--accent-mint)]/5 to-[var(--accent-teal)]/5 border border-[var(--accent-mint)]/10 p-4 mb-2">
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">✦ Sabiduría Vegi del Día</p>
        <p className="text-sm text-[var(--text-primary)] italic leading-relaxed">
          "La comida que preparas con consciencia porta tu frecuencia vibratoria. Cada picado es una oración, cada plato es un altar."
        </p>
        <p className="text-xs text-[var(--accent-mint)] mt-2">— El Oráculo Vegi</p>
      </div>
    </div>
  )
}

function OracleScreen({ state, dispatch }) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [activeSuggestions, setActiveSuggestions] = useState(VEGI_STRUCTURED_MOCKS.default.suggestions)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.chatMessages])

  const processResponsePayload = useCallback((payload) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'vegi', content: payload.message } })
    if (payload.suggestions) {
      setActiveSuggestions(payload.suggestions)
    }
  }, [dispatch])

  const simulateAIResponse = useCallback((userMsg) => {
    setIsTyping(true)
    const delay = 1200 + Math.random() * 800

    setTimeout(() => {
      const msg = userMsg.toLowerCase()
      let payload = VEGI_STRUCTURED_MOCKS.default

      if (msg.includes('palta') || msg.includes('aguacate')) payload = VEGI_STRUCTURED_MOCKS.palta
      else if (msg.includes('plátano') || msg.includes('platano') || msg.includes('banana')) payload = VEGI_STRUCTURED_MOCKS.platano
      else if (msg.includes('receta') || msg.includes('rápida') || msg.includes('rapida')) payload = VEGI_STRUCTURED_MOCKS.receta
      else if (msg.includes('quinua') || msg.includes('quinoa')) payload = VEGI_STRUCTURED_MOCKS.quinua
      else if (msg.includes('champiñon') || msg.includes('champinon') || msg.includes('hongo')) payload = VEGI_STRUCTURED_MOCKS.champiñon
      else if (msg.includes('ceviche')) payload = VEGI_STRUCTURED_MOCKS.default // fallback or specific ceviche text if added

      processResponsePayload(payload)
      setIsTyping(false)
    }, delay)
  }, [processResponsePayload])

  const handleSend = useCallback((textToSend) => {
    const targetText = typeof textToSend === 'string' ? textToSend : input
    const trimmed = targetText.trim()
    if (!trimmed) return

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content: trimmed } })
    setInput('')
    simulateAIResponse(trimmed)
  }, [input, dispatch, simulateAIResponse])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion)
  }

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false)
      const transcription = "Tengo palta, zapallo y quinua en mi nevera. Dame una receta peruana."
      
      const N8N_WHISPER_WEBHOOK = import.meta.env.VITE_N8N_WHISPER_URL;
      if (N8N_WHISPER_WEBHOOK && supabase) {
        try {
          fetch(N8N_WHISPER_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'default-user', audioSignedUrl: 'mock-signed-url' })
          });
        } catch(e) { console.error(e); }
      }

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content: `🎤 "${transcription}"` } })
      simulateAIResponse(transcription)
    } else {
      setIsRecording(true)
      setTimeout(() => {
        if (setIsRecording) setIsRecording(false)
      }, 5000)
    }
  }, [isRecording, dispatch, simulateAIResponse])

  const handlePhotoUpload = useCallback(async () => {
    setIsLoadingPhoto(true)
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'user', content: '📸 [Foto de mi refrigerador subida]', isImage: true }
    })

    const N8N_VISION_WEBHOOK = import.meta.env.VITE_N8N_VISION_URL;
    if (supabase && N8N_VISION_WEBHOOK) {
      try {
        fetch(N8N_VISION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'default-user', imageUrl: 'https://vegi.sh/mock-refrigerator.jpg', countryCode: 'PE' })
        });
      } catch(e) { console.error(e); }
    }

    setTimeout(() => {
      setIsLoadingPhoto(false)
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          role: 'vegi',
          content: '🔍 **Análisis de Nevera Completado**\n\nHe detectado los siguientes ingredientes de alta vibración:\n\n• 🥑 **Palta** (2 unidades, madurez óptima)\n• 🎃 **Zapallo macre** (ideal para bisque)\n• 🌾 **Quinua** (pre-activada, excelente)\n• 🍋 **Limones sutiles** (x6)\n• 🧄 **Ajo morado** (antibacteriano poderoso)\n• 🌿 **Hierbabuena fresca**\n\n¡Excelente despensa, Chef Martín! Con estos ingredientes podemos crear 4 recetas distintas de alta conciencia. ¿Cuál es tu estado energético ahora mismo?',
          isAnalysis: true
        }
      })
      setActiveSuggestions([
        "Hacer Bisque de Zapallo",
        "Hacer Tiradito de Palta",
        "Ver recetas de Quinua"
      ])
    }, 2500)
  }, [dispatch])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[var(--border-moss)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-teal)] flex items-center justify-center text-[var(--bg-primary)] text-lg">
            🌿
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] font-['Space_Grotesk']">El Oráculo Vegi</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
              <span className="text-xs text-[var(--accent-teal)]">Conexión espiritual activa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {state.chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-float-in`}>
            {msg.role === 'vegi' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-teal)] flex items-center justify-center text-[var(--bg-primary)] text-xs mr-2 flex-shrink-0 mt-auto">
                🌿
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--accent-teal)]/15 border border-[var(--accent-teal)]/20 text-[var(--text-primary)] rounded-br-sm'
                  : msg.isAnalysis
                    ? 'bg-[var(--bg-card)] border border-[var(--accent-mint)]/30 text-[var(--text-primary)] rounded-bl-sm shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-moss)] text-[var(--text-primary)] rounded-bl-sm'
              }`}
            >
              {msg.isImage && (
                <div className="w-full h-24 shimmer rounded-xl mb-2 flex items-center justify-center">
                  <span className="text-xs text-[var(--text-secondary)]">Procesando imagen mística...</span>
                </div>
              )}
              <div className="whitespace-pre-line prose prose-invert max-w-none text-[var(--text-primary)]">
                {msg.content.startsWith('###') ? (
                  // Renderizado estructurado simple para los mocks Markdown
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-[var(--accent-mint)] text-sm">{msg.content.split('\n\n')[0].replace('###', '')}</h4>
                    <p className="text-xs leading-relaxed">{msg.content.split('\n\n')[1]}</p>
                    {msg.content.split('\n\n')[2] && (
                      <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-moss)] text-[10px] text-[var(--text-secondary)]">
                        {msg.content.split('\n\n')[2]}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 animate-float-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-teal)] flex items-center justify-center text-[var(--bg-primary)] text-xs">
              🌿
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[var(--accent-mint)]"
                    style={{ animation: `typing-dot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoadingPhoto && (
          <div className="flex justify-center">
            <div className="bg-[var(--bg-card)] border border-[var(--accent-mint)]/20 rounded-full px-4 py-2 flex items-center gap-2">
              <RefreshCw size={12} className="text-[var(--accent-mint)] animate-spin" />
              <span className="text-xs text-[var(--accent-mint)]">Sintonizando ingredientes con IA...</span>
            </div>
          </div>
        )}
      </div>

      {/* Sugerencias Dinámicas Interactivas (De un solo toque) */}
      {!isTyping && !isLoadingPhoto && activeSuggestions.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 flex flex-col gap-1.5 border-t border-[var(--border-moss)] bg-[var(--bg-primary)]/50">
          <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-semibold">Sugerencias Contemplativas</p>
          <div className="flex flex-wrap gap-1.5">
            {activeSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-moss)] text-[var(--accent-teal)] text-[11px] px-2.5 py-1.5 rounded-full tap-active transition-all text-left font-medium"
              >
                ✦ {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRecording && (
        <div className="flex-shrink-0 mx-4 mb-2 bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-end h-8">
              {[12, 20, 28, 16, 24, 12, 20].map((h, i) => (
                <div key={i} className="wave-bar" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="text-xs text-[var(--accent-teal)] font-medium">Escuchando tu voz...</span>
          </div>
          <button onClick={handleRecord} className="text-[var(--accent-teal)] text-xs font-semibold tap-active">Detener</button>
        </div>
      )}

      <div className="flex-shrink-0 px-4 pb-2 flex gap-2">
        <button
          id="btn-upload-photo"
          onClick={handlePhotoUpload}
          disabled={isLoadingPhoto}
          className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-moss)] text-[var(--text-secondary)] text-xs px-3 py-2 rounded-xl tap-active hover:border-[var(--accent-mint)]/30 hover:text-[var(--accent-mint)] transition-all disabled:opacity-40"
        >
          <Camera size={14} />
          Foto nevera
        </button>
        <button
          id="btn-record-voice"
          onClick={handleRecord}
          className={`flex items-center gap-1.5 border text-xs px-3 py-2 rounded-xl tap-active transition-all ${
            isRecording
              ? 'bg-[var(--accent-teal)]/20 border-[var(--accent-teal)]/50 text-[var(--accent-teal)]'
              : 'bg-[var(--bg-card)] border-[var(--border-moss)] text-[var(--text-secondary)] hover:border-[var(--accent-teal)]/30 hover:text-[var(--accent-teal)]'
          }`}
        >
          <Mic size={14} />
          {isRecording ? 'Detener' : 'Audio'}
        </button>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2 px-4 pb-4">
        <div className="flex-1 flex items-center bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl px-4 py-2.5 focus-within:border-[var(--accent-mint)]/40 transition-colors">
          <input
            id="oracle-chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingredientes que tienes hoy..."
            className="flex-1 bg-transparent text-[var(--text-primary)] text-sm outline-none placeholder-gray-400"
          />
        </div>
        <button
          id="btn-send-chat"
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl bg-[var(--accent-mint)] flex items-center justify-center tap-active transition-all disabled:opacity-30 hover:opacity-90 shadow-md"
        >
          <Send size={16} className="text-[var(--bg-primary)]" />
        </button>
      </div>
    </div>
  )
}

function MapScreen({ state, dispatch, selectedCountry, setSelectedCountry }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [scores, setScores] = useState({ vegi: 8.5, introspection: 7, guest: 8 })
  const [uploading, setUploading] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [completingChallenge, setCompletingChallenge] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [checkedIngredients, setCheckedIngredients] = useState({})
  const [dbMetadata, setDbMetadata] = useState(null)

  // Consultar metadatos locales y APIs públicas para el país actualmente seleccionado
  const countryCode = selectedCountry?.id === 'peru' ? 'PE' : selectedCountry?.id === 'mexico' ? 'MX' : selectedCountry?.id === 'tailandia' ? 'TH' : 'PE'
  const searchQuery = selectedCountry?.id === 'peru' ? 'peru-nature' : selectedCountry?.id === 'mexico' ? 'mexico-nature' : 'thailand-nature'
  const wikiTitle = selectedCountry?.id === 'peru' ? 'Gastronomía_del_Perú' : selectedCountry?.id === 'mexico' ? 'Gastronomía_de_México' : 'Gastronomía_de_Tailandia'

  const media = useCountryMedia(countryCode, searchQuery, wikiTitle)

  // Fetch db metadata from Supabase
  useEffect(() => {
    async function fetchDbMetadata() {
      if (!supabase || !selectedCountry) return
      try {
        const { data, error } = await supabase
          .from('country_metadata')
          .select('*')
          .eq('country_code', countryCode)
          .single()
        if (!error && data) {
          setDbMetadata(data)
        }
      } catch (err) {
        console.error("Error fetching country db metadata:", err)
      }
    }
    fetchDbMetadata()
  }, [selectedCountry, countryCode])

  // Reset page states when switching countries
  useEffect(() => {
    setPhotoUploaded(false)
    setCheckedIngredients({})
  }, [selectedCountry])

  const handleCompleteChallenge = () => {
    setCompletingChallenge(true)

    if (supabase && selectedCountry) {
      try {
        supabase.from('food_evaluations').insert({
          user_id: 'default-user',
          country_code: countryCode,
          recipe_name: selectedCountry.challenge?.title || 'Reto Consagrado',
          user_score: scores.introspection,
          guest_score: scores.guest,
          ai_score: scores.vegi || 8.5
        }).then(() => {});
      } catch(e) { console.error(e); }
    }

    setTimeout(() => {
      dispatch({ type: 'COMPLETE_CHALLENGE', payload: { country: selectedCountry.id, xp: selectedCountry.xp || 250 } })
      setShowConfetti(true)
      
      // Vibración de victoria háptica (patrón triunfal)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200])
      }

      setCompletingChallenge(false)
      setTimeout(() => {
        setShowConfetti(false)
        setSelectedCountry(null)
      }, 2500)
    }, 1200)
  }

  const handlePhotoUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setPhotoUploaded(true)
      // Generar score del oráculo de forma mágica
      setScores(prev => ({ ...prev, vegi: (8.0 + Math.random() * 1.8).toFixed(1) }))
    }, 1800)
  }

  const toggleIngredient = (ing) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ing]: !prev[ing]
    }))
  }

  const ConfettiEffect = () => {
    const colors = ['#2EE59D', '#0EA5E9', '#F59E0B', '#A855F7', '#EF4444']
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute confetti-particle"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 40}%`,
              background: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.8 + Math.random() * 0.8}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center animate-star-burst">
            <div className="text-6xl mb-2">🕉️</div>
            <div className="text-2xl font-bold text-gradient-spiritual">+{selectedCountry?.xp || 250} XP</div>
            <div className="text-sm text-white mt-1">¡Nuevo Territorio Consagrado! 🌟</div>
          </div>
        </div>
      </div>
    )
  }

  const [mapSubTab, setMapSubTab] = useState('challenges') // 'challenges' | 'enciclopedia'
  const [localTab, setLocalTab] = useState('all') // 'all' | 'ingredients' | 'techniques'
  const [encQuery, setEncQuery] = useState('')
  const [searchingEnc, setSearchingEnc] = useState(false)
  const [encResults, setEncResults] = useState([])
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [wikiIngInfo, setWikiIngInfo] = useState({ summary: '', loading: false })

  const searchIngredientsInApis = async (query) => {
    if (!query.trim()) {
      setEncResults([])
      return
    }
    setSearchingEnc(true)
    try {
      // 1. Base local premium
      const mockIngredients = [
        { id: 11352, name: 'Papa Amarilla Nativa', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=350&auto=format&fit=crop', category: 'Tubérculos', origin: 'Andes', energy: 'Tamas / Sattva', level: 1, description: 'Tubérculo de enraizamiento profundo. Proporciona estabilidad y carbohidratos complejos.' },
        { id: 9901, name: 'Activación de Granos', isTech: true, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=350&auto=format&fit=crop', category: 'Técnica Alquímica', origin: 'Universal', energy: 'Sattva Máximo', level: 1, description: 'Remojo en medio ácido para desactivar antinutrientes (ácido fítico) y liberar enzimas vitales.' },
        { id: 12104, name: 'Coco Rallado Orgánico', image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?q=80&w=350&auto=format&fit=crop', category: 'Frutos Secos', origin: 'Tailandia', energy: 'Sattva', level: 2, description: 'Aporta grasas nobles que lubrican los tejidos y calman el exceso de fuego (Pitta).' },
        { id: 11216, name: 'Jengibre Sagrado (Khing)', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=350&auto=format&fit=crop', category: 'Especias', origin: 'Sudoeste de Asia', energy: 'Rajas / Sattva', level: 2, description: 'Raíz ígnea que enciende el Agni (fuego digestivo) y purifica las toxinas acumuladas.' },
        { id: 20081, name: 'Harina de Quinua Real', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=350&auto=format&fit=crop', category: 'Granos Ancestrales', origin: 'Andes del Perú', energy: 'Sattva Máximo', level: 3, description: 'Grano sagrado rico en lisina y aminoácidos esenciales, secado al sol.' },
        { id: 11962, name: 'Champiñón Shiitake Silvestre', image: 'https://images.unsplash.com/photo-1579619077671-5509746f332c?q=80&w=350&auto=format&fit=crop', category: 'Hongos', origin: 'Asia Oriental', energy: 'Sattva', level: 3, description: 'Hongo que conecta con la sabiduría de la tierra. Potente modulador inmunológico.' },
        { id: 12555, name: 'Mijo Pelado Orgánico', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=350&auto=format&fit=crop', category: 'Granos Ancestrales', origin: 'América del Norte / Asia', energy: 'Sattva', level: 1, description: 'El mijo es un grano antiguo libre de gluten, sumamente alcalinizante y de muy fácil digestión.', tips: 'Lávalo bien antes de hervir. Queda delicioso como base cremosa en desayunos o sustituto de arroz.' },
        { id: 9902, name: 'Fermentación Láctica', isTech: true, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=350&auto=format&fit=crop', category: 'Técnica Alquímica', origin: 'Europa / Asia', energy: 'Sattva Máximo', level: 3, description: 'Transmutación biológica mediante lactobacterias que sintetizan vitaminas y mejoran microbiota digestiva.' }
      ]

      // Filtrar resultados locales
      const localFiltered = mockIngredients.filter(i => 
        i.name.toLowerCase().includes(query.toLowerCase()) || 
        i.category.toLowerCase().includes(query.toLowerCase())
      )

      // 2. Consulta dinámica a Open Food Facts API (Soporta millones de ingredientes y trae fotos reales)
      let apiItems = []
      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v2/search?categories_tags=plant-based-foods-and-beverages&generic_name_es=${encodeURIComponent(query)}&fields=code,product_name,image_url,categories,origins,countries,generic_name,brands&limit=6`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.products && data.products.length > 0) {
            apiItems = data.products
              .filter(p => p.product_name && p.product_name.trim() !== '')
              .map((p, idx) => {
                const category = p.categories_tags?.[0]?.replace('en:', '')?.replace('-', ' ') || 'Alimento'
                return {
                  id: p.id || `off-${idx}-${Date.now()}`,
                  name: p.product_name,
                  image: p.image_url || 'https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=350', // fallback vegetal
                  category: category.charAt(0).toUpperCase() + category.slice(1),
                  origin: p.origins || p.countries || 'Global',
                  energy: 'Sattva / Prana Neutro',
                  level: 1,
                  description: `Insumo vegetal consultado en la red global: ${p.generic_name || 'Ingrediente natural de alimentación conscientiente.'}`,
                  tips: `Ideal para incorporar en recetas plant-based. Marca registrada: ${p.brands || 'Natural'}.`
                }
              })
          }
        }
      } catch (err) {
        console.warn("Open Food Facts API no disponible:", err)
      }

      // Mezclar resultados locales con los de la API externa
      const mergedResults = [...localFiltered, ...apiItems]
      
      // Remover duplicados por nombre
      const uniqueResults = []
      const namesSeen = new Set()
      for (const item of mergedResults) {
        const nameKey = item.name.toLowerCase().trim()
        if (!namesSeen.has(nameKey)) {
          namesSeen.add(nameKey)
          uniqueResults.push(item)
        }
      }

      setEncResults(uniqueResults)
    } catch (e) {
      console.error(e)
    } finally {
      setSearchingEnc(false)
    }
  }

  // Buscar en Wikipedia información del ingrediente seleccionado
  const fetchWikipediaIngredientDetail = async (ingName) => {
    setWikiIngInfo({ summary: '', loading: true })
    try {
      const wikiRes = await fetch(
        `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(ingName)}&format=json&origin=*`
      )
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json()
        const pages = wikiData?.query?.pages
        if (pages) {
          const pageId = Object.keys(pages)[0]
          const summary = pages[pageId]?.extract || `El ${ingName} es un insumo botánico fundamental en las cocinas del mundo, valorado tanto por sus propiedades gastronómicas como nutricionales.`
          setWikiIngInfo({ summary, loading: false })
          return
        }
      }
      setWikiIngInfo({ summary: `Detalles enciclopédicos sobre ${ingName} listos para asimilar culinariamente.`, loading: false })
    } catch (e) {
      setWikiIngInfo({ summary: 'No se pudo invocar el extracto de Wikipedia en este momento.', loading: false })
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchIngredientsInApis(encQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [encQuery])

  return (
    <div className="relative flex flex-col p-4 gap-4 animate-float-in pb-4 min-h-full">
      {showConfetti && <ConfettiEffect />}

      {/* Cabecera de Stats de Alto Impacto */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-moss)] px-4 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Racha</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{state.streak} Días</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">⭐</span>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Experiencia</p>
            <p className="text-sm font-bold text-[var(--accent-gold)]">{state.xp} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🌀</span>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Nivel</p>
            <p className="text-sm font-bold text-[var(--accent-mint)]">Lvl {state.level}</p>
          </div>
        </div>
      </div>

      {/* Selectores de Sub-Módulo */}
      <div className="flex bg-[var(--bg-card)] border border-[var(--border-moss)] p-1 rounded-xl">
        <button
          onClick={() => { setMapSubTab('challenges'); setSelectedIngredient(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mapSubTab === 'challenges' 
              ? 'bg-[var(--accent-mint)] text-[var(--bg-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span>🗺️</span> Retos de Países
        </button>
        <button
          onClick={() => setMapSubTab('enciclopedia')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mapSubTab === 'enciclopedia' 
              ? 'bg-[var(--accent-mint)] text-[var(--bg-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen size={13} /> Enciclopedia Ancestral
        </button>
      </div>

      {mapSubTab === 'challenges' ? (
        <>
          <div className="pt-1 text-left">
            <p className="text-xs text-[var(--accent-teal)] uppercase tracking-widest font-semibold font-['Space_Grotesk']">Peregrinación Sagrada</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Mapamundi de Retos 🗺️</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Sube el prana y desbloquea el conocimiento de cada territorio</p>
          </div>

          {/* Mini-esquema de mapa estilizado (Ruta de Nivel) */}
          <VegiCard className="p-4 flex items-center justify-around bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-elevated)] border border-[var(--border-moss)]">
            {COUNTRIES.map((c, idx) => {
              const isUnlocked = state.unlockedCountries.includes(c.id)
              const isCurrent = activeSlide === idx
              return (
                <div key={c.id} className="flex items-center gap-1">
                  <button
                    onClick={() => isUnlocked ? setActiveSlide(idx) : null}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all tap-active relative ${
                      isCurrent 
                        ? 'ring-2 ring-[var(--accent-mint)] scale-110 shadow-md bg-[var(--bg-elevated)] border-none' 
                        : isUnlocked 
                          ? 'bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/40 hover:bg-[var(--accent-teal)]/20' 
                          : 'bg-transparent border border-dashed border-[var(--border-moss)] opacity-40 grayscale pointer-events-none'
                    }`}
                  >
                    {c.flag}
                    {!isUnlocked && (
                      <div className="absolute -top-1 -right-1 bg-black/60 rounded-full p-0.5 border border-[var(--border-moss)]">
                        <Lock size={8} className="text-gray-400" />
                      </div>
                    )}
                  </button>
                  {idx < COUNTRIES.length - 1 && (
                    <span className={`text-[10px] font-bold ${isUnlocked && state.unlockedCountries.includes(COUNTRIES[idx+1].id) ? 'text-[var(--accent-mint)]' : 'text-gray-600 opacity-30'}`}>➔</span>
                  )}
                </div>
              )
            })}
          </VegiCard>

          {/* Carrusel de Países en Tarjetas Parallax */}
          <div className="relative overflow-hidden py-2">
            {(() => {
              const country = COUNTRIES[activeSlide] || COUNTRIES[0]
              const isUnlocked = state.unlockedCountries.includes(country.id)
              
              return (
                <div className="w-full transition-all duration-500 animate-float-in">
                  <VegiCard className={`relative overflow-hidden h-72 flex flex-col justify-end p-5 transition-all duration-700 ${!isUnlocked ? 'grayscale opacity-75' : 'border-glow-spiritual'}`}>
                    {/* Imagen del País con efecto degradado difuminado */}
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] hover:scale-105"
                      style={{ backgroundImage: `url(${
                        country.id === 'peru' 
                          ? 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600' 
                          : country.id === 'mexico'
                            ? 'https://images.unsplash.com/photo-1512813583145-baaa340ef29f?q=80&w=600'
                            : 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=600'
                      })` }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="relative z-10 flex flex-col gap-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <span className="text-[10px] text-[var(--accent-teal)] font-bold uppercase tracking-wider">Territorio {activeSlide + 1}</span>
                          <h3 className="text-lg font-black text-white font-['Space_Grotesk']">{country.name}</h3>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                        {country.id === 'peru' 
                          ? 'Explora el templo de la Pachamama y los insumos de los Andes sagrados.'
                          : country.id === 'mexico'
                            ? 'Conéctate con la espiritualidad del maíz y los secretos culinarios del fuego.'
                            : 'Transmuta tu cocina a través de la meditación budista de los cinco sabores sagrados.'}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-[var(--accent-gold)] font-medium">+{country.xp} XP disponibles</span>
                        <button
                          onClick={() => setSelectedCountry(country)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold tap-active transition-all duration-300 ${
                            isUnlocked 
                              ? 'bg-[var(--accent-mint)] text-[var(--bg-primary)] shadow-md hover:shadow-lg scale-100 hover:scale-102' 
                              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                          }`}
                          disabled={!isUnlocked}
                        >
                          {isUnlocked ? 'Iniciar Sadhana' : 'Bloqueado'}
                        </button>
                      </div>
                    </div>
                  </VegiCard>
                </div>
              )
            })()}
          </div>
        </>
      ) : (
        // ============================================================
        // VISTA DE LA ENCICLOPEDIA / DICCIONARIO ANCESTRAL MEJORADA
        // ============================================================
        <div className="flex flex-col gap-4 animate-float-in text-left">
          
          {/* Misión Diaria de Dopamina */}
          <div className="bg-gradient-to-r from-[var(--accent-mint)]/20 via-[var(--accent-teal)]/10 to-[var(--bg-card)] border border-[var(--accent-mint)]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-mint)]/5 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] text-[var(--accent-mint)] font-bold uppercase tracking-widest bg-[var(--accent-mint)]/10 border border-[var(--accent-mint)]/20 px-2 py-0.5 rounded-md">Revelación Pránica Diaria 🌟</span>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1.5 font-['Space_Grotesk']">¿El poder curativo del Jengibre?</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">Completa la lectura y descubre cómo el Khing enciende tu fuego digestivo (Agni) para ganar experiencia cósmica.</p>
            <button
              onClick={() => {
                const target = {
                  id: 11216,
                  name: 'Jengibre Sagrado (Khing)',
                  image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=350&auto=format&fit=crop',
                  category: 'Especias',
                  origin: 'Sudoeste de Asia',
                  energy: 'Rajas / Sattva',
                  reqLevel: 1,
                  description: 'Raíz ígnea que enciende el Agni (fuego digestivo) y purifica las toxinas acumuladas de tejidos corporales.',
                  tips: 'Tómalo rallado en infusión tibia antes del almuerzo para activar tu sistema pránico basal.'
                };
                setSelectedIngredient(target);
                fetchWikipediaIngredientDetail(target.name);
              }}
              className="mt-3 bg-[var(--bg-primary)] hover:bg-[var(--accent-mint)] hover:text-black border border-[var(--border-moss)] text-xs text-[var(--accent-mint)] px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 w-max shadow-sm"
            >
              <span>📖</span> Leer y Recibir Sabiduría
            </button>
          </div>

          <div className="pt-1">
            <p className="text-xs text-[var(--accent-gold)] uppercase tracking-widest font-semibold font-['Space_Grotesk']">Santuario Culinario</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Biblioteca de Aprendizaje 📚</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Busca y domina técnicas e ingredientes ancestrales plant-based.</p>
          </div>

          {/* Sub-selectores dentro de la Enciclopedia para dividir Insumos de Técnicas */}
          {(() => {
            // Todos los ingredientes y técnicas unificados
            const premiumItems = [
              { id: 9003, name: 'Manzana Silvestre', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=350&auto=format&fit=crop', category: 'Frutas', origin: 'Región Templada', energy: 'Sattva', level: 1, description: 'Representa la vitalidad y el frescor pránico. Excelente regulador de digestión.' },
              { id: 11352, name: 'Papa Amarilla Nativa', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=350&auto=format&fit=crop', category: 'Tubérculos', origin: 'Andes', energy: 'Tamas / Sattva', level: 1, description: 'Tubérculo de enraizamiento profundo. Proporciona estabilidad y carbohidratos complejos.' },
              { id: 9901, name: 'Activación de Granos', isTech: true, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=350&auto=format&fit=crop', category: 'Técnica Alquímica', origin: 'Universal', energy: 'Sattva Máximo', level: 1, description: 'Remojo en medio ácido para desactivar antinutrientes (ácido fítico) y liberar enzimas vitales.' },
              { id: 12104, name: 'Coco Rallado Orgánico', image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?q=80&w=350&auto=format&fit=crop', category: 'Frutos Secos', origin: 'Tailandia', energy: 'Sattva', level: 2, description: 'Aporta grasas nobles que lubrican los tejidos y calman el exceso de fuego (Pitta).' },
              { id: 11216, name: 'Jengibre Sagrado (Khing)', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=350&auto=format&fit=crop', category: 'Especias', origin: 'Sudoeste de Asia', energy: 'Rajas / Sattva', level: 2, description: 'Raíz ígnea que enciende el Agni (fuego digestivo) y purifica las toxinas acumuladas.' },
              { id: 20081, name: 'Harina de Quinua Real', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=350&auto=format&fit=crop', category: 'Granos Ancestrales', origin: 'Andes del Perú', energy: 'Sattva Máximo', level: 3, description: 'Grano sagrado rico en lisina y aminoácidos esenciales, secado al sol.' },
              { id: 11962, name: 'Champiñón Shiitake Silvestre', image: 'https://images.unsplash.com/photo-1579619077671-5509746f332c?q=80&w=350&auto=format&fit=crop', category: 'Hongos', origin: 'Asia Oriental', energy: 'Sattva', level: 3, description: 'Hongo que conecta con la sabiduría de la tierra. Potente modulador inmunológico.' },
              { id: 9902, name: 'Fermentación Láctica', isTech: true, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=350&auto=format&fit=crop', category: 'Técnica Alquímica', origin: 'Europa / Asia', energy: 'Sattva Máximo', level: 3, description: 'Transmutación biológica mediante lactobacterias que sintetizan vitaminas y mejoran microbiota digestiva.' }
            ]

            // Si hay búsqueda activa, agregar los ingredientes consultados por la API
            const allDatabaseItems = encQuery.trim() !== '' ? encResults : premiumItems

            // Filtrar según el input de búsqueda global y según la pestaña local seleccionada
            const filteredItems = allDatabaseItems.filter(item => {
              const matchesTab = localTab === 'all' || 
                (localTab === 'ingredients' && !item.isTech) || 
                (localTab === 'techniques' && item.isTech)

              return matchesTab
            })

            return (
              <>
                {/* Micro Tabs Internos */}
                <div className="flex bg-[var(--bg-primary)] border border-[var(--border-moss)] p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setLocalTab('all')}
                    className={`flex-1 py-1 rounded transition-all ${localTab === 'all' ? 'bg-[var(--accent-teal)]/20 text-[var(--accent-teal)]' : 'text-gray-400'}`}
                  >
                    Todos ({filteredItems.length})
                  </button>
                  <button
                    onClick={() => setLocalTab('ingredients')}
                    className={`flex-1 py-1 rounded transition-all ${localTab === 'ingredients' ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]' : 'text-gray-400'}`}
                  >
                    🌾 Insumos
                  </button>
                  <button
                    onClick={() => setLocalTab('techniques')}
                    className={`flex-1 py-1 rounded transition-all ${localTab === 'techniques' ? 'bg-[var(--accent-mint)]/20 text-[var(--accent-mint)]' : 'text-gray-400'}`}
                  >
                    🧠 Técnicas
                  </button>
                </div>

                {/* Input de Búsqueda */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={encQuery}
                    onChange={(e) => setEncQuery(e.target.value)}
                    placeholder="Buscar quinua, jengibre, coco, miso..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-gray-500 outline-none focus:border-[var(--accent-mint)]/40 transition-colors shadow-inner"
                  />
                </div>

                {/* Lista de Resultados Agrupados por Nivel */}
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(lvl => {
                    const groupItems = filteredItems.filter(i => i.level === lvl)
                    if (groupItems.length === 0) return null

                    const title = lvl === 1 
                      ? 'Nivel 1 — Neófito Culinario 🥔' 
                      : lvl === 2 
                        ? 'Nivel 2 — Iniciado de la Tierra 🥥' 
                        : 'Nivel 3 — Alquimista del Prana 🌾'

                    return (
                      <div key={lvl} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[var(--accent-gold)] tracking-wider font-bold uppercase">{title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {groupItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedIngredient(item)
                                fetchWikipediaIngredientDetail(item.name)
                              }}
                              className="bg-[var(--bg-card)] border border-[var(--border-moss)] hover:border-[var(--accent-mint)]/30 rounded-2xl p-3 flex flex-col gap-2 transition-all text-left shadow-sm relative overflow-hidden tap-active"
                            >
                              <div className="flex items-center justify-between z-10">
                                <span className="text-[9px] text-[var(--accent-teal)] font-bold uppercase tracking-wider">
                                  {item.isTech ? '🧠 Técnica' : item.category}
                                </span>
                                <Badge color={item.energy.includes('Máximo') ? 'mint' : 'gold'}>{item.energy}</Badge>
                              </div>
                              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate z-10">{item.name}</h4>
                              <p className="text-[9px] text-[var(--text-secondary)] font-medium z-10">📍 {item.origin}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  
                  {filteredItems.length === 0 && (
                    <div className="py-8 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border border-dashed border-[var(--border-moss)] rounded-2xl">
                      No se encontraron resultados para tu búsqueda.
                    </div>
                  )}
                </div>
              </>
            )
          })()}
          {/* Tarjeta de Detalle del ingrediente seleccionado */}
          {selectedIngredient && (
            <VegiCard glow className="p-4 border-[var(--accent-mint)]/20 flex flex-col gap-3 animate-float-in mt-2 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-elevated)]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] text-[var(--accent-mint)] font-bold uppercase tracking-widest">{selectedIngredient.category}</span>
                  <h3 className="text-base font-black text-[var(--text-primary)] font-['Space_Grotesk'] mt-0.5">{selectedIngredient.name}</h3>
                </div>
                <button onClick={() => setSelectedIngredient(null)} className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400">
                  <X size={12} />
                </button>
              </div>

              {/* Imagen Gastronómica Dynamic */}
              <div className="h-32 w-full rounded-xl overflow-hidden relative border border-[var(--border-moss)]/50">
                <img 
                  src={selectedIngredient.image} 
                  alt={selectedIngredient.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[8px] text-gray-300">Fotografía botánica de alta resolución</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[var(--border-moss)]/50">
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase">Zona de Origen</span>
                  <p className="font-bold text-[var(--text-primary)]">{selectedIngredient.origin}</p>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase">Fuerza Cósmica (Prana)</span>
                  <p className="font-bold text-[var(--accent-gold)]">{selectedIngredient.energy}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-[var(--accent-teal)] font-bold uppercase tracking-wider block mb-1">Propiedades y Misticismo</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  "{selectedIngredient.description}"
                </p>
                {selectedIngredient.tips && (
                  <p className="text-[10px] text-[var(--accent-mint)] leading-relaxed mt-1 font-semibold">
                    💡 Tips: {selectedIngredient.tips}
                  </p>
                )}
              </div>

              <div className="bg-[var(--bg-primary)] border border-[var(--border-moss)] rounded-xl p-3">
                <span className="text-[9px] text-[var(--accent-mint)] font-bold uppercase tracking-wider block mb-1">Extracción Enciclopédica (Wikipedia)</span>
                {wikiIngInfo.loading ? (
                  <div className="py-2 text-center flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <RefreshCw size={10} className="animate-spin text-[var(--accent-mint)]" />
                    <span>Invocando sabiduría colectiva...</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                    {wikiIngInfo.summary}
                  </p>
                )}
              </div>

              {/* Botón de gamificación para consagrar lectura */}
              <button
                onClick={() => {
                  dispatch({ type: 'COMPLETE_CHALLENGE', payload: { country: 'none', xp: 20 } })
                  // Efecto Confeti local
                  setShowConfetti(true)
                  setTimeout(() => setShowConfetti(false), 2000)
                  setSelectedIngredient(null)
                }}
                className="w-full bg-[var(--accent-mint)] text-[var(--bg-primary)] font-black text-xs py-3 rounded-xl tap-active transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>☯️</span> Consagrar Sabiduría (+20 XP)
              </button>
            </VegiCard>
          )}
        </div>
      )}

      {/* Portal del País (Ficha Inmersiva - Vista de Pantalla Completa) */}
      {selectedCountry && (
        <div className="absolute top-0 left-0 right-0 bottom-20 z-40 bg-[var(--bg-primary)] flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Cabecera / Hero Banner */}
          <div className="relative h-60 w-full flex-shrink-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${media.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/30 to-transparent" />
            
            {/* Botón de Regresar */}
            <button 
              onClick={() => setSelectedCountry(null)}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 border border-white/15 tap-active z-50 transition-all flex items-center justify-center"
              title="Volver al mapa"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>

            {/* Título flotante sobre la foto */}
            <div className="absolute bottom-4 left-6 right-6 text-left">
              <div className="flex items-center gap-3">
                <img src={media.flagUrl} alt={selectedCountry.name} className="w-12 h-8 object-cover rounded-lg shadow-md border border-white/20" />
                <div>
                  <span className="text-[10px] text-[var(--accent-mint)] font-bold tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Portal Ancestral</span>
                  <h2 className="text-2xl font-black text-white font-['Space_Grotesk'] drop-shadow-md mt-0.5">{selectedCountry.name}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de la Ficha */}
          <div className="px-5 py-6 flex flex-col gap-6 text-left bg-[var(--bg-primary)]">
            
            {/* Bloque Geográfico (REST Countries API) */}
            <div className="grid grid-cols-2 gap-3 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl p-4 shadow-sm">
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Capital</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{media.capital}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Moneda</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{media.currency}</p>
              </div>
              <div className="pt-2 border-t border-[var(--border-moss)]/50">
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Idiomas</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 truncate">{media.languages}</p>
              </div>
              <div className="pt-2 border-t border-[var(--border-moss)]/50">
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Población</p>
                <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{media.population}</p>
              </div>
            </div>

            {/* Misticismo y Espiritualidad (Supabase Metadata) */}
            <div>
              <h3 className="text-xs text-[var(--accent-gold)] uppercase tracking-widest font-bold font-['Space_Grotesk'] flex items-center gap-1.5">
                <span>🕉️</span> {dbMetadata?.spiritual_concept || 'Concepto Espiritual'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5 italic bg-[var(--bg-card)] border border-[var(--border-moss)] p-3.5 rounded-2xl">
                "{dbMetadata?.spiritual_description || 'Invocando los secretos de este territorio en la base de datos...'}"
              </p>
            </div>

            {/* Historia Gastronómica (Wikipedia + Supabase Metadata) */}
            <div>
              <h3 className="text-xs text-[var(--accent-teal)] uppercase tracking-widest font-bold font-['Space_Grotesk'] flex items-center gap-1.5">
                <span>📖</span> Sabiduría Culinaria y Orígenes
              </h3>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed mt-2 bg-[var(--bg-card)] border border-[var(--border-moss)] p-3.5 rounded-2xl">
                {dbMetadata?.gastronomic_history || 'Cargando registros históricos ancestrales...'}
              </p>
              
              {/* Resumen dinámico Wikipedia */}
              <div className="mt-3 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-[var(--accent-teal)] font-bold tracking-widest uppercase">Wikipedia OpenSearch</span>
                  <Badge color="teal">Sincronizado</Badge>
                </div>
                {media.loading ? (
                  <div className="py-4 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-[var(--accent-teal)]" />
                    <span>Invocando extracto...</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-5">
                    {media.wikiSummary}
                  </p>
                )}
              </div>
            </div>

            {/* Sadhana / Challenge Activo */}
            {selectedCountry.challenge ? (
              <div className="border border-[var(--accent-mint)]/30 bg-gradient-to-b from-[var(--accent-mint)]/5 to-[var(--bg-card)] rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] text-[var(--accent-mint)] font-bold tracking-widest uppercase">Reto Consagrado</span>
                    <h4 className="text-sm font-black text-[var(--text-primary)] font-['Space_Grotesk'] mt-0.5">{selectedCountry.challenge.title}</h4>
                  </div>
                  <Badge color="mint">+{selectedCountry.xp} XP</Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{selectedCountry.challenge.description}</p>
                
                {/* Ingredientes / Insumos checklist */}
                <div className="mb-4 text-left">
                  <p className="text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-bold mb-2">Insumos Sagrados Requeridos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCountry.challenge.ingredients?.map((ing) => {
                      const isChecked = !!checkedIngredients[ing]
                      return (
                        <button
                          key={ing}
                          onClick={() => toggleIngredient(ing)}
                          className={`flex items-center gap-2 text-left p-2 rounded-xl border transition-all text-[11px] tap-active ${
                            isChecked
                              ? 'bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/40 text-[var(--accent-mint)] font-bold shadow-sm'
                              : 'bg-[var(--bg-elevated)] border-[var(--border-moss)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] border transition-all ${
                            isChecked ? 'border-[var(--accent-mint)] bg-[var(--accent-mint)] text-black' : 'border-gray-500'
                          }`}>
                            {isChecked && '✓'}
                          </span>
                          <span className="truncate">{ing}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge color="teal"><Clock size={9} /> {selectedCountry.challenge.prepTime}</Badge>
                  <Badge color="gold"><Zap size={9} /> Prana {selectedCountry.challenge.pranaLevel}/5</Badge>
                </div>

                {/* Foto Subida & Scoring */}
                <div className="border-t border-[var(--border-moss)]/40 pt-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Foto de tu Alquimia</span>
                    <button
                      onClick={handlePhotoUpload}
                      disabled={uploading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 tap-active transition-all ${
                        photoUploaded
                          ? 'bg-[var(--accent-mint)]/20 text-[var(--accent-mint)] border border-[var(--accent-mint)]/30 shadow-sm'
                          : 'bg-[var(--bg-elevated)] border border-[var(--border-moss)] text-[var(--text-primary)] hover:border-[var(--accent-mint)]/30'
                      }`}
                    >
                      {uploading ? (
                        <><RefreshCw size={12} className="animate-spin" /> Subiendo...</>
                      ) : photoUploaded ? (
                        <><Check size={12} /> Subida exitosa</>
                      ) : (
                        <><Camera size={12} /> Subir Foto</>
                      )}
                    </button>
                  </div>

                  {/* Evaluaciones de Scoring */}
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[var(--text-secondary)] font-medium">Auto-Introspección (Tu Score)</span>
                        <span className="text-[var(--accent-mint)] font-bold">{scores.introspection}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={scores.introspection}
                        onChange={(e) => setScores(prev => ({ ...prev, introspection: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-[var(--border-moss)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-mint)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[var(--text-secondary)] font-medium">Frecuencia Huéspedes (Sabor)</span>
                        <span className="text-[var(--accent-gold)] font-bold">{scores.guest}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={scores.guest}
                        onChange={(e) => setScores(prev => ({ ...prev, guest: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-[var(--border-moss)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-gold)]"
                      />
                    </div>

                    {photoUploaded && (
                      <div className="flex justify-between items-center bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 p-2.5 rounded-xl animate-float-in">
                        <span className="text-[11px] text-[var(--accent-teal)] font-bold">Resonancia del Oráculo (IA)</span>
                        <span className="text-xs font-black text-[var(--accent-teal)]">{scores.vegi} / 10 🔮</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCompleteChallenge}
                    disabled={completingChallenge}
                    className="w-full mt-2 bg-[var(--accent-mint)] hover:bg-[var(--accent-mint)]/90 text-[var(--bg-primary)] font-black text-sm py-3.5 rounded-2xl tap-active transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {completingChallenge ? (
                      <><RefreshCw size={14} className="animate-spin" /> Consagrando Sadhana...</>
                    ) : (
                      <>🕉️ Consagrar Territorio y Desbloquear</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-moss)] rounded-2xl p-6 text-center shadow-sm">
                <Lock size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-[var(--text-secondary)]">Este territorio está desbloqueado, pero su templo de retos se abrirá en la próxima alineación cósmica.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


function KitchenScreen() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [localIngredients, setLocalIngredients] = useState([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)

  // Cargar ingredientes del "Santuario de Insumos" de Supabase
  useEffect(() => {
    async function loadInsumos() {
      if (!supabase) return
      try {
        setLoadingIngredients(true)
        const { data, error } = await supabase
          .from('local_ingredients')
          .select('*')
        if (!error && data) {
          setLocalIngredients(data)
        }
      } catch (e) {
        console.error("Error al cargar insumos místicos:", e)
      } finally {
        setLoadingIngredients(false)
      }
    }
    loadInsumos()
  }, [])

  const filteredTechniques = COOKING_TECHNIQUES.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLocalIngredients = localIngredients.filter(ing =>
    ing.name_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ing.tips_alquimia && ing.tips_alquimia.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-4 p-4 pb-2 animate-float-in">
      <div className="pt-2">
        <p className="text-xs text-[var(--accent-teal)] uppercase tracking-widest font-semibold font-['Space_Grotesk']">Alquimia en Acción</p>
        <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Mi Cocina Sagrada 🔪</h2>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar size={14} className="text-[var(--accent-mint)]" />
            Sadhanas Semanal — Perú
          </h3>
          <Badge color="mint">Semana actual</Badge>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
            {WEEKLY_MEALS.map((meal, idx) => (
              <button
                key={meal.day}
                id={`day-card-${meal.day.toLowerCase()}`}
                onClick={() => setSelectedDay(selectedDay?.day === meal.day ? null : meal)}
                className={`flex-shrink-0 w-32 rounded-2xl p-3 text-left transition-all tap-active border ${
                  selectedDay?.day === meal.day
                    ? 'border-[var(--accent-mint)]/60 bg-[var(--accent-mint)]/10 shadow-sm'
                    : idx === 6
                      ? 'border-[var(--border-moss)] bg-[var(--bg-elevated)]'
                      : 'border-[var(--border-moss)] bg-[var(--bg-card)] hover:border-[var(--border-moss)]/60'
                }`}
              >
                <p className="text-lg mb-1">{meal.emoji}</p>
                <p className={`text-xs font-bold mb-1 ${selectedDay?.day === meal.day ? 'text-[var(--accent-mint)]' : 'text-[var(--text-secondary)]'}`}>{meal.day}</p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{meal.recipe}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedDay && (
          <VegiCard glow className="p-4 mt-3 animate-float-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedDay.emoji}</span>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">{selectedDay.day}unes</p>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{selectedDay.recipe}</h4>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedDay.detail}</p>
            <div className="flex gap-2 mt-3">
              <Badge color="teal"><Clock size={9} /> 35-45 min</Badge>
              <Badge color="mint"><Zap size={9} /> Vitalidad sattva</Badge>
            </div>
          </VegiCard>
        )}
      </div>

      {/* Santuario de Insumos Locales de Supabase */}
      {searchTerm.trim() !== '' && filteredLocalIngredients.length > 0 && (
        <div className="flex flex-col gap-2 animate-float-in">
          <h3 className="text-xs text-[var(--accent-gold)] uppercase tracking-widest font-bold">✨ Insumos Ancestrales Detectados</h3>
          {filteredLocalIngredients.map(ing => (
            <VegiCard key={ing.id} className="p-4 border-[var(--accent-gold)]/20 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)]">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{ing.name_local}</h4>
                <Badge color="gold">Prana: {ing.energia_sattva}</Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-2 italic">"{ing.historia_ancestral}"</p>
              <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-moss)]">
                <p className="text-[10px] text-[var(--accent-mint)] font-bold mb-1">🌀 Alquimia Culinaria:</p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{ing.tips_alquimia}</p>
              </div>
            </VegiCard>
          ))}
        </div>
      )}

      <VegiCard className="p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-[var(--accent-teal)]" />
          Balance Energético Semanal
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Proteína vegetal', value: 78, color: 'var(--accent-mint)' },
            { label: 'Fibra prebiótica', value: 92, color: 'var(--accent-teal)' },
            { label: 'Fuerza inmunológica', value: 85, color: 'var(--accent-gold)' },
            { label: 'Omega 3 y Grasas Nobles', value: 61, color: '#A855F7' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--border-moss)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
                />
              </div>
            </div>
          ))}
        </div>
      </VegiCard>

      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent-mint)]" />
          Técnicas de Alquimia Culinaria
        </h3>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="technique-search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar técnica mística..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-gray-400 outline-none focus:border-[var(--accent-mint)]/40 transition-colors"
          />
        </div>

        <div className="space-y-3">
          {filteredTechniques.map(tech => (
            <button
              key={tech.id}
              id={`technique-${tech.id}`}
              onClick={() => setSelectedTechnique(selectedTechnique?.id === tech.id ? null : tech)}
              className={`w-full text-left rounded-2xl p-4 border transition-all tap-active bg-gradient-to-br ${tech.color} ${tech.border} ${
                selectedTechnique?.id === tech.id ? 'border-opacity-60 shadow-lg' : 'hover:border-opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tech.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{tech.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{tech.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge color={tech.id === 'fermentacion' ? 'purple' : tech.id === 'activacion' ? 'mint' : tech.id === 'umami' ? 'gold' : 'teal'}>
                    {tech.level}
                  </Badge>
                  <span className="text-[10px] text-gray-500">{tech.duration}</span>
                </div>
              </div>

              {selectedTechnique?.id === tech.id && (
                <div className="mt-3 pt-3 border-t border-white/10 animate-float-in">
                  <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">{tech.mystical}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge color="gray"><Clock size={9} /> {tech.duration}</Badge>
                    <span className="text-[10px] text-[var(--accent-mint)] self-center">Toca para practicar →</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'oracle', icon: MessageCircle, label: 'El Oráculo' },
    { id: 'map', icon: Globe, label: 'Mapamundi' },
    { id: 'kitchen', icon: ChefHat, label: 'Mi Cocina' },
  ]

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-moss)] flex items-stretch z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all tap-active ${
              isActive ? 'text-[var(--accent-mint)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-mint)]"
                  style={{ boxShadow: '0 0 6px var(--accent-mint)' }} />
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--accent-mint)]' : 'text-[var(--text-secondary)]'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function vegiReducer(state, action) {
  switch (action.type) {
    case 'BOOST_STREAK':
      return {
        ...state,
        streak: state.streak + 1,
        xp: state.xp + 15,
        streakBoosted: true,
        pranaEnergy: Math.min(state.pranaEnergy + 10, 100),
      }

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      }

    case 'COMPLETE_CHALLENGE': {
      const newXP = state.xp + action.payload.xp
      const newLevel = Math.floor(newXP / 300) + 1
      const nextCountry = action.payload.country === 'peru' 
        ? 'mexico' 
        : action.payload.country === 'mexico' 
          ? 'tailandia' 
          : action.payload.country === 'tailandia' 
            ? 'india' 
            : null
      const updatedUnlocked = nextCountry && !state.unlockedCountries.includes(nextCountry)
        ? [...state.unlockedCountries, nextCountry]
        : state.unlockedCountries

      return {
        ...state,
        xp: newXP,
        level: Math.max(state.level, Math.min(newLevel, 6)),
        streak: state.streak + 1,
        completedChallenges: state.completedChallenges + 1,
        pranaEnergy: Math.min(state.pranaEnergy + 20, 100),
        unlockedCountries: updatedUnlocked,
      }
    }

    case 'SYNC_PROFILE':
      return {
        ...state,
        xp: action.payload.xp,
        streak: action.payload.streak_days,
        level: Math.max(state.level, Math.floor(action.payload.xp / 300) + 1)
      }

    default:
      return state
  }
}

const INITIAL_STATE = {
  streak: 7,
  xp: 180,
  level: 1,
  pranaEnergy: 65,
  streakBoosted: false,
  completedChallenges: 0,
  unlockedCountries: ['peru'],
  chatMessages: [
    {
      role: 'vegi',
      content: 'Hola Chef Martín... 🌿\n\nSintonizo con la vibración de tu cocina. Tus cuchillos están afilados y el espíritu vegetal te acompaña hoy.\n\n¿Qué ingredientes sagrados del Perú tienes en tu nevera? Escríbelos, sube una foto o graba un audio para canalizar una receta. 🎤',
    }
  ],
}

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('vegi-state-v7')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...INITIAL_STATE,
          ...parsed,
          chatMessages: parsed.chatMessages?.length > 0 ? parsed.chatMessages : INITIAL_STATE.chatMessages
        }
      }
    } catch {}
    return INITIAL_STATE
  })

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mockUserId] = useState("d3b07384-d113-4956-a5db-85d6b8a7c2be")
  const [selectedCountry, setSelectedCountry] = useState(null)

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const dispatch = useCallback((action) => {
    setState(prev => {
      const newState = vegiReducer(prev, action)
      try {
        localStorage.setItem('vegi-state-v7', JSON.stringify(newState))
      } catch {}
      return newState
    })
  }, [])

  const { profile, loading: syncLoading } = useVegiSync(mockUserId, (newProfile) => {
    dispatch({ type: 'SYNC_PROFILE', payload: newProfile })
  })

  useEffect(() => {
    if (profile) {
      dispatch({ type: 'SYNC_PROFILE', payload: profile })
    }
  }, [profile, dispatch])

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen state={state} dispatch={dispatch} isSyncing={syncLoading} />
      case 'oracle': return <OracleScreen state={state} dispatch={dispatch} />
      case 'map': return <MapScreen state={state} dispatch={dispatch} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
      case 'kitchen': return <KitchenScreen />
      default: return null
    }
  }

  return (
    <div className={`relative w-full max-w-md mx-auto h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-2xl border-x border-[var(--border-moss)] overflow-hidden pb-20 ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {!supabase && (
          <span className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-pulse" title="Modo Alquimia Local (Supabase Offline)">
            <WifiOff size={14} />
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-moss)] shadow-md text-[var(--text-primary)] tap-active hover:bg-[var(--bg-elevated)] flex items-center justify-center"
          title="Cambiar tema"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(46,229,157,0.03) 0%, rgba(14,165,233,0.02) 40%, transparent 80%)' }} />

      <div className={`flex-1 min-h-0 overflow-y-auto ${activeTab === 'oracle' ? 'flex flex-col' : ''}`}
        style={{ scrollbarWidth: 'thin' }}>
        {renderScreen()}
      </div>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
