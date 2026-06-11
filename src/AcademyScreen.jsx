// ============================================================
// AcademyScreen — Universidad de Alquimia Plant-Based
// App Móvil Premium | UX Gamificada con Biblioteca y Exámenes
// ============================================================

import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Lock, CheckCircle, ChevronRight,
  Star, Award, Zap, ChevronLeft, X,
  Search, Clock, FileText, HelpCircle,
  Check, AlertCircle, GraduationCap, Flame,
  Layers, FlaskConical, Sparkles, Rocket
} from 'lucide-react'
import { ACADEMY_SEMESTERS, LIBRARY_GLOSSARY } from './academyData'
import { supabase } from './supabaseClient'
import AcademyAdmin from './AcademyAdmin'

// ─── Utilidad: calcular progreso ───────────────────────────
function getSemesterProgress(semester, progressMap) {
  let total = 0
  let done = 0
  semester.subjects.forEach(subj => {
    subj.lessons.forEach(lesson => {
      total++
      if (progressMap[lesson.id]) done++
    })
  })
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

// ─── Icono de semestre dinámico ─────────────────────────────
const SEM_ICONS = { sem1: Layers, sem2: FlaskConical, sem3: Sparkles, sem4: Rocket }

// ===============================================
function SemesterMap({ semesters = [], onSelectSemester, progressMap, dispatch, activeCareer, onCareerChange }) {
  const [mapTab, setMapTab] = useState('semesters')
  const [leaderboardList, setLeaderboardList] = useState([])
  const totalXP = Object.keys(progressMap).length * 25

  const getBotsLeaderboard = () => {
    const defaultBots = [
      { name: '@Sofia_SousChef', role: 'Sous Chef', baseXp: 280, avatar: '👩‍🍳', trend: 'stable' },
      { name: '@AlquimistaVegano', role: 'Alquimista V', baseXp: 245, avatar: '🧙‍♂️', trend: 'up' },
      { name: '@SaborSilvestre', role: 'Explorador', baseXp: 185, avatar: '🌿', trend: 'down' },
      { name: '@PanaderoEstelar', role: 'Oficial', baseXp: 120, avatar: '🥖', trend: 'stable' },
      { name: '@Micro_Green', role: 'Ayudante', baseXp: 60, avatar: '🌱', trend: 'up' }
    ]
    
    const stored = localStorage.getItem('vegi-bots-leaderboard')
    let bots = stored ? JSON.parse(stored) : defaultBots
    
    const lastUserXp = Number(localStorage.getItem('vegi-last-user-xp') || 0)
    const currentUserXp = totalXP
    
    if (currentUserXp > lastUserXp) {
      bots = bots.map(b => ({
        ...b,
        baseXp: b.baseXp + Math.floor(Math.random() * 25) + 5
      }))
      localStorage.setItem('vegi-bots-leaderboard', JSON.stringify(bots))
      localStorage.setItem('vegi-last-user-xp', currentUserXp.toString())
    }
    
    const list = [
      ...bots,
      { name: 'Tú (@Martin_Chef)', role: 'Estudiante', baseXp: totalXP + 100, avatar: '🎓', isUser: true, trend: 'up' }
    ]
    
    return list.sort((a, b) => b.baseXp - a.baseXp)
  }

  useEffect(() => {
    if (!supabase) {
      setLeaderboardList(getBotsLeaderboard())
      return
    }

    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('xp', { ascending: false })
        
        if (error) throw error
        
        const mapped = data.map(item => ({
          name: item.name,
          role: item.role,
          baseXp: item.xp,
          avatar: item.avatar,
          trend: item.trend,
          isUser: !item.is_bot
        }))
        setLeaderboardList(mapped)
      } catch (err) {
        console.warn("Fallback: Error al consultar Supabase Leaderboard", err)
        setLeaderboardList(getBotsLeaderboard())
      }
    }

    fetchLeaderboard()

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [progressMap, totalXP])

  const isPizza = activeCareer === 'pizza'
  const heroBg = isPizza 
    ? 'linear-gradient(160deg, #5c2409 0%, #2b1307 60%, var(--bg-primary) 100%)'
    : 'linear-gradient(160deg, #0f4c3a 0%, #1a2a1e 60%, var(--bg-primary) 100%)'
  const heroAccentColor = isPizza ? '#F59E0B' : '#2EE59D'
  const radialCircles = isPizza
    ? 'radial-gradient(circle at 80% 20%, #F59E0B 0%, transparent 60%), radial-gradient(circle at 20% 80%, #EF4444 0%, transparent 50%)'
    : 'radial-gradient(circle at 80% 20%, #2EE59D 0%, transparent 60%), radial-gradient(circle at 20% 80%, #0EA5E9 0%, transparent 50%)'
  const heroTitle = isPizza ? 'Maestría en Pizza' : 'Alquimia Culinaria'
  const heroSubtitle = isPizza
    ? '26 semanas · 4 asignaturas troncales · Laboratorio de Masas'
    : '6 semestres · Biblioteca interactiva · Exámenes prácticos'

  return (
    <div className="flex flex-col gap-0 animate-float-in">
      {/* Header Hero */}
      <div className="relative overflow-hidden px-5 pt-14 pb-8"
        style={{ background: heroBg }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: radialCircles }} />
        <div className="relative z-10">
          
          {/* Career Switcher Toggle */}
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 mb-5 max-w-[340px]">
            <button
              onClick={() => onCareerChange('alquimia')}
              className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer text-center ${
                activeCareer === 'alquimia'
                  ? 'bg-gradient-to-r from-[#2EE59D] to-[#0EA5E9] text-black shadow-[0_2px_8px_rgba(46,229,157,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🌿 Alquimia
            </button>
            <button
              onClick={() => onCareerChange('pizza')}
              className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer text-center ${
                activeCareer === 'pizza'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🍕 Maestría Pizza
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={18} style={{ color: heroAccentColor }} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: heroAccentColor }}>
              {isPizza ? 'Cátedra de Pizza Contemporánea' : 'Universidad Plant-Based'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {heroTitle}
          </h1>
          <p className="text-sm text-white/60 leading-relaxed max-w-[280px]">
            {heroSubtitle}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Zap size={13} style={{ color: heroAccentColor }} />
              <span className="text-xs font-bold text-white">{totalXP} XP ganados</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Flame size={13} className="text-orange-400 animate-flame-burn" />
              <span className="text-xs font-bold text-white">
                {Object.keys(progressMap).length} lecciones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[var(--border-moss)] bg-[var(--bg-card)] relative z-10">
        <button
          onClick={() => setMapTab('semesters')}
          className={`flex-1 py-3 text-xs font-black transition-all cursor-pointer ${
            mapTab === 'semesters'
              ? 'text-[var(--text-primary)] font-black'
              : 'text-[var(--text-secondary)]'
          }`}
          style={mapTab === 'semesters' ? { borderBottom: `2px solid ${heroAccentColor}` } : {}}
        >
          🎓 Semestres
        </button>
        <button
          onClick={() => setMapTab('leaderboard')}
          className={`flex-1 py-3 text-xs font-black transition-all cursor-pointer ${
            mapTab === 'leaderboard'
              ? 'text-[var(--text-primary)] font-black'
              : 'text-[var(--text-secondary)]'
          }`}
          style={mapTab === 'leaderboard' ? { borderBottom: `2px solid ${heroAccentColor}` } : {}}
        >
          🏆 Tabla de Clasificación
        </button>
      </div>

      {mapTab === 'semesters' ? (
        <div className="px-4 py-5 flex flex-col gap-4">
          {semesters.map((sem, idx) => {
            const progress = getSemesterProgress(sem, progressMap)
            const SemIcon = SEM_ICONS[sem.id] || Layers
            const isLocked = false // Desbloqueado en modo desarrollador (original: sem.locked && progress === 0 && idx > 0)

            return (
              <button
                key={sem.id}
                id={`sem-card-${sem.id}`}
                onClick={() => !isLocked && onSelectSemester(sem)}
                className={`w-full text-left rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isLocked
                    ? 'opacity-60 cursor-not-allowed border-[var(--border-moss)]'
                    : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                }`}
                style={{ background: sem.gradient, borderColor: sem.border }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md"
                        style={{ background: `${sem.color}25`, border: `1.5px solid ${sem.color}50` }}>
                        {sem.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: sem.color }}>Semestre {sem.number}</span>
                          {isLocked && <Lock size={10} style={{ color: sem.color }} />}
                          {progress === 100 && <CheckCircle size={12} style={{ color: sem.color }} />}
                        </div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight mt-0.5">
                          {sem.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        +{sem.xpReward} XP
                      </span>
                      <span className="text-lg">{sem.badge.emoji}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {sem.subtitle}
                  </p>

                {/* Barra de progreso */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${sem.color}, ${sem.colorSecondary})`,
                        boxShadow: `0 0 8px ${sem.color}60`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: sem.color }}>{progress}%</span>
                </div>

                {/* Materias preview */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {sem.subjects.map(subj => (
                    <span key={subj.id}
                      className="text-[9px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: `${sem.color}15`, color: sem.color }}>
                      {subj.emoji} {subj.title}
                    </span>
                  ))}
                </div>
              </div>

              {!isLocked && (
                <div className="px-5 py-3 border-t flex items-center justify-between"
                  style={{ borderColor: `${sem.color}20`, background: `${sem.color}05` }}>
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    {sem.totalLessons} lecciones · {sem.subjects.length} materias
                  </span>
                  <ChevronRight size={14} style={{ color: sem.color }} />
                </div>
              )}
            </button>
          )
        })}
      </div>
      ) : (
        <div className="px-4 py-5 flex flex-col gap-3.5 animate-float-in">
          <div className="text-center p-3.5 bg-[var(--bg-elevated)]/30 border border-[var(--border-moss)] rounded-2xl mb-2">
            <span className="text-[10px] font-black uppercase text-[var(--accent-mint)] tracking-wider block mb-0.5">Liga de Alquimia Culinaria</span>
            <p className="text-[9px] text-[var(--text-secondary)]">Demuestra tu conocimiento y supera a otros chefs de la academia</p>
          </div>
          
          <div className="space-y-2.5">
            {leaderboardList.map((item, idx) => {
              const rank = idx + 1
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
              return (
                <div
                  key={item.name}
                  className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                    item.isUser
                      ? 'border-[var(--accent-mint)] bg-[var(--accent-mint)]/10 shadow-md font-bold'
                      : 'border-[var(--border-moss)] bg-[var(--bg-card)]'
                  }`}
                  style={item.isUser ? { boxShadow: '0 0 10px rgba(46, 229, 157, 0.15)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-black text-[var(--text-secondary)]">
                      {medal || rank}
                    </span>
                    <span className="text-xl">{item.avatar}</span>
                    <div>
                      <h4 className={`text-xs font-bold ${item.isUser ? 'text-[var(--accent-mint)] font-black' : 'text-[var(--text-primary)]'}`}>
                        {item.name}
                      </h4>
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block mt-0.5">{item.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--text-primary)]">{item.baseXp} XP</span>
                    <span className={`text-[10px] ${item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-orange-400' : 'text-gray-400'}`}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '•'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// COMPONENTE: Tarjeta Coleccionable Holográfica (NFT-style)
// ============================================================
function InteractiveNFTCard({ title, emoji, color, colorSecondary, subtitle, xp }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [shimmer, setShimmer] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - card.left - card.width / 2
    const y = e.clientY - card.top - card.height / 2
    setRotate({ x: -y / (card.height / 15), y: x / (card.width / 15) })
    
    const percentX = Math.round(((e.clientX - card.left) / card.width) * 100)
    const percentY = Math.round(((e.clientY - card.top) / card.height) * 100)
    setShimmer({ x: percentX, y: percentY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setShimmer({ x: 50, y: 50 })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[280px] h-[360px] mx-auto rounded-3xl overflow-hidden shadow-2xl border transition-all duration-150 cursor-pointer select-none"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        borderColor: `${color}60`,
        background: 'linear-gradient(160deg, #111e15 0%, #080d0a 100%)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${color}20`
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300 opacity-50"
        style={{
          background: `radial-gradient(circle at ${shimmer.x}% ${shimmer.y}%, rgba(255,255,255,0.45) 0%, transparent 60%), linear-gradient(${shimmer.x * 3.6}deg, ${color}35, ${colorSecondary}35)`
        }}
      />
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, ${colorSecondary})` }}
      />
      <div className="absolute inset-0 p-6 flex flex-col justify-between items-center text-center z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          Coleccionable Oficial
        </span>
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full blur-2xl opacity-40 animate-pulse"
            style={{ background: color }}
          />
          <span className="text-6xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] transform hover:scale-110 transition-transform duration-300">
            {emoji}
          </span>
        </div>
        <div className="w-full">
          <h4 className="text-base font-black text-white leading-tight drop-shadow-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </h4>
          <p className="text-[10px] text-white/55 mt-1 truncate px-2">
            {subtitle}
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-white/40">
            <span>+{xp} XP</span>
            <span>ID #{(title.length * 313) % 1000}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// VISTA 2: Materias de un Semestre (Lista de Subjects)
// ============================================================
function SubjectList({ semester, onSelectSubject, onBack, progressMap }) {
  const progress = getSemesterProgress(semester, progressMap)
  const [showNFT, setShowNFT] = useState(false)

  return (
    <div className="flex flex-col animate-float-in">
      {/* Modal NFT Holográfico */}
      {showNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-float-in">
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setShowNFT(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all tap-active"
            >
              <X size={20} />
            </button>
            <InteractiveNFTCard
              title={semester.badge.title}
              emoji={semester.badge.emoji}
              color={semester.color}
              colorSecondary={semester.colorSecondary}
              subtitle={semester.subtitle}
              xp={semester.xpReward}
            />
            <p className="text-[11px] text-white/60 text-center max-w-[240px] mt-4 leading-relaxed font-mono">
              Muévete o desliza encima para ver el brillo holográfico y la rotación 3D del certificado.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${semester.color}25 0%, var(--bg-primary) 100%)` }}>
        <button onClick={onBack}
          className="absolute top-14 left-4 p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-moss)] tap-active">
          <ChevronLeft size={16} className="text-[var(--text-primary)]" />
        </button>
        <div className="text-center mt-2">
          <div className="text-4xl mb-2">{semester.emoji}</div>
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: semester.color }}>
            Semestre {semester.number}
          </span>
          <h2 className="text-xl font-black text-[var(--text-primary)] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {semester.title}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{semester.subtitle}</p>
          <div className="flex items-center gap-2 justify-center mt-3">
            <div className="flex-1 max-w-[180px] h-2 bg-[var(--border-moss)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})` }} />
            </div>
            <span className="text-xs font-bold" style={{ color: semester.color }}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Badge del semestre */}
      <div
        onClick={() => setShowNFT(true)}
        className="mx-4 mb-4 p-4 rounded-2xl border flex items-center gap-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
        style={{ background: `${semester.color}10`, borderColor: `${semester.color}30` }}
        title="Ver Certificado Digital"
      >
        <div className="text-3xl relative">
          {semester.badge.emoji}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: semester.color }}>
            Insignia Coleccionable
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-500 font-black rounded">3D HOLOGRÁFICA</span>
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{semester.badge.title}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">+{semester.xpReward} XP · Haz clic para previsualizar el NFT</p>
        </div>
        <ChevronRight size={14} style={{ color: semester.color }} />
      </div>

      {/* Lista de materias */}
      <div className="px-4 flex flex-col gap-3 pb-6">
        {semester.subjects.map((subj, idx) => {
          const subjLessons = subj.lessons.length
          const subjDone = subj.lessons.filter(l => progressMap[l.id]).length
          const pct = subjLessons === 0 ? 0 : Math.round((subjDone / subjLessons) * 100)

          const isSubjLocked = false // Desbloqueado en modo desarrollador (original: subj.locked)

          return (
            <button
              key={subj.id}
              id={`subj-${subj.id}`}
              onClick={() => !isSubjLocked && onSelectSubject(subj)}
              className={`w-full text-left p-4 rounded-2xl border bg-[var(--bg-card)] transition-all tap-active ${
                isSubjLocked
                  ? 'opacity-50 cursor-not-allowed border-[var(--border-moss)]'
                  : 'cursor-pointer hover:border-opacity-60 active:scale-[0.98]'
              }`}
              style={{ borderColor: isSubjLocked ? undefined : `${semester.color}30` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${semester.color}15` }}>
                  {subj.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{subj.title}</h4>
                    {isSubjLocked && <Lock size={11} className="text-[var(--text-secondary)]" />}
                    {pct === 100 && <CheckCircle size={12} style={{ color: semester.color }} />}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{subjLessons} lecciones · +{subj.xp} XP</p>
                </div>
                <ChevronRight size={14} className="text-[var(--text-secondary)]" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{subj.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--border-moss)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})`
                  }} />
                </div>
                <span className="text-[9px] font-bold" style={{ color: semester.color }}>{subjDone}/{subjLessons}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// VISTA 3: Lecciones de una Materia
// ============================================================
function LessonList({ subject, semester, onSelectLesson, onBack, progressMap }) {
  return (
    <div className="flex flex-col animate-float-in">
      <div className="relative px-5 pt-14 pb-5"
        style={{ background: `linear-gradient(180deg, ${semester.color}15 0%, var(--bg-primary) 100%)` }}>
        <button onClick={onBack}
          className="absolute top-14 left-4 p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-moss)] tap-active">
          <ChevronLeft size={16} className="text-[var(--text-primary)]" />
        </button>
        <div className="text-center mt-2">
          <div className="text-3xl mb-2">{subject.emoji}</div>
          <h2 className="text-lg font-black text-[var(--text-primary)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {subject.title}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed max-w-[260px] mx-auto">
            {subject.description}
          </p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-6">
        {subject.lessons.map((lesson, idx) => {
          const done = !!progressMap[lesson.id]
          const prevDone = true // Desbloqueado en modo desarrollador (original: idx === 0 || !!progressMap[subject.lessons[idx - 1]?.id])

          return (
            <button
              key={lesson.id}
              id={`lesson-${lesson.id}`}
              onClick={() => prevDone && onSelectLesson(lesson)}
              className={`w-full text-left p-4 rounded-2xl border transition-all tap-active ${
                !prevDone
                  ? 'opacity-40 cursor-not-allowed border-[var(--border-moss)] bg-[var(--bg-card)]'
                  : done
                    ? 'border-[var(--accent-mint)]/30 bg-[var(--accent-mint)]/5 cursor-pointer'
                    : 'border-[var(--border-moss)] bg-[var(--bg-card)] cursor-pointer hover:border-opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  done
                    ? 'bg-[var(--accent-mint)]/20'
                    : !prevDone
                      ? 'bg-[var(--border-moss)]'
                      : 'bg-[var(--bg-elevated)]'
                }`}>
                  {done
                    ? <CheckCircle size={18} className="text-[var(--accent-mint)]" />
                    : !prevDone
                      ? <Lock size={16} className="text-[var(--text-secondary)]" />
                      : <span className="text-base font-bold text-[var(--text-secondary)]">{idx + 1}</span>
                  }
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{lesson.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                      <Clock size={9} /> {lesson.duration}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                      <FileText size={9} /> Teoría
                    </span>
                    {(() => {
                      const quizData = lesson.content?.quiz || lesson.quiz;
                      return (Array.isArray(quizData) ? quizData.length > 0 : (quizData && typeof quizData === 'object'));
                    })() && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                        <HelpCircle size={9} /> Quiz
                      </span>
                    )}
                  </div>
                </div>
                {done
                  ? <span className="text-[10px] font-bold text-[var(--accent-mint)]">✓ +25 XP</span>
                  : <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                }
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// VISTA 4: Lección — Contenido Teórico Premium
// ============================================================
// ============================================================
// SIMULADORES INTERACTIVOS Y LABORATORIOS CULINARIOS
// ============================================================

function FermentationSimulator() {
  const [days, setDays] = useState(7)
  const [temp, setTemp] = useState(20)
  const [salt, setSalt] = useState(2.5)

  const balActivity = Math.max(0, Math.min(100, Math.round((temp > 40 || temp < 10) ? 0 : (100 - Math.abs(22 - temp) * 6) - (salt > 5 ? (salt - 5) * 15 : 0))))
  const pathogenGrowth = Math.round(salt < 1.5 ? (100 - salt * 50) * (temp > 25 ? 1.5 : 1) : 0)
  
  const phDrop = (balActivity / 100) * (days * 0.4)
  const currentPh = Math.max(3.2, Math.round((6.0 - phDrop) * 10) / 10)

  let status = "Estable e Inactivo ❄️"
  let statusColor = "text-sky-500"
  let desc = "Bajas temperaturas. El fermento está durmiendo."
  
  if (pathogenGrowth > 40) {
    status = "⚠️ Contaminado (Moho/Podredumbre)"
    statusColor = "text-red-500 font-black animate-pulse"
    desc = "¡Alerta! Poca sal o temperatura muy alta. Han proliferado hongos y bacterias dañinas. ¡Desechar!"
  } else if (currentPh <= 3.8 && currentPh >= 3.4) {
    status = "✨ Fermentación Perfecta (Probiótico)"
    statusColor = "text-green-500 font-black animate-pulse"
    desc = "¡Excelente balance! El pH es lo suficientemente bajo para ser seguro y los sabores son óptimos."
  } else if (currentPh < 3.4) {
    status = "🥴 Sobrefermentado / Muy Ácido"
    statusColor = "text-amber-500 font-bold"
    desc = "Demasiado tiempo o calor. El fermento es seguro pero excesivamente ácido y blando."
  } else if (balActivity > 30) {
    status = "🫧 Fermentación Activa"
    statusColor = "text-indigo-500 font-bold"
    desc = "Bacterias ácido-lácticas activas consumiendo azúcares. Gas y burbujas visibles."
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl flex flex-col gap-4 animate-float-in">
      <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
        <FlaskConical size={16} className="text-purple-500" />
        Simulador Bioquímico de Fermentación
      </h4>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Modifica los parámetros físicos y químicos para ver cómo reaccionan los microorganismos.
      </p>

      <div className="space-y-3 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-moss)]">
        <div>
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-[var(--text-primary)]">Temperatura: {temp}°C</span>
            <span className="text-[var(--text-secondary)]">Óptimo: 18-22°C</span>
          </div>
          <input type="range" min="5" max="45" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full accent-purple-500" />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-[var(--text-primary)]">Salmuera: {salt}%</span>
            <span className="text-[var(--text-secondary)]">Óptimo: 2-3%</span>
          </div>
          <input type="range" min="0" max="10" step="0.5" value={salt} onChange={e => setSalt(Number(e.target.value))} className="w-full accent-purple-500" />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span className="text-[var(--text-primary)]">Tiempo: {days} días</span>
            <span className="text-[var(--text-secondary)]">Óptimo: 5-14 días</span>
          </div>
          <input type="range" min="1" max="25" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)] text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Nivel pH</p>
          <p className={`text-xl font-black ${currentPh <= 3.8 && currentPh >= 3.4 ? 'text-green-500' : 'text-[var(--text-primary)]'}`}>
            {currentPh}
          </p>
        </div>
        <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)] text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">Actividad BAL</p>
          <p className="text-xl font-black text-purple-500">{balActivity}%</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border flex flex-col gap-1 bg-purple-500/5 border-purple-500/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Estado del Cultivo</p>
        <p className={`text-sm ${statusColor}`}>{status}</p>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">{desc}</p>
      </div>

      <div className="relative h-28 w-20 mx-auto border-4 border-dashed border-[var(--text-secondary)]/30 rounded-b-3xl rounded-t-lg bg-[var(--bg-elevated)] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 bg-purple-500/20 transition-all duration-500" style={{ height: pathogenGrowth > 40 ? '90%' : '75%' }}>
          {balActivity > 20 && !pathogenGrowth && (
            <div className="absolute inset-0 flex flex-wrap gap-2 p-2 justify-center animate-pulse">
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce delay-100" />
            </div>
          )}
          {pathogenGrowth > 40 && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center text-lg">🤢</div>
          )}
          {currentPh <= 3.8 && currentPh >= 3.4 && !pathogenGrowth && (
            <div className="absolute inset-0 flex items-center justify-center text-lg animate-bounce">🏆</div>
          )}
        </div>
        <span className="text-[9px] font-bold text-[var(--text-secondary)] mb-1 z-10">Jarra</span>
      </div>
    </div>
  )
}

function ChocolateTemperingSimulator() {
  const [step, setStep] = useState(1)
  const [temp, setTemp] = useState(30)
  
  let feedback = ""
  let status = "En espera..."
  let statusColor = "text-[var(--text-secondary)]"

  if (step === 1) {
    status = "Fase 1: Fusión 熔"
    if (temp >= 45 && temp <= 50) {
      feedback = "¡Perfecto! Has destruido todos los cristales inestables. Pasa al paso 2."
      statusColor = "text-green-500 font-bold"
    } else if (temp < 45) {
      feedback = "La temperatura es muy baja. Todavía quedan cristales de cacao sin fundir."
      statusColor = "text-amber-500"
    } else {
      feedback = "¡Cuidado! Si superas los 55°C puedes quemar el chocolate y separar la manteca."
      statusColor = "text-red-500"
    }
  } else if (step === 2) {
    status = "Fase 2: Enfriamiento ❄️"
    if (temp >= 27 && temp <= 28) {
      feedback = "¡Excelente! Has iniciado la nucleación de cristales estables (Beta/Tipo V). Pasa al paso 3."
      statusColor = "text-green-500 font-bold"
    } else if (temp > 28) {
      feedback = "Demasiado caliente. Los cristales estables aún no pueden formarse."
      statusColor = "text-amber-500"
    } else {
      feedback = "Demasiado frío. Se están formando cristales inestables (Tipo I-IV) muy rápido."
      statusColor = "text-red-500"
    }
  } else if (step === 3) {
    status = "Fase 3: Atemperado 🔥"
    if (temp >= 31 && temp <= 32) {
      feedback = "🏆 ¡ÉXITO! Chocolate perfectamente templado. Obtienes cristales estables Tipo V. Brillo de espejo y snap limpio al morder."
      statusColor = "text-green-500 font-black animate-pulse"
    } else if (temp < 31) {
      feedback = "Demasiado frío para trabajar. Se solidificará de forma inestable antes de moldear."
      statusColor = "text-amber-500"
    } else {
      feedback = "¡Oh no! Has derretido los cristales estables Tipo V que formaste en el paso 2. Tienes que reiniciar el proceso."
      statusColor = "text-red-500 font-bold"
    }
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl flex flex-col gap-4 animate-float-in">
      <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
        <FlaskConical size={16} className="text-amber-500" />
        Simulador de Cristalización de Cacao
      </h4>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Controla la temperatura del chocolate negro para obtener el templado perfecto (Cristal Tipo V).
      </p>

      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              step === s
                ? 'bg-amber-500 text-white border-transparent shadow-md'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-moss)]'
            }`}
          >
            Paso {s}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)]">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Temperatura Actual: {temp}°C</span>
          <span className="text-amber-500 font-black">
            {step === 1 ? 'Target: 45-50°C' : step === 2 ? 'Target: 27-28°C' : 'Target: 31-32°C'}
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="60"
          value={temp}
          onChange={e => setTemp(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
      </div>

      <div className="p-4 rounded-xl border bg-amber-500/5 flex flex-col gap-1 border-amber-500/20">
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{status}</p>
        <p className={`text-xs ${statusColor} leading-relaxed`}>{feedback}</p>
      </div>

      <div className="relative h-20 w-full bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-b-2xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-900/10" />
        <div
          className="absolute inset-x-0 bottom-0 bg-amber-950 transition-all duration-500 ease-in-out"
          style={{
            height: '60%',
            opacity: temp > 40 ? 0.85 : 0.95,
            boxShadow: step === 3 && temp >= 31 && temp <= 32 ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
          }}
        />
        <span className="text-[10px] font-black text-white z-10 drop-shadow-md">
          {step === 3 && temp >= 31 && temp <= 32 ? '✨ Chocolate Templado Espejo ✨' : 'Recipiente de Cacao'}
        </span>
      </div>
    </div>
  )
}

function KnifeAnglesSimulator() {
  const [angle, setAngle] = useState(20)
  const [food, setFood] = useState('tomato')

  let force = 0
  let durability = 100
  let description = ""
  
  if (food === 'tomato') {
    if (angle < 18) {
      force = 10
      durability = 95
      description = "⚡ Precisión de cirujano. Corta la piel fina del tomate sin aplastar las células de agua."
    } else if (angle <= 25) {
      force = 30
      durability = 100
      description = "👍 Buen corte, aunque requiere presionar un poco para romper la piel cerosa."
    } else {
      force = 80
      durability = 100
      description = "🤢 Mal corte. Aplasta el tomate liberando todos los jugos en la tabla."
    }
  } else if (food === 'root') {
    if (angle < 18) {
      force = 40
      durability = 40
      description = "⚠️ Filo muy frágil. Corta bien, pero corres el riesgo de astillar la hoja con el apio nabo duro."
    } else if (angle <= 25) {
      force = 50
      durability = 95
      description = "✨ Balance óptimo. El filo penetra la estructura de celulosa con gran control y durabilidad."
    } else {
      force = 90
      durability = 100
      description = "💪 Demasiada resistencia. La hoja actúa más como cuña, rompiendo el vegetal en vez de cortarlo."
    }
  } else if (food === 'bone') {
    if (angle < 18) {
      force = 80
      durability = 5
      description = "🚨 ¡DESASTRE! El filo súper agudo choca contra el material duro y se mella de inmediato."
    } else if (angle <= 25) {
      force = 70
      durability = 30
      description = "❌ Mal afilado para esta tarea. El filo se desafilará en pocos minutos de golpeo."
    } else {
      force = 30
      durability = 95
      description = "🔨 Afilado robusto (tipo hacha). Resistente a impactos, ideal para materiales leñosos o duros."
    }
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl flex flex-col gap-4 animate-float-in">
      <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
        <FlaskConical size={16} className="text-emerald-500" />
        Simulador de Física del Filo y Ángulo
      </h4>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Compara cómo influye el ángulo de afilado según el tipo de ingrediente que vayas a cortar.
      </p>

      <div className="flex gap-2">
        {['tomato', 'root', 'bone'].map(f => (
          <button
            key={f}
            onClick={() => setFood(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              food === f
                ? 'bg-emerald-500 text-white border-transparent shadow-md'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-moss)]'
            }`}
          >
            {f === 'tomato' ? '🍅 Tomate' : f === 'root' ? '🥔 Apio Nabo' : '🪵 Ramas/Cocos'}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)]">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Ángulo del Bisel: {angle}°</span>
          <span className="text-emerald-500">
            {angle < 18 ? 'Japonés Agudo' : angle <= 25 ? 'Europeo Estándar' : 'Bisel Hacha'}
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="35"
          value={angle}
          onChange={e => setAngle(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div className="space-y-3 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-moss)] text-xs">
        <div className="flex justify-between items-center">
          <span>Esfuerzo Requerido:</span>
          <div className="w-24 h-2 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${force}%`, backgroundColor: force > 70 ? '#ef4444' : force > 40 ? '#f59e0b' : '#10b981' }} />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span>Durabilidad del Filo:</span>
          <div className="w-24 h-2 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${durability}%`, backgroundColor: durability < 40 ? '#ef4444' : '#10b981' }} />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-emerald-500/5 text-xs text-[var(--text-secondary)] leading-relaxed border-emerald-500/20">
        <p className="font-bold text-emerald-500 mb-1">Análisis Dinámico</p>
        {description}
      </div>
    </div>
  )
}

function EmulsionSimulator() {
  const [speed, setSpeed] = useState(1000)
  const [ratio, setRatio] = useState(3)
  const [emulsifier, setEmulsifier] = useState('none')

  let stability = 0
  let text = "Sin emulsionar"
  let color = "text-red-500"
  let desc = ""

  if (emulsifier === 'none') {
    stability = Math.max(0, Math.min(20, Math.round(speed / 100)))
    text = "Fases Separadas 🌊"
    color = "text-red-500"
    desc = "El aceite flota arriba en gotas grandes y el agua abajo. La tensión superficial de las grasas no se ha roto."
  } else if (emulsifier === 'mustard') {
    stability = Math.round((speed / 5000) * 50 + (ratio >= 2 && ratio <= 4 ? 30 : 10))
    if (stability > 70) {
      text = "Emulsión Estable 🥗"
      color = "text-green-500 font-bold"
      desc = "La mostaza proporciona mucílagos que estabilizan la vinagreta. Buena cremosidad y color uniforme."
    } else {
      text = "Emulsión Inestable / Líquida"
      color = "text-amber-500"
      desc = "Velocidad de batido insuficiente. El aceite no se ha dividido en gotas microscópicas."
    }
  } else if (emulsifier === 'aquafaba') {
    stability = Math.round((speed / 5000) * 70 + (ratio >= 3 && ratio <= 5 ? 30 : 10))
    if (stability > 80) {
      text = "Emulsión Ultraestable (Mayonesa) 🥛"
      color = "text-green-500 font-black animate-pulse"
      desc = "Las saponinas y proteínas de la aquafaba atrapan perfectamente las gotitas de aceite. Textura espesa y firme."
    } else if (stability > 50) {
      text = "Emulsión Floja / Cremosa"
      color = "text-amber-500"
      desc = "Falta batir con mayor intensidad o ajustar la proporción de aceite gradualmente."
    } else {
      text = "Corta y Separada 🤢"
      color = "text-red-500 font-bold"
      desc = "¡Se ha cortado! Has vertido el aceite demasiado rápido o le falta energía mecánica."
    }
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl flex flex-col gap-4 animate-float-in">
      <h4 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
        <FlaskConical size={16} className="text-pink-500" />
        Simulador Físico de Emulsiones
      </h4>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Ajusta la velocidad de batido y el emulsionante para unir aceite y agua en una fase estable.
      </p>

      <div className="flex gap-2">
        {['none', 'mustard', 'aquafaba'].map(e => (
          <button
            key={e}
            onClick={() => setEmulsifier(e)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              emulsifier === e
                ? 'bg-pink-500 text-white border-transparent'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-moss)]'
            }`}
          >
            {e === 'none' ? '❌ Ninguno' : e === 'mustard' ? '🥗 Mostaza' : '🥛 Aquafaba'}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)]">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Velocidad Batido: {speed} RPM</span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="500"
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="w-full accent-pink-500"
        />
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-moss)]">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Proporción Aceite/Agua: {ratio}:1</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          value={ratio}
          onChange={e => setRatio(Number(e.target.value))}
          className="w-full accent-pink-500"
        />
      </div>

      <div className="p-4 rounded-xl border bg-pink-500/5 flex flex-col gap-1 text-xs border-pink-500/20">
        <p className="font-bold text-pink-500 text-[10px] uppercase tracking-wider">Resultado de la Emulsión</p>
        <p className={`font-bold ${color}`}>{text}</p>
        <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-2 mt-2">
          <span>Estabilidad:</span>
          <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${stability}%` }} />
          </div>
          <span className="font-bold text-pink-500">{stability}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Base de Datos de Laboratorios Prácticos ────────────────────────

const LAB_PRACTICES = {
  'sem1-s1-l1': {
    title: 'Análisis de Alliums en Cocina',
    description: 'En este laboratorio, picarás cebollas a diferentes temperaturas para medir la velocidad de liberación de aliinasa y lagrimeo.',
    inputs: [
      { name: 'temp', label: 'Temperatura de la cebolla (°C)', type: 'select', options: ['5°C (Refrigerada)', '20°C (Ambiente)', '40°C (Tibia)'] },
      { name: 'knife', label: 'Afilado del cuchillo', type: 'select', options: ['Sin filo / Romo', 'Afilado medio', 'Filo de navaja'] }
    ],
    evaluate: (vals) => {
      const { temp, knife } = vals
      if (temp === '5°C (Refrigerada)' && knife === 'Filo de navaja') {
        return { score: 100, feedback: '🏆 ¡Fórmula Perfecta! El frío ralentiza la enzima aliinasa y el cuchillo extremadamente afilado corta las células limpiamente sin aplastarlas, reduciendo el gas lacrimógeno a cero.' }
      }
      if (knife === 'Sin filo / Romo') {
        return { score: 40, feedback: '🤢 El cuchillo romo aplasta las células vegetales, liberando una gran nube de gas que irrita tus ojos rápidamente, sin importar la temperatura.' }
      }
      return { score: 70, feedback: '👍 Buen intento. Enfriar la cebolla ayuda, pero con un cuchillo regular aún se liberan precursores del lagrimeo.' }
    }
  },
  'sem2-s1-l1': {
    title: 'Cultivo de Bacterias Ácido Lácticas (Chucrut)',
    description: 'Registra los datos de tu primer frasco de fermento láctico para evaluar su seguridad microbiológica.',
    inputs: [
      { name: 'salt', label: 'Porcentaje de sal marina (%)', type: 'number', min: 0, max: 10, step: 0.1, default: 2 },
      { name: 'oxygen', label: 'Exposición al oxígeno', type: 'select', options: ['Sumergido bajo agua (Anaeróbico)', 'Expuesto al aire (Aeróbico)'] }
    ],
    evaluate: (vals) => {
      const { salt, oxygen } = vals
      const s = Number(salt)
      if (oxygen === 'Expuesto al aire (Aeróbico)') {
        return { score: 20, feedback: '🚨 ¡Contaminación de Moho! Las bacterias lácticas necesitan un entorno estrictamente anaeróbico. Si la col flota expuesta al aire, se pudrirá y desarrollará moho superficial.' }
      }
      if (s < 1.5) {
        return { score: 40, feedback: '⚠️ Salmuera insuficiente. Menos del 1.5% de sal no inhibe a los patógenos iniciales. Tu fermento puede volverse blando o de olor desagradable.' }
      }
      if (s > 4) {
        return { score: 60, feedback: '🧂 Demasiada sal. Inhibirá tanto a los patógenos como a las bacterias ácido lácticas buenas. El proceso será sumamente lento y salado.' }
      }
      return { score: 100, feedback: '🏆 ¡Perfecto! La combinación de 2-3% de sal y un entorno sumergido anaeróbico garantiza un chucrut crujiente, ácido y cargado de probióticos sanos.' }
    }
  }
}

const getDefaultLab = (lesson) => ({
  title: `Práctica Culinaria: ${lesson.title}`,
  description: `Realiza la técnica descrita en la lección en tu cocina y registra tu autoevaluación.`,
  inputs: [
    { name: 'attempts', label: 'Número de intentos prácticos', type: 'number', min: 1, max: 10, default: 1 },
    { name: 'satisfaction', label: 'Calidad del resultado (Textura/Sabor)', type: 'select', options: ['Excelente / Profesional', 'Bueno / Aceptable', 'Requiere más práctica'] }
  ],
  evaluate: (vals) => {
    const { satisfaction } = vals
    if (satisfaction === 'Excelente / Profesional') {
      return { score: 100, feedback: '🏆 ¡Maravilloso! Has dominado la técnica de alta cocina en tu estación. Continúa experimentando.' }
    }
    if (satisfaction === 'Bueno / Aceptable') {
      return { score: 80, feedback: '👍 Buen progreso culinario. La repetición de pliegues o temperaturas perfeccionará tu memoria muscular.' }
    }
    return { score: 50, feedback: '👨‍🍳 La cocina de vanguardia requiere práctica. Vuelve a leer la teoría, controla tus pesos y reinténtalo.' }
  }
})

function LabPracticeCard({ lesson, onComplete }) {
  const customLab = LAB_PRACTICES[lesson.id] || getDefaultLab(lesson)
  const [formVals, setFormVals] = useState(() => {
    const initial = {}
    customLab.inputs.forEach(inp => {
      initial[inp.name] = inp.default || (inp.type === 'select' ? inp.options[0] : '')
    })
    return initial
  })
  const [result, setResult] = useState(null)

  const handleRun = () => {
    const evalResult = customLab.evaluate(formVals)
    setResult(evalResult)
    if (evalResult.score >= 80) {
      onComplete()
    }
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-2xl flex flex-col gap-4 animate-float-in">
      <div className="flex items-center gap-2">
        <Award size={18} className="text-amber-500" />
        <h4 className="text-sm font-black text-[var(--text-primary)]">{customLab.title}</h4>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {customLab.description}
      </p>

      <div className="space-y-4 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-moss)]">
        {customLab.inputs.map(inp => (
          <div key={inp.name} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--text-primary)]">{inp.label}</label>
            {inp.type === 'select' ? (
              <select
                value={formVals[inp.name]}
                onChange={e => setFormVals(p => ({ ...p, [inp.name]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-moss)] text-xs text-[var(--text-primary)] focus:outline-none"
              >
                {inp.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={inp.type}
                min={inp.min}
                max={inp.max}
                step={inp.step}
                value={formVals[inp.name]}
                onChange={e => setFormVals(p => ({ ...p, [inp.name]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-moss)] text-xs text-[var(--text-primary)] focus:outline-none"
              />
            )}
          </div>
        ))}
        <button
          onClick={handleRun}
          className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md tap-active"
        >
          🔬 Evaluar Práctica
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-1.5 transition-all ${
            result.score >= 80 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Resultado</span>
            <span className={`text-xs font-black ${result.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
              Calificación: {result.score}/100
            </span>
          </div>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed">{result.feedback}</p>
          {result.score >= 80 && (
            <p className="text-[9px] font-semibold text-green-500">✓ Completado y registrado. ¡Felicidades, chef!</p>
          )}
        </div>
      )}
    </div>
  )
}

const SIMULATORS = {
  'sem2-s1-l1': FermentationSimulator,
  'sem1-s2-l3': KnifeAnglesSimulator,
  'sem2-s2-l2': EmulsionSimulator,
  'sem3-s3-l1': ChocolateTemperingSimulator
}

// ============================================================
// WIDGET 1: Diagrama Celular Botánico Interactivo SVG
// ============================================================
function BotanicalCellDiagram({ semester }) {
  const [selectedPart, setSelectedPart] = useState('none');
  const [isCrushed, setIsCrushed] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const parts = {
    none: {
      title: "Célula de Allium (Ajo/Cebolla) Intacta",
      desc: "Haz clic en las distintas partes de la estructura celular para explorar sus compuestos bioquímicos."
    },
    wall: {
      title: "Pared Celular y Lámina Media",
      desc: "Compuesta por celulosa, hemicelulosa y protopectinas insolubles ligadas con iones de calcio (Ca²⁺) que actúan como cemento intercelular."
    },
    vacuole: {
      title: "Vacuola Gigante (Centro de Defensa)",
      desc: "Ocupa hasta el 90% de la célula y almacena la enzima activa ALIINASA. En estado intacto, está aislada del citosol."
    },
    cytosol: {
      title: "Citosol (Citoplasma)",
      desc: "El medio líquido celular donde se disuelve la ALIINA (aminoácido azufrado inodoro, precursor del sabor)."
    }
  };

  const handleCrush = () => {
    setIsCrushed(true);
    setShowAnimation(true);
    setSelectedPart('none');
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  const handleReset = () => {
    setIsCrushed(false);
    setSelectedPart('none');
  };

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🔬 Esquema Celular Interactivo</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simulador microscópico de compartimentación</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* SVG Diagram */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg 
            viewBox="0 0 200 200" 
            className={`w-full h-full transition-all duration-300 ${isCrushed ? 'animate-shake' : ''} ${showAnimation ? 'opacity-80' : ''}`}
          >
            <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-moss)" strokeDasharray="3 3" />
            
            {!isCrushed ? (
              <>
                <polygon 
                  points="100,10 178,55 178,145 100,190 22,145 22,55" 
                  fill="rgba(16, 185, 129, 0.05)" 
                  stroke={selectedPart === 'wall' ? 'var(--accent-mint)' : '#10b981'} 
                  strokeWidth={selectedPart === 'wall' ? '4' : '2'}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedPart('wall')}
                />
                
                <polygon 
                  points="100,20 168,60 168,140 100,180 32,140 32,60" 
                  fill={selectedPart === 'cytosol' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.08)'} 
                  stroke="none"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedPart('cytosol')}
                />
                <circle cx="60" cy="70" r="3" fill="#0ea5e9" opacity="0.8" />
                <circle cx="70" cy="130" r="3" fill="#0ea5e9" opacity="0.8" />
                <circle cx="130" cy="150" r="3" fill="#0ea5e9" opacity="0.8" />
                <circle cx="140" cy="60" r="3" fill="#0ea5e9" opacity="0.8" />
                <text x="50" y="62" fill="#0ea5e9" fontSize="8" fontWeight="bold" className="pointer-events-none opacity-80">Aliina</text>
                
                <circle 
                  cx="100" 
                  cy="100" 
                  r="45" 
                  fill={selectedPart === 'vacuole' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.08)'} 
                  stroke={selectedPart === 'vacuole' ? '#a855f7' : '#c084fc'} 
                  strokeWidth={selectedPart === 'vacuole' ? '3' : '1.5'}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedPart('vacuole')}
                />
                <path d="M 85,95 Q 100,80 115,95 Q 100,110 85,95" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.8" />
                <text x="80" y="112" fill="#a855f7" fontSize="8" fontWeight="bold" className="pointer-events-none opacity-80">Aliinasa</text>
              </>
            ) : (
              <>
                <polygon 
                  points="100,10 115,35 130,10 178,55 160,80 178,105 178,145 100,190 22,145 40,110 22,80 22,55" 
                  fill="rgba(239, 68, 68, 0.03)" 
                  stroke="#ef4444" 
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <circle cx="100" cy="100" r="80" fill="rgba(16, 185, 129, 0.04)" />
                <g className="animate-pulse">
                  <circle cx="100" cy="90" r="5" fill="#10b981" />
                  <circle cx="85" cy="120" r="5" fill="#10b981" />
                  <circle cx="120" cy="110" r="5" fill="#10b981" />
                  <circle cx="75" cy="75" r="5" fill="#10b981" />
                  <circle cx="130" cy="70" r="5" fill="#10b981" />
                  <line x1="100" y1="90" x2="85" y2="120" stroke="#10b981" strokeWidth="1" opacity="0.4" />
                  <line x1="100" y1="90" x2="120" y2="110" stroke="#10b981" strokeWidth="1" opacity="0.4" />
                  <text x="80" y="100" fill="#10b981" fontSize="10" fontWeight="black">ALICINA 🔥</text>
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Info panel */}
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div className="p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
            {isCrushed ? (
              <div>
                <h5 className="text-xs font-black text-red-500 flex items-center gap-1.5 mb-1">
                  💥 Célula Rupturada (Machacada)
                </h5>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  Las barreras celulares se han quebrado. La <strong>Aliinasa</strong> de la vacuola se unió al instante con la <strong>Aliina</strong> del citosol, desatando la cascada enzimática que sintetizó la <strong>Alicina</strong> (el compuesto picante y aromático).
                </p>
              </div>
            ) : (
              <div>
                <h5 className="text-xs font-black text-[var(--text-primary)] mb-1">
                  {parts[selectedPart].title}
                </h5>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  {parts[selectedPart].desc}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            {!isCrushed ? (
              <button
                onClick={handleCrush}
                className="flex-1 py-2 rounded-xl text-white text-[10px] font-black tap-active cursor-pointer shadow-sm text-center"
                style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
              >
                🧄 Machacar Ajo (Ruptura Celular)
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl border border-[var(--border-moss)] text-[var(--text-secondary)] text-[10px] font-bold tap-active cursor-pointer text-center bg-[var(--bg-card)]"
              >
                🔄 Restaurar Célula
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET ADICIONAL: Widget de Animación / HTML Personalizado
// ============================================================
function CustomHtmlWidget({ html }) {
  if (!html) return null;
  return (
    <div className="my-6 rounded-3xl border border-[var(--border-moss)] overflow-hidden bg-[var(--bg-elevated)] shadow-lg animate-float-in">
      <div className="bg-[var(--bg-card)] px-4 py-2 border-b border-[var(--border-moss)] flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-mint)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-mint)] animate-pulse" />
          Simulación Interactiva
        </span>
      </div>
      <iframe
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  margin: 0; 
                  padding: 12px; 
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                  background: #0B110E; 
                  color: #E2E8F0; 
                  overflow-x: hidden;
                }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                ::-webkit-scrollbar-thumb { background: rgba(46,229,157,0.2); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(46,229,157,0.4); }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `}
        sandbox="allow-scripts"
        className="w-full h-80 border-0"
        title="Custom Animation"
      />
    </div>
  );
}

// ============================================================
// WIDGET 1B: Anatomía Interactiva del Bulbo
// ============================================================
function BulbLayerExplorer({ semester }) {
  const [selectedLayer, setSelectedLayer] = useState('none');
  const layers = {
    none: { title: "Explorador de Capas del Bulbo", desc: "Haz clic en cada parte del bulbo para ver su importancia culinaria y botánica." },
    tunica: { title: "Túnica (Capa Protectora)", desc: "Hojas secas exteriores que aíslan al bulbo de la humedad extrema y evitan el ingreso de microorganismos." },
    catafilos: { title: "Catafilos Carnosos (Hojas de Reserva)", desc: "Capas carnosas internas que almacenan fructanos y agua libre. Se separan concéntricamente al cortar." },
    plato: { title: "Plato Basal (Disco/Tallo Corto)", desc: "El tallo real comprimido del que brotan las raíces adventicias hacia abajo y los catafilos hacia arriba." },
    yema: { title: "Yema Apical (Meristemo Central)", desc: "El punto de crecimiento del que brotarán las hojas aéreas. Contiene brotes meristemáticos activos." }
  };

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🧅 Anatomía Interactiva del Bulbo</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Explora las capas concéntricas</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer Tunica */}
            <path d="M 50,10 C 20,40 20,80 50,95 C 80,80 80,40 50,10 Z" fill="none" stroke={selectedLayer === 'tunica' ? 'var(--accent-mint)' : '#b45309'} strokeWidth={selectedLayer === 'tunica' ? '3' : '1.5'} className="cursor-pointer transition-all duration-200" onClick={() => setSelectedLayer('tunica')} />
            {/* Catafilos Outer */}
            <path d="M 50,18 C 26,44 26,76 50,90 C 74,76 74,44 50,18 Z" fill="none" stroke={selectedLayer === 'catafilos' ? 'var(--accent-mint)' : '#84cc16'} strokeWidth={selectedLayer === 'catafilos' ? '3' : '1.5'} className="cursor-pointer transition-all duration-200" onClick={() => setSelectedLayer('catafilos')} />
            {/* Catafilos Inner */}
            <path d="M 50,28 C 34,48 34,72 50,85 C 66,72 66,48 50,28 Z" fill="none" stroke={selectedLayer === 'catafilos' ? 'var(--accent-mint)' : '#a3e635'} strokeWidth={selectedLayer === 'catafilos' ? '2.5' : '1'} className="cursor-pointer transition-all duration-200" onClick={() => setSelectedLayer('catafilos')} />
            {/* Apical Bud */}
            <path d="M 50,42 C 42,54 42,68 50,80 C 58,68 58,54 50,42 Z" fill={selectedLayer === 'yema' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)'} stroke={selectedLayer === 'yema' ? '#a855f7' : '#c084fc'} strokeWidth="1.5" className="cursor-pointer transition-all duration-200" onClick={() => setSelectedLayer('yema')} />
            {/* Basal Plate */}
            <ellipse cx="50" cy="90" rx="20" ry="6" fill={selectedLayer === 'plato' ? '#f59e0b' : '#d97706'} className="cursor-pointer transition-all duration-200" onClick={() => setSelectedLayer('plato')} />
          </svg>
        </div>
        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          <h5 className="text-xs font-black text-[var(--text-primary)] mb-1">{layers[selectedLayer].title}</h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{layers[selectedLayer].desc}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1C: Comparador Tunicados vs Escamosos
// ============================================================
function TunicVsScaly({ semester }) {
  const [activeTab, setActiveTab] = useState('tunic');

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-3 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">⚖️ Comparador: Tunicados vs Escamosos</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Variaciones estructurales del bulbo</p>
      </div>
      <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1">
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'tunic' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setActiveTab('tunic')}>
          Tunicados (Cebolla/Ajo)
        </button>
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${activeTab === 'scaly' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setActiveTab('scaly')}>
          Escamosos (Lirio)
        </button>
      </div>
      <div className="p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 flex flex-col gap-2 min-h-[110px] justify-center">
        {activeTab === 'tunic' ? (
          <div>
            <h5 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1">🧅 Capas Concéntricas Continuas</h5>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1">
              Las capas (catafilos) están apretadas concéntricamente unas dentro de otras, formando anillos perfectos al cortarse transversalmente. Cuentan con una túnica seca externa. Ideal para retener humedad y cocinar en aros o plumas.
            </p>
          </div>
        ) : (
          <div>
            <h5 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1">🌸 Escamas Imbricadas Separables</h5>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1">
              Carecen de túnica protectora externa continua. Compuestos por escamas carnosas individuales que se superponen flojamente como tejas. Tienen parénquima muy almidonado. Muy apreciados en gastronomía asiática por su textura cerosa crujiente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1D: Panel de Control de Almacenamiento
// ============================================================
function PostHarvestControl({ semester }) {
  const [temp, setTemp] = useState(12);
  const [hum, setHum] = useState(68);

  const getStatus = () => {
    if (temp < 4) return { status: "Daño por frío ❄️", desc: "La temperatura extrema congela el agua vacuolar celular, colapsando los tejidos al retornar a temperatura ambiente.", color: "text-blue-500" };
    if (temp > 15 && hum > 75) return { status: "Pudrición bacteriana 🦠", desc: "El calor y la humedad excesiva activan la respiración celular y condensan agua, propiciando el ataque de Erwinia carotovora.", color: "text-red-500" };
    if (temp > 14 && hum <= 75) return { status: "Brotación y Germinación 🌱", desc: "La temperatura cálida rompe la latencia de la yema apical. Brotarán hojas verdes que restarán sabor y dulzor al bulbo.", color: "text-amber-500" };
    if (hum < 60) return { status: "Deshidratación y Plasmólisis 🍂", desc: "La baja humedad provoca pérdida de agua vacuolar por transpiración pasiva, perdiendo turgencia y firmeza crujiente.", color: "text-yellow-600" };
    return { status: "Latencia Óptima ✅", desc: "Variables perfectas. El bulbo mantiene una respiración celular lenta y controlada, preservando azúcares y sabor por meses.", color: "text-emerald-500" };
  };

  const currentStatus = getStatus();

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌡️ Panel de Control de Almacenamiento</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simula variables de despensa profesional</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)]">
            <span>Temperatura: {temp}°C</span>
            <span className="text-[var(--text-secondary)]">Ideal: 10-14°C</span>
          </div>
          <input type="range" min="0" max="30" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-[var(--accent-mint)]" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)]">
            <span>Humedad Relativa: {hum}%</span>
            <span className="text-[var(--text-secondary)]">Ideal: 65-70%</span>
          </div>
          <input type="range" min="40" max="95" value={hum} onChange={(e) => setHum(Number(e.target.value))} className="w-full accent-[var(--accent-mint)]" />
        </div>
        <div className="p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center mt-1">
          <h5 className={`text-xs font-black ${currentStatus.color} mb-1`}>{currentStatus.status}</h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{currentStatus.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 2: Termómetro de Hitos Térmicos Interactivo
// ============================================================
function ThermalThermometer({ semester }) {
  const [selectedTemp, setSelectedTemp] = useState(82);

  const milestones = {
    4: {
      title: "❄️ 4 °C — Cristalización y Retrogradación",
      desc: "El almidón cocido se enfría y las cadenas de amilosa se alinean de forma compacta para formar almidón resistente tipo RS3. Ideal para ensaladas de patata prebióticas."
    },
    60: {
      title: "🔬 60 °C — Inactivación Enzimática y Gelatinización",
      desc: "La enzima aliinasa muere permanentemente. Comienza la hidratación del almidón: los gránulos absorben agua masivamente hinchándose y espesando líquidos."
    },
    82: {
      title: "🌿 82 °C — Beta-eliminación de Pectinas",
      desc: "Punto de ablandamiento crítico del vegetal. Las protopectinas insolubles ligadas con calcio en la lámina media se descomponen en pectinas solubles, permitiendo que las células se separen y deslicen."
    },
    110: {
      title: "🔥 110 °C — Caramelización de la Fructosa",
      desc: "La fructosa libre de los bulbos sufre pirólisis térmica directa en ausencia de proteínas, formando caramelán (dorado) y aromas dulces de toffee."
    },
    140: {
      title: "🍳 140 °C — Reacción de Maillard",
      desc: "Los azúcares reductores se unen con aminoácidos libres (como la cisteína azufrada). Se forman melanoidinas de color marrón y pirazinas con aromas complejos cárnicos, tostados y umami."
    }
  };

  const temps = [4, 60, 82, 110, 140];

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌡️ Termómetro de Hitos Térmicos</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Efectos del calor en tejidos y macromoléculas vegetales</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative pt-4 pb-2 px-1">
          <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full border border-[var(--border-moss)] relative">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((temps.indexOf(selectedTemp) + 1) / temps.length) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f59e0b 80%, #ef4444 100%)'
              }}
            />
          </div>

          <div className="flex justify-between items-center -mt-5 relative z-10 px-0.5">
            {temps.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTemp(t)}
                className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedTemp === t
                    ? 'bg-white text-black shadow-lg scale-110'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:scale-105'
                }`}
                style={selectedTemp === t ? { borderColor: semester.color } : { borderColor: 'var(--border-moss)' }}
              >
                <span className="text-[8px] font-black">{t}°C</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[95px] flex flex-col justify-center animate-float-in" key={selectedTemp}>
          <h5 className="text-xs font-black flex items-center gap-1.5 mb-1.5" style={{ color: semester.color }}>
            {milestones[selectedTemp].title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            {milestones[selectedTemp].desc}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1E: Cutting Mechanics Simulator
// ============================================================
function CuttingMechanicsSimulator({ semester }) {
  const [cutType, setCutType] = useState('none');
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🔪 Simulador Mecánico del Corte</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Longitudinal vs Transversal a nivel celular</p>
      </div>
      <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1">
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${cutType === 'longitudinal' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setCutType('longitudinal')}>
          Corte Longitudinal (Paralelo)
        </button>
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${cutType === 'transversal' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setCutType('transversal')}>
          Corte Transversal (Perpendicular)
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-36 h-36 shrink-0 relative bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Cell walls representation */}
            <g stroke="#10b981" strokeWidth="1.5" fill="none">
              <path d="M 20,10 L 20,90 M 40,10 L 40,90 M 60,10 L 60,90 M 80,10 L 80,90" />
              <path d="M 20,30 L 40,30 M 40,50 L 60,50 M 60,25 L 80,25 M 20,65 L 40,65 M 60,70 L 80,70" />
            </g>
            
            {/* Vacuoles */}
            <g fill="#0ea5e9" opacity={cutType === 'transversal' ? "0.2" : "0.5"} className="transition-all duration-300">
              <circle cx="30" cy="20" r="4" />
              <circle cx="30" cy="48" r="4" />
              <circle cx="30" cy="78" r="4" />
              <circle cx="50" cy="35" r="4" />
              <circle cx="50" cy="68" r="4" />
              <circle cx="70" cy="15" r="4" />
              <circle cx="70" cy="48" r="4" />
              <circle cx="70" cy="82" r="4" />
            </g>
            
            {cutType === 'longitudinal' && (
              <>
                {/* Knife moving between lines */}
                <line x1="40" y1="5" x2="40" y2="95" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 2" className="animate-pulse" />
                <path d="M 37,15 L 43,15 M 37,55 L 43,55 M 37,85 L 43,85" stroke="#3b82f6" strokeWidth="1" />
              </>
            )}
            
            {cutType === 'transversal' && (
              <>
                {/* Knife cutting across */}
                <line x1="5" y1="50" x2="95" y2="50" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 2" className="animate-pulse" />
                {/* Leaking droplets */}
                <g fill="#0ea5e9" className="animate-bounce">
                  <path d="M 30,55 C 30,57 28,59 28,60 C 28,61 29,62 30,62 C 31,62 32,61 32,60 C 32,59 30,57 30,55 Z" />
                  <path d="M 50,55 C 50,57 48,59 48,60 C 48,61 49,62 50,62 C 51,62 52,61 52,60 C 52,59 50,57 50,55 Z" />
                  <path d="M 70,55 C 70,57 68,59 68,60 C 68,61 69,62 70,62 C 71,62 72,61 72,60 C 72,59 70,57 70,55 Z" />
                </g>
                <text x="25" y="47" fill="#ef4444" fontSize="6" fontWeight="bold">Ruptura</text>
              </>
            )}
          </svg>
        </div>
        
        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          {cutType === 'none' && (
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Selecciona un tipo de corte para simular su efecto a nivel celular y ver cómo impacta la termodinámica de cocción y el perfil de sabor.
            </p>
          )}
          {cutType === 'longitudinal' && (
            <div>
              <h5 className="text-xs font-black text-emerald-500 mb-1">🛡️ Células Preservadas</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                El cuchillo pasa entre las paredes celulares (laminilla media). Los fructanos y el agua quedan confinados. La cebolla retiene su estructura, tarda en ablandarse y ofrece resistencia al mordisco ideal para la Sopa de Cebolla.
              </p>
            </div>
          )}
          {cutType === 'transversal' && (
            <div>
              <h5 className="text-xs font-black text-red-500 mb-1">💥 Colapso y Pérdida de Jugo</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                El cuchillo rompe las paredes de celulosa transversales. Se liberan instantáneamente precursores y agua vacuolar. El agua se evapora rápido al fuego, caramelizando velozmente. Ideal para sofritos y aderezos derretidos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1F: Bulb Types Explorer
// ============================================================
function BulbTypesExplorer({ semester }) {
  const [bulbType, setBulbType] = useState('tunicado');
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🧄 Comparador de Diseños de Bulbos</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simples (con concéntricos) frente a Compuestos (con dientes)</p>
      </div>
      <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1">
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${bulbType === 'tunicado' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setBulbType('tunicado')}>
          Tunicado Simple (Cebolla)
        </button>
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${bulbType === 'compuesto' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setBulbType('compuesto')}>
          Compuesto (Ajo)
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-36 h-36 shrink-0 relative bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {bulbType === 'tunicado' ? (
              <g stroke="#84cc16" strokeWidth="1.5" fill="none">
                {/* Concentric onion layers */}
                <circle cx="50" cy="50" r="40" stroke="#b45309" strokeWidth="2" />
                <circle cx="50" cy="50" r="32" />
                <circle cx="50" cy="50" r="24" />
                <circle cx="50" cy="50" r="16" />
                <circle cx="50" cy="50" r="8" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" />
              </g>
            ) : (
              <g stroke="#f59e0b" strokeWidth="1.5" fill="none">
                {/* Composite Garlic Cloves */}
                <circle cx="50" cy="50" r="42" stroke="#d97706" strokeWidth="1.5" />
                {/* individual cloves */}
                <path d="M 50,50 Q 50,15 40,20 Q 30,30 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <path d="M 50,50 Q 85,50 80,40 Q 70,30 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <path d="M 50,50 Q 50,85 60,80 Q 70,70 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <path d="M 50,50 Q 15,50 20,60 Q 30,70 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <path d="M 50,50 Q 15,25 25,15 Q 35,25 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <path d="M 50,50 Q 85,75 75,85 Q 65,75 50,50" fill="rgba(245, 158, 11, 0.1)" />
                <circle cx="50" cy="50" r="5" fill="#d97706" />
              </g>
            )}
          </svg>
        </div>
        
        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          {bulbType === 'tunicado' ? (
            <div>
              <h5 className="text-xs font-black text-amber-600 mb-1">🧅 Capas Concéntricas Continuas</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                Cada catafilo forma un cilindro cerrado. El asado entero retiene humedad y cocina las capas internas al vapor. Al cortarse, produce aros y plumas perfectas de sabor dulce.
              </p>
            </div>
          ) : (
            <div>
              <h5 className="text-xs font-black text-amber-500 mb-1">🧄 Bulbillos Independientes (Dientes)</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                Cada diente es una unidad biológica autónoma con su propio punto apical y túnica fibrosa protectora. Si se cocinan enteros con su piel, retienen el vapor de agua disolviendo pectinas y dando una crema untuosa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1G: Scaly Starch Gelatinization
// ============================================================
function ScalyStarchGelatinization({ semester }) {
  const [cookTime, setCookTime] = useState(0);
  
  const getGelState = () => {
    if (cookTime === 0) {
      return {
        title: "🌱 Escama Cruda",
        desc: "Almidón en gránulos duros e insolubles. Paredes de celulosa y pectina rígidas. Textura muy crujiente y dura.",
        color: "text-[var(--text-secondary)]",
        hydration: 0
      };
    } else if (cookTime <= 45) {
      return {
        title: "✨ Gelatinización Superficial (Óptimo)",
        desc: "Los gránulos de almidón externos absorben agua y se hinchan a 65°C creando una película brillante y untuosa. El centro de la escama conserva pectinas firmes, logrando un crujido excepcional.",
        color: "text-emerald-500",
        hydration: 50
      };
    } else {
      return {
        title: "⚠️ Colapso de Estructura e Hidrólisis",
        desc: "El agua penetra por completo el parénquima de reserva. Las pectinas de la laminilla media se disuelven (beta-eliminación) y los granos de almidón revientan, convirtiendo la escama en una masa pastosa, harinosa y sin mordida.",
        color: "text-red-500",
        hydration: 100
      };
    }
  };
  
  const stateInfo = getGelState();
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌸 Gelatinización del Almidón en Escamas</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Dinámica de cocción del lirio comestible (Lilium)</p>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)]">
            <span>Tiempo de Cocción: {cookTime} segundos</span>
            <span className="text-[var(--text-secondary)]">Límite crujiente: 45s</span>
          </div>
          <input type="range" min="0" max="120" value={cookTime} onChange={(e) => setCookTime(Number(e.target.value))} className="w-full accent-[var(--accent-mint)]" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-36 h-36 shrink-0 relative bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Celda vegetal */}
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="#84cc16" strokeWidth={cookTime > 45 ? "1" : "2"} className="transition-all duration-300" />
              
              {/* Starch grains inside */}
              {cookTime === 0 && (
                <>
                  <circle cx="50" cy="50" r="10" fill="#e2e8f0" stroke="#94a3b8" />
                  <circle cx="35" cy="40" r="8" fill="#e2e8f0" stroke="#94a3b8" />
                  <circle cx="65" cy="45" r="7" fill="#e2e8f0" stroke="#94a3b8" />
                  <circle cx="45" cy="65" r="9" fill="#e2e8f0" stroke="#94a3b8" />
                  <circle cx="60" cy="62" r="8" fill="#e2e8f0" stroke="#94a3b8" />
                </>
              )}
              
              {cookTime > 0 && cookTime <= 45 && (
                <>
                  {/* Swelling slightly & outer gel layer */}
                  <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="rgba(14, 165, 233, 0.15)" stroke="#0ea5e9" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="13" fill="rgba(14, 165, 233, 0.4)" stroke="#0ea5e9" className="animate-pulse" />
                  <circle cx="35" cy="40" r="11" fill="rgba(14, 165, 233, 0.4)" stroke="#0ea5e9" />
                  <circle cx="65" cy="45" r="10" fill="rgba(14, 165, 233, 0.4)" stroke="#0ea5e9" />
                  <circle cx="45" cy="65" r="12" fill="rgba(14, 165, 233, 0.4)" stroke="#0ea5e9" />
                  <text x="32" y="90" fill="#0ea5e9" fontSize="6" fontWeight="bold">Gel exterior</text>
                </>
              )}
              
              {cookTime > 45 && (
                <>
                  {/* Bursting / Colapso */}
                  <polygon points="50,8 87,27 87,73 50,92 13,73 13,27" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="50" cy="50" r="22" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 1" />
                  <circle cx="32" cy="38" r="18" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="0.5" />
                  <circle cx="68" cy="60" r="20" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="0.5" />
                  <path d="M 40,40 Q 50,30 60,40 M 30,60 Q 50,55 70,65" stroke="#ef4444" strokeWidth="1" />
                  <text x="25" y="90" fill="#ef4444" fontSize="6" fontWeight="bold">Colapso celular</text>
                </>
              )}
            </svg>
          </div>
          
          <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
            <h5 className={`text-xs font-black ${stateInfo.color} mb-1`}>{stateInfo.title}</h5>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{stateInfo.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1H: Respiration Rate Simulator
// ============================================================
function RespirationRateSimulator({ semester }) {
  const [temp, setTemp] = useState(12);
  const [hum, setHum] = useState(65);
  
  // Exponential respiration rate with temperature
  const respirationRate = Math.round(Math.pow(1.15, temp) * 10) / 10;
  // Water loss rate increases if humidity is low
  const waterLoss = Math.max(0, Math.round((70 - hum) * 1.5 * 10) / 10);
  
  const getQualityAssessment = () => {
    if (temp < 4) {
      return { status: "⚠️ Frío Crítico (Retrogradación)", desc: "Las bajas temperaturas rompen la latencia obligando a hidrolizar fructanos en azúcares simples como defensa térmica.", color: "text-blue-400" };
    }
    if (temp > 15 && hum > 75) {
      return { status: "🦠 Pudrición Acelerada", desc: "La respiración alta genera calor y humedad que condensan en la bodega, fomentando ataques fúngicos y bacterianos.", color: "text-red-500" };
    }
    if (temp > 14) {
      return { status: "🌱 Despertar Apical (Brotación)", desc: "El calor sostenido activa el metabolismo central y activa la yema apical. Consumo masivo de fructanos.", color: "text-amber-500" };
    }
    if (hum < 60) {
      return { status: "🍂 Pérdida de Turgencia (Plasmólisis)", desc: "El aire seco absorbe agua celular. El bulbo se arruga, perdiendo masa firmeza crujiente.", color: "text-yellow-600" };
    }
    return { status: "✅ Latencia Óptima", desc: "La respiración es mínima. Los fructanos permanecen intactos y las células duraderas.", color: "text-emerald-500" };
  };
  
  const assessment = getQualityAssessment();
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌡️ Tasa Respiratoria y Pérdida de Masa</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simulador fisiológico post-cosecha en despensa</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--text-primary)]">Temperatura: {temp}°C</span>
            <input type="range" min="0" max="25" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-[var(--accent-mint)]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--text-primary)]">Humedad: {hum}%</span>
            <input type="range" min="40" max="90" value={hum} onChange={(e) => setHum(Number(e.target.value))} className="w-full accent-[var(--accent-mint)]" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-moss)]/40">
              <span className="block text-[8px] text-[var(--text-secondary)] font-bold uppercase">Tasa de Respiración</span>
              <span className="text-xs font-black text-amber-500">{respirationRate} mL CO₂/kg·h</span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-moss)]/40">
              <span className="block text-[8px] text-[var(--text-secondary)] font-bold uppercase">Pérdida de Peso Diaria</span>
              <span className="text-xs font-black text-blue-500">{waterLoss} g/kg</span>
            </div>
          </div>
          
          <div className="flex-1 w-full p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[75px] flex flex-col justify-center">
            <h5 className={`text-xs font-black ${assessment.color} mb-1`}>{assessment.status}</h5>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{assessment.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1I: Ethylene Diffusion Simulator
// ============================================================
function EthyleneDiffusionSimulator({ semester }) {
  const [hasEthylene, setHasEthylene] = useState(false);
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌱 Difusión de Etileno en Despensa</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simula la cercanía de frutas climatéricas a los bulbos</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-36 h-36 shrink-0 relative bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Onion outline */}
            <path d="M 50,25 C 30,45 30,75 50,85 C 70,75 70,45 50,25 Z" fill="rgba(168, 85, 247, 0.05)" stroke="#a855f7" strokeWidth="1.5" />
            
            {/* Meristem yema apical */}
            {!hasEthylene ? (
              <circle cx="50" cy="65" r="3" fill="#a855f7" />
            ) : (
              <path d="M 50,65 Q 48,45 50,20 Q 52,45 50,65" fill="#84cc16" className="animate-pulse" />
            )}
            
            {/* Fruits releasing gas */}
            {hasEthylene ? (
              <>
                <circle cx="15" cy="80" r="10" fill="#ef4444" />
                <rect x="13" y="67" width="4" height="6" fill="#b45309" />
                {/* gas molecules */}
                <g fill="#10b981" className="animate-ping" opacity="0.6">
                  <circle cx="28" cy="65" r="1.5" />
                  <circle cx="38" cy="50" r="1.5" />
                  <circle cx="48" cy="40" r="1.5" />
                </g>
                <text x="8" y="95" fill="#ef4444" fontSize="5" fontWeight="bold">Manzana</text>
              </>
            ) : (
              <text x="5" y="85" fill="var(--text-secondary)" fontSize="5">Sin frutas</text>
            )}
          </svg>
        </div>
        
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div className="p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
            {!hasEthylene ? (
              <div>
                <h5 className="text-xs font-black text-emerald-500 mb-1">💤 Latencia Profunda Activa</h5>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  Las cebollas y ajos permanecen dulces e inodoros. El ácido abscísico está en niveles altos. Fructanos intactos al 100%.
                </p>
              </div>
            ) : (
              <div>
                <h5 className="text-xs font-black text-red-500 mb-1">🚨 Brotación y Pérdida de Sabor</h5>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  El gas etileno ($C_2H_4$) penetra en la yema. La auxina se dispara, la yema apical crece brotando una hoja interna verde. La fructosa es consumida, restando dulzor y añadiendo amargor metálico.
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setHasEthylene(!hasEthylene)}
            className="mt-3 py-2 rounded-xl text-white text-[10px] font-black tap-active cursor-pointer shadow-sm text-center animate-pulse"
            style={{ background: hasEthylene ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            {hasEthylene ? "🍎 Retirar Manzanas" : "🍎 Colocar Manzanas Cerca"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1J: Sulfur Cascade Reaction
// ============================================================
function SulfurCascadeReaction({ semester }) {
  const [step, setStep] = useState(1);
  
  const steps = {
    1: {
      title: "Paso 1: Ruptura del Tonoplasto",
      desc: "El corte del cuchillo fractura físicamente el tonoplasto (membrana de la vacuola). La enzima aliinasa vacuolar inunda el citosol celular.",
      equation: "Vacuola abierta ➔ Aliinasa liberada"
    },
    2: {
      title: "Paso 2: Acoplamiento de la Enzima",
      desc: "La aliinasa se une instantáneamente al precursor aminoácido azufrado Aliina (ajo) o Isoaliina (cebolla) flotando en el citosol.",
      equation: "Aliina + Aliinasa ➔ Complejo Activo"
    },
    3: {
      title: "Paso 3: Hidrólisis Enzimática",
      desc: "La enzima rompe el enlace químico en microsegundos, liberando ácido alilsulfénico, piruvato y amoníaco.",
      equation: "Complejo Activo ➔ Ácido Alilsulfénico + Piruvato"
    },
    4: {
      title: "Paso 4: Condensación Final (Alicina / Gas)",
      desc: "En el Ajo, dos moléculas de ácido alilsulfénico se condensan en Alicina (aroma y picor). En la Cebolla, la LF-sintasa produce S-óxido de tiopropanal (gas que hace llorar).",
      equation: "Ácido Alilsulfénico ➔ ALICINA 🔥 / S-Óxido Gas 😢"
    }
  };
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">⚗️ Cascada Bioquímica del Azufre</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Reacción cinética paso a paso tras el corte</p>
      </div>
      
      <div className="flex justify-between items-center px-4">
        {[1, 2, 3, 4].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`w-6 h-6 rounded-full text-[10px] font-black border flex items-center justify-center transition-all cursor-pointer ${
              step === s ? 'bg-[var(--accent-mint)] text-black border-[var(--accent-mint)] scale-110 shadow-md' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-moss)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      
      <div className="p-3.5 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center animate-float-in" key={step}>
        <h5 className="text-xs font-black text-[var(--text-primary)] mb-1">{steps[step].title}</h5>
        <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed mb-2">{steps[step].desc}</p>
        <span className="inline-block self-start px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-moss)]/40 text-[8px] font-mono text-[var(--accent-mint)]">
          {steps[step].equation}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 1K: Knife Sharpness Simulator
// ============================================================
function KnifeSharpnessSimulator({ semester }) {
  const [isSharp, setIsSharp] = useState(true);
  
  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🔪 Simulador de Filo y Daño Tisular</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Cuchillo afilado frente a desafilado</p>
      </div>
      
      <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1">
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${isSharp ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setIsSharp(true)}>
          Filo de Espejo (#8000)
        </button>
        <button className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${!isSharp ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-secondary)]'}`} onClick={() => setIsSharp(false)}>
          Filo Romo / Desafilado
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-36 h-36 shrink-0 relative bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Cells representation */}
            {isSharp ? (
              <g stroke="#10b981" strokeWidth="1.5" fill="none">
                {/* Nice hexagon cells cleanly sliced */}
                <path d="M 10,20 L 30,20 L 40,35 L 30,50 L 10,50 L 5,35 Z" fill="rgba(16,185,129,0.05)" />
                <path d="M 60,20 L 80,20 L 90,35 L 80,50 L 60,50 L 50,35 Z" fill="rgba(16,185,129,0.05)" />
                <path d="M 10,60 L 30,60 L 40,75 L 30,90 L 10,90 L 5,75 Z" fill="rgba(16,185,129,0.05)" />
                <path d="M 60,60 L 80,60 L 90,75 L 80,90 L 60,90 L 50,75 Z" fill="rgba(16,185,129,0.05)" />
                {/* Blade line slice */}
                <line x1="45" y1="5" x2="45" y2="95" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="49" y="15" fill="#3b82f6" fontSize="5" fontWeight="bold">Corte Limpio</text>
              </g>
            ) : (
              <g stroke="#ef4444" strokeWidth="1.5" fill="none" className="animate-shake">
                {/* Crushed, irregular shape cells */}
                <path d="M 10,25 Q 25,15 35,30 Q 30,55 10,48 Z" fill="rgba(239,68,68,0.1)" />
                <path d="M 65,22 Q 75,18 85,35 Q 75,55 58,45 Z" fill="rgba(239,68,68,0.1)" />
                {/* Blade squishing */}
                <line x1="40" y1="5" x2="50" y2="95" stroke="#ef4444" strokeWidth="3" />
                {/* tear drop vapors / droplets */}
                <circle cx="25" cy="35" r="3" fill="#0ea5e9" opacity="0.7" />
                <circle cx="70" cy="30" r="3" fill="#0ea5e9" opacity="0.7" />
                <circle cx="50" cy="50" r="2.5" fill="#0ea5e9" opacity="0.7" />
                <text x="25" y="80" fill="#ef4444" fontSize="5" fontWeight="bold">Aplastamiento</text>
              </g>
            )}
          </svg>
        </div>
        
        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          {isSharp ? (
            <div>
              <h5 className="text-xs font-black text-emerald-500 mb-1">⚡ Corte de Precisión Molecular</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                El cuchillo de chef ultra-afilado separa las células sin dañarlas mecánicamente. El tonoplasto no se rompe a los lados del corte. No hay lixiviación de jugos ni gases lacrimógenos. Tabla seca y sabor puro.
              </p>
            </div>
          ) : (
            <div>
              <h5 className="text-xs font-black text-red-500 mb-1">😢 Presión Romo y Gas Lacrimógeno</h5>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                La hoja desafilada actúa como cuña que aplasta las células. Revientan a varios milímetros de distancia. Liberación violenta de aliinasa e isoaliina, lixiviando jugos que se oxidan, dando notas amargas y lágrimas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 8: Sucesión Ecológica de BAL (Sem2-S1-L1)
// ============================================================
function SucesionEcologicaBal({ semester }) {
  const [day, setDay] = useState(0);

  const leuconostoc = [10, 85, 95, 40, 10, 0, 0, 0, 0, 0, 0];
  const plantarum = [0, 5, 20, 60, 90, 95, 96, 95, 95, 95, 95];
  const ph = [6.5, 6.0, 5.2, 4.5, 4.0, 3.8, 3.7, 3.6, 3.6, 3.6, 3.6];

  const getStatusText = (d) => {
    if (d === 0) return { title: "Día 0: Inicio", desc: "La col morada se introduce en la salmuera al 2%. Las bacterias nativas están en estado latente.", color: "text-[var(--text-secondary)]" };
    if (d <= 2) return { title: "Día 1-2: Fase Leuconostoc", desc: "L. mesenteroides coloniza el medio rápidamente. Consume azúcares liberando ácido láctico, acético y abundante CO₂ gaseoso que expulsa el oxígeno residual.", color: "text-emerald-400" };
    if (d <= 4) return { title: "Día 3-4: Transición Ecológica", desc: "El pH cae abajo de 4.5. L. mesenteroides se autoinactiva por acidez. Comienza a dominar Lactobacillus plantarum para acidificar de forma vigorosa.", color: "text-blue-400" };
    if (d <= 7) return { title: "Día 5-7: Homofefermentación Láctica", desc: "L. plantarum fermenta agresivamente produciendo ácido láctico puro. El pH desciende al rango seguro de 3.6 a 3.8. El fermento adquiere acidez limpia.", color: "text-amber-500" };
    return { title: "Día 8-10: Estabilización y Maduración", desc: "Los azúcares se agotan. Lactobacillus pentosus y plantarum entran en latencia por autolimitación ácida. El chucrut está completamente curado y estable.", color: "text-emerald-500" };
  };

  const status = getStatusText(day);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🔬 Sucesión Ecológica Microbiana (BAL)</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Monitorea el ecosistema de bacterias en el chucrut a lo largo de 10 días</p>
      </div>

      <div className="w-full h-40 bg-[var(--bg-elevated)]/25 rounded-2xl border border-[var(--border-moss)]/40 p-2 relative">
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border-moss)" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border-moss)" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="5" x2="100" y2="5" stroke="var(--border-moss)" strokeWidth="0.5" opacity="0.3" />
          
          <line x1={day * 10} y1="0" x2={day * 10} y2="38" stroke="var(--accent-mint)" strokeWidth="0.8" strokeDasharray="1.5 1" />

          <path 
            d={`M 0,${35 - leuconostoc[0]*0.3} Q 20,${35 - leuconostoc[2]*0.3} 40,${35 - leuconostoc[4]*0.3} T 100,35`} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="1.5" 
          />
          <path 
            d={`M 0,35 Q 20,${35 - plantarum[2]*0.3} 40,${35 - plantarum[4]*0.3} T 100,${35 - plantarum[10]*0.3}`} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="1.5" 
          />
          <path 
            d={`M 0,${35 - (ph[0]-3)*5} Q 20,${35 - (ph[2]-3)*5} 40,${35 - (ph[4]-3)*5} T 100,${35 - (ph[10]-3)*5}`} 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="1.2" 
            strokeDasharray="2 1"
          />

          <circle cx="5" cy="5" r="1" fill="#10b981" />
          <text x="7" y="6.5" fill="#10b981" fontSize="2.2">L. mesenteroides</text>

          <circle cx="35" cy="5" r="1" fill="#3b82f6" />
          <text x="37" y="6.5" fill="#3b82f6" fontSize="2.2">L. plantarum</text>

          <circle cx="65" cy="5" r="1" fill="#ef4444" />
          <text x="67" y="6.5" fill="#ef4444" fontSize="2.2">pH del Medio</text>
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-primary)]">
          <span>Día: {day}</span>
          <span className="text-[9px] text-[var(--text-secondary)]">Desliza para avanzar tiempo</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="10" 
          value={day} 
          onChange={(e) => setDay(parseInt(e.target.value))}
          className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
        />
      </div>

      <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)]/30 border border-[var(--border-moss)]/40">
        <h5 className={`text-xs font-black mb-1 ${status.color}`}>
          {status.title}
        </h5>
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
          {status.desc}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 9: Osmosis en Curado de Kimchi (Sem2-S1-L2)
// ============================================================
function KimchiSaladoOsmosis({ semester }) {
  const [salinity, setSalinity] = useState(8);

  const getOsmoticData = (s) => {
    if (s < 2) {
      return {
        title: "Sub-ósmosis (Salinidad insuficiente)",
        desc: "Las células vegetales retienen el agua. La col china permanece dura pero sin protección microbiana. La enzima pectinasa destruirá la pared celular celular, ablandando las hojas.",
        color: "text-red-400",
        cellColor: "rgba(239, 68, 68, 0.05)",
        strokeColor: "#ef4444",
        waterFlow: "in",
        membraneScale: 0.95
      };
    }
    if (s <= 11) {
      return {
        title: "Ósmosis Perfecta (Salinidad Ideal 8% - 10%)",
        desc: "El agua celular sale libremente hacia el exterior en equilibrio plasmático. La vacuole colapsa reduciendo volumen celular. Las fibras de col quedan crujientes, elásticas y desinfectadas.",
        color: "text-[var(--accent-mint)]",
        cellColor: "rgba(16, 185, 129, 0.05)",
        strokeColor: "#2EE59D",
        waterFlow: "out",
        membraneScale: 0.75
      };
    }
    return {
      title: "Hiper-ósmosis / Salinidad Letal (>12%)",
      desc: "Deshidratación celular extrema. La salinidad excede el límite de tolerancia de las bacterias ácido-lácticas (shock osmótico). El fermento se bloquea y la col morirá salada y sin acidificar.",
      color: "text-amber-500",
      cellColor: "rgba(245, 158, 11, 0.05)",
      strokeColor: "#f59e0b",
      waterFlow: "stop",
      membraneScale: 0.60
    };
  };

  const data = getOsmoticData(salinity);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🧂 Curado de Col China y Dinámica de Ósmosis</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Ajusta la concentración de salmuera para observar el comportamiento osmótico de las células basales</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-32 h-32 shrink-0 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="15" y="15" width="70" height="70" rx="10" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" opacity="0.3" />
            <rect 
              x={50 - 35 * data.membraneScale} 
              y={50 - 35 * data.membraneScale} 
              width={70 * data.membraneScale} 
              height={70 * data.membraneScale} 
              rx={10 * data.membraneScale} 
              stroke={data.strokeColor} 
              strokeWidth="2" 
              fill={data.cellColor}
              className="transition-all duration-300"
            />
            <circle 
              cx="50" 
              cy="50" 
              r={20 * data.membraneScale} 
              fill="#0ea5e9" 
              opacity="0.25"
              className="transition-all duration-300"
            />
            {data.waterFlow === "out" && (
              <g stroke="#0ea5e9" strokeWidth="1" fill="none" className="animate-pulse">
                <line x1="50" y1="50" x2="10" y2="10" strokeDasharray="2 1" />
                <line x1="50" y1="50" x2="90" y2="90" strokeDasharray="2 1" />
                <line x1="50" y1="50" x2="90" y2="10" strokeDasharray="2 1" />
                <line x1="50" y1="50" x2="10" y2="90" strokeDasharray="2 1" />
              </g>
            )}
            {data.waterFlow === "in" && (
              <g stroke="#ef4444" strokeWidth="1" fill="none" className="animate-pulse">
                <line x1="10" y1="10" x2="45" y2="45" strokeDasharray="2 1" />
                <line x1="90" y1="90" x2="55" y2="55" strokeDasharray="2 1" />
              </g>
            )}
          </svg>
        </div>

        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          <h5 className={`text-xs font-black mb-1 ${data.color}`}>
            {data.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            {data.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-primary)]">
          <span>Concentración de Sal: {salinity}%</span>
          <span className="text-[9px] text-[var(--text-secondary)]">Ideal: 8% a 10%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="15" 
          value={salinity} 
          onChange={(e) => setSalinity(parseInt(e.target.value))}
          className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 10: Prevención de Moho Kahm en Salmueras (Sem2-S1-L3)
// ============================================================
function KahmMoldSimulator({ semester }) {
  const [sal, setSal] = useState(2.0);
  const [ph, setPh] = useState(5.0);

  const evaluateRisk = (s, p) => {
    if (p > 4.6 || s < 1.8) {
      return {
        title: "¡Riesgo Extremo de Moho Kahm!",
        desc: "Las condiciones son ideales para que las levaduras aerobias (Kahm) y patógenos colonicen la superficie. pH alto y sal marina insuficiente permiten el desarrollo micótico.",
        color: "text-red-400",
        bg: "rgba(239, 68, 68, 0.05)",
        kahmAlpha: 0.8,
        bubbles: 0
      };
    }
    if (p > 4.2 || s < 2.2) {
      return {
        title: "Riesgo Moderado / Alerta de Velo",
        desc: "El pH está bajando pero la baja salinidad facilita la germinación de levaduras si entra oxígeno. Mantenga el frasco sellado herméticamente.",
        color: "text-amber-500",
        bg: "rgba(245, 158, 11, 0.05)",
        kahmAlpha: 0.4,
        bubbles: 3
      };
    }
    return {
      title: "Salmuera Segura y Estable (Inhibición Total)",
      desc: "La acidez láctica pura (pH < 4.0) y la salinidad al 2.5% inhiben de inmediato todas las esporas de moho Kahm y patógenos. El fermento burbujea CO₂ activamente.",
      color: "text-[var(--accent-mint)]",
      bg: "rgba(16, 185, 129, 0.05)",
      kahmAlpha: 0,
      bubbles: 8
    };
  };

  const risk = evaluateRisk(sal, ph);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🦠 Simulador de Estabilidad en Salmueras (Moho Kahm)</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Juega con el pH y el porcentaje de sal para evitar la proliferación de levaduras oxidativas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-28 h-36 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative shrink-0">
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <path d="M 25,10 L 75,10 L 75,20 L 85,25 L 85,110 L 15,110 L 15,25 L 25,20 Z" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3" />
            <path d="M 15,35 L 85,35 L 85,110 L 15,110 Z" fill="rgba(14, 165, 233, 0.1)" />
            {risk.kahmAlpha > 0 && (
              <path 
                d="M 15,35 C 30,30 40,40 50,35 C 60,30 70,40 85,35 L 85,40 L 15,40 Z" 
                fill="#ffffff" 
                opacity={risk.kahmAlpha} 
                className="transition-all duration-300"
              />
            )}
            {Array.from({ length: risk.bubbles }).map((_, i) => (
              <circle 
                key={i} 
                cx={25 + (i * 7) % 50} 
                cy={100 - (i * 9) % 60} 
                r="1.5" 
                fill="#ffffff" 
                opacity="0.6" 
                className="animate-pulse" 
              />
            ))}
          </svg>
        </div>

        <div className="flex-1 p-3 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          <h5 className={`text-xs font-black mb-1 ${risk.color}`}>
            {risk.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            {risk.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)]">
            <span>Concentración de Sal: {sal}%</span>
            <span>pH del Sistema: {ph}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <label className="text-[8px] font-bold text-[var(--text-secondary)] block mb-1">SAL (Min: 0% - Max: 5%)</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={sal * 10} 
              onChange={(e) => setSal(parseFloat(e.target.value) / 10)}
              className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[8px] font-bold text-[var(--text-secondary)] block mb-1">pH (Min: 3.0 - Max: 6.0)</label>
            <input 
              type="range" 
              min="30" 
              max="60" 
              value={ph * 10} 
              onChange={(e) => setPh(parseFloat(e.target.value) / 10)}
              className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 11: Presión en Sodas Silvestres (Sem2-S1-L4)
// ============================================================
function GingerBugFermentationSim({ semester }) {
  const [time, setTime] = useState(24);
  const [temp, setTemp] = useState(22);

  const calculateSodaPhysics = (t, tmp) => {
    const speed = Math.max(0.2, (tmp - 10) / 10);
    const effectiveHours = t * speed;
    
    const pressure = Math.min(6.0, parseFloat((effectiveHours * 0.08).toFixed(2)));
    const abv = Math.min(1.5, parseFloat((effectiveHours * 0.02).toFixed(2)));

    if (pressure > 4.2) {
      return {
        title: "⚠️ ¡Peligro de Explosión de Botella!",
        desc: "La presión interna supera los 4.2 bares. El vidrio flip-top común podría estallar violentamente por exceso de gas. ¡Purgue el gas o refrigere de inmediato!",
        color: "text-red-500",
        alertBg: "bg-red-500/10 border-red-500/30",
        gaugeColor: "#ef4444",
        pressure,
        abv
      };
    }
    if (pressure > 2.0) {
      return {
        title: "🫧 Carbonatación Perfecta",
        desc: "Presión óptima de 2 a 4 bares. El CO₂ está firmemente disuelto en el líquido como ácido carbónico. Listo para refrigerar para estabilizar el gas.",
        color: "text-[var(--accent-mint)]",
        alertBg: "bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/30",
        gaugeColor: "#2EE59D",
        pressure,
        abv
      };
    }
    return {
      title: "💤 Fermentación Plana o Lenta",
      desc: "Presión baja (<2 bares). El refresco silvestre todavía se siente dulce e inmóvil. Necesita más tiempo a temperatura ambiente para activar las levaduras.",
      color: "text-[var(--text-secondary)]",
      alertBg: "bg-white/5 border-white/10",
      gaugeColor: "#a1a1aa",
      pressure,
      abv
    };
  };

  const physics = calculateSodaPhysics(time, temp);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🍾 Gaseosas Silvestres: Simulador de Carbonatación y Presión</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Evalúa cómo interactúan la temperatura y las horas de embotellado en el Ginger Bug / Tepache</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-24 h-40 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative shrink-0">
          <svg viewBox="0 0 80 140" className="w-full h-full">
            <path d="M 30,10 L 50,10 L 50,25 L 60,35 L 60,130 L 20,130 L 20,35 L 30,25 Z" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3" />
            <path d="M 20,55 L 60,55 L 60,130 L 20,130 Z" fill="rgba(217, 119, 6, 0.15)" />
            <circle cx="40" cy="90" r="15" fill="var(--bg-card)" stroke="var(--border-moss)" strokeWidth="1" />
            <line 
              x1="40" 
              y1="90" 
              x2={40 + 12 * Math.cos((physics.pressure / 6) * Math.PI - Math.PI/2)} 
              y2={90 + 12 * Math.sin((physics.pressure / 6) * Math.PI - Math.PI/2)} 
              stroke={physics.gaugeColor} 
              strokeWidth="2" 
            />
            <text x="31" y="94" fontSize="3" fontWeight="bold" fill="var(--text-primary)">{physics.pressure} bar</text>
            {physics.pressure > 1.0 && Array.from({ length: Math.floor(physics.pressure * 3) }).map((_, i) => (
              <circle key={i} cx={25 + (i * 11) % 30} cy={120 - (i * 13) % 60} r="1" fill="#ffffff" opacity="0.6" />
            ))}
          </svg>
        </div>

        <div className={`flex-1 p-3.5 rounded-2xl border ${physics.alertBg} flex flex-col justify-center min-h-[110px]`}>
          <h5 className={`text-xs font-black mb-1 ${physics.color}`}>
            {physics.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">
            {physics.desc}
          </p>
          <div className="flex gap-4 border-t border-[var(--border-moss)]/20 pt-2 text-[9px] font-mono text-[var(--text-secondary)]">
            <span>ABV Estimado: <strong className="text-[var(--text-primary)]">{physics.abv}%</strong></span>
            <span>CO₂ Disuelto: <strong className="text-[var(--text-primary)]">{Math.min(100, Math.floor(physics.pressure * 20))}%</strong></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Horas de Cierre: {time}h</span>
          </div>
          <input 
            type="range" 
            min="6" 
            max="72" 
            value={time} 
            onChange={(e) => setTime(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Temperatura: {temp}°C</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="30" 
            value={temp} 
            onChange={(e) => setTemp(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET: Fermentación de Granos / Kvass (Sem2-S1-L9)
// ============================================================
function GrainFermSim({ semester }) {
  const [hours, setHours] = useState(18);
  const [maltPct, setMaltPct] = useState(10);

  const getKvassState = (h, malt) => {
    const sugarBoost = 1 + (malt / 100) * 0.6;
    const effectiveH = h * sugarBoost;
    const ph = Math.max(3.2, parseFloat((6.2 - effectiveH * 0.075).toFixed(2)));
    const abv = Math.min(1.8, parseFloat((effectiveH * 0.022).toFixed(2)));
    const co2 = Math.min(100, Math.floor(effectiveH * 3));
    if (effectiveH > 42) return { label: "🔴 Sobre-acidificado", desc: `pH ${ph} — Acidez acética dominante. El kvass resulta agrio en exceso. Solo útil como base de marinados.`, color: "text-red-400", bar: "#ef4444", ph, abv, co2 };
    if (effectiveH > 22) return { label: "✅ Kvass Perfecto Seco", desc: `pH ${ph} — Acidez láctica marcada, carbonatación plena, notas de centeno tostado y caramelo. Ideal para catar.`, color: "text-[var(--accent-mint)]", bar: "#2EE59D", ph, abv, co2 };
    if (effectiveH > 12) return { label: "🟡 Kvass Semidulce", desc: `pH ${ph} — Levemente ácido, efervescente y refrescante. La BAL está activa pero queda azúcar residual.`, color: "text-yellow-400", bar: "#facc15", ph, abv, co2 };
    return { label: "💤 Fermentación Naciente", desc: `pH ${ph} — Las levaduras apenas inician la actividad. Sabor a mosto de pan, sin acidez apreciable.`, color: "text-[var(--text-secondary)]", bar: "#71717a", ph, abv, co2 };
  };

  const state = getKvassState(hours, maltPct);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌾 Simulador de Kvass: Tiempo × Malta × pH</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Ajusta las horas de fermentación y el % de malta activa para ver cómo evoluciona el kvass</p>
      </div>

      <div className="flex gap-3">
        <div className="w-24 shrink-0 flex flex-col items-center justify-center gap-1">
          <svg viewBox="0 0 60 100" className="w-full h-28">
            <rect x="10" y="10" width="40" height="80" rx="6" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3"/>
            <rect x="10" y={10 + (100 - state.co2)} width="40" height={state.co2 * 0.8} rx="4" fill={state.bar} opacity="0.25"/>
            {Array.from({ length: Math.floor(state.co2 / 12) }).map((_, i) => (
              <circle key={i} cx={18 + (i % 3) * 12} cy={80 - i * 9} r="1.5" fill={state.bar} opacity="0.7"/>
            ))}
            <text x="30" y="58" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-primary)">{state.ph}</text>
            <text x="30" y="67" textAnchor="middle" fontSize="5" fill="var(--text-secondary)">pH</text>
          </svg>
          <span className="text-[9px] text-[var(--text-secondary)] font-mono">CO₂: {state.co2}%</span>
        </div>
        <div className={`flex-1 p-3 rounded-2xl border text-[10px] flex flex-col justify-center gap-1.5 ${state.color === 'text-red-400' ? 'bg-red-500/10 border-red-500/30' : state.color === 'text-[var(--accent-mint)]' ? 'bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/30' : state.color === 'text-yellow-400' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
          <p className={`font-black text-xs ${state.color}`}>{state.label}</p>
          <p className="text-[var(--text-secondary)] leading-relaxed">{state.desc}</p>
          <div className="flex gap-4 font-mono text-[9px] text-[var(--text-secondary)] border-t border-[var(--border-moss)]/20 pt-1.5 mt-1">
            <span>pH: <strong className="text-[var(--text-primary)]">{state.ph}</strong></span>
            <span>ABV: <strong className="text-[var(--text-primary)]">{state.abv}%</strong></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Horas de fermentación: {hours}h</span>
          </div>
          <input type="range" min="6" max="60" value={hours} onChange={(e) => setHours(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"/>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>% Malta activa añadida: {maltPct}%</span>
          </div>
          <input type="range" min="0" max="30" value={maltPct} onChange={(e) => setMaltPct(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET: Fermentación Tropical / Tepache (Sem2-S1-L10)
// ============================================================
function TropicalFermSim({ semester }) {
  const [brix, setBrix] = useState(10);
  const [tempC, setTempC] = useState(28);

  const getTepacheState = (bx, t) => {
    const speedFactor = Math.max(0.5, (t - 15) / 10);
    const dom = bx > 15 ? 'levaduras osmotolerantes' : bx > 8 ? 'BAL + levaduras silvestres' : 'BAL heterofermentativas';
    const abv = bx > 15 ? parseFloat((bx * 0.04 * speedFactor).toFixed(2)) : parseFloat((bx * 0.015 * speedFactor).toFixed(2));
    const ph = parseFloat(Math.max(3.2, 5.5 - bx * 0.08 - (t - 20) * 0.04).toFixed(2));
    const co2 = Math.min(100, Math.floor(bx * 4 * speedFactor));

    if (bx > 18) return { label: "🍯 Tepache Alcohólico Rico", desc: `${bx}°Bx a ${t}°C — Dominan ${dom}. Alto ABV (${abv}%), pocas BAL. Perfil similar a hidromiel tropical.`, color: "text-amber-400", bar: "#f59e0b", ph, abv, co2, dom };
    if (bx > 10) return { label: "✅ Tepache Artesanal Balanceado", desc: `${bx}°Bx a ${t}°C — ${dom} en equilibrio. Efervescente, ácido-frutal con ${abv}% ABV. ¡El punto óptimo!`, color: "text-[var(--accent-mint)]", bar: "#2EE59D", ph, abv, co2, dom };
    if (bx > 4) return { label: "🌿 Tepache Probiótico Suave", desc: `${bx}°Bx a ${t}°C — Dominan ${dom}. Muy ácido, bajo en alcohol (${abv}%). Ideal como bebida funcional diaria.`, color: "text-emerald-400", bar: "#34d399", ph, abv, co2, dom };
    return { label: "💧 Sustrato Insuficiente", desc: `${bx}°Bx — Concentración de azúcar demasiado baja. Los microorganismos no tienen suficiente energía para fermentar.`, color: "text-[var(--text-secondary)]", bar: "#71717a", ph, abv, co2, dom };
  };

  const state = getTepacheState(brix, tempC);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🍍 Simulador de Tepache: °Brix × Temperatura</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Controla la concentración de azúcar y temperatura para ver qué microorganismos dominan la fermentación</p>
      </div>

      <div className="flex gap-3">
        <div className="w-24 shrink-0 flex flex-col items-center justify-center gap-1">
          <svg viewBox="0 0 60 100" className="w-full h-28">
            <rect x="8" y="15" width="44" height="75" rx="8" fill="rgba(251,191,36,0.08)" stroke="var(--text-primary)" strokeWidth="1.2" opacity="0.3"/>
            <rect x="8" y={15 + (75 - state.co2 * 0.75)} width="44" height={state.co2 * 0.75} rx="6" fill={state.bar} opacity="0.2"/>
            {Array.from({ length: Math.floor(state.co2 / 10) }).map((_, i) => (
              <circle key={i} cx={15 + (i % 4) * 10} cy={80 - i * 7} r="1.8" fill={state.bar} opacity="0.65"/>
            ))}
            <text x="30" y="56" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-primary)">{state.ph}</text>
            <text x="30" y="65" textAnchor="middle" fontSize="5" fill="var(--text-secondary)">pH</text>
          </svg>
          <span className="text-[9px] text-[var(--text-secondary)] font-mono">{brix}°Bx</span>
        </div>

        <div className={`flex-1 p-3 rounded-2xl border text-[10px] flex flex-col justify-center gap-1.5 ${state.color === 'text-amber-400' ? 'bg-amber-500/10 border-amber-500/30' : state.color === 'text-[var(--accent-mint)]' ? 'bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/30' : state.color === 'text-emerald-400' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
          <p className={`font-black text-xs ${state.color}`}>{state.label}</p>
          <p className="text-[var(--text-secondary)] leading-relaxed">{state.desc}</p>
          <div className="text-[9px] font-mono text-[var(--text-secondary)] border-t border-[var(--border-moss)]/20 pt-1.5 mt-1">
            <span className="text-[var(--text-primary)] font-bold">Microbiota dominante: </span>{state.dom}
          </div>
          <div className="flex gap-4 font-mono text-[9px] text-[var(--text-secondary)]">
            <span>ABV: <strong className="text-[var(--text-primary)]">{state.abv}%</strong></span>
            <span>CO₂: <strong className="text-[var(--text-primary)]">{state.co2}%</strong></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Concentración de azúcar: {brix}°Bx</span>
          </div>
          <input type="range" min="2" max="22" value={brix} onChange={(e) => setBrix(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"/>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Temperatura: {tempC}°C</span>
          </div>
          <input type="range" min="15" max="38" value={tempC} onChange={(e) => setTempC(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 12: Proteólisis de Proteínas en Miso (Sem2-S1-L5)
// ============================================================
function MisoProteolysisSim({ semester }) {
  const [salinity, setSalinity] = useState(8);
  const [months, setMonths] = useState(3);

  const getMisoStatus = (s, m) => {
    if (s < 5) {
      return {
        title: "⚠️ ¡Contaminación Microbiológica!",
        desc: `Al mes ${m}, con baja salidad (${s}%), las bacterias patógenas proliferan. El fermento se pudre desprendiendo ácido butírico y olores nauseabundos.`,
        color: "text-red-500",
        alertBg: "bg-red-500/10 border-red-500/30",
        chainIntegrity: 0.3,
        aminoCount: 4,
        badBacteria: true
      };
    }
    if (s > 11) {
      return {
        title: "💤 Enzimas Inhibidas por Alta Salinidad",
        desc: `Al mes ${m}, la alta salinidad (${s}%) retarda drásticamente la actividad de las proteasas del Koji. La descomposición es lentísima y el sabor umami es escaso.`,
        color: "text-amber-500",
        alertBg: "bg-amber-500/10 border-amber-500/30",
        chainIntegrity: 0.9,
        aminoCount: 2,
        badBacteria: False
      };
    }
    // Ideal 6-10%
    const progress = Math.min(1.0, m / 6);
    const umamiLevel = Math.floor(progress * 100);
    return {
      title: m < 2 ? "⏳ Inicio de la Hidrólisis" : m < 5 ? "🥣 Proteólisis Activa" : "✨ Miso Maduro y Rico en Umami",
      desc: `Al mes ${m}, con salinidad ideal (${s}%), las proteasas cortan eficientemente las proteínas. Nivel de sabor Umami: ${umamiLevel}% (Altas concentraciones de ácido glutámico libre).`,
      color: "text-[var(--accent-mint)]",
      alertBg: "bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/30",
      chainIntegrity: 1.0 - progress * 0.7,
      aminoCount: Math.floor(progress * 15) + 3,
      badBacteria: False
    };
  };

  const status = getMisoStatus(salinity, months);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🥣 Proteólisis de Proteínas en Miso de Garbanzo</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Ajusta la salinidad y observa cómo las enzimas rompen las proteínas en aminoácidos (Glutamato)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-32 h-32 shrink-0 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Long protein chains */}
            {status.chainIntegrity > 0.4 && (
              <path 
                d="M 10,30 Q 30,15 50,30 T 90,30" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={status.chainIntegrity * 3} 
                opacity="0.7" 
                className="transition-all duration-300"
              />
            )}
            {status.chainIntegrity > 0.6 && (
              <path 
                d="M 10,70 Q 30,85 50,70 T 90,70" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={status.chainIntegrity * 2.5} 
                opacity="0.6" 
                className="transition-all duration-300"
              />
            )}

            {/* Released amino acids (Glutamate) */}
            {Array.from({ length: status.aminoCount }).map((_, i) => (
              <g key={i}>
                <circle 
                  cx={20 + (i * 19) % 65} 
                  cy={15 + (i * 23) % 70} 
                  r="2.5" 
                  fill="#10b981" 
                  className="animate-pulse" 
                />
                <text 
                  x={19 + (i * 19) % 65} 
                  y={11 + (i * 23) % 70} 
                  fill="#10b981" 
                  fontSize="3" 
                  fontWeight="bold"
                >
                  Glu
                </text>
              </g>
            ))}

            {/* Bad bacteria / contamination dots */}
            {status.badBacteria && Array.from({ length: 6 }).map((_, i) => (
              <circle 
                key={`bad-${i}`} 
                cx={15 + (i * 13) % 70} 
                cy={25 + (i * 17) % 60} 
                r="3.5" 
                fill="#ef4444" 
                opacity="0.8" 
              />
            ))}
          </svg>
        </div>

        <div className={`flex-1 p-3 rounded-2xl border ${status.alertBg} min-h-[90px] flex flex-col justify-center`}>
          <h5 className={`text-xs font-black mb-1 ${status.color}`}>
            {status.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            {status.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Salinidad: {salinity}%</span>
            <span className="text-[9px] text-[var(--text-secondary)]">Ideal: 6% a 10%</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="15" 
            value={salinity} 
            onChange={(e) => setSalinity(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Tiempo: {months} meses</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="6" 
            value={months} 
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 13: Osmolaridad en Fermentación de Fruta (Sem2-S1-L6)
// ============================================================
function FruitFermentOsmolarity({ semester }) {
  const [sal, setSal] = useState(2.5);
  const [temp, setTemp] = useState(18);

  const getFruitStatus = (s, t) => {
    // If sal is low and temp is warm: alcohol wins
    if (s < 1.8 && t > 20) {
      return {
        title: "🍷 Fermentación Alcohólica Dominante",
        desc: "Las levaduras silvestres (*Saccharomyces*) consumen glucosa de forma explosiva, liberando etanol (alcohol) y desplazando a las BAL. El perfil es licoroso, no láctico.",
        color: "text-orange-400",
        bg: "rgba(249, 115, 22, 0.05)",
        strokeColor: "#f97316",
        showYeast: true,
        showBal: false
      };
    }
    // If sal is too high: everything is inhibited
    if (s > 3.5) {
      return {
        title: "💤 Choque Osmótico Total",
        desc: "La salinidad al 4% inhibe tanto a levaduras como a bacterias lácticas. La fruta queda inerte, demasiado salada y sin cambios metabólicos.",
        color: "text-red-400",
        bg: "rgba(239, 68, 68, 0.05)",
        strokeColor: "#ef4444",
        showYeast: false,
        showBal: false
      };
    }
    // Ideal: sal 2.2% - 3%, temp 15-18°C
    return {
      title: "✨ Lactofermentación Pura y Ésteres Aromáticos",
      desc: "Lactobacillus plantarum prospera en ambiente templado/salado, bloqueando a las levaduras. Las BAL producen ácido láctico y ésteres de aromas frutales exóticos.",
      color: "text-[var(--accent-mint)]",
      bg: "rgba(16, 185, 129, 0.05)",
      strokeColor: "#2EE59D",
      showYeast: false,
      showBal: true
    };
  };

  const status = getFruitStatus(sal, temp);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🍑 Osmolaridad y Control Microbiológico en Frutas</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Usa sal y frío para seleccionar bacterias lácticas frente a levaduras alcohólicas nativas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-32 h-32 shrink-0 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background container of fruit cells */}
            <circle cx="50" cy="50" r="40" fill="none" stroke={status.strokeColor} strokeWidth="1.5" />

            {/* Yeast cells (large circles) */}
            {status.showYeast && (
              <g fill="#f59e0b" opacity="0.8">
                <circle cx="35" cy="40" r="8" />
                <circle cx="45" cy="35" r="5" />
                <circle cx="65" cy="55" r="9" />
                <circle cx="58" cy="65" r="5" />
                {/* Bubble lines for ethanol */}
                <line x1="35" y1="30" x2="35" y2="15" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1 1" />
                <line x1="65" y1="45" x2="65" y2="25" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1 1" />
              </g>
            )}

            {/* BAL bacteria (small rod shapes) */}
            {status.showBal && (
              <g fill="#10b981" opacity="0.9">
                <rect x="30" y="30" width="4" height="10" rx="2" transform="rotate(30 30 30)" />
                <rect x="60" y="35" width="4" height="10" rx="2" transform="rotate(-40 60 35)" />
                <rect x="40" y="60" width="4" height="10" rx="2" transform="rotate(15 40 60)" />
                <rect x="50" y="45" width="4" height="10" rx="2" transform="rotate(75 50 45)" />
                <rect x="70" y="60" width="4" height="10" rx="2" transform="rotate(-10 70 60)" />
              </g>
            )}

            {!status.showBal && !status.showYeast && (
              <text x="32" y="53" fill="#ef4444" fontSize="5" fontWeight="bold">Inactivo</text>
            )}
          </svg>
        </div>

        <div className="flex-1 p-3.5 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/30 min-h-[90px] flex flex-col justify-center">
          <h5 className={`text-xs font-black mb-1 ${status.color}`}>
            {status.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            {status.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Sal marina: {sal}%</span>
            <span className="text-[9px] text-[var(--text-secondary)]">Recomendado: 2.5%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="40" 
            value={sal * 10} 
            onChange={(e) => setSal(parseFloat(e.target.value) / 10)}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Temperatura: {temp}°C</span>
            <span className="text-[9px] text-[var(--text-secondary)]">Recomendado: 15-18°C</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="30" 
            value={temp} 
            onChange={(e) => setTemp(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 14: Expansión de Gas y Autolisis en Pastas (Sem2-S1-L7)
// ============================================================
function ChiliPasteAutolysis({ semester }) {
  const [hours, setHours] = useState(24);
  const [gasLevel, setGasLevel] = useState(24);

  const handleDegas = () => {
    setGasLevel(0);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    setGasLevel(hours);
  }, [hours]);

  const getPasteHeight = () => {
    // Height increments from 70 to 110 based on gasLevel (CO2 trapped)
    return Math.min(105, 65 + gasLevel * 0.55);
  };

  const isCritical = getPasteHeight() > 95;

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🌶️ Atrapamiento de CO₂ y Expansión de la Pasta de Chile</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Simula las horas de fermentación y desgasifica manualmente para evitar desbordes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-24 h-40 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative shrink-0">
          <svg viewBox="0 0 80 140" className="w-full h-full">
            {/* Jar outline */}
            <path d="M 20,15 L 60,15 L 60,25 L 70,30 L 70,130 L 10,130 L 10,30 L 20,25 Z" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3" />
            
            {/* Red Chili Paste level expanding upwards */}
            <path 
              d={`M 10,${130 - getPasteHeight()} C 30,${130 - getPasteHeight() - 3} 40,${130 - getPasteHeight() + 3} 70,${130 - getPasteHeight()} L 70,130 L 10,130 Z`} 
              fill="rgba(239, 68, 68, 0.75)" 
              className="transition-all duration-300"
            />

            {/* Trapped CO2 bubbles in the paste */}
            {gasLevel > 10 && Array.from({ length: Math.min(12, Math.floor(gasLevel / 5)) }).map((_, i) => (
              <circle 
                key={i} 
                cx={18 + (i * 13) % 45} 
                cy={125 - (i * 7) % (getPasteHeight() - 10)} 
                r="1.8" 
                fill="#ffffff" 
                opacity="0.8" 
              />
            ))}
          </svg>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-[110px]">
          <h5 className={`text-xs font-black mb-1 ${isCritical ? 'text-red-500' : 'text-emerald-500'}`}>
            {isCritical ? "⚠️ ¡Peligro de Desborde!" : "🥣 Expansión Controlada"}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-3">
            {isCritical 
              ? "El CO₂ atrapado ha inflado la pasta de chile. El gas tapona la salida y derramará el fermento. ¡Presiona el botón para purgar!"
              : "Las bacterias fermentadoras producen gas que queda retenido debido a la viscosidad natural del chile triturado."}
          </p>
          <button 
            onClick={handleDegas}
            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-[10px] font-black cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
          >
            💨 Desgasificar / Purgar Pasta
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)]">
          <span>Tiempo: {hours} horas</span>
          <span>Altura: {Math.floor(getPasteHeight())}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="72" 
          value={hours} 
          onChange={(e) => setHours(parseInt(e.target.value))}
          className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}

// ============================================================
// WIDGET 15: Simbiosis del Kéfir de Agua (Sem2-S1-L8)
// ============================================================
function KefirCarbonationSim({ semester }) {
  const [density, setDensity] = useState(8);
  const [minerals, setMinerals] = useState("alto");

  const getKefirStatus = (d, m) => {
    if (m === "bajo") {
      return {
        title: "😢 Disolución de Gránulos (Falta de Minerales)",
        desc: "Sin calcio ni magnesio, la enzima dextransucrasa se inactiva. Los gránulos se vuelven babosos y se disuelven. La simbiosis muere.",
        color: "text-red-400",
        alertBg: "bg-red-500/10 border-red-500/30",
        grainColor: "#ef4444",
        bubbles: 1,
        integrity: "Baja / Desintegrándose"
      };
    }
    if (d > 14) {
      return {
        title: "⏳ Inanición por Alta Densidad de Gránulos",
        desc: "Demasiados gránulos consumen el azúcar disponible en pocas horas. El kéfir se vuelve ácido tosco rápidamente y los gránulos mueren de hambre.",
        color: "text-amber-500",
        alertBg: "bg-amber-500/10 border-amber-500/30",
        grainColor: "#f59e0b",
        bubbles: 4,
        integrity: "Estresada / Sin Azúcar"
      };
    }
    // Optimal
    return {
      title: "✨ Crecimiento Activo de Tibicos y Dextrano",
      desc: "Excelente balance de minerales y gránulos al 8%. Las bacterias tejen matriz tridimensional de dextrano, mientras las levaduras aportan gas CO₂.",
      color: "text-[var(--accent-mint)]",
      alertBg: "bg-[var(--accent-mint)]/10 border-[var(--accent-mint)]/30",
      grainColor: "#2EE59D",
      bubbles: 8,
      integrity: "Excelente / Creciente"
    };
  };

  const status = getKefirStatus(density, minerals);

  return (
    <div className="my-6 p-4 rounded-3xl border border-[var(--border-moss)] bg-[var(--bg-card)] shadow-md flex flex-col gap-4 animate-float-in">
      <div className="text-center border-b border-[var(--border-moss)] pb-2.5">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">🧪 Estructura de Dextrano y Salud del Kéfir de Agua</h4>
        <p className="text-[9px] text-[var(--text-secondary)]">Monitorea la integridad de los nódulos de kéfir ajustando minerales y proporción de granos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-28 h-32 bg-[var(--bg-elevated)]/25 rounded-2xl flex items-center justify-center border border-[var(--border-moss)]/40 overflow-hidden relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Kefir Grains representation */}
            <circle cx="35" cy="40" r="7" fill={status.grainColor} opacity="0.8" />
            <circle cx="45" cy="45" r="9" fill={status.grainColor} opacity="0.8" />
            <circle cx="55" cy="35" r="8" fill={status.grainColor} opacity="0.8" />
            <circle cx="65" cy="50" r="7" fill={status.grainColor} opacity="0.8" />
            <circle cx="40" cy="58" r="9" fill={status.grainColor} opacity="0.8" />
            <circle cx="55" cy="60" r="6" fill={status.grainColor} opacity="0.8" />

            {/* CO2 Bubbles */}
            {Array.from({ length: status.bubbles }).map((_, i) => (
              <circle 
                key={i} 
                cx={20 + (i * 11) % 60} 
                cy={80 - (i * 9) % 65} 
                r="1.2" 
                fill="#ffffff" 
                opacity="0.7" 
                className="animate-pulse" 
              />
            ))}
          </svg>
        </div>

        <div className={`flex-1 p-3.5 rounded-2xl border ${status.alertBg} min-h-[100px] flex flex-col justify-center`}>
          <h5 className={`text-xs font-black mb-1 ${status.color}`}>
            {status.title}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">
            {status.desc}
          </p>
          <span className="text-[8px] font-mono uppercase text-[var(--text-secondary)]">Salud del Gránulo: <strong className="text-[var(--text-primary)]">{status.integrity}</strong></span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-primary)] mb-1">
            <span>Gránulos de Kéfir: {density}% del peso</span>
            <span className="text-[9px] text-[var(--text-secondary)]">Ideal: 5% a 10%</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="20" 
            value={density} 
            onChange={(e) => setDensity(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-mint)] h-1 bg-[var(--border-moss)]/40 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <span className="text-[10px] font-bold text-[var(--text-primary)] block mb-1">Minerales del Agua:</span>
          <div className="flex rounded-xl bg-[var(--bg-elevated)] p-1 gap-1">
            {["bajo", "medio", "alto"].map((m) => (
              <button 
                key={m}
                onClick={() => setMinerals(m)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase cursor-pointer transition-all ${minerals === m ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextDiagram({ text, title = "Esquema conceptual" }) {
  // Clean the text if it's a code block
  let cleanText = text;
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }
  
  const lines = cleanText.split('\n');
  let displayTitle = title;
  let diagramLines = lines;
  
  if (lines[0] && lines[0].includes('DIAGRAMA:')) {
    displayTitle = lines[0].replace('DIAGRAMA:', '').trim();
    diagramLines = lines.slice(1);
    if (diagramLines[0] && /^[─\-_=\s]+$/.test(diagramLines[0])) {
      diagramLines = diagramLines.slice(1);
    }
  }
  
  const renderedLines = diagramLines.map((line, idx) => {
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Replace notes e.g., "← Piso 3: La fachada exterior"
    escaped = escaped.replace(/(←\s*.+)$/g, '<span class="diagram-note">$1</span>');
    escaped = escaped.replace(/(\/\/\s*.+)$/g, '<span class="diagram-note">$1</span>');
    
    // Replace box-drawing characters
    escaped = escaped.replace(/([┌┐└┘─│├┤┬┴┼═║╔╗╚╝╠╣╦╩╬])/g, '<span class="diagram-border">$1</span>');
    
    // Replace flow arrows
    escaped = escaped.replace(/([▼▲◀▶→])/g, '<span class="diagram-arrow">$1</span>');
    escaped = escaped.replace(/(?<!diagram-note">)←/g, '<span class="diagram-arrow">←</span>');
    
    // Highlight parentheses content
    escaped = escaped.replace(/(\([^)]+\))/g, '<span class="diagram-parentheses">$1</span>');
    
    return (
      <div key={idx} dangerouslySetInnerHTML={{ __html: escaped || ' ' }} />
    );
  });
  
  return (
    <div className="diagram-container my-5">
      <div className="diagram-header">
        <span>📊 {displayTitle}</span>
        <span className="text-[var(--accent-mint)] opacity-60">Visualizer v1.0</span>
      </div>
      <div className="diagram-scroll">
        {renderedLines}
      </div>
    </div>
  );
}

function InteractiveTimeline({ text }) {
  const lines = text.split('\n').filter(Boolean);
  const items = lines.map((line, idx) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      return { title: match[1].trim(), desc: match[2].trim() };
    }
    return { title: `Paso ${idx + 1}`, desc: line.trim() };
  });

  return (
    <div className="timeline-container">
      {items.map((item, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timeline-badge">
            <span className="text-[8px] font-black text-[var(--accent-mint)]">🌿</span>
          </div>
          <div className="timeline-content">
            <h5 className="timeline-title">{item.title}</h5>
            <p className="timeline-text">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableRecipeScaler({ headers, initialBody, parseMarkdownAndGlossary }) {
  const [scale, setScale] = useState(1.0);

  const scaleCellText = (text, factor) => {
    return text.replace(/(\d+(?:\.\d+)?)\s*g\b/g, (match, val) => {
      const scaledVal = parseFloat((parseFloat(val) * factor).toFixed(1));
      return `${scaledVal}g`;
    });
  };

  return (
    <div className="recipe-scaler-card">
      <div className="recipe-scaler-header">
        <span className="recipe-scaler-title">⚖️ Escalador de Receta</span>
        <div className="recipe-scaler-controls">
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="recipe-scaler-slider"
          />
          <span className="recipe-scaler-badge">{scale.toFixed(1)}x</span>
        </div>
      </div>
      <div className="overflow-x-auto border border-[var(--border-moss)] rounded-xl bg-[var(--bg-card)]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-moss)]">
              {headers.map((h, i) => (
                <th key={i} className="p-2.5 font-bold text-[var(--text-primary)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialBody.map((row, ri) => (
              <tr key={ri} className="border-b border-[var(--border-moss)] last:border-0 hover:bg-black/[0.01]">
                {row.map((cell, ci) => {
                  const scaledText = scaleCellText(cell, scale);
                  return (
                    <td
                      key={ci}
                      className="p-2.5 text-[var(--text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(scaledText) }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeafChecklist({ lines, lessonId, sectionIdx, blockIdx, parseMarkdownAndGlossary }) {
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`vegi-checklist-${lessonId}-${sectionIdx}-${blockIdx}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = (idx, e) => {
    const updated = { ...checkedItems, [idx]: !checkedItems[idx] };
    setCheckedItems(updated);
    localStorage.setItem(`vegi-checklist-${lessonId}-${sectionIdx}-${blockIdx}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-2 my-4">
      {lines.map((line, li) => {
        const isChecked = !!checkedItems[li];
        const cleanText = line.replace(/^[•*]\s*/, '');
        return (
          <div
            key={li}
            onClick={(e) => toggleCheck(li, e)}
            className={`leaf-checklist-item ${isChecked ? 'checked' : ''}`}
          >
            <div className="leaf-checkbox">
              {isChecked && (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                </svg>
              )}
            </div>
            <span
              className="leaf-checklist-text"
              dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(cleanText) }}
            />
          </div>
        );
      })}
    </div>
  );
}

function parsePracticalLab(text) {
  const lines = text.split('\n');
  let title = "Práctica de Cocina";
  let materials = [];
  let steps = [];
  let currentStep = null;
  let inMaterials = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('🥣') || line.includes('📋 Paso a Paso:')) {
      title = line.replace(/[🥣📋:]/g, '').trim();
      continue;
    }

    if (line.toLowerCase().includes('material necesario:')) {
      inMaterials = true;
      continue;
    }

    const stepMatch = line.match(/^Paso\s*(\d+)\s*:\s*(.*)$/i);
    if (stepMatch) {
      inMaterials = false;
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        number: parseInt(stepMatch[1]),
        title: stepMatch[2].trim(),
        text: []
      };
      continue;
    }

    if (inMaterials && (line.startsWith('-') || line.startsWith('*'))) {
      materials.push(line.replace(/^[-*]\s*/, '').trim());
      continue;
    }

    if (currentStep) {
      if (line !== '---') {
        currentStep.text.push(line);
      }
    }
  }

  if (currentStep) {
    steps.push(currentStep);
  }

  return { title, materials, steps };
}

function PracticalLab({ text, lessonId, parseMarkdownAndGlossary }) {
  const { title, materials, steps } = parsePracticalLab(text);
  
  const [checkedMaterials, setCheckedMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(`vegi-lab-materials-${lessonId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(`vegi-lab-steps-${lessonId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleMaterial = (idx) => {
    const updated = { ...checkedMaterials, [idx]: !checkedMaterials[idx] };
    setCheckedMaterials(updated);
    localStorage.setItem(`vegi-lab-materials-${lessonId}`, JSON.stringify(updated));
  };

  const toggleStep = (idx) => {
    const updated = { ...completedSteps, [idx]: !completedSteps[idx] };
    setCompletedSteps(updated);
    localStorage.setItem(`vegi-lab-steps-${lessonId}`, JSON.stringify(updated));
  };

  const progressPercent = steps.length === 0 ? 0 : Math.round((Object.values(completedSteps).filter(Boolean).length / steps.length) * 100);

  return (
    <div className="lab-practice-card my-6">
      <div className="lab-practice-header">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥣</span>
          <div>
            <h4 className="lab-practice-title">{title}</h4>
            <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Taller de Laboratorio Culinario</p>
          </div>
        </div>
        {steps.length > 0 && (
          <div className="text-right">
            <span className="text-[10px] font-bold text-[var(--accent-mint)]">{progressPercent}% Completado</span>
            <div className="w-16 h-1 bg-[var(--border-moss)]/40 rounded-full mt-1 overflow-hidden ml-auto">
              <div className="h-full bg-[var(--accent-mint)] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {materials.length > 0 && (
        <div className="lab-materials-section">
          <span className="lab-section-subtitle">📋 Materiales y Utensilios</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {materials.map((mat, idx) => {
              const checked = !!checkedMaterials[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleMaterial(idx)}
                  className={`lab-material-item ${checked ? 'checked' : ''}`}
                >
                  <div className="lab-material-checkbox">
                    {checked && "✓"}
                  </div>
                  <span className="text-xs">{mat}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="lab-steps-section mt-4">
          <span className="lab-section-subtitle">🔥 Procedimiento Paso a Paso</span>
          <div className="space-y-3 mt-3">
            {steps.map((step, idx) => {
              const completed = !!completedSteps[idx];
              return (
                <div key={idx} className={`lab-step-card ${completed ? 'completed' : ''}`}>
                  <div className="lab-step-top">
                    <span className="lab-step-badge">Paso {step.number}</span>
                    <h5 className="lab-step-title" dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(step.title) }} />
                  </div>
                  <p className="lab-step-text mt-2 text-xs" dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(step.text.join(' ')) }} />
                  <button
                    onClick={() => toggleStep(idx)}
                    className={`lab-step-btn mt-3 ${completed ? 'completed' : ''}`}
                  >
                    {completed ? "✓ Paso Completado" : "Marcar Paso como Completado"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonView({ lesson, semester, subject, onBack, onComplete, progressMap, dispatch }) {
  const [activeTab, setActiveTab] = useState('theory')
  const [activeSection, setActiveSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  // Fresh content loaded directly from Supabase on mount
  const [freshContent, setFreshContent] = useState(null)

  useEffect(() => {
    setFreshContent(null)
    if (!supabase || !lesson?.id) return
    supabase
      .from('lessons')
      .select('content, quiz, key_facts')
      .eq('id', lesson.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const loadedSections = data.content?.sections || []
          setFreshContent({
            sections: loadedSections,
            quiz: data.quiz || [],
            keyFacts: data.key_facts || []
          })
          // Auto-select the first section containing actual theory content (avoiding objectives)
          const theoryIdx = loadedSections.findIndex(sec => sec.title.includes('📖') || sec.title.includes('🔍'));
          if (theoryIdx !== -1) {
            setActiveSection(theoryIdx)
          } else {
            setActiveSection(0)
          }
        }
      })
  }, [lesson?.id])

  const [lives, setLives] = useState(3)
  const [quizFailed, setQuizFailed] = useState(false)
  const [shownHints, setShownHints] = useState({})
  
  // Glossary & Dopamine Checkpoints States
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null)
  const [claimedCheckpoints, setClaimedCheckpoints] = useState(() => {
    try {
      const saved = localStorage.getItem('vegi-claimed-checkpoints-' + lesson.id)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [confettiActive, setConfettiActive] = useState(false)

  const claimCheckpoint = (sectionIdx, e) => {
    if (claimedCheckpoints[sectionIdx]) return;
    const updated = { ...claimedCheckpoints, [sectionIdx]: true };
    setClaimedCheckpoints(updated);
    localStorage.setItem('vegi-claimed-checkpoints-' + lesson.id, JSON.stringify(updated));
    if (dispatch) {
      dispatch({ type: 'COMPLETE_CHALLENGE', payload: { country: 'none', xp: 5 } });
    }
    if (e && e.clientX && e.clientY) {
      triggerXpParticle(5, e.clientX, e.clientY);
    } else {
      triggerXpParticle(5, window.innerWidth / 2, window.innerHeight / 2);
    }
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 3000);
  };
  
  // Dopamine States
  const [xpParticles, setXpParticles] = useState([])
  const [showChest, setShowChest] = useState(false)
  const [chestOpened, setChestOpened] = useState(false)
  const [chestIngredient, setChestIngredient] = useState(null)

  // ─── PART 2: TTS (Speech) States & Logic ───────────────────
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)

  const getCleanTextForTTS = (rawText) => {
    if (!rawText) return ""
    let clean = rawText.replace(/^#{1,6}\s*/gm, '')
    clean = clean.replace(/\[WIDGET:[A-Z0-9_]+\]/g, '')
    clean = clean.replace(/\|/g, ' ')
    clean = clean.replace(/\*\*|__/g, '')
    clean = clean.replace(/\*|_/g, '')
    clean = clean.replace(/→/g, ' significa ')
    clean = clean.replace(/\n+/g, ' ')
    return clean
  }

  // Cancel speech on tab or active section change
  useEffect(() => {
    if (synth) {
      synth.cancel()
      setIsPlayingSpeech(false)
    }
  }, [activeSection, lesson.id, activeTab])

  useEffect(() => {
    return () => {
      if (synth) synth.cancel()
    }
  }, [])

  const handleSpeechPlayPause = () => {
    if (!synth) return

    if (isPlayingSpeech) {
      synth.pause()
      setIsPlayingSpeech(false)
    } else {
      if (synth.paused) {
        synth.resume()
        setIsPlayingSpeech(true)
      } else {
        synth.cancel()
        const content = lesson.content || lesson
        const sections = content?.sections || []
        const textToSpeak = getCleanTextForTTS(sections[activeSection]?.text)
        if (!textToSpeak) return

        const u = new SpeechSynthesisUtterance(textToSpeak)
        u.lang = 'es-ES'
        u.rate = speechRate
        
        const voices = synth.getVoices()
        const spanishVoice = voices.find(v => v.lang.startsWith('es-') && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('premium'))) || voices.find(v => v.lang.startsWith('es-'))
        if (spanishVoice) {
          u.voice = spanishVoice
        }

        u.onend = () => setIsPlayingSpeech(false)
        u.onerror = () => setIsPlayingSpeech(false)

        synth.speak(u)
        setIsPlayingSpeech(true)
      }
    }
  }

  useEffect(() => {
    if (synth && isPlayingSpeech) {
      synth.cancel()
      const content = lesson.content || lesson
      const sections = content?.sections || []
      const textToSpeak = getCleanTextForTTS(sections[activeSection]?.text)
      if (!textToSpeak) return
      const u = new SpeechSynthesisUtterance(textToSpeak)
      u.lang = 'es-ES'
      u.rate = speechRate
      const voices = synth.getVoices()
      const spanishVoice = voices.find(v => v.lang.startsWith('es-') && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'))) || voices.find(v => v.lang.startsWith('es-'))
      if (spanishVoice) u.voice = spanishVoice
      u.onend = () => setIsPlayingSpeech(false)
      u.onerror = () => setIsPlayingSpeech(false)
      synth.speak(u)
    }
  }, [speechRate])

  // ─── PART 3: Highlighter & Notes States ──────────────────
  const [highlights, setHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem(`vegi-highlights-${lesson.id}`)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [selectedText, setSelectedText] = useState('')
  const [showHighlighterToolbar, setShowHighlighterToolbar] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesText, setNotesText] = useState(() => {
    return localStorage.getItem(`vegi-notes-${lesson.id}`) || ''
  })

  const handleNotesChange = (e) => {
    const text = e.target.value
    setNotesText(text)
    localStorage.setItem(`vegi-notes-${lesson.id}`, text)
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection.toString().trim()
    if (text.length > 2) {
      setSelectedText(text)
      setShowHighlighterToolbar(true)
    } else {
      setShowHighlighterToolbar(false)
    }
  }

  const addHighlight = (color) => {
    if (!selectedText) return
    const newHighlight = { text: selectedText, color }
    const updated = [...highlights.filter(h => h.text !== selectedText), newHighlight]
    setHighlights(updated)
    localStorage.setItem(`vegi-highlights-${lesson.id}`, JSON.stringify(updated))
    setSelectedText('')
    setShowHighlighterToolbar(false)
    window.getSelection().removeAllRanges()
  }

  const removeHighlight = (textToRemove) => {
    const updated = highlights.filter(h => h.text !== textToRemove)
    setHighlights(updated)
    localStorage.setItem(`vegi-highlights-${lesson.id}`, JSON.stringify(updated))
  }

  const applyHighlights = (htmlStr) => {
    let result = htmlStr
    highlights.forEach(hl => {
      try {
        const escaped = hl.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const regex = new RegExp(`(${escaped})`, 'gi')
        let colorClass = 'bg-emerald-500/30 text-white rounded px-0.5'
        if (hl.color === 'gold') colorClass = 'bg-amber-500/30 text-white rounded px-0.5'
        if (hl.color === 'rose') colorClass = 'bg-rose-500/30 text-white rounded px-0.5'
        result = result.replace(regex, `<mark class="${colorClass}">$1</mark>`)
      } catch (e) {
        console.warn("Error running highlight regex: ", e)
      }
    })
    return result
  }

  const triggerXpParticle = (amount, x, y) => {
    const id = Date.now() + Math.random()
    setXpParticles(prev => [...prev, { id, amount, x, y }])
    setTimeout(() => {
      setXpParticles(prev => prev.filter(p => p.id !== id))
    }, 1200)
  }

  const handleOpenChest = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Trigger particles at the chest's location
    triggerXpParticle(25, rect.left + rect.width / 2 - 20, rect.top - 20)
    
    setChestOpened(true)
    const ingredients = [
      { name: "Trufa de Musgo Negro 🍄", desc: "Un hongo subterráneo que aporta notas umami terrosas ultra-complejas." },
      { name: "Ajo Negro Fermentado 🧄", desc: "Dientes envejecidos que caramelizan sus azúcares hasta dar notas a regaliz y balsámico." },
      { name: "Sal de Escamas del Himalaya 🧂", desc: "Cristales puros para una disolución controlada en emplatados de alta costura." },
      { name: "Extracto de Levadura Autolizado 🧬", desc: "Péptidos libres que potencian la sinergia alostérica de receptores gustativos." },
      { name: "Aceite de Chiles Ahumados 🌶️", desc: "Compuestos lipófilos que transportan el calor de forma sedosa en boca." }
    ]
    const randomIng = ingredients[Math.floor(Math.random() * ingredients.length)]
    setChestIngredient(randomIng)
  }
  
  const isExam = lesson.id.includes('-f') || lesson.id.includes('-p') || lesson.title.toLowerCase().includes('examen')
  const [timeRemaining, setTimeRemaining] = useState(lesson.id.includes('-f') ? 1200 : 600)
  
  useEffect(() => {
    if (!isExam || !showQuiz || quizSubmitted) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setQuizSubmitted(true)
          setLives(0)
          setQuizFailed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isExam, showQuiz, quizSubmitted])
  
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  // Ajustes de lectura
  const [readingTheme, setReadingTheme] = useState(() => localStorage.getItem('vegi-reading-theme') || 'mint')
  const [readingFont, setReadingFont] = useState(() => localStorage.getItem('vegi-reading-font') || 'sans')
  const [readingSize, setReadingSize] = useState(() => localStorage.getItem('vegi-reading-size') || 'md')
  const [showReadingPreferences, setShowReadingPreferences] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  const [sectionsRead, setSectionsRead] = useState(() => {
    try {
      const saved = localStorage.getItem('vegi-sections-read-' + lesson.id);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  })

  const toggleSectionRead = (idx) => {
    setSectionsRead(prev => {
      const updated = { ...prev, [idx]: !prev[idx] };
      localStorage.setItem('vegi-sections-read-' + lesson.id, JSON.stringify(updated));
      return updated;
    });
  }

  const highlightGlossaryTerms = (htmlStr) => {
    let result = htmlStr;
    const termMetadata = {
      fructanos: { type: 'compound', desc: 'Polímeros de fructosa solubles que sirven como reserva energética y anticongelante térmico celular.' },
      aliina: { type: 'compound', desc: 'Aminoácido azufrado inodoro que actúa como el precursor principal del sabor en el ajo.' },
      aliinasa: { type: 'structure', desc: 'Enzima vacuolar responsable de descomponer la aliina y desencadenar las reacciones del picante.' },
      alicina: { type: 'compound', desc: 'Compuesto azufrado inestable responsable del picor, aroma y propiedades antibióticas del ajo crudo.' },
      anetol: { type: 'compound', desc: 'Polifenol aromático volátil responsable de las notas anisadas en el hinojo y anís.' },
      antocianinas: { type: 'compound', desc: 'Pigmentos flavonoides hidrosolubles responsables de los colores rojos y morados en Alliums.' },
      plasmólisis: { type: 'process', desc: 'Deshidratación celular donde la vacuola pierde agua y el citoplasma se contrae.' },
      retrogradación: { type: 'process', desc: 'Realineación cristalina de la amilosa al enfriar el almidón cocido, formando almidón resistente.' },
      amilosa: { type: 'structure', desc: 'Macromolécula de almidón de cadena lineal, responsable de la firmeza estructural y retrogradación.' },
      amilopectina: { type: 'structure', desc: 'Macromolécula de almidón altamente ramificada, responsable de la cremosidad y retención de agua.' },
      gelatinización: { type: 'process', desc: 'Proceso de hidratación y expansión del almidón con calor que espesa las preparaciones.' },
      curcumina: { type: 'compound', desc: 'Polifenol activo de la cúrcuma con potentes propiedades curativas y de coloración.' },
      piperina: { type: 'compound', desc: 'Alcaloide de la pimienta que inhibe el metabolismo hepático y aumenta la absorción de nutrientes.' },
      rafidios: { type: 'compound', desc: 'Micro-agujas de oxalato de calcio que causan irritación física en Alliums y cormos crudos.' }
    };
    
    Object.keys(termMetadata).forEach(term => {
      const regex = new RegExp(`\\b(${term})s?\\b`, 'gi');
      const meta = termMetadata[term];
      result = result.replace(regex, `<span class="glossary-tooltip glossary-badge glossary-badge-${meta.type} border-b-2 border-dashed border-[var(--accent-mint)] cursor-help font-bold relative" data-tooltip="${meta.desc}">$1</span>`);
    });
    return result;
  };

  const parseMarkdownAndGlossary = (text) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/→/g, `<span style="color:${semester.color}">→</span>`)
      .replace(/\n/g, '<br/>');
    
    const withGlossary = highlightGlossaryTerms(formatted);
    return applyHighlights(withGlossary);
  };

  const done = !!progressMap[lesson.id]
  // freshContent is fetched live from Supabase on mount — always up to date
  const content = freshContent || lesson.content || lesson
  const sections = content?.sections || []
  let quiz = freshContent?.quiz ?? (content?.quiz || [])
  if (quiz && !Array.isArray(quiz)) {
    quiz = [{
      q: quiz.q || quiz.question,
      options: quiz.options || [],
      correct: quiz.correct,
      explanation: quiz.explanation
    }]
  }
  const keyFacts = freshContent?.keyFacts ?? (content?.keyFacts || [])
  const readProgress = sections.length === 0 ? 100 : Math.round(((activeSection + 1) / sections.length) * 100)

  const handleComplete = () => {
    setShowCelebration(true)
    setTimeout(() => {
      setShowCelebration(false)
      onComplete(lesson.id)
      onBack()
    }, 2000)
  }

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true)
    const incorrectCount = quiz.filter((q, i) => quizAnswers[i] !== q.correct).length
    const newLives = Math.max(0, 3 - incorrectCount)
    setLives(newLives)
    
    if (newLives === 0) {
      setQuizFailed(true)
    } else {
      setTimeout(() => {
        setShowChest(true)
      }, 1500)
    }
  }

  const handleRetryQuiz = () => {
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizFailed(false)
    setLives(3)
    setShownHints({})
    if (isExam) {
      setTimeRemaining(lesson.id.includes('-f') ? 1200 : 600)
    }
  }

  const quizScore = quiz.length === 0 ? 0 :
    quiz.filter((q, i) => quizAnswers[i] === q.correct).length

  const SimulatorComponent = SIMULATORS[lesson.id]
  const hasSimulator = !!SimulatorComponent

  return (
    <div className="flex flex-col min-h-full animate-float-in">
      {/* Cofre de Ingredientes Dopamina */}
      {showChest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-float-in">
          <div className="text-center p-8 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-3xl shadow-2xl max-w-xs mx-4 relative overflow-hidden">
            {!chestOpened ? (
              <div className="animate-float-in">
                <div className="text-6xl mb-4 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-box-shake" onClick={handleOpenChest}>
                  🎁
                </div>
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-2">¡Cofre Recompensa Obtenido!</h2>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Haz clic en el cofre para revelar tu ingrediente raro</p>
              </div>
            ) : (
              <div className="animate-star-burst">
                <div className="text-6xl mb-4">✨</div>
                <span className="text-[10px] text-[var(--accent-mint)] font-bold tracking-widest uppercase">INGREDIENTE RARO</span>
                <h2 className="text-lg font-black text-amber-500 mt-1 mb-2">{chestIngredient?.name}</h2>
                <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                  {chestIngredient?.desc}
                </p>
                <button
                  onClick={() => {
                    setShowChest(false)
                    handleComplete()
                  }}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white cursor-pointer hover:opacity-90 transition-all bg-gradient-to-r from-[var(--accent-mint)] to-[var(--accent-teal)] shadow-md tap-active"
                >
                  Continuar e Inscribir (+25 XP)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating XP Particles */}
      {xpParticles.map(p => (
        <div
          key={p.id}
          className="fixed z-50 text-emerald-400 font-black text-lg pointer-events-none animate-float-xp"
          style={{ left: p.x, top: p.y, textShadow: '0 0 8px rgba(16,185,129,0.6)' }}
        >
          +{p.amount} XP ✨
        </div>
      ))}
      {/* Celebración overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-float-in">
          <div className="text-center p-8 bg-[var(--bg-card)] border border-[var(--border-moss)] rounded-3xl shadow-2xl max-w-xs mx-4">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">¡Lección Completada!</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Has obtenido la memoria del ingrediente</p>
            <div className="flex items-center gap-2 justify-center bg-[var(--accent-mint)]/20 px-4 py-2 rounded-full w-fit mx-auto">
              <Zap size={16} className="text-[var(--accent-mint)] animate-pulse" />
              <span className="text-[var(--accent-mint)] font-bold">+25 XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-moss)] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg tap-active hover:bg-[var(--bg-card)]">
          <ChevronLeft size={18} className="text-[var(--text-primary)]" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: semester.color }}>
            {subject.title}
          </p>
          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{lesson.title}</h3>
        </div>
        
        {/* Libreta de apuntes toggle */}
        <button 
          onClick={() => setShowNotes(p => !p)} 
          className={`p-2 rounded-lg tap-active transition-all ${
            showNotes ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'hover:bg-[var(--bg-card)] text-[var(--text-secondary)]'
          }`}
          title="Libreta de apuntes"
        >
          <FileText size={18} />
        </button>

        <div className="flex items-center gap-1.5 text-[10px] font-bold shrink-0" style={{ color: semester.color }}>
          <Clock size={11} /> {lesson.duration}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-moss)] bg-[var(--bg-elevated)] shrink-0">
        <button
          onClick={() => { setShowQuiz(false); setActiveTab('theory') }}
          className={`flex-1 py-3 text-[11px] font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'theory' && !showQuiz
              ? 'border-emerald-500 text-[var(--text-primary)] bg-emerald-500/5'
              : 'border-transparent text-[var(--text-secondary)] hover:bg-black/[0.02]'
          }`}
        >
          <BookOpen size={12} />
          Teoría
        </button>
        {hasSimulator && (
          <button
            onClick={() => { setShowQuiz(false); setActiveTab('simulator') }}
            className={`flex-1 py-3 text-[11px] font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === 'simulator' && !showQuiz
                ? 'border-purple-500 text-[var(--text-primary)] bg-purple-500/5'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-black/[0.02]'
          }`}
          >
            <FlaskConical size={12} />
            Simulador
          </button>
        )}
        <button
          onClick={() => { setShowQuiz(false); setActiveTab('lab') }}
          className={`flex-1 py-3 text-[11px] font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'lab' && !showQuiz
              ? 'border-amber-500 text-[var(--text-primary)] bg-amber-500/5'
              : 'border-transparent text-[var(--text-secondary)] hover:bg-black/[0.02]'
          }`}
        >
          <Award size={12} />
          Laboratorio
        </button>
        {quiz.length > 0 && (
          <button
            onClick={() => setShowQuiz(true)}
            className={`flex-1 py-3 text-[11px] font-bold flex items-center justify-center gap-1 border-b-2 transition-all ${
              showQuiz
                ? 'border-sky-500 text-[var(--text-primary)] bg-sky-500/5'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-black/[0.02]'
            }`}
          >
            <HelpCircle size={12} />
            Quiz
          </button>
        )}
      </div>

      {/* Barra de lectura */}
      <div className="h-0.5 bg-[var(--border-moss)] shrink-0">
        <div className="h-full transition-all duration-500" style={{
          width: `${readProgress}%`,
          background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})`
        }} />
      </div>

      {/* Contenido según Tab */}
      {!showQuiz ? (
        <div className="flex-1 overflow-y-auto pb-32">
          {activeTab === 'theory' && (
            <div className={`animate-float-in theme-reading-${readingTheme} font-reading-${readingFont} text-reading-${readingSize} min-h-full transition-all duration-300 pb-20`}>
              {/* Progreso de Lectura */}
              {sections.length > 0 && (
                <div className="px-5 pt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)]">Progreso del Capítulo</span>
                    <span className="text-[10px] font-black" style={{ color: semester.color }}>{readProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--border-moss)]/20 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${readProgress}%`,
                        background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Panel de Ajustes Editoriales */}
              <div className="px-5 pt-3">
                <div className="flex items-center justify-between border border-[var(--border-moss)] bg-[var(--bg-card)] rounded-2xl px-4 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[var(--accent-mint)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Preferencia Editorial</span>
                  </div>
                  <button 
                    onClick={() => setShowReadingPreferences(!showReadingPreferences)}
                    className="text-[10px] font-bold px-3 py-1 rounded-full border border-[var(--border-moss)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--accent-mint)]/10 transition-all cursor-pointer"
                  >
                    {showReadingPreferences ? 'Cerrar Ajustes' : 'Ajustar Texto ⚙️'}
                  </button>
                </div>
                
                {showReadingPreferences && (
                  <div className="mt-2 p-3.5 border border-[var(--border-moss)] bg-[var(--bg-card)] rounded-2xl flex flex-col gap-3 shadow-md animate-float-in">
                    {/* Temas */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">Fondo de Papel</span>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'mint', label: '🌿 Menta', bg: 'bg-[#f3f8f5]', border: 'border-[#dae5dd]' },
                          { id: 'sepia', label: '📖 Sepia', bg: 'bg-[#f6ebd4]', border: 'border-[#e4d7bf]' },
                          { id: 'dark', label: '🌙 Bosque', bg: 'bg-[#070b09]', border: 'border-[#172b20]' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setReadingTheme(t.id);
                              localStorage.setItem('vegi-reading-theme', t.id);
                            }}
                            className={`text-[9px] font-bold px-2 py-1 rounded-full border transition-all ${
                              readingTheme === t.id ? 'ring-2 ring-[var(--accent-mint)] border-transparent' : 'opacity-80'
                            }`}
                            style={{
                              backgroundColor: t.id === 'mint' ? '#f3f8f5' : t.id === 'sepia' ? '#f6ebd4' : '#070b09',
                              color: t.id === 'dark' ? '#f0fdf4' : '#1a2e22',
                              borderColor: t.id === 'mint' ? '#dae5dd' : t.id === 'sepia' ? '#e4d7bf' : '#172b20'
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipografía */}
                    <div className="flex items-center justify-between border-t border-[var(--border-moss)] pt-2.5">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">Tipografía</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setReadingFont('sans');
                            localStorage.setItem('vegi-reading-font', 'sans');
                          }}
                          className={`text-[9px] font-bold px-3 py-1 rounded-full border ${
                            readingFont === 'sans' ? 'bg-[var(--accent-mint)] text-white border-transparent' : 'border-[var(--border-moss)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                          }`}
                        >
                          Sans (Moderna)
                        </button>
                        <button
                          onClick={() => {
                            setReadingFont('serif');
                            localStorage.setItem('vegi-reading-font', 'serif');
                          }}
                          className={`text-[9px] font-bold px-3 py-1 rounded-full border ${
                            readingFont === 'serif' ? 'bg-[var(--accent-mint)] text-white border-transparent' : 'border-[var(--border-moss)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                          }`}
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          Serif (Libro)
                        </button>
                      </div>
                    </div>

                    {/* Tamaño de texto */}
                    <div className="flex items-center justify-between border-t border-[var(--border-moss)] pt-2.5">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">Tamaño de Letra</span>
                      <div className="flex gap-1.5">
                        {['sm', 'md', 'lg'].map(sz => (
                          <button
                            key={sz}
                            onClick={() => {
                              setReadingSize(sz);
                              localStorage.setItem('vegi-reading-size', sz);
                            }}
                            className={`text-[9px] font-bold px-3 py-1 rounded-full border uppercase ${
                              readingSize === sz ? 'bg-[var(--accent-mint)] text-white border-transparent' : 'border-[var(--border-moss)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {sz === 'sm' ? 'Pequeño' : sz === 'md' ? 'Medio' : 'Grande'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Intro */}
              <div className="px-5 pt-4 pb-4">
                <div className="p-4 rounded-2xl border mb-5 shadow-sm"
                  style={{ background: `${semester.color}08`, borderColor: `${semester.color}25` }}>
                  {(() => {
                    const introText = content.intro || '';
                    if (!introText) return null;
                    const firstLetter = introText.charAt(0);
                    const restOfText = introText.slice(1);
                    return (
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                        <span 
                          className="float-left text-3xl font-black mr-2 px-3 py-1 rounded-2xl text-white select-none align-middle mt-1 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${semester.color}, ${semester.colorSecondary})`,
                          }}
                        >
                          {firstLetter}
                        </span>
                        {restOfText}
                      </p>
                    );
                  })()}
                </div>

                {/* Key Facts */}
                {keyFacts.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                      📊 Datos Clave
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {keyFacts.map((fact, i) => (
                        <div key={i} className="p-3 rounded-xl border bg-[var(--bg-card)] border-[var(--border-moss)]">
                          <div className="text-lg mb-1">{fact.icon}</div>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-tight mb-1">{fact.label}</p>
                          <p className="text-sm font-black" style={{ color: semester.color }}>{fact.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secciones navegables */}
              {sections.length > 0 && (
                <div className="px-5">
                  {/* Nav pills de sección */}
                  <div 
                    className="flex flex-nowrap gap-2 overflow-x-auto pb-3 mb-4 scrollbar-custom"
                    onWheel={(e) => {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }}
                  >
                    {sections.map((sec, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSection(idx)}
                        className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                          activeSection === idx
                            ? 'text-white border-transparent'
                            : 'text-[var(--text-secondary)] border-[var(--border-moss)] bg-[var(--bg-card)]'
                        }`}
                        style={activeSection === idx ? {
                          background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})`,
                          borderColor: 'transparent'
                        } : {}}
                      >
                        {sec.icon} {sec.title}
                      </button>
                    ))}
                  </div>

                  {/* Contenido de sección activa */}
                  <div key={activeSection} className="animate-float-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: `${semester.color}20` }}>
                        {sections[activeSection].icon}
                      </div>
                      <h3 className="text-base font-black text-[var(--text-primary)] flex-1">
                        {sections[activeSection].title}
                      </h3>
                    </div>

                    {/* Audiolibro Pránico Player Bar */}
                    <div className="mb-6 p-4 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-card)] flex items-center justify-between gap-3 shadow-md shadow-black/5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSpeechPlayPause}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isPlayingSpeech 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : 'bg-[var(--bg-elevated)] text-[var(--accent-mint)] hover:bg-[var(--border-moss)]'
                          } cursor-pointer tap-active`}
                          title={isPlayingSpeech ? 'Pausar audiolibro' : 'Escuchar sección'}
                        >
                          {isPlayingSpeech ? (
                            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                        
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                            Audiolibro Pránico IA
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-[var(--text-primary)] leading-none">
                              {isPlayingSpeech ? 'Reproduciendo voz...' : 'Escuchar en audio'}
                            </span>
                            
                            {/* Animated Wave visualizer */}
                            <div className={`flex items-end gap-0.5 h-3 px-1 ${isPlayingSpeech ? 'wave-active' : ''}`}>
                              <span className="wave-bar" style={{ animationPlayState: isPlayingSpeech ? 'running' : 'paused', height: '6px', width: '2px' }} />
                              <span className="wave-bar" style={{ animationPlayState: isPlayingSpeech ? 'running' : 'paused', height: '10px', width: '2px' }} />
                              <span className="wave-bar" style={{ animationPlayState: isPlayingSpeech ? 'running' : 'paused', height: '12px', width: '2px' }} />
                              <span className="wave-bar" style={{ animationPlayState: isPlayingSpeech ? 'running' : 'paused', height: '8px', width: '2px' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Speed Selector */}
                      <div className="flex items-center bg-[var(--bg-elevated)] rounded-xl p-1 border border-[var(--border-moss)] shrink-0">
                        {[1.0, 1.25, 1.5].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setSpeechRate(rate)}
                            className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                              speechRate === rate
                                ? 'bg-[var(--accent-mint)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {rate.toFixed(2)}x
                          </button>
                        ))}
                      </div>
                    </div>
 
                    <div 
                      className="prose-lesson text-sm text-[var(--text-primary)] leading-relaxed space-y-4 mb-6 cursor-pointer"
                      onMouseUp={handleTextSelection}
                      onTouchEnd={handleTextSelection}
                      onClick={(e) => {
                        const target = e.target;
                        if (target.classList.contains('glossary-tooltip')) {
                          const term = target.textContent;
                          const definition = target.getAttribute('data-tooltip');
                          setSelectedGlossaryTerm({ term, definition });
                        }
                      }}
                    >
                      {(() => {
                        const rawText = sections[activeSection]?.text || ''
                        if (!rawText || rawText.trim() === '') {
                          return (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
                              <span className="text-4xl">✏️</span>
                              <p className="text-xs text-[var(--text-secondary)] text-center">Este contenido aún no ha sido cargado.<br/>Edítalo desde el Panel de Administración.</p>
                            </div>
                          )
                        }
                        const splitBlocks = (text) => {
                          if (!text) return [];
                          const result = [];
                          let current = [];
                          let inCode = false;
                          const lines = text.split('\n');
                          for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line.trim().startsWith('```')) {
                              inCode = !inCode;
                              current.push(line);
                              continue;
                            }
                            if (inCode) {
                              current.push(line);
                            } else {
                              if (line.trim() === '') {
                                if (current.length > 0) {
                                  result.push(current.join('\n'));
                                  current = [];
                                }
                              } else {
                                current.push(line);
                              }
                            }
                          }
                          if (current.length > 0) {
                            result.push(current.join('\n'));
                          }
                          return result;
                        };
                        const rawBlocks = splitBlocks(rawText);
                        const blocks = [];
                        let currentPracticeBlock = null;

                        rawBlocks.forEach(block => {
                          const trimmed = block.trim();
                          const isPracticePart = trimmed.startsWith('🥣') || 
                                                 trimmed.toLowerCase().includes('material necesario:') || 
                                                 /^Paso\s*\d+\s*:/i.test(trimmed) ||
                                                 trimmed === '---';
                          
                          if (isPracticePart) {
                            if (!currentPracticeBlock) {
                              currentPracticeBlock = block;
                            } else {
                              currentPracticeBlock += '\n\n' + block;
                            }
                          } else {
                            if (currentPracticeBlock) {
                              blocks.push(currentPracticeBlock);
                              currentPracticeBlock = null;
                            }
                            blocks.push(block);
                          }
                        });
                        if (currentPracticeBlock) {
                          blocks.push(currentPracticeBlock);
                        }

                        const renderedElements = [];
                        let subsectionCounter = -1;

                        blocks.forEach((block, bi) => {
                          const trimmedBlock = block.trim();
                          const isHeader = trimmedBlock.startsWith('###') || trimmedBlock.startsWith('##');

                          // Detect timelines
                          const timelineLines = trimmedBlock.split('\n').filter(Boolean);
                          const isTimeline = timelineLines.length > 1 && timelineLines.every(line => /^(?:Día|Dia|Fase|Paso|Semana)\s*\d+\s*:/i.test(line.trim()));

                          let blockElement = null;

                          const isPractice = trimmedBlock.startsWith('🥣') || trimmedBlock.toLowerCase().includes('material necesario:') || /^Paso\s*\d+\s*:/i.test(trimmedBlock);

                          if (isPractice) {
                            blockElement = (
                              <PracticalLab
                                key={bi}
                                text={trimmedBlock}
                                lessonId={lesson.id}
                                parseMarkdownAndGlossary={parseMarkdownAndGlossary}
                              />
                            );
                          } else if (isTimeline) {
                            blockElement = <InteractiveTimeline key={bi} text={trimmedBlock} />;
                          } else if (isHeader) {
                            if (subsectionCounter >= 0) {
                              const currentSubId = subsectionCounter;
                              renderedElements.push(
                                <SectionSupportImage 
                                  key={`img-support-${bi}`}
                                  lessonId={lesson.id} 
                                  sectionIdx={activeSection} 
                                  subsectionIdx={currentSubId} 
                                  semester={semester} 
                                />
                              );
                            }
                            subsectionCounter++;
                          }

                          // Detectar widgets
                          if (trimmedBlock === '[WIDGET:CELL_DIAGRAM]') {
                            blockElement = <BotanicalCellDiagram key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:THERMOMETER]') {
                            blockElement = <ThermalThermometer key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:BULB_LAYER_EXPLORER]') {
                            blockElement = <BulbLayerExplorer key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:TUNIC_VS_SCALY]') {
                            blockElement = <TunicVsScaly key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:POST_HARVEST_CONTROL]') {
                            blockElement = <PostHarvestControl key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:CUTTING_MECHANICS_SIMULATOR]') {
                            blockElement = <CuttingMechanicsSimulator key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:BULB_TYPES_EXPLORER]') {
                            blockElement = <BulbTypesExplorer key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:SCALY_STARCH_GELATINIZATION]') {
                            blockElement = <ScalyStarchGelatinization key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:RESPIRATION_RATE_SIMULATOR]') {
                            blockElement = <RespirationRateSimulator key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:ETHYLENE_DIFFUSION_SIMULATOR]') {
                            blockElement = <EthyleneDiffusionSimulator key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:SULFUR_CASCADE_REACTION]') {
                            blockElement = <SulfurCascadeReaction key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:KNIFE_SHARPNESS_SIMULATOR]') {
                            blockElement = <KnifeSharpnessSimulator key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:SUCESION_ECOLOGICA_BAL]') {
                            blockElement = <SucesionEcologicaBal key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:KIMCHI_SALADO_OSMOSIS]') {
                            blockElement = <KimchiSaladoOsmosis key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:KAHM_MOLD_SIMULATOR]') {
                            blockElement = <KahmMoldSimulator key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:GINGER_BUG_FERMENTATION_SIM]') {
                            blockElement = <GingerBugFermentationSim key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:GRAIN_FERM_SIM]') {
                            blockElement = <GrainFermSim key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:TROPICAL_FERM_SIM]') {
                            blockElement = <TropicalFermSim key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:PROTEOLISIS_MISO_SIM]') {
                            blockElement = <MisoProteolysisSim key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:FRUIT_FERMENT_OSMOLARITY]') {
                            blockElement = <FruitFermentOsmolarity key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:CHILI_PASTE_AUTOLYSIS]') {
                            blockElement = <ChiliPasteAutolysis key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:KEFIR_CARBONATION_SIM]') {
                            blockElement = <KefirCarbonationSim key={bi} semester={semester} />;
                          } else if (trimmedBlock === '[WIDGET:CUSTOM_HTML]' || trimmedBlock === '[WIDGET:CUSTOM]') {
                            blockElement = <CustomHtmlWidget key={bi} html={sections[activeSection]?.custom_html} />;
                          } else if (isHeader) {
                            const isH3 = trimmedBlock.startsWith('###');
                            const cleanTitle = trimmedBlock.replace(/^#{2,3}\s*/, '');
                            blockElement = (
                              <h4 
                                key={bi} 
                                className={`font-black text-[var(--text-primary)] my-6 flex items-center gap-2 border-b pb-2 ${
                                  isH3 ? 'text-xs tracking-wide border-[var(--border-moss)]/50 pt-2' : 'text-sm'
                                }`}
                              >
                                <span 
                                  className="w-1.5 h-4.5 rounded-full shrink-0" 
                                  style={{ background: `linear-gradient(180deg, ${semester.color}, ${semester.colorSecondary})` }} 
                                />
                                <span dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(cleanTitle) }} />
                              </h4>
                            );
                          } else if (trimmedBlock.startsWith('|')) {
                            const lines = trimmedBlock.split('\n').filter(Boolean);
                            const rows = lines.map(line => line.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1));
                            const headers = rows[0];
                            const body = rows.slice(2);
                            blockElement = (
                              <TableRecipeScaler
                                key={bi}
                                headers={headers}
                                initialBody={body}
                                parseMarkdownAndGlossary={parseMarkdownAndGlossary}
                              />
                            );
                          } else if ((trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) || /[┌┐└┘─│├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]/.test(trimmedBlock) || trimmedBlock.startsWith('DIAGRAMA:')) {
                            blockElement = (
                              <TextDiagram key={bi} text={trimmedBlock} title="Diagrama Conceptual" />
                            );
                          } else if (trimmedBlock.startsWith('💡') || trimmedBlock.startsWith('🔬') || trimmedBlock.startsWith('🌿') || trimmedBlock.startsWith('🍳')) {
                            const charArray = Array.from(trimmedBlock);
                            const firstChar = charArray[0];
                            const typeMap = { '💡': 'tip', '🔬': 'science', '🌿': 'alchemy', '🍳': 'cook' };
                            const calloutType = typeMap[firstChar] || 'tip';
                            const cleanText = charArray.slice(1).join('').trim();
                            blockElement = (
                              <div key={bi} className={`callout-card callout-card-${calloutType}`}>
                                <div className="text-xl select-none shrink-0 mt-0.5">{firstChar}</div>
                                <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(cleanText) }} />
                              </div>
                            );
                          } else if (trimmedBlock.startsWith('>')) {
                            const cleanText = trimmedBlock.replace(/^>\s*/, '');
                            blockElement = (
                              <blockquote key={bi} className="editorial-quote">
                                <span className="absolute left-2 top-2 text-3xl opacity-15 select-none font-serif">“</span>
                                <div className="text-xs leading-relaxed font-serif pl-4" dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(cleanText) }} />
                              </blockquote>
                            );
                          } else if (trimmedBlock.startsWith('•')) {
                            const bulletLines = trimmedBlock.split('\n').filter(Boolean);
                            blockElement = (
                              <LeafChecklist
                                key={bi}
                                lines={bulletLines}
                                lessonId={lesson.id}
                                sectionIdx={activeSection}
                                blockIdx={bi}
                                parseMarkdownAndGlossary={parseMarkdownAndGlossary}
                              />
                            );
                          } else if (/^\d+\./.test(trimmedBlock)) {
                            blockElement = (
                              <div key={bi} className="space-y-2">
                                {trimmedBlock.split('\n').filter(Boolean).map((line, li) => (
                                  <div key={li} className="flex gap-2">
                                    <span className="shrink-0 font-bold text-[10px] mt-1" style={{ color: semester.color }}>
                                      {line.match(/^\d+/)?.[0]}.
                                    </span>
                                    <span dangerouslySetInnerHTML={{ __html: parseMarkdownAndGlossary(line.replace(/^\d+\.\s*/, '')) }} />
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            blockElement = (
                              <p key={bi} dangerouslySetInnerHTML={{
                                __html: parseMarkdownAndGlossary(trimmedBlock)
                              }} />
                            );
                          }

                          if (blockElement) {
                            renderedElements.push(blockElement);
                          }
                        });

                        const hasCustomWidgetTag = blocks.some(b => b.trim() === '[WIDGET:CUSTOM_HTML]' || b.trim() === '[WIDGET:CUSTOM]');
                        if (sections[activeSection]?.custom_html && !hasCustomWidgetTag) {
                          renderedElements.push(
                            <CustomHtmlWidget key="auto-custom-widget" html={sections[activeSection].custom_html} />
                          );
                        }

                        if (subsectionCounter >= 0) {
                          const currentSubId = subsectionCounter;
                          renderedElements.push(
                            <SectionSupportImage 
                              key={`img-support-final`}
                              lessonId={lesson.id} 
                              sectionIdx={activeSection} 
                              subsectionIdx={currentSubId} 
                              semester={semester} 
                            />
                          );
                        } else {
                          renderedElements.push(
                            <SectionSupportImage 
                              key={`img-support-general`}
                              lessonId={lesson.id} 
                              sectionIdx={activeSection} 
                              subsectionIdx={0} 
                              semester={semester} 
                            />
                          );
                        }

                        // Checkpoint de Dopamina (skip objectives section index 0)
                        if (activeSection > 0) {
                          const isClaimed = !!claimedCheckpoints[activeSection];
                          renderedElements.push(
                            <DopamineCheckpoint 
                              key={`dopamine-checkpoint-${activeSection}`}
                              lessonId={lesson.id}
                              sectionIdx={activeSection}
                              sectionTitle={sections[activeSection].title}
                              onClaim={(e) => claimCheckpoint(activeSection, e)}
                              claimed={isClaimed}
                            />
                          );
                        }

                        return renderedElements;
                      })()}
                    </div>

                    {/* Videoteca de Refuerzo Premium */}
                    {sections[activeSection] && sections[activeSection].videos && sections[activeSection].videos.length > 0 ? (
                      <div className="my-8 p-5 rounded-3xl border border-[var(--border-moss)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)]/30 flex flex-col gap-4 relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(16,185,129,0.03)]">
                        {/* Glowing green accent light */}
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--accent-mint)]/5 blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center gap-3 border-b border-[var(--border-moss)]/40 pb-3 relative z-10">
                          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-moss)] flex items-center justify-center shadow-sm shrink-0">
                            {/* SVG YouTube Play Icon */}
                            <svg className="w-5 h-5 text-[var(--accent-mint)] fill-current animate-pulse" viewBox="0 0 24 24">
                              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.519 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.482 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[var(--text-primary)] tracking-wide uppercase font-mono" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              Videoteca de Refuerzo Práctico
                            </h4>
                            <p className="text-[10px] text-[var(--text-secondary)]">Acelera tu aprendizaje buscando y analizando estas clases de referencia en YouTube</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10">
                          {sections[activeSection].videos.map((vid, vi) => (
                            <VideoSearchItem key={vi} vid={vid} index={vi} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      content?.videos && content.videos.length > 0 && (
                        <div className="my-6 p-4 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-card)] flex flex-col gap-3">
                          <div className="flex items-center gap-2 border-b border-[var(--border-moss)] pb-2">
                            <span className="text-lg">📹</span>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                                Videoteca de Refuerzo
                              </h4>
                              <p className="text-[9px] text-[var(--text-secondary)]">Clases en video seleccionadas para ampliar tu conocimiento</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {content.videos.map((vid, vi) => (
                              <button
                                key={vi}
                                onClick={() => setActiveVideo(vid)}
                                className="w-full text-left p-3 rounded-xl border border-[var(--border-moss)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] transition-all flex items-center justify-between group cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-mint)] transition-all">{vid.title}</p>
                                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{vid.channel} · {vid.duration}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[var(--accent-mint)]/10 group-hover:bg-[var(--accent-mint)] flex items-center justify-center text-[var(--accent-mint)] group-hover:text-white transition-all shadow-sm shrink-0">
                                  <span className="text-xs font-bold">▶</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {/* Checklist interactivo de comprensión */}
                    <div className="my-6 p-4 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-card)] flex flex-col gap-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        🎯 Verificación de Aprendizaje
                      </h4>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!sectionsRead[activeSection]}
                          onChange={() => toggleSectionRead(activeSection)}
                          className="mt-0.5 accent-[var(--accent-mint)] w-4 h-4 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            He leído y comprendido esta sección
                          </span>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-tight mt-0.5">
                            Marca esta casilla para confirmar tu dominio de este submódulo.
                          </p>
                        </div>
                      </label>
                      {sectionsRead[activeSection] && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent-mint)] animate-pulse mt-1">
                          <CheckCircle size={12} />
                          <span>¡Submódulo verificado y dominado!</span>
                        </div>
                      )}
                    </div>

                    {/* Navegación entre secciones */}
                    <div className="flex gap-3 mb-6">
                      {activeSection > 0 && (
                        <button onClick={() => setActiveSection(p => p - 1)}
                          className="flex-1 py-2.5 rounded-xl border border-[var(--border-moss)] text-xs font-semibold text-[var(--text-secondary)] tap-active">
                          ← Anterior
                        </button>
                      )}
                      {activeSection < sections.length - 1 ? (
                        <button
                          onClick={() => setActiveSection(p => p + 1)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white tap-active"
                          style={{ background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})` }}>
                          Siguiente →
                        </button>
                      ) : (
                        <button
                          onClick={() => hasSimulator ? setActiveTab('simulator') : setActiveTab('lab')}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white tap-active shadow-lg"
                          style={{ background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})` }}>
                          Práctica o Lab →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'simulator' && hasSimulator && (
            <div className="px-5 pt-5">
              <SimulatorComponent />
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="px-5 pt-5">
              <LabPracticeCard lesson={lesson} onComplete={handleComplete} />
            </div>
          )}
        </div>
      ) : (
        // ─── Quiz de la lección ──────────────────────────────
        <div className="flex-1 overflow-y-auto pb-32 px-5 pt-6">
          {quizFailed ? (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-float-in">
              <div className="text-6xl mb-4 animate-bounce">💥</div>
              <h3 className="text-lg font-black text-red-500 mb-2">¡Receta Quemada!</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed mb-6">
                Has cometido demasiados errores y te has quedado sin vidas culinarias. Repasa la teoría del ingrediente antes de volver a intentarlo.
              </p>
              <button
                onClick={handleRetryQuiz}
                className="px-6 py-3.5 rounded-xl text-xs font-black text-white cursor-pointer hover:opacity-90 transition-all bg-gradient-to-r from-red-500 to-amber-500 shadow-md tap-active"
              >
                🔄 Repetir Evaluación
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {isExam ? '🎓 Evaluación de Cátedra' : 'Quiz de la Lección'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {isExam ? 'Demuestra tu dominio científico del tema' : 'Responde para completar la lección y ganar XP'}
                </p>
              </div>

              {/* Status Bar: Lives & Timer */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex justify-between items-center px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Vidas</span>
                  <span className="text-xs flex gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className={`transition-all duration-300 ${i < lives ? 'text-red-500 scale-110' : 'text-zinc-600 opacity-40'}`}>
                        {i < lives ? '♥️' : '🖤'}
                      </span>
                    ))}
                  </span>
                </div>

                {isExam ? (
                  <div className="flex justify-between items-center px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Tiempo</span>
                    <span className={`text-[11px] font-mono font-black ${timeRemaining < 120 ? 'text-red-500 animate-pulse' : 'text-[var(--accent-mint)]'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-moss)] rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Dificultad</span>
                    <span className="text-[9px] font-bold text-amber-500 uppercase">Avanzado</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quiz.map((q, qi) => (
                  <div key={qi} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-moss)]">
                    <p className="text-sm font-bold text-[var(--text-primary)] mb-3 leading-relaxed">
                      <span className="font-black" style={{ color: semester.color }}>Q{qi + 1}.</span> {q.q}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi
                        const correct = q.correct === oi
                        let style = 'border-[var(--border-moss)] bg-[var(--bg-elevated)]'
                        if (quizSubmitted) {
                          if (correct) style = 'border-green-500 bg-green-500/10'
                          else if (selected && !correct) style = 'border-red-500 bg-red-500/10'
                        } else if (selected) {
                          style = `border-transparent text-white`
                        }

                        return (
                          <button
                            key={oi}
                            disabled={quizSubmitted}
                            onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                            className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${style} ${!quizSubmitted ? 'tap-active cursor-pointer' : ''}`}
                            style={selected && !quizSubmitted ? {
                              background: `linear-gradient(90deg, ${semester.color}CC, ${semester.colorSecondary}CC)`,
                              borderColor: 'transparent'
                            } : {}}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                selected && !quizSubmitted ? 'bg-white/30 text-white' : 'bg-[var(--border-moss)] text-[var(--text-secondary)]'
                              }`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className={selected && !quizSubmitted ? 'text-white font-medium' : 'text-[var(--text-primary)]'}>
                                {opt}
                              </span>
                              {quizSubmitted && correct && <Check size={14} className="text-green-500 ml-auto" />}
                              {quizSubmitted && selected && !correct && <X size={14} className="text-red-500 ml-auto" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Hints block */}
                    {!quizSubmitted && q.hint && (
                      <div className="mt-3.5 border-t border-[var(--border-moss)]/40 pt-2.5">
                        {!shownHints[qi] ? (
                          <button
                            onClick={() => setShownHints(p => ({ ...p, [qi]: true }))}
                            className="text-[10px] font-bold text-[var(--accent-mint)] flex items-center gap-1 cursor-pointer hover:opacity-85"
                          >
                            💡 Revelar pista de estudio
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/40 border border-[var(--border-moss)]/60 animate-float-in flex flex-col gap-1.5">
                            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                              {q.hint}
                            </p>
                            {q.youtube && (
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q.youtube)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black text-red-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                🎥 Ver en YouTube: busca "{q.youtube}" ➔
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Justification block */}
                    {quizSubmitted && q.explanation && (
                      <div className="mt-3.5 p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-[10px] text-[var(--text-secondary)] leading-relaxed animate-float-in">
                        <span className="font-bold text-green-500 block mb-0.5">📝 Explicación:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < quiz.length}
                  className="w-full mt-6 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 tap-active cursor-pointer"
                  style={{ background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})` }}>
                  Enviar Respuestas
                </button>
              ) : (
                <div className="mt-6 p-4 rounded-2xl text-center shadow-md animate-float-in"
                  style={{ background: `${semester.color}15`, border: `1px solid ${semester.color}30` }}>
                  <div className="text-3xl mb-2">{quizScore === quiz.length ? '🏆' : quizScore >= quiz.length / 2 ? '👍' : '📚'}</div>
                  <p className="font-black text-[var(--text-primary)] text-lg">{quizScore}/{quiz.length} correctas</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {quizScore === quiz.length ? '¡Perfecto! Lección completada.' : 'Buen intento. Sigue estudiando.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CTA Fijo para marcar finalizado si no hay quiz ni lab obligatorio */}
      {!showQuiz && activeTab === 'theory' && sections.length === 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none max-w-md mx-auto">
          <button
            onClick={() => quiz.length > 0 ? setShowQuiz(true) : handleComplete()}
            className="w-full pointer-events-auto py-4 rounded-2xl text-sm font-bold text-white shadow-xl tap-active"
            style={{ background: `linear-gradient(90deg, ${semester.color}, ${semester.colorSecondary})` }}>
            {quiz.length > 0 ? '📝 Hacer el Quiz' : done ? '✓ Completado' : '✅ Marcar como leído'}
          </button>
        </div>
      )}
      {/* Confetti Overlay */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .animate-confetti-fall {
              animation-name: confetti-fall;
              animation-timing-function: linear;
              animation-fill-mode: forwards;
            }
          `}</style>
          {Array.from({ length: 45 }).map((_, i) => {
            const left = Math.random() * 100 + 'vw';
            const size = Math.random() * 8 + 6 + 'px';
            const colors = ['#2EE59D', '#0EA5E9', '#FF4757', '#FFA502', '#2ED573'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const delay = Math.random() * 1.5 + 's';
            const duration = Math.random() * 1.5 + 2 + 's';
            return (
              <div 
                key={i} 
                className="absolute top-0 rounded-sm animate-confetti-fall"
                style={{
                  left,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  animationDelay: delay,
                  animationDuration: duration,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Glossary Definition Modal Bottom Sheet */}
      {selectedGlossaryTerm && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-5 bg-[#120b0b]/90 backdrop-blur-md border-t border-red-500/20 rounded-t-3xl animate-float-in shadow-2xl pb-8">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔬</span>
                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest font-mono">
                  Definición: {selectedGlossaryTerm.term}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedGlossaryTerm(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-neutral-100 leading-relaxed font-bold">
              {selectedGlossaryTerm.definition}
            </p>

            {/* Analogy Box */}
            <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-2.5 items-start mt-1">
              <span className="text-base leading-none">💡</span>
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                <strong className="text-red-400 font-extrabold uppercase tracking-wide block mb-0.5">En la Alquimia Culinaria:</strong>
                {
                  selectedGlossaryTerm.term.toLowerCase().includes('aliina') ? "Es el 'polvo de pólvora' inodoro almacenado en las vacuolas del ajo. Permanece latente y estable hasta que el bulbo sufre un corte o daño físico." :
                  selectedGlossaryTerm.term.toLowerCase().includes('aliinasa') ? "Es la 'chispa' enzimática. Está separada físicamente de la aliina por membranas celulares. Al romper el ajo, se juntan y catalizan la alicina." :
                  selectedGlossaryTerm.term.toLowerCase().includes('alicina') ? "Es el 'fuego aromático' resultante. Es un antiséptico natural sumamente volátil y potente que aporta el sabor y picor característico del ajo crudo." :
                  selectedGlossaryTerm.term.toLowerCase().includes('ósmosis') || selectedGlossaryTerm.term.toLowerCase().includes('osmosis') ? "Funciona como 'exprimir una esponja biológica'. La sal extrae los jugos y azúcares celulares de los vegetales para nutrir a las BAL." :
                  selectedGlossaryTerm.term.toLowerCase().includes('plasmólisis') ? "Es el colapso físico de la célula vegetal al perder su agua interna. Hace que las verduras pierdan rigidez y queden flexibles y curadas." :
                  selectedGlossaryTerm.term.toLowerCase().includes('gluten') ? "El andamio de la masa. Una red elástica tridimensional de proteínas que atrapa el dióxido de carbono para que el pan se infle." :
                  selectedGlossaryTerm.term.toLowerCase().includes('umami') ? "El sabor de la profundidad. Estimula la salivación y le avisa al cerebro que el alimento es rico en aminoácidos valiosos predigeridos." :
                  "Es un compuesto bioactivo o fenómeno físico que optimiza la textura, sabor y conservación biológica de tus preparaciones de vanguardia."
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Highlighter Toolbar */}
      {showHighlighterToolbar && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-[#1a1313]/95 backdrop-blur-md border border-red-500/30 flex items-center gap-3.5 shadow-2xl animate-float-in">
          <span className="text-[10px] font-black uppercase text-neutral-400 font-mono tracking-wider shrink-0">Subrayar:</span>
          <div className="flex gap-2">
            <button 
              onClick={() => addHighlight('mint')} 
              className="w-6 h-6 rounded-full bg-emerald-500 hover:scale-110 active:scale-95 transition-all border border-white/20 cursor-pointer" 
              title="Verde Menta (Clave)"
            />
            <button 
              onClick={() => addHighlight('gold')} 
              className="w-6 h-6 rounded-full bg-amber-500 hover:scale-110 active:scale-95 transition-all border border-white/20 cursor-pointer" 
              title="Oro Alquímico (Importante)"
            />
            <button 
              onClick={() => addHighlight('rose')} 
              className="w-6 h-6 rounded-full bg-rose-500 hover:scale-110 active:scale-95 transition-all border border-white/20 cursor-pointer" 
              title="Rosa Capsaicina (Fórmula)"
            />
          </div>
          <div className="w-px h-5 bg-neutral-800" />
          <button 
            onClick={() => {
              setShowHighlighterToolbar(false);
              window.getSelection().removeAllRanges();
            }}
            className="text-neutral-400 hover:text-white text-[10px] font-bold uppercase transition-all px-1 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Libreta de Apuntes (Notes Panel Drawer) */}
      {showNotes && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-[#0e1612]/95 backdrop-blur-md border-l border-amber-500/20 shadow-2xl flex flex-col animate-float-in">
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 text-amber-400">
              <FileText size={16} />
              <h4 className="text-xs font-black uppercase tracking-widest font-mono">
                Libreta de Apuntes
              </h4>
            </div>
            <button 
              onClick={() => setShowNotes(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Notes Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider font-mono">
                Mis Apuntes Personales:
              </label>
              <textarea
                value={notesText}
                onChange={handleNotesChange}
                placeholder="Escribe tus observaciones, tiempos de fermentación, dudas o ideas para tus recetas..."
                className="w-full h-44 p-3 rounded-xl bg-black/40 border border-neutral-800 focus:border-amber-500/50 text-neutral-200 text-xs font-medium placeholder-neutral-600 focus:outline-none resize-none transition-all"
              />
              <span className="text-[8px] text-neutral-500 text-right font-mono italic">
                ✓ Autoguardado local
              </span>
            </div>

            {/* Highlights Section */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider font-mono">
                Mis Subrayados ({highlights.length}):
              </label>
              {highlights.length === 0 ? (
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/20 text-center text-[10px] text-neutral-500 leading-normal">
                  Selecciona y subraya texto clave en la teoría para guardarlo aquí de referencia rápida.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {highlights.map((hl, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex flex-col gap-2 shadow-sm ${
                        hl.color === 'mint' ? 'border-emerald-500/10 bg-emerald-500/5' :
                        hl.color === 'gold' ? 'border-amber-500/10 bg-amber-500/5' :
                        'border-rose-500/10 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                          hl.color === 'mint' ? 'bg-emerald-500/15 text-emerald-400' :
                          hl.color === 'gold' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {hl.color === 'mint' ? 'Clave' : hl.color === 'gold' ? 'Importante' : 'Fórmula'}
                        </span>
                        <button 
                          onClick={() => removeHighlight(hl.text)}
                          className="text-neutral-500 hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer"
                          title="Eliminar subrayado"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-300 italic font-medium leading-relaxed">
                        "{hl.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// VISTA 5: Biblioteca del Conocimiento (Glosario Interactivo)
// ============================================================
function LibraryView({ onBack, accentColor }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const categories = ['Todos', ...Array.from(new Set(LIBRARY_GLOSSARY.map(g => g.category)))]
  const [expandedTerm, setExpandedTerm] = useState(null)

  const filtered = LIBRARY_GLOSSARY.filter(g => {
    const matchCat = activeCategory === 'Todos' || g.category === activeCategory
    const matchSearch = g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.def.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const categoryColors = {
    'Química': '#A855F7', 'Técnica': '#2EE59D', 'Fitoquímica': '#22C55E',
    'Bioquímica': '#0EA5E9', 'Molecular': '#EC4899', 'Sensorial': '#F59E0B',
    'Microbiología': '#8B5CF6', 'Nutrición': '#10B981', 'Equipamiento': '#6366F1',
    'Física': '#F97316', 'Todos': accentColor
  }

  return (
    <div className="flex flex-col animate-float-in">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 pt-14 pb-3">
          <button onClick={onBack} className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-moss)] tap-active">
            <ChevronLeft size={16} className="text-[var(--text-primary)]" />
          </button>
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">📚 Biblioteca</h2>
            <p className="text-[10px] text-[var(--text-secondary)]">{LIBRARY_GLOSSARY.length} términos · Glosario completo</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar término o concepto..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-moss)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-mint)]/50"
            />
          </div>
        </div>

        {/* Categorías */}
        <div 
          className="flex flex-nowrap gap-2 px-4 pb-3 overflow-x-auto scrollbar-custom"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all`}
              style={activeCategory === cat ? {
                background: categoryColors[cat] || accentColor,
                color: 'white',
                borderColor: 'transparent'
              } : {
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-moss)',
                background: 'var(--bg-card)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de términos */}
      <div className="px-4 pb-6 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[var(--text-secondary)] text-sm">
            No se encontraron resultados
          </div>
        )}
        {filtered.map((item, i) => {
          const color = categoryColors[item.category] || accentColor
          const isExpanded = expandedTerm === item.term
          return (
            <button
              key={i}
              onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
              className="w-full text-left p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-moss)] transition-all tap-active"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-[var(--text-primary)]">{item.term}</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}15`, color }}>
                      {item.category}
                    </span>
                  </div>
                  {isExpanded ? (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed animate-float-in">
                      {item.def}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] truncate">{item.def}</p>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className={`shrink-0 text-[var(--text-secondary)] transition-transform mt-0.5 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// WIDGET ADICIONAL: Carga de Imagen de Apoyo con Prompts de IA
// ============================================================
const SUPPORT_AI_PROMPTS = {
  'sem1-s1-l1': [
    // Secciones de Bulbos: La Alquimia Subterránea
    // Sec 0: Morfología y Fisiología de los Bulbos
    [
      "Infografía de la evolución y origen geófito de las plantas Alliums (ajos y cebollas). Muestra el desarrollo subterráneo como reserva de energía ante climas extremos. Estilo botánico vintage, etiquetas claras en español, colores verde oliva y ocre, alta resolución.",
      "Esquema detallado de la anatomía de un bulbo tunicado simple (cebolla). Vista en corte longitudinal mostrando las capas concéntricas (catafilos carnosos), el plato basal leñoso, la yema apical meristemática y las raíces adventicias. Estilo ilustración científica moderna, etiquetas limpias en español, alta resolución, vector.",
      "Cuadro comparativo ilustrado de la clasificación morfológica de Alliums culinarios: 1. Bulbos Tunicados Simples (Cebolla/Puerro), 2. Bulbos Tunicados Compuestos (Dientes de Ajo) con bulbillos individuales, 3. Bulbos Escamosos (Lirios comestibles) con escamas imbricadas superpuestas. Estilo plano minimalista, etiquetas en español, alta resolución.",
      "Infografía de la fisiología post-cosecha de Alliums. Muestra el proceso de respiración celular a >15°C, pérdida de humedad por transpiración a <60% HR, y activación del brote apical por gas etileno. Diseño de dashboard moderno, iconos limpios, etiquetas en español, alta resolución.",
      "Diagrama termodinámico de la cocción de bulbos. Muestra a nivel celular la hidrólisis de protopectinas a 90°C y la rotura de membranas que libera agua y fructanos. Compara un corte longitudinal (conserva fibras) frente a un corte transversal (colapso celular). Diseño de gastronomía molecular, etiquetas en español, alta definición."
    ],
    // Sec 1: Bioquímica del Allium: La Reacción del Picante
    [
      "Diagrama microscópico de una célula vegetal de ajo intacta. Muestra la vacuola gigante conteniendo la enzima aliinasa y el citosol conteniendo el precursor aliina. Al lado, muestra el daño mecánico (corte del cuchillo) que rompe las paredes y junta ambos compuestos. Diseño de infografía biológica moderna, etiquetas en español, alta definición.",
      "Gráfico de estabilidad de la enzima Aliinasa ante cambios físicos. Muestra una curva de pH óptimo (5.5 - 8.0) e inactivación por acidez extrema (pH < 4.0). Al lado, muestra una curva de temperatura óptima (37°C) e inactivación térmica permanente por encima de 60°C. Diseño limpio y científico, etiquetas en español.",
      "Infografía de la ruta bioquímica del ajo (Allium sativum). Muestra la conversión enzimática de Aliina en ácido alilsulfénico y su rápida condensación no enzimática en Alicina (tiosulfinato). Muestra los compuestos secundarios resultantes (ajoeno y vinilditiínas) tras reposar en aceite. Estilo de póster de química orgánica moderna, etiquetas en español.",
      "Esquema bioquímico de la ruta de la cebolla (Allium cepa). Muestra la acción de la aliinasa sobre la isoaliina para generar ácido propenilsulfénico y la posterior intervención de la LF-sintasa para producir el gas volátil S-óxido de tiopropanal (factor lacrimógeno). Muestra el contacto con el agua ocular produciendo ácido sulfúrico. Ilustración con diagramas de moléculas y caras ilustradas, etiquetas en español.",
      "Diagrama comparativo fitoquímico de Alliums secundarios: Puerro (alto metialiina, aroma herbáceo sin factor lacrimógeno) y Chalota (balance perfecto de precursores de ajo y cebolla). Ilustraciones botánicas limpias con barras de compuestos azufrados, etiquetas en español.",
      "Infografía de técnicas culinarias de control de compuestos azufrados: 1. Control térmico (frenado criogénico a 4°C), 2. Inactivación ácida (limón/vinagre), 3. Inactivación térmica (escaldado de dientes de ajo a >60°C), 4. Lavado de solutos hidrófilos con agua corriente. Iconos modernos, diseño minimalista, etiquetas en español."
    ],
    // Sec 2: Taxonomía y Perfiles Sensoriales
    [
      "Ficha técnica infográfica de la Cebolla Amarilla (Allium cepa). Muestra su alto contenido de fructanos, potencial de caramelización lenta y notas organolépticas a toffee y frutos secos tras cocción. Estilo editorial premium, colores cálidos, etiquetas en español.",
      "Ficha técnica de la Cebolla Morada o Roja. Muestra la presencia de antocianinas vacuolares solubles y su reactividad al pH: grisáceo en medio neutro y rosa brillante en medio ácido (ceviche). Diseño estético y colorido, etiquetas en español.",
      "Ficha técnica de la Cebolla Blanca. Muestra su alto contenido de agua libre y menor cantidad de fructanos, resultando en una mordida muy crujiente y limpia. Muestra su uso ideal para salteados rápidos al wok. Diseño minimalista moderno, etiquetas en español.",
      "Ficha técnica de la Chalota (Shallot). Muestra su crecimiento en racimos y sus capas finas de sabor delicado y aromático. Advierte sobre el riesgo de quemarse con facilidad a fuego directo y muestra su uso en la salsa Bernesa. Diseño elegante de alta cocina, etiquetas en español.",
      "Infografía del Hinojo (Foeniculum vulgare). Aclara que es un pecíolo hipertrofiado no-Allium y detalla el rol del trans-anetol (aroma anisado soluble en grasas y alcohol) y su comportamiento térmico. Estilo botánico moderno con diagramas de fibras de celulosa, etiquetas en español."
    ],
    // Sec 3: La Termodinámica de la Caramelización vs Maillard
    [
      "Diagrama del proceso de la Reacción de Maillard (140°C - 165°C) en Alliums. Muestra las 3 fases: 1. Condensación del azúcar reductor con el grupo amino (Reordenamiento de Amadori), 2. Degradación de Strecker (formación de pirazinas y tiazoles aromáticos), 3. Polimerización de melanoidinas (color marrón tostado). Ilustración científica moderna, etiquetas en español.",
      "Infografía de la Caramelización (pirólisis pura de azúcares libres a >110°C para la fructosa). Muestra la transformación de azúcares y su polimerización en Caramelán, Caramelen y Caramelín. Ilustración de gastronomía molecular, colores ámbar y bronce, etiquetas en español.",
      "Cronograma paso a paso de 60 minutos para la Caramelización Técnica Profesional: Fase 1 (Sudado y ósmosis a 90°C), Fase 2 (Evaporación y concentración a 100°C), Fase 3 (Transición e inicio de pardeamiento a 110°C), Fase 4 (Reacción de Maillard y desglasados continuos a 140°C). Diseño de infografía de flujo temporal, etiquetas en español, alta resolución."
    ]
  ],
  'sem1-s1-l2': [
    // Sec 0: Anatomía de un Tubérculo y Yemas Latentes
    [
      "Infografía de la anatomía de un tubérculo (papa - Solanum tuberosum) en corte longitudinal. Muestra yemas latentes (ojos), parénquima de reserva (amiloplastos), y peridermis (piel). Estilo científico moderno, tonos tierra y ocre, alta definición, etiquetas en español."
    ],
    // Sec 1: La Física del Almidón: Amilosa y Amilopectina
    [
      "Diagrama molecular de las moléculas del almidón: Amilosa y Amilopectina, junto con el proceso de Gelatinización (hinchamiento por calor) y Retrogradación (enfriamiento a 4°C y formación de Almidón Resistente Tipo 3). Diseño vectorial limpio, etiquetas en español, alta resolución."
    ],
    // Sec 2: Biodiversidad de Tubérculos y Fórmulas Culinarias
    [
      "Póster infográfico de biodiversidad de tubérculos andinos: Papa Amarilla (alto almidón/viscosidad), Camote/Batata (rico en azúcares), Yuca/Mandioca (denso en tapioca), y Yacón (rico en inulina prebiótica). Fichas técnicas limpias, colores naturales, diseño plano moderno, etiquetas en español, alta definición."
    ],
    // Sec 3: Técnicas de Fritura y Confitado Químico
    [
      "Diagrama técnico de cocina para la 'Fritura de Yuca en Dos Tiempos' (Hervido/Gelatinización, Enfriamiento/Retrogradación, Fritura a 180°C/Evaporación superficial). Estilo de infografía de gastronomía molecular, diseño minimalista moderno, etiquetas en español."
    ]
  ],
  'sem1-s1-l3': [
    // Sec 0: Fisiología de las Raíces Napiformes
    [
      "Infografía botánica de las raíces napiformes (zanahoria - Daucus carota) y la biodisponibilidad de carotenoides. Ilustración de corte longitudinal que muestra el núcleo leñoso interno y la corteza exterior. Gráfico comparativo de la absorción de carotenos (crudo 5% vs cocido con grasa 40%). Estilo minimalista moderno, etiquetas en español."
    ],
    // Sec 1: Rizomas: Tallo Horizontal y Fitoterapia Culinaria
    [
      "Diagrama explicativo sobre los rizomas culinarios (Jengibre y Cúrcuma). Muestra la conversión química de Gingerol en Shogaol con calor, y la sinergia de absorción (+2000%) de la Curcumina cuando se consume con Piperina (pimienta negra). Diseño vectorial elegante, etiquetas en español."
    ],
    // Sec 2: Cormos: Tallos Macizos y Toxicidad por Oxalato
    [
      "Infografía científica sobre los cormos (Taro/Malanga - Colocasia esculenta). Muestra la presencia de cristales de oxalato de calcio en forma de agujas (rafidios) en células crudas y su disolución térmica por cocción. Diseño moderno, advertencias claras en español, alta resolución."
    ]
  ],
  // ─── PROMPTS DEL SEMESTRE V ────────────────────────────────
  'sem5-s1-l1': [
    // Sec 0: Estructura Proteica y Aminoácidos Limitantes
    [
      "Infografía vertical 9:16 sobre el Espejo de Aminoácidos y complementación proteica vegetal. Compara legumbres (altas en lisina, bajas en metionina) con cereales (altos en metionina, bajos en lisina) que se complementan para formar una proteína completa. Estilo ilustración botánica premium, etiquetas en español, alta definición.",
      "Diagrama explicativo 9:16 sobre los índices de digestabilidad proteica DIAAS vs PDCAAS en alimentos vegetales (soja, garbanzos y cereales). Muestra el proceso de absorción en las microvellosidades del íleon. Estilo infografía científica, tonos verde y esmeralda, etiquetas limpias en español."
    ],
    // Sec 1: Técnicas de Combinación Culinaria de Alta Gama
    [
      "Póster infográfico 9:16 que muestra combinaciones culinarias de alta gama para proteínas completas (edamame con quinua, hummus con semillas de sésamo). Muestra texturas y aportes de aminoácidos en capas. Estilo menú gourmet moderno, etiquetas en español.",
      "Diagrama de fermentación de tempeh a nivel micro-molecular. Muestra el micelio del hongo Rhizopus oligosporus penetrando los granos de soja y rompiendo enlaces peptídicos complejos en aminoácidos libres biodisponibles. Estilo dibujo técnico, alta resolución, etiquetas en español."
    ]
  ],
  'sem5-s1-l2': [
    // Sec 0: Bioquímica del Omega-3 Vegetal
    [
      "Infografía vertical 9:16 sobre la ruta de conversión enzimática de ácidos grasos Omega-3 vegetales. Muestra la conversión de ALA (semillas de chía/linaza) a EPA y DHA por elongasas y desaturasas, indicando el porcentaje de conversión y la interferencia competitiva con Omega-6. Diseño científico premium, etiquetas en español.",
      "Gráfico de proporción dietética ideal de grasas Omega-6 vs Omega-3 (rango 2:1 a 4:1) frente a la proporción occidental inflamatoria común (15:1). Ilustración de balanza bioquímica equilibrada con aceites vegetales puros, etiquetas en español."
    ],
    // Sec 1: Aplicaciones y Emulsiones Lipídicas Saludables
    [
      "Diagrama técnico 9:16 de emulsificación de ácidos grasos omega-3 en frío usando mucílagos naturales para evitar la termo-oxidación del aceite de chía. Estilo gastronomía física, alta definición, etiquetas en español.",
      "Infografía sobre microalgas marinas (Schizochytrium) como fuente directa de DHA y EPA de alta biodisponibilidad y pureza ecológica. Ilustración de reactor biológico y células de algas, diseño limpio, etiquetas en español."
    ]
  ],
  'sem5-s2-l1': [
    // Sec 0: La Química de la Quelación de Minerales
    [
      "Infografía 9:16 sobre la estructura molecular del ácido fítico quelando iones de hierro, zinc y calcio en el intestino. Muestra la acción hidrolítica de la enzima fitasa activada por acidez (pH 4.5) y remojo templado (35°C). Estilo infografía científica premium, etiquetas en español.",
      "Diagrama del comportamiento de los oxalatos en hojas verdes (espinaca y acelga). Muestra los rafidios de oxalato de calcio insoluble y cómo el escaldado de las hojas disuelve los oxalatos libres en agua caliente. Diseño ilustrado limpio, etiquetas en español."
    ],
    // Sec 1: Protocolos de Activación y Germinación Práctica
    [
      "Esquema biológico 9:16 del proceso de germinación de una semilla en 4 etapas. Muestra la absorción de agua, la síntesis de giberelinas, y la activación de enzimas hidrolíticas (amilasas, proteasas, fitasas) para digerir los antinutrientes. Estilo botánico y biológico, etiquetas en español.",
      "Infografía de panadería consciente que utiliza granos germinados deshidratados a baja temperatura (<42°C). Muestra la conservación enzimática y la liberación natural de maltosa que mejora sabor y digestión. Diseño rústico elegante, etiquetas en español."
    ]
  ],
  'sem5-s2-l2': [
    // Sec 0: Desnaturalización Térmica de Lectinas y Saponinas
    [
      "Infografía vertical 9:16 sobre la desnaturalización térmica de las lectinas (fitohemaglutininas) a 100°C en judías y legumbres. Advierte sobre el peligro de cocciones por debajo de 85°C que no logran romper estas proteínas. Estilo gráfico instructivo moderno, etiquetas en español.",
      "Diagrama de lavado y eliminación mecánica de saponinas espumosas de la quinua. Muestra la estructura anfipática de la saponina interactuando con agua y la importancia del lavado hasta eliminar la turbidez. Diseño plano minimalista, etiquetas en español."
    ],
    // Sec 1: Fermentación y Cocción a Presión en Legumbres
    [
      "Infografía técnica 9:16 que compara la cocción convencional de legumbres frente a la cocción a presión a 120°C que hidroliza oligosacáridos causantes de gases (rafinosa y estaquiosa). Diseño moderno de electrodoméstico científico, etiquetas en español.",
      "Diagrama de la fermentación láctica de harinas de legumbres para pan plano (idli/dosa). Muestra cómo las bacterias lácticas disminuyen el pH y pre-digieren las proteínas. Estilo ilustración de fermentación tradicional india, alta definición, etiquetas en español."
    ]
  ],
  'sem5-s3-l1': [
    // Sec 0: Reducción Química de Fe3+ a Fe2+
    [
      "Infografía vertical 9:16 que explica la reducción química del hierro no hemo en estado férrico (Fe3+) a ferroso (Fe2+) mediada por el ácido ascórbico (Vitamina C) en el estómago para permitir su entrada por los transportadores celulares DMT-1. Estilo molecular moderno, etiquetas en español.",
      "Diagrama comparativo sobre los inhibidores del hierro no hemo: Taninos de té/café y polifenoles bloqueando la absorción celular. Ilustración clara con tazas y compuestos moleculares cruzados, etiquetas en español."
    ],
    // Sec 1: Sinergias Prácticas en el Menú Alquímico
    [
      "Ilustración 9:16 de un plato de alta cocina: pimientos rojos asados al dente rellenos de lentejas y quinua, mostrando la sinergia molecular de hierro + Vitamina C en un emplatado elegante y moderno con espacio negativo. Estilo fotografía gourmet, alta resolución.",
      "Diagrama de emulsión y preparación de aderezo de tahini con limón y perejil fresco, detallando la interacción ácida que mejora la biodisponibilidad del sésamo. Diseño de receta visual minimalista, etiquetas en español."
    ]
  ],
  'sem5-s3-l2': [
    // Sec 0: Absorción del Calcio y Zinc en el Reino Vegetal
    [
      "Infografía 9:16 sobre la absorción de calcio en crucíferas (brócoli/kale) sin oxalatos frente a espinacas con oxalatos. Muestra las rutas de absorción ósea mediadas por las Vitaminas D3 (transportadores calbindina) y K2 (activación de osteocalcina y despeje arterial de calcio). Estilo médico-científico, etiquetas en español.",
      "Diagrama de la absorción de zinc en plantas facilitada por ácidos orgánicos (cítrico, láctico) que forman quelatos solubles de fácil transporte intestinal. Diseño esquemático limpio, etiquetas en español."
    ],
    // Sec 1: Técnicas de Fortificación Natural y Fermentación Láctica
    [
      "Infografía vertical 9:16 sobre el Natto (soja fermentada por Bacillus subtilis) como la mayor fuente natural de Vitamina K2 (MK-7) biodisponible. Muestra la fermentación biológica y la viscosidad característica del plato. Ilustración tradicional japonesa premium, etiquetas en español.",
      "Diagrama de fortificación de leches vegetales con el alga Lithothamnium calcareum, detallando su estructura porosa marina que optimiza la solubilidad y digestión del calcio. Diseño plano científico, etiquetas en español."
    ]
  ],
  'sem5-s4-l1': [
    // Sec 0: Bioquímica de las Fibras Prebióticas y SCFA
    [
      "Infografía vertical 9:16 sobre la fermentación de fibras prebióticas (inulina y FOS) en el colon. Muestra la síntesis de ácidos grasos de cadena corta (butirato, propionato y acetato) que alimentan a los colonocitos y fortalecen la barrera intestinal. Estilo biológico de alta gama, etiquetas en español.",
      "Diagrama químico del proceso de retrogradación del almidón gelatinizado al enfriarse a 4°C, cristalizando en Almidón Resistente Tipo 3 que resiste la digestión en el intestino delgado. Diseño científico, colores fríos y azules, etiquetas en español."
    ],
    // Sec 1: El Menú Simbiótico y Técnicas de Retrogradación
    [
      "Paso a paso infográfico 9:16 sobre el método de retrogradación de papas y arroz (hervir, enfriar 12h a 4°C, recalentar suavemente) para reducir el índice glucémico. Diseño de pizarra de cocina moderna con pasos y mediciones químicas, etiquetas en español.",
      "Ilustración gourmet 9:16 de una ensalada templada simbiótica: arroz retrogradado con chucrut lactofermentado y espárragos trigueros al vapor. Estilo de emplatado minimalista de alta cocina, etiquetas en español."
    ]
  ],
  'sem5-s4-l2': [
    // Sec 0: Fitonutrientes y la Regulación de la Inflamación
    [
      "Infografía vertical 9:16 de la combinación antiinflamatoria maestra: Cúrcuma (curcumina) + Pimienta negra (piperina) + Grasas (aceite de coco/oliva). Muestra cómo la piperina bloquea la glucuronidación hepática multiplicando por 20 la biodisponibilidad. Diseño de póster editorial moderno, etiquetas en español.",
      "Esquema biológico de la formación de sulforafano en crucíferas. Muestra las células de brócoli liberando la enzima mirosinasa para reaccionar con glucorafanina al picarse en crudo, activando la vía antioxidante Nrf2. Diseño biológico, etiquetas en español."
    ],
    // Sec 1: Técnicas de Activación Térmica de Fitonutrientes
    [
      "Infografía 9:16 sobre el protocolo 'Picar y Esperar' de 40 minutos en crucíferas para preservar el sulforafano antes de cocinar. Muestra el temporizador y el cambio enzimático en la tabla de cortar. Diseño limpio y didáctico, etiquetas en español.",
      "Diagrama de emulsificación y preparación de 'Golden Milk' (leche dorada) con cúrcuma, jengibre fresco, pimienta y aceite de coco emulsionado a baja velocidad. Estilo receta alquímica moderna, tonos dorados cálidos, etiquetas en español."
    ]
  ],

  // ─── PROMPTS DEL SEMESTRE VI ────────────────────────────────
  'sem6-s1-l1': [
    // Sec 0: La Estructura y Vida del Sustrato Regenerativo
    [
      "Infografía vertical 9:16 sobre la estructura de un sustrato de cultivo regenerativo en macetas urbanas. Muestra las proporciones ideales: 1/3 fibra de coco, 1/3 humus de lombriz, 1/3 perlita, junto con el intercambio iónico radicular facilitado por hongos de micorrizas en la rizosfera. Estilo botánico y edafológico, etiquetas en español.",
      "Esquema microscópico del microbioma del suelo mostrando hifas fúngicas interactuando con raíces y bacterias liberando fósforo soluble. Diseño científico de alta calidad, tonos tierra, etiquetas en español."
    ],
    // Sec 1: Compostaje de Precision y Enmiendas Orgánicas
    [
      "Diagrama técnico 9:16 de un compostador casero equilibrado con proporción 30:1 de Carbono (secos, hojas, cartón) a Nitrógeno (húmedos, restos de cocina). Muestra zonas de temperatura y flujo de aire. Diseño plano didáctico, etiquetas en español.",
      "Infografía sobre el Té de Compost Aireado (TCA). Detalla la fermentación en agua aireada con melaza durante 24-48 horas para multiplicar microorganismos benéficos y su aplicación en riego foliar. Estilo alquimia de la tierra, etiquetas en español."
    ]
  ],
  'sem6-s1-l2': [
    // Sec 0: Fisiología y Nutrición del Cultivo sin Suelo
    [
      "Infografía vertical 9:16 sobre fisiología y nutrición en hidroponía. Muestra el control de pH óptimo (5.5 - 6.5) y Conductividad Eléctrica (EC) de 1.2 a 1.6 mS/cm para evitar bloqueos minerales en raíces de lechugas suspendidas en agua. Diseño vectorial limpio, tonos cian y verde, etiquetas en español.",
      "Diagrama comparativo de sistemas hidropónicos caseros: NFT (película de nutrientes circulante) vs Kratky (hidroponía pasiva estanca). Diseño minimalista explicativo, etiquetas en español."
    ],
    // Sec 1: Diseño de Torres y Paredes de Cultivo Vertical
    [
      "Infografía 9:16 de una torre de cultivo vertical automatizada en balcón. Muestra el flujo de agua por gravedad y luces LED de espectro completo (rojo 660nm y azul 450nm) para optimizar el crecimiento vegetal en interiores. Estilo futurista limpio, etiquetas en español.",
      "Diagrama de automatización de riego con sensores y temporizadores digitales para mantenimiento de soluciones hidropónicas caseras de forma eficiente. Diseño técnico, etiquetas en español."
    ]
  ],
  'sem6-s2-l1': [
    // Sec 0: Métodos de Propagación y Fisiología de Enraizamiento
    [
      "Infografía vertical 9:16 sobre propagación por esquejes de tallo de aromáticas leñosas (romero, tomillo). Detalla el corte bajo el nodo foliar, remoción de hojas y aplicación de hormonas naturales de lentejas (auxinas). Ilustración botánica estilo cuaderno de notas de campo, etiquetas en español.",
      "Diagrama de división de mata de hierbas rizomatosas como menta y cebollino, mostrando la separación de rizomas sanos y raíces. Diseño didáctico limpio, etiquetas en español."
    ],
    // Sec 1: Poda de Producción y Control de Floración
    [
      "Infografía 9:16 de poda apical paso a paso en albahaca y menta. Muestra el corte de la yema apical para redirigir citoquininas a los brotes axilares, formando una planta arbustiva densa. Diseño gráfico limpio con flechas explicativas, etiquetas en español.",
      "Esquema metabólico que explica por qué se debe podar la floración para evitar hojas amargas y desvío de aceites esenciales. Ilustración de hojas y botones florales con leyendas químicas en español."
    ]
  ],
  'sem6-s2-l2': [
    // Sec 0: La Química de los Terpenos Culinarios
    [
      "Infografía vertical 9:16 sobre los terpenos aromáticos de la alta cocina: Linalool (albahaca), Cineol (romero) y Timol (tomillo) sintetizados en tricomas glandulares. Detalla su punto de evaporación a >45°C y la importancia de usarlas en frío. Estilo póster editorial de aromas, etiquetas en español.",
      "Diagrama molecular de la degradación y oxidación de terpenos por calor y exposición a la luz solar en la cocina. Diseño elegante de laboratorio, etiquetas en español."
    ],
    // Sec 1: Técnicas de Extracción y Conservación de Aromas
    [
      "Infografía técnica 9:16 de preparación de aceite verde esmeralda clorofilado por shock térmico (escaldado, hielo, licuado al vacío). Muestra la fijación del color y la solubilidad de terpenos en grasas neutras. Estilo fotografía de alta cocina diagramada, etiquetas en español.",
      "Diagrama de maceración en frío de hierbas duras en medio ácido (vinagre de manzana), detallando la extracción de polifenoles y aromas. Estilo bodegón de frascos de botica modernos, etiquetas en español."
    ]
  ],
  'sem6-s3-l1': [
    // Sec 0: Vinagres de Fruta y Fermentación Acética de Descartes
    [
      "Infografía vertical 9:16 de fermentación circular de vinagre en 2 fases: Fase 1 (alcohólica por levaduras de cáscaras en anaerobiosis) y Fase 2 (acética por Acetobacter en aerobiosis). Muestra frascos y lecturas de alcohol. Diseño de ilustración rústica moderna, etiquetas en español.",
      "Diagrama de una fermentación viva con 'madre de vinagre' mostrando bacterias flotando y consumiendo alcohol para generar ácido acético. Estilo gráfico didáctico, etiquetas en español."
    ],
    // Sec 1: Garums Vegetales y Autólisis Enzimática
    [
      "Infografía vertical 9:16 de preparación de Garum vegetal circular utilizando Koji de cebada y descartes de legumbres con un 12% de sal marina a 55°C. Muestra la autólisis enzimática liberando glutamato umami. Diseño conceptual premium de laboratorio de fermentos, etiquetas en español.",
      "Diagrama de prensado, filtración en lienzo de quesería y pasteurización térmica de garum vegetal, detallando el embotellado de oro umami líquido. Diseño limpio, etiquetas en español."
    ]
  ],
  'sem6-s3-l2': [
    // Sec 0: Deshidratación Técnica y Harinas de Descartes
    [
      "Infografía vertical 9:16 sobre deshidratación técnica de okara o mermas húmedas a 55°C para lograr una actividad de agua <0.3. Muestra la estabilidad microbiológica y la molienda final en harinas súper finas sin gluten. Diseño minimalista de proceso industrial casero, etiquetas en español.",
      "Diagrama de polvos saborizados coloreados obtenidos de pieles de hortalizas deshidratadas molidas a alta velocidad (polvo de tomate rojo, polvo de champiñón gris). Ilustración elegante de platos sazonados, etiquetas en español."
    ],
    // Sec 1: Aceites Infusionados por Ultrasonido y Carbones Culinarios
    [
      "Infografía técnica 9:16 sobre extracción de aromas en aceites por ultrasonido, detallando la micro-cavitación celular que rompe tricomas sin calor. Diseño futurista de equipamiento de cocina molecular, etiquetas en español.",
      "Esquema de elaboración de carbón vegetal activo culinario a partir de la carbonización de hojas verdes de puerro a 200°C. Muestra la textura porosa pura y su uso estético en rebozados negros premium, etiquetas en español."
    ]
  ],
  'sem6-s4-l1': [
    // Sec 0: Optimización del Costo de Materia Prima
    [
      "Infografía 9:16 sobre costos circulares en el restaurante vegetal (Yield Test). Muestra la reducción del costo real del ingrediente al transformar mermas (vainas, tallos) en aceites, vinagres y polvos saborizados. Diseño corporativo de contabilidad culinaria moderna, etiquetas en español.",
      "Matriz de Ingeniería de Menú (Estrella, Caballo, Enigma, Perro) aplicada a platos plant-based de alto margen (ej: coliflor asada con garum). Diseño de gráfico de burbujas limpio, etiquetas en español."
    ],
    // Sec 1: Compras Estacionales y Relación Directa con Productores
    [
      "Infografía vertical 9:16 sobre compras estacionales y relación directa con agricultores locales. Muestra el flujo de abastecimiento directo, reducción de huella de carbono y frescura óptima de la cosecha. Estilo ilustración editorial verde, etiquetas en español.",
      "Diagrama de técnicas de conservación estacional (fermentados, encurtidos y deshidratados) para mantener existencias del restaurante en invierno sin depender de importaciones. Diseño de despensa gourmet, etiquetas en español."
    ]
  ],
  'sem6-s4-l2': [
    // Sec 0: Storytelling Culinario y el Valor Intangible del Plato
    [
      "Infografía vertical 9:16 sobre Storytelling culinario y transparencia en la carta. Muestra cómo detallar la procedencia ecológica y las horas de fermentación de los garums aumenta el valor percibido del menú por el comensal. Diseño elegante estilo menú de restaurante de lujo, etiquetas en español.",
      "Diagrama de comunicación de marca sostenible libre de greenwashing y mensajes moralistas, priorizando la experiencia sensorial del sabor umami. Ilustración minimalista, etiquetas en español."
    ],
    // Sec 1: Diseño de Experiencias y Presentación Zero-Waste
    [
      "Infografía vertical 9:16 sobre el diseño de mesa zero-waste y emplatado consciente. Muestra el uso de espacio negativo, vajillas artesanales de cerámica rugosa, toques estéticos con cenizas y aceites clorofilados. Estilo de diseño zen minimalista, alta definición, etiquetas en español.",
      "Diagrama de cierre de ciclo de experiencia de sala: menús en papel semilla plantable y detalles biodegradables que completan la propuesta ética del local. Ilustración limpia con tonos verdes y beige, etiquetas en español."
    ]
  ]
};

function SectionSupportImage({ lessonId, sectionIdx, subsectionIdx = 0, semester }) {
  const prompts = SUPPORT_AI_PROMPTS[lessonId];
  if (!prompts) return null;

  const sectionPrompts = prompts[sectionIdx];
  if (!sectionPrompts) return null;

  const promptText = sectionPrompts[subsectionIdx] || "";
  if (!promptText) return null;

  const [imageUrl, setImageUrl] = useState(() => {
    return localStorage.getItem(`vegi-support-img-${lessonId}-${sectionIdx}-${subsectionIdx}`) || null;
  });
  const [uploading, setUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function fetchSupabaseImage() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('lesson_support_images')
          .select('image_url')
          .eq('lesson_id', lessonId)
          .eq('section_index', sectionIdx)
          .eq('subsection_index', subsectionIdx)
          .maybeSingle();
        if (data && data.image_url) {
          setImageUrl(data.image_url);
          localStorage.setItem(`vegi-support-img-${lessonId}-${sectionIdx}-${subsectionIdx}`, data.image_url);
        }
      } catch (e) {
        // Ignorar si no existe tabla/registro
      }
    }
    fetchSupabaseImage();
  }, [lessonId, sectionIdx, subsectionIdx]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target.result;
      
      localStorage.setItem(`vegi-support-img-${lessonId}-${sectionIdx}-${subsectionIdx}`, base64Url);
      setImageUrl(base64Url);

      if (supabase) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${lessonId}-${sectionIdx}-${subsectionIdx}-${Date.now()}.${fileExt}`;
          const filePath = `support-images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('academy-support-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('academy-support-images')
            .getPublicUrl(filePath);

          const { error: dbError } = await supabase
            .from('lesson_support_images')
            .upsert({
              lesson_id: lessonId,
              section_index: sectionIdx,
              subsection_index: subsectionIdx,
              image_url: publicUrl,
              updated_at: new Date().toISOString()
            }, { onConflict: 'lesson_id,section_index,subsection_index' });

          if (dbError) throw dbError;

          setImageUrl(publicUrl);
          localStorage.setItem(`vegi-support-img-${lessonId}-${sectionIdx}-${subsectionIdx}`, publicUrl);
          alert("¡Imagen subida a Supabase con éxito!");
        } catch (err) {
          console.error("Error al subir a Supabase:", err);
          alert("Guardado localmente. Falló la subida a Supabase (Verifica el bucket 'academy-support-images' y la tabla 'lesson_support_images')");
        }
      } else {
        alert("Guardado localmente en el navegador (Supabase desconectado).");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = async () => {
    if (confirm("¿Seguro que deseas eliminar esta imagen de apoyo?")) {
      localStorage.removeItem(`vegi-support-img-${lessonId}-${sectionIdx}-${subsectionIdx}`);
      setImageUrl(null);
      if (supabase) {
        try {
          await supabase
            .from('lesson_support_images')
            .delete()
            .eq('lesson_id', lessonId)
            .eq('section_index', sectionIdx)
            .eq('subsection_index', subsectionIdx);
        } catch (e) {
          console.warn("No se pudo eliminar de Supabase", e);
        }
      }
    }
  };

  return (
    <div className="my-6 p-4 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-card)]/30 shadow-sm flex flex-col gap-3 animate-float-in">
      <div className="flex items-center justify-between border-b border-[var(--border-moss)]/40 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🖼️</span>
          <span className="text-[11px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Imagen de Apoyo #{subsectionIdx + 1}</span>
        </div>
        <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full">9:16 Infografía</span>
      </div>

      {imageUrl ? (
        <div className="flex items-center gap-3 bg-[var(--bg-elevated)]/40 p-2.5 rounded-xl border border-[var(--border-moss)]">
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="w-12 h-20 rounded-lg overflow-hidden border border-[var(--border-moss)] bg-black shrink-0 cursor-pointer hover:opacity-80 transition-all relative group"
          >
            <img 
              src={imageUrl} 
              alt="Miniatura" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px]">
              🔍
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-[var(--accent-mint)] font-bold block">
              {imageUrl.startsWith('data:') ? '💾 Guardado local' : '☁️ Sincronizado en Supabase'}
            </span>
            <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">Infografía cargada con éxito</p>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setIsLightboxOpen(true)}
                className="text-[9px] font-black text-[var(--accent-mint)] hover:underline cursor-pointer"
              >
                🔍 Ampliar (9:16)
              </button>
              <button 
                onClick={handleRemove} 
                className="text-[9px] font-bold text-red-400 hover:text-red-500 cursor-pointer"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full rounded-xl overflow-hidden border border-[var(--border-moss)] bg-[var(--bg-elevated)]/40 flex flex-col items-center justify-center min-h-[100px] p-4 text-center">
          <div className="text-sm text-[var(--text-secondary)] font-bold mb-2">No hay ilustración cargada</div>
          <label className="px-4 py-1.5 bg-[var(--bg-card)] border border-[var(--border-moss)] hover:border-[var(--accent-mint)] text-[var(--text-primary)] rounded-full text-[9px] font-bold transition-all shadow-sm cursor-pointer tap-active">
            {uploading ? "Subiendo..." : "Cargar Infografía 9:16"}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={uploading} 
              className="hidden" 
            />
          </label>
        </div>
      )}

      {/* Caja de prompt */}
      <div className="p-3 rounded-xl border border-[var(--border-moss)]/50 bg-[var(--bg-elevated)]/20 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">🤖 Prompt de Generación de IA</span>
          <button 
            onClick={handleCopyPrompt}
            className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-moss)] text-[var(--text-primary)] hover:bg-[var(--accent-mint)]/10 transition-all cursor-pointer"
          >
            {copySuccess ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed italic">
          "{promptText}"
        </p>
      </div>

      {/* Lightbox Modal para visualización en pantalla completa 9:16 */}
      {isLightboxOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-float-in">
          {/* Botón de cerrar X */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 bg-black/55 border border-white/20 hover:bg-black/80 text-white rounded-full p-2.5 z-55 cursor-pointer tap-active flex items-center justify-center shadow-lg"
          >
            <X size={20} />
          </button>

          {/* Contenedor del poster 9:16 */}
          <div className="relative w-full max-w-sm h-full max-h-[85vh] flex flex-col items-center justify-center">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center shadow-2xl relative">
              <img 
                src={imageUrl} 
                alt="Infografía en Pantalla Completa" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {/* Descripción / Título flotante al fondo */}
            <div className="mt-4 text-center px-4 w-full">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ilustración de Apoyo #{subsectionIdx + 1}</h4>
              <p className="text-[9px] text-gray-400 mt-1 leading-relaxed line-clamp-2 italic">"{promptText}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: AcademyScreen
// ============================================================
// Auxiliar para parsear hash del currículo de la academia
const getAcademyStateFromHash = (hash, semesters = ACADEMY_SEMESTERS) => {
  const parts = hash.substring(1).split('/');
  let view = 'map';
  let selectedSemester = null;
  let selectedSubject = null;
  let selectedLesson = null;

  if (parts[0] !== 'academy') return { view, selectedSemester, selectedSubject, selectedLesson };

  const sub = parts[1];
  const id = parts[2];

  if (sub === 'admin') {
    view = 'admin';
  } else if (sub === 'library') {
    view = 'library';
  } else if (sub === 'semester' && id) {
    selectedSemester = semesters.find(s => s.id === id) || null;
    if (selectedSemester) view = 'subjects';
  } else if (sub === 'subject' && id) {
    for (const sem of semesters) {
      const subj = sem.subjects.find(s => s.id === id);
      if (subj) {
        selectedSemester = sem;
        selectedSubject = subj;
        view = 'lessons';
        break;
      }
    }
  } else if (sub === 'lesson' && id) {
    for (const sem of semesters) {
      for (const subj of sem.subjects) {
        const les = subj.lessons.find(l => l.id === id);
        if (les) {
          selectedSemester = sem;
          selectedSubject = subj;
          selectedLesson = les;
          view = 'lesson';
          break;
        }
      }
    }
  }

  return { view, selectedSemester, selectedSubject, selectedLesson };
};

function DopamineCheckpoint({ lessonId, sectionIdx, sectionTitle, onClaim, claimed }) {
  const curiosities = [
    "La salmuera al 2% crea un ambiente selectivo de exclusión osmótica: deshidrata y destruye microbios patógenos y hace prosperar a las bacterias benéficas.",
    "El dióxido de carbono producido por Leuconostoc mesenteroides en los primeros días crea una atmósfera anaerobia protectora natural.",
    "Las bacterias ácido lácticas (BAL) carecen de cadena respiratoria; obtienen toda su energía pránica por fermentación directa.",
    "El chucrut fermentado tradicionalmente contiene niveles de vitamina C bioactiva superiores a la col fresca por síntesis microbiana.",
    "Las enzimas vegetales actúan de forma coordinada con la acidez para ablandar o mantener firmes las fibras del vegetal.",
    "El ácido láctico acumulado baja el pH por debajo de 4.6, deteniendo en seco el crecimiento de patógenos letales como el botulismo."
  ];
  
  const curiosity = curiosities[sectionIdx % curiosities.length];

  return (
    <div className={`my-6 p-5 rounded-2xl border transition-all duration-500 ${
      claimed 
        ? 'border-emerald-500/20 bg-gradient-to-br from-[#0c1812] to-[#060f0b] shadow-emerald-950/20' 
        : 'border-amber-500/20 bg-gradient-to-br from-[#1b160f] to-[#110e0a] shadow-amber-950/20'
    } shadow-lg relative overflow-hidden`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
        claimed ? 'bg-emerald-500/10' : 'bg-amber-500/10'
      }`} />
      
      <div className="flex items-start gap-3.5 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
          claimed 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
        }`}>
          {claimed ? '✨' : '⚡'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${
              claimed ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {claimed ? 'Checkpoint Completado +5 XP' : 'Descubrimiento Bioquímico Oculto'}
            </span>
          </div>
          <h5 className="text-xs font-bold text-white mb-2 leading-tight">
            {claimed ? '¡Sabiduría Desbloqueada!' : '¿Listo para desvelar el secreto de esta sección?'}
          </h5>
          
          {claimed ? (
            <div className="text-[11px] text-neutral-300 leading-relaxed bg-black/30 border border-emerald-500/10 rounded-xl p-3 animate-float-in">
              <strong className="text-emerald-400 font-extrabold uppercase tracking-wide block mb-1 text-[8px]">
                Curiosidad Científica:
              </strong>
              {curiosity}
            </div>
          ) : (
            <button
              onClick={onClaim}
              className="mt-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-amber-950/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Revelar Secreto & Reclamar XP</span>
              <span>⚡</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoSearchItem({ vid, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(vid.searchQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full p-5 rounded-2xl border border-[var(--border-moss)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)]/40 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.04)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:border-[var(--accent-mint)]/40 transition-all duration-300 flex flex-col gap-4 group relative overflow-hidden">
      {/* Decorative background leaf glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[var(--accent-mint)]/5 blur-2xl group-hover:bg-[var(--accent-mint)]/10 transition-all duration-500 pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-moss)] text-xs font-black text-[var(--accent-mint)] flex items-center justify-center shrink-0 transition-all shadow-sm">
          0{index + 1}
        </div>
        <h5 className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
          {vid.title}
        </h5>
      </div>

      {/* Description Block */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/30 border border-[var(--border-moss)]/60 text-[11px] text-[var(--text-secondary)] leading-relaxed relative">
        <span className="text-[var(--accent-mint)] font-extrabold uppercase tracking-wider text-[8px] block mb-1.5 font-mono">
          Eje de Investigación
        </span>
        {vid.description}
      </div>

      {/* Action Block */}
      <div className="flex flex-col gap-2.5 mt-1">
        {/* Search Query Pill */}
        <div className="w-full flex items-center justify-between gap-3 bg-[var(--bg-elevated)]/60 border border-[var(--border-moss)]/40 rounded-xl px-3.5 py-2.5 transition-all">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] font-black mb-1">Criterio de Búsqueda</span>
            <code className="text-[11px] text-[var(--text-primary)] font-semibold font-mono select-all truncate">{vid.searchQuery}</code>
          </div>
          <button
            onClick={handleCopy}
            title="Copiar texto de búsqueda"
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-mint)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all shrink-0 cursor-pointer tap-active"
          >
            {copied ? (
              <span className="text-[9px] font-black text-[var(--accent-mint)] animate-pulse">Copiado</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

        {/* YouTube Search Trigger Button */}
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-mint)] to-[var(--accent-mint)]/90 hover:from-[var(--accent-mint)]/95 hover:to-[var(--accent-mint)] hover:scale-[1.01] active:scale-[0.98] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer tap-active"
        >
          <svg className="w-4.5 h-4.5 fill-current text-white animate-pulse" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.519 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.482 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>Explorar Video de Apoyo</span>
        </a>
      </div>
    </div>
  );
}

export default function AcademyScreen({ dispatch }) {
  const [view, setView] = useState('map') // map | subjects | lessons | lesson | library
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [progressMap, setProgressMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vegi-academy-progress') || '{}')
    } catch { return {} }
  })
  const [semestersData, setSemestersData] = useState(ACADEMY_SEMESTERS)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeCareer, setActiveCareer] = useState(() => {
    const hash = window.location.hash || ''
    if (hash.includes('pizza1')) {
      return 'pizza'
    }
    return localStorage.getItem('vegi-active-career') || 'alquimia'
  })

  const handleCareerChange = (career) => {
    setActiveCareer(career)
    localStorage.setItem('vegi-active-career', career)
  }

  // Cargar currículo desde Supabase — reutilizable para recarga manual
  const loadAcademyData = async () => {
    if (!supabase) return
    setLoading(true)
    try {
        const { data: sems, error: semsErr } = await supabase
          .from('semesters')
          .select('*')
          .order('number', { ascending: true })
        if (semsErr) throw semsErr

        const { data: subjs, error: subjsErr } = await supabase
          .from('subjects')
          .select('*')
          .order('id', { ascending: true })
        if (subjsErr) throw subjsErr

        const { data: lessons, error: lessonsErr } = await supabase
          .from('lessons')
          .select('*')
          .order('id', { ascending: true })
        if (lessonsErr) throw lessonsErr

        const formattedSemesters = sems.map(sem => {
          const semSubjects = subjs
            .filter(sub => sub.semester_id === sem.id)
            .map(sub => {
              const subLessons = lessons
                .filter(les => les.subject_id === sub.id)
                .map(les => ({
                  id: les.id,
                  title: les.title,
                  type: les.type,
                  duration: les.duration,
                  completed: les.completed,
                  content: les.content,
                  keyFacts: les.key_facts,
                  quiz: les.quiz
                }))
                .sort((a, b) => {
                  const getWeek = (t) => {
                    const match = t.match(/Semana\s+(\d+)/i);
                    return match ? parseInt(match[1], 10) : 999;
                  };
                  return getWeek(a.title) - getWeek(b.title);
                });

              return {
                id: sub.id,
                title: sub.title,
                emoji: sub.emoji,
                description: sub.description,
                locked: sub.locked,
                completed: sub.completed,
                xp: sub.xp,
                lessons: subLessons
              }
            })

          return {
            id: sem.id,
            number: sem.number,
            title: sem.title,
            subtitle: sem.subtitle,
            emoji: sem.emoji,
            color: sem.color,
            colorSecondary: sem.color_secondary,
            gradient: sem.gradient,
            border: sem.border,
            locked: sem.locked,
            totalLessons: sem.total_lessons,
            completedLessons: sem.completed_lessons,
            xpReward: sem.xp_reward,
            badge: sem.badge,
            career_id: sem.career_id || 'alquimia',
            subjects: semSubjects
          }
        })

        if (formattedSemesters.length > 0) {
          setSemestersData(formattedSemesters)
        }
      } catch (err) {
        console.warn("VEGI: Error cargando currículo desde Supabase. Usando fallback estático local.", err)
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    loadAcademyData()
  }, [refreshKey])

  // Sincronizar hash con los estados de navegación
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#dashboard'
      if (!hash.startsWith('#academy')) return

      const parsed = getAcademyStateFromHash(hash, semestersData)
      setView(parsed.view)
      setSelectedSemester(parsed.selectedSemester)
      setSelectedSubject(parsed.selectedSubject)
      setSelectedLesson(parsed.selectedLesson)

      if (parsed.selectedSemester) {
        const semCareer = parsed.selectedSemester.career_id || 'alquimia'
        setActiveCareer(semCareer)
        localStorage.setItem('vegi-active-career', semCareer)
      } else if (hash.includes('pizza1')) {
        setActiveCareer('pizza')
        localStorage.setItem('vegi-active-career', 'pizza')
      }
    }

    window.addEventListener('hashchange', handleHash)
    handleHash()

    return () => window.removeEventListener('hashchange', handleHash)
  }, [semestersData])

  const saveProgress = async (lessonId) => {
    const updated = { ...progressMap, [lessonId]: true }
    setProgressMap(updated)
    localStorage.setItem('vegi-academy-progress', JSON.stringify(updated))
    // Dar XP en el estado global
    dispatch({ type: 'BOOST_STREAK' })

    if (supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', 'd3b07384-d113-4956-a5db-85d6b8a7c2be')
          .single()
        const currentXp = data?.xp || 0
        const { error } = await supabase
          .from('profiles')
          .update({ xp: currentXp + 25 })
          .eq('id', 'd3b07384-d113-4956-a5db-85d6b8a7c2be')
        if (error) throw error
      } catch (e) {
        console.warn("No se pudo actualizar XP en Supabase profiles:", e)
      }
    }
  }

  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [view])

  const renderView = () => {
    if (view === 'admin') {
      return <AcademyAdmin onBack={() => window.location.hash = 'academy'} />
    }
    if (view === 'library') {
      return <LibraryView onBack={() => window.location.hash = 'academy'} accentColor={activeCareer === 'pizza' ? '#F59E0B' : '#2EE59D'} />
    }
    if (view === 'map') {
      const filteredSemesters = semestersData.filter(sem => (sem.career_id || 'alquimia') === activeCareer)
      return (
        <SemesterMap
          semesters={filteredSemesters}
          onSelectSemester={(sem) => window.location.hash = 'academy/semester/' + sem.id}
          progressMap={progressMap}
          dispatch={dispatch}
          activeCareer={activeCareer}
          onCareerChange={handleCareerChange}
        />
      )
    }
    if (view === 'subjects' && selectedSemester) {
      return (
        <SubjectList
          semester={selectedSemester}
          onSelectSubject={(subj) => window.location.hash = 'academy/subject/' + subj.id}
          onBack={() => window.location.hash = 'academy'}
          progressMap={progressMap}
        />
      )
    }
    if (view === 'lessons' && selectedSubject) {
      return (
        <LessonList
          subject={selectedSubject}
          semester={selectedSemester}
          onSelectLesson={(lesson) => window.location.hash = 'academy/lesson/' + lesson.id}
          onBack={() => window.location.hash = 'academy/semester/' + selectedSemester.id}
          progressMap={progressMap}
        />
      )
    }
    if (view === 'lesson' && selectedLesson) {
      return (
        <LessonView
          lesson={selectedLesson}
          semester={selectedSemester}
          subject={selectedSubject}
          onBack={() => window.location.hash = 'academy/subject/' + selectedSubject.id}
          onComplete={saveProgress}
          progressMap={progressMap}
          dispatch={dispatch}
        />
      )
    }
    return null
  }

  const isPizza = activeCareer === 'pizza'
  const accentMint = isPizza ? '#F59E0B' : 'var(--accent-mint)'
  const libraryBg = isPizza ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'linear-gradient(135deg, #2EE59D, #0EA5E9)'

  return (
    <div className="flex flex-col h-full" ref={scrollRef}>
      {/* Botón flotante de biblioteca y admin */}
      {view === 'map' && (
        <>
          <button
            id="admin-fab"
            onClick={() => window.location.hash = 'academy/admin'}
            className="fixed bottom-38 right-4 z-20 w-12 h-12 rounded-full shadow-xl flex items-center justify-center tap-active"
            style={{ background: 'linear-gradient(135deg, #15221B, #0E1612)', border: `1px solid ${accentMint}` }}
            title="Consola de Administración"
          >
            <Layers size={18} style={{ color: accentMint }} />
          </button>
          <button
            id="refresh-fab"
            onClick={() => setRefreshKey(k => k + 1)}
            className="fixed bottom-52 right-4 z-20 w-12 h-12 rounded-full shadow-xl flex items-center justify-center tap-active transition-all"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: `1px solid ${accentMint}40` }}
            title="Sincronizar contenido actualizado"
          >
            {loading
              ? <span className="text-base animate-spin inline-block">⟳</span>
              : <span className="text-base" style={{ color: accentMint }}>⟳</span>
            }
          </button>
          <button
            id="library-fab"
            onClick={() => window.location.hash = 'academy/library'}
            className="fixed bottom-24 right-4 z-20 w-12 h-12 rounded-full shadow-xl flex items-center justify-center tap-active"
            style={{ background: libraryBg }}
            title="Biblioteca de consultas"
          >
            <BookOpen size={20} className="text-white" />
          </button>
        </>
      )}

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {renderView()}
      </div>
    </div>
  )
}
