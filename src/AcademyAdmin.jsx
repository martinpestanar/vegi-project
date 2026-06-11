import React, { useState, useEffect } from 'react'
import { 
  BookOpen, Save, CheckCircle, AlertCircle, Eye, Edit3, 
  Award, Layers, FlaskConical, Sparkles, Rocket, ArrowLeft, Loader2, Image,
  Plus, Trash2
} from 'lucide-react'
import { supabase } from './supabaseClient'

const SEM_ICONS = { sem1: Layers, sem2: FlaskConical, sem3: Sparkles, sem4: Rocket, sem5: Award, sem6: BookOpen }

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
        <span className="text-[var(--accent-mint)] opacity-60">Visualizer v1.0 (Admin Preview)</span>
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

export default function AcademyAdmin({ onBack }) {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSem, setSelectedSem] = useState(null)
  const [selectedSubj, setSelectedSubj] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedSecIdx, setSelectedSecIdx] = useState(null)
  const [activeCareer, setActiveCareer] = useState(() => {
    return localStorage.getItem('vegi-active-career') || 'alquimia'
  })
  
  // Navigation Flow: 'subjects' | 'weeks' | 'editor'
  const [viewStep, setViewStep] = useState('subjects')

  // Editor States
  const [editorTitle, setEditorTitle] = useState('')
  const [editorText, setEditorText] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [editorSubTab, setEditorSubTab] = useState('markdown') // 'markdown' | 'animation'
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // edit | preview
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const handleCareerChange = (career) => {
    setActiveCareer(career)
    localStorage.setItem('vegi-active-career', career)
    
    // Auto-select first semester of this career
    const matchingSems = semesters.filter(s => (s.career_id || 'alquimia') === career)
    if (matchingSems.length > 0) {
      setSelectedSem(matchingSems[0])
      if (matchingSems[0].subjects.length > 0) {
        setSelectedSubj(matchingSems[0].subjects[0])
      } else {
        setSelectedSubj(null)
      }
    } else {
      setSelectedSem(null)
      setSelectedSubj(null)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      if (!supabase) return
      
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

      const formatted = sems.map(sem => {
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
                content: les.content || { sections: [] },
                keyFacts: les.key_facts,
                quiz: les.quiz
              }))
              .sort((a, b) => {
                const getWeek = (t) => {
                  const match = t.match(/Semana\s+(\d+)/i)
                  return match ? parseInt(match[1], 10) : 999
                }
                return getWeek(a.title) - getWeek(b.title)
              })

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

      setSemesters(formatted)
      const currentCareer = localStorage.getItem('vegi-active-career') || 'alquimia'
      setActiveCareer(currentCareer)
      const matchingSems = formatted.filter(s => (s.career_id || 'alquimia') === currentCareer)
      if (matchingSems.length > 0) {
        setSelectedSem(matchingSems[0])
        if (matchingSems[0].subjects.length > 0) {
          setSelectedSubj(matchingSems[0].subjects[0])
        }
      } else if (formatted.length > 0) {
        setSelectedSem(formatted[0])
        if (formatted[0].subjects.length > 0) {
          setSelectedSubj(formatted[0].subjects[0])
        }
      }
    } catch (err) {
      console.error("Error cargando currículo en Admin:", err)
    } finally {
      setLoading(false)
    }
  }

  // Check if a section is a placeholder or has been populated
  const isSectionPending = (text = '') => {
    if (!text) return true
    // Old format
    if (text.includes('[Pegar aquí') || text.includes('**[Pegar')) return true
    // New modern template format
    if (text.includes('[Define aquí') || text.includes('[Explica de forma')) return true
    if (text.includes('[Inserta un consejo') || text.includes('[Paso 1:')) return true
    if (text.includes('[Aspecto clave') || text.includes('[¿Se estiró')) return true
    return false
  }

  // Compute stats for a subject
  const getSubjectStats = (subj) => {
    let totalTheory = 0
    let filledTheory = 0
    
    if (subj && subj.lessons) {
      subj.lessons.forEach(les => {
        if (les.type === 'theory' && les.content?.sections) {
          les.content.sections.forEach(sec => {
            // Count all editable sections (old 📖 format OR new modern format icons)
            const isEditable = sec.title.includes('📖') || 
              sec.title.includes('🎯') || sec.title.includes('🔍') ||
              sec.title.includes('💡') || sec.title.includes('🥣')
            if (isEditable) {
              totalTheory++
              if (!isSectionPending(sec.text)) {
                filledTheory++
              }
            }
          })
        }
      })
    }

    const percent = totalTheory === 0 ? 0 : Math.round((filledTheory / totalTheory) * 100)
    return { totalTheory, filledTheory, percent }
  }

  const handleSelectSection = (lesson, idx) => {
    setSelectedLesson(lesson)
    setSelectedSecIdx(idx)
    setEditorTitle(lesson.content.sections[idx]?.title || '')
    setEditorText(lesson.content.sections[idx]?.text || '')
    setEditorHtml(lesson.content.sections[idx]?.custom_html || '')
    setEditorSubTab('markdown')
    setActiveTab('edit')
    setSaveSuccess(false)
    setViewStep('editor')
  }

  // Create a new week in Supabase
  const handleAddWeek = async () => {
    const title = prompt("Introduce el nombre de la nueva semana (ej: Semana 3: Conceptos de Termodinámica):")
    if (!title) return

    try {
      setSaving(true)
      const tempId = `${selectedSubj.id}-l${Date.now()}`
      
      const newLesson = {
        id: tempId,
        subject_id: selectedSubj.id,
        title: title,
        type: 'theory',
        duration: '4 horas',
        completed: false,
        content: {
          sections: [
            { icon: '🎯', title: '🎯 Objetivos de Aprendizaje', text: 'Al finalizar esta semana, el alumno será capaz de...' }
          ]
        },
        key_facts: [
          { icon: '⏱️', label: 'Tiempo sugerido', value: '4 horas' }
        ],
        quiz: []
      }

      const { error } = await supabase
        .from('lessons')
        .insert(newLesson)

      if (error) throw error

      // Update state locally
      const updatedSems = semesters.map(sem => {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            if (sub.id === selectedSubj.id) {
              return {
                ...sub,
                lessons: [...sub.lessons, newLesson].sort((a, b) => {
                  const getWeek = (t) => {
                    const match = t.match(/Semana\s+(\d+)/i)
                    return match ? parseInt(match[1], 10) : 999
                  }
                  return getWeek(a.title) - getWeek(b.title)
                })
              }
            }
            return sub
          })
        }
      })
      
      setSemesters(updatedSems)
      const currentSem = updatedSems.find(s => s.id === selectedSem.id)
      setSelectedSem(currentSem)
      const currentSubj = currentSem.subjects.find(s => s.id === selectedSubj.id)
      setSelectedSubj(currentSubj)
      
      alert("¡Nueva semana agregada con éxito!")
    } catch (err) {
      console.error("Error agregando semana:", err)
      alert("No se pudo agregar la semana: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete a week from Supabase
  const handleDeleteWeek = async (lessonId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta semana por completo? Esta acción no se puede deshacer y borrará toda su teoría.")) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      // Update state
      const updatedSems = semesters.map(sem => {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            if (sub.id === selectedSubj.id) {
              return {
                ...sub,
                lessons: sub.lessons.filter(l => l.id !== lessonId)
              }
            }
            return sub
          })
        }
      })
      
      setSemesters(updatedSems)
      const currentSem = updatedSems.find(s => s.id === selectedSem.id)
      setSelectedSem(currentSem)
      const currentSubj = currentSem.subjects.find(s => s.id === selectedSubj.id)
      setSelectedSubj(currentSubj)
      setSelectedLesson(null)
      setSelectedSecIdx(null)
    } catch (err) {
      console.error("Error eliminando semana:", err)
      alert("No se pudo eliminar la semana: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Add a new section inside the active week
  const handleAddSubsection = async (lesson) => {
    const title = prompt("Introduce el nombre de la subsección (ej: 📖 3. Radiación de Calor):", "📖 ")
    if (!title) return

    try {
      setSaving(true)
      const newSec = {
        icon: title.match(/[\u0080-\uFFFF\w]/)?.[0] || '📖',
        title: title,
        text: '[Pegar aquí el texto de la subsección]'
      }

      const updatedSections = [...(lesson.content?.sections || []), newSec]
      const updatedContent = {
        ...(lesson.content || {}),
        sections: updatedSections
      }

      const { error } = await supabase
        .from('lessons')
        .update({ content: updatedContent })
        .eq('id', lesson.id)

      if (error) throw error

      // Update state locally
      const updatedSems = semesters.map(sem => {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            return {
              ...sub,
              lessons: sub.lessons.map(les => {
                if (les.id === lesson.id) {
                  return { ...les, content: updatedContent }
                }
                return les
              })
            }
          })
        }
      })

      setSemesters(updatedSems)
      const currentSem = updatedSems.find(s => s.id === selectedSem.id)
      setSelectedSem(currentSem)
      const currentSubj = currentSem.subjects.find(s => s.id === selectedSubj.id)
      setSelectedSubj(currentSubj)
      
      alert("¡Subsección agregada con éxito!")
    } catch (err) {
      console.error("Error agregando subsección:", err)
      alert("No se pudo agregar la subsección: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete section in editor view
  const handleDeleteSubsection = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta subsección?")) return

    try {
      setSaving(true)
      const updatedSections = selectedLesson.content.sections.filter((_, idx) => idx !== selectedSecIdx)
      const updatedContent = {
        ...selectedLesson.content,
        sections: updatedSections
      }

      const { error } = await supabase
        .from('lessons')
        .update({ content: updatedContent })
        .eq('id', selectedLesson.id)

      if (error) throw error

      const updatedSems = semesters.map(sem => {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            return {
              ...sub,
              lessons: sub.lessons.map(les => {
                if (les.id === selectedLesson.id) {
                  return { ...les, content: updatedContent }
                }
                return les
              })
            }
          })
        }
      })

      setSemesters(updatedSems)
      const currentSem = updatedSems.find(s => s.id === selectedSem.id)
      setSelectedSem(currentSem)
      const currentSubj = currentSem.subjects.find(s => s.id === selectedSubj.id)
      setSelectedSubj(currentSubj)
      
      setSelectedLesson(null)
      setSelectedSecIdx(null)
      setViewStep('weeks')
      alert("¡Subsección eliminada con éxito!")
    } catch (err) {
      console.error("Error eliminando subsección:", err)
      alert("No se pudo eliminar la subsección: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!selectedLesson || selectedSecIdx === null) return
    try {
      setSaving(true)
      setSaveSuccess(false)

      // Update local object
      const updatedSections = [...selectedLesson.content.sections]
      updatedSections[selectedSecIdx].title = editorTitle
      updatedSections[selectedSecIdx].text = editorText
      updatedSections[selectedSecIdx].custom_html = editorHtml

      const updatedContent = {
        ...selectedLesson.content,
        sections: updatedSections
      }

      console.log('[Admin Save] Saving lesson ID:', selectedLesson.id)
      console.log('[Admin Save] Payload sections structure:', updatedSections)

      // Sync to Supabase
      const { data, error, status } = await supabase
        .from('lessons')
        .update({ content: updatedContent })
        .eq('id', selectedLesson.id)
        .select()

      console.log('[Admin Save] Supabase response status:', status, '| error:', error, '| returned data:', data)

      if (error) {
        alert("Error de Supabase: " + error.message + " (Código: " + error.code + ")")
        throw error
      }

      if (!data || data.length === 0) {
        console.warn("[Admin Save] No rows updated! Check Row Level Security (RLS) or matching ID.")
        alert("Advertencia: No se actualizó ninguna fila en Supabase. ¿La lección existe con ese ID en la base de datos?")
      } else {
        alert("¡Guardado y sincronizado con éxito en Supabase!")
      }

      // Update state locally
      const updatedSems = semesters.map(sem => {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => {
            return {
              ...sub,
              lessons: sub.lessons.map(les => {
                if (les.id === selectedLesson.id) {
                  return { ...les, content: updatedContent }
                }
                return les
              })
            }
          })
        }
      })

      setSemesters(updatedSems)
      
      // Update selected references
      const currentSem = updatedSems.find(s => s.id === selectedSem.id)
      setSelectedSem(currentSem)
      const currentSubj = currentSem.subjects.find(s => s.id === selectedSubj.id)
      setSelectedSubj(currentSubj)
      const currentLes = currentSubj.lessons.find(l => l.id === selectedLesson.id)
      setSelectedLesson(currentLes)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error al sincronizar sección con Supabase:", err)
      alert("Error de conexión: No se pudo subir el contenido. Intente nuevamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedLesson.id}_${selectedSecIdx}_${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('academy-support-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
        
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('academy-support-images')
        .getPublicUrl(fileName)
        
      // Append markdown link to editor text
      const imgMarkdown = `\n\n![${file.name.split('.')[0]}](${publicUrl})\n\n`
      setEditorText(prev => prev + imgMarkdown)
      
      alert("¡Imagen subida con éxito y agregada al final de la teoría!")
    } catch (err) {
      console.error("Error subiendo imagen:", err)
      alert("Error al subir la imagen: " + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  // Parse Markdown to beautiful styled elements
  const renderStyledMarkdown = (text = '', html = '') => {
    if (!text && !html) return <p className="text-gray-500 italic">Sin contenido cargado aún.</p>

    const splitBlocks = (txt) => {
      if (!txt) return [];
      const result = [];
      let current = [];
      let inCode = false;
      const lines = txt.split('\n');
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
    const rawBlocks = splitBlocks(text)
    const blocks = [];
    let currentPracticeBlock = null;

    rawBlocks.forEach(b => {
      const trimmed = b.trim();
      const isPracticePart = trimmed.startsWith('🥣') || 
                             trimmed.toLowerCase().includes('material necesario:') || 
                             /^Paso\s*\d+\s*:/i.test(trimmed) ||
                             trimmed === '---';
      
      if (isPracticePart) {
        if (!currentPracticeBlock) {
          currentPracticeBlock = b;
        } else {
          currentPracticeBlock += '\n\n' + b;
        }
      } else {
        if (currentPracticeBlock) {
          blocks.push(currentPracticeBlock);
          currentPracticeBlock = null;
        }
        blocks.push(b);
      }
    });
    if (currentPracticeBlock) {
      blocks.push(currentPracticeBlock);
    }

    const rendered = blocks.map((block, bIdx) => {
      block = block.trim()
      if (!block) return null

      // Check if it's culinary practice
      const isPractice = block.startsWith('🥣') || block.toLowerCase().includes('material necesario:') || /^Paso\s*\d+\s*:/i.test(block);
      if (isPractice) {
        return (
          <PracticalLab
            key={bIdx}
            text={block}
            lessonId={selectedLesson?.id || 'admin'}
            parseMarkdownAndGlossary={formatInlineMarkdown}
          />
        )
      }

      // Detect timelines
      const timelineLines = block.split('\n').filter(Boolean);
      const isTimeline = timelineLines.length > 1 && timelineLines.every(line => /^(?:Día|Dia|Fase|Paso|Semana)\s*\d+\s*:/i.test(line.trim()));
      if (isTimeline) {
        return <InteractiveTimeline key={bIdx} text={block} />;
      }

      // Check if it's the custom widget block
      if (block === '[WIDGET:CUSTOM_HTML]' || block === '[WIDGET:CUSTOM]') {
        return (
          <div key={bIdx} className="my-4 rounded-2xl border border-[var(--border-moss)] overflow-hidden bg-[var(--bg-elevated)] shadow-md">
            <div className="bg-[var(--bg-card)] px-3 py-1.5 border-b border-[var(--border-moss)] flex items-center justify-between text-[9px] uppercase font-bold text-[var(--accent-mint)]">
              <span>💻 Simulación Interactiva</span>
            </div>
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { margin: 0; padding: 12px; font-family: system-ui, sans-serif; background: #0B110E; color: #E2E8F0; }
                    </style>
                  </head>
                  <body>
                    ${html || '<div style="color:#888;text-align:center;font-size:11px;">[No se ha ingresado código de animación aún]</div>'}
                  </body>
                </html>
              `}
              sandbox="allow-scripts"
              className="w-full h-60 border-0"
              title="Preview custom HTML"
            />
          </div>
        )
      }

      // Images
      if (block.startsWith('![') && block.includes('](')) {
        const altMatch = block.match(/!\[([^\]]*)\]/)
        const urlMatch = block.match(/\(([^)]+)\)/)
        if (urlMatch) {
          const alt = altMatch ? altMatch[1] : ''
          const url = urlMatch[1]
          return (
            <div key={bIdx} className="my-4 flex flex-col items-center gap-2">
              <img 
                src={url} 
                alt={alt} 
                className="max-w-full h-auto rounded-xl border border-[var(--border-moss)] shadow-md bg-[var(--bg-elevated)]"
              />
              {alt && <span className="text-[10px] text-[var(--text-muted)] italic">{alt}</span>}
            </div>
          )
        }
      }

      // Headings
      if (block.startsWith('### ')) {
        return (
          <h4 key={bIdx} className="text-base font-bold mt-6 mb-3 flex items-center gap-2 border-b border-[var(--border-moss)] pb-1" style={{ color: 'var(--accent-mint)' }}>
            {block.substring(4)}
          </h4>
        )
      }

      // Quotes
      if (block.startsWith('> ')) {
        return (
          <div key={bIdx} className="editorial-quote my-4">
            <p className="font-reading-serif italic text-sm">{block.substring(2)}</p>
          </div>
        )
      }

      // Bullet Lists
      if (block.startsWith('• ') || block.startsWith('* ') || block.includes('\n• ') || block.includes('\n* ')) {
        const bulletLines = block.split('\n').filter(Boolean);
        return (
          <LeafChecklist
            key={bIdx}
            lines={bulletLines}
            lessonId={selectedLesson?.id || 'admin'}
            sectionIdx={selectedSecIdx || 0}
            blockIdx={bIdx}
            parseMarkdownAndGlossary={formatInlineMarkdown}
          />
        )
      }

      // Tables
      if (block.startsWith('|')) {
        const rows = block.split('\n').filter(r => r.trim().startsWith('|'))
        if (rows.length > 1) {
          const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean)
          const dataRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean))
          return (
            <TableRecipeScaler
              key={bIdx}
              headers={headers}
              initialBody={dataRows}
              parseMarkdownAndGlossary={formatInlineMarkdown}
            />
          )
        }
      }

      // Check for code blocks or diagram text
      if ((block.startsWith('```') && block.endsWith('```')) || /[┌┐└┘─│├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]/.test(block) || block.startsWith('DIAGRAMA:')) {
        return (
          <TextDiagram key={bIdx} text={block} title="Diagrama Conceptual" />
        )
      }

      // Check for Callout triggers
      let calloutClass = ''
      let emoji = ''
      if (block.startsWith('🔬')) {
        calloutClass = 'callout-card-science'
        emoji = '🔬'
      } else if (block.startsWith('⚠️')) {
        calloutClass = 'callout-card-cook'
        emoji = '⚠️'
      } else if (block.startsWith('💡')) {
        calloutClass = 'callout-card-tip'
        emoji = '💡'
      } else if (block.startsWith('🍳') || block.startsWith('🌿') || block.startsWith('🌡️')) {
        calloutClass = 'callout-card-alchemy'
        emoji = block.slice(0, 2)
      }

      if (calloutClass) {
        // Remove emoji from paragraph text
        const cleanedBlock = block.slice(2).trim()
        return (
          <div key={bIdx} className={`callout-card ${calloutClass} my-5 text-xs`}>
            <span className="text-xl">{emoji}</span>
            <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanedBlock) }} />
          </div>
        )
      }

      // Standard paragraph
      return (
        <p 
          key={bIdx} 
          className="text-xs leading-relaxed mb-4 text-[var(--text-secondary)]"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block) }}
        />
      )
    })

    const hasCustomWidgetTag = text.includes('[WIDGET:CUSTOM_HTML]') || text.includes('[WIDGET:CUSTOM]')
    if (html && !hasCustomWidgetTag) {
      rendered.push(
        <div key="auto-preview" className="my-4 rounded-2xl border border-[var(--border-moss)] overflow-hidden bg-[var(--bg-elevated)] shadow-md">
          <div className="bg-[var(--bg-card)] px-3 py-1.5 border-b border-[var(--border-moss)] flex items-center justify-between text-[9px] uppercase font-bold text-[var(--accent-mint)]">
            <span>💻 Vista Previa de Animación</span>
          </div>
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { margin: 0; padding: 12px; font-family: system-ui, sans-serif; background: #0B110E; color: #E2E8F0; }
                  </style>
                </head>
                <body>
                  ${html}
                </body>
              </html>
            `}
            sandbox="allow-scripts"
            className="w-full h-60 border-0"
            title="Preview custom HTML"
          />
        </div>
      )
    }

    return rendered
  }

  // Format inline bold/italic
  const formatInlineMarkdown = (text = '') => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-[var(--text-secondary)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-mint)] mb-3" />
        <p className="text-sm font-medium">Alineando planos curriculares desde la base de datos...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] dark-theme text-[var(--text-primary)]">
      {/* HEADER BANNER */}
      <header className="flex items-center justify-between p-4 border-b border-[var(--border-moss)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (viewStep === 'editor') {
                setViewStep('weeks')
              } else if (viewStep === 'weeks') {
                setViewStep('subjects')
              } else {
                onBack()
              }
            }}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-moss)] tap-active"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xs font-bold text-gradient-spiritual">
              {viewStep === 'editor' ? 'Editor de Contenido' : viewStep === 'weeks' ? 'Semanas de Estudio' : 'Consola Académica'}
            </h1>
            <p className="text-[9px] text-[var(--text-muted)] truncate max-w-[180px]">
              {viewStep === 'editor' ? selectedLesson?.title : viewStep === 'weeks' ? selectedSubj?.title : 'Carga de Currículo Universitario'}
            </p>
          </div>
        </div>
        
        {selectedSubj && (() => {
          const stats = getSubjectStats(selectedSubj)
          return (
            <div className="text-right">
              <span className="text-[9px] font-bold text-[var(--accent-mint)]">{stats.percent}% cargado</span>
              <div className="w-16 h-1.5 bg-[var(--bg-elevated)] rounded-full mt-1 overflow-hidden ml-auto">
                <div 
                  className="h-full bg-[var(--accent-mint)] rounded-full" 
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>
          )
        })()}
      </header>

      {/* SCROLLABLE VIEW STEPPER */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* VIEW 1: SEMESTERS AND SUBJECTS */}
        {viewStep === 'subjects' && (
          <div className="flex flex-col p-4 space-y-4">
            {/* Career Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Carrera Activa</span>
              <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10 max-w-[340px]">
                <button
                  onClick={() => handleCareerChange('alquimia')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer text-center ${
                    activeCareer === 'alquimia'
                      ? 'bg-gradient-to-r from-[#2EE59D] to-[#0EA5E9] text-black shadow-[0_2px_8px_rgba(46,229,157,0.3)] font-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  🌿 Alquimia
                </button>
                <button
                  onClick={() => handleCareerChange('pizza')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer text-center ${
                    activeCareer === 'pizza'
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)] font-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  🍕 Maestría Pizza
                </button>
              </div>
            </div>

            {/* Semesters Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Semestres</span>
              <div className="grid grid-cols-6 gap-1.5">
                {semesters
                  .filter(sem => (sem.career_id || 'alquimia') === activeCareer)
                  .map(sem => {
                    const active = selectedSem?.id === sem.id
                    return (
                      <button
                        key={sem.id}
                        onClick={() => {
                          setSelectedSem(sem)
                          if (sem.subjects.length > 0) setSelectedSubj(sem.subjects[0])
                        }}
                        className={`h-9 rounded-xl flex items-center justify-center transition-all text-xs font-bold ${
                          active 
                            ? activeCareer === 'pizza'
                              ? 'bg-[#F59E0B] text-white font-extrabold shadow-md'
                              : 'bg-[var(--accent-mint)] text-black font-extrabold shadow-md' 
                            : 'bg-[var(--bg-card)] border border-[var(--border-moss)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        {sem.number}
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Materias (Semestre {selectedSem?.number})</span>
              <div className="space-y-2">
                {selectedSem?.subjects.map(subj => {
                  const stats = getSubjectStats(subj)
                  return (
                    <button
                      key={subj.id}
                      onClick={() => {
                        setSelectedSubj(subj)
                        setViewStep('weeks')
                      }}
                      className="w-full p-4 rounded-2xl text-left border border-[var(--border-moss)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] transition-all flex items-center justify-between tap-active"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subj.emoji}</span>
                        <div>
                          <h3 className="text-xs font-bold text-[var(--text-primary)]">{subj.title}</h3>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{subj.lessons?.length || 0} semanas curriculares</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--accent-mint)]">{stats.percent}%</span>
                        <p className="text-[9px] text-[var(--text-muted)]">Cargado</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 16 WEEKS & SECTIONS */}
        {viewStep === 'weeks' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Semanas de {selectedSubj?.title}</span>
              <button 
                onClick={() => setViewStep('subjects')}
                className="text-[10px] text-[var(--accent-mint)] hover:underline"
              >
                ← Cambiar materia
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedSubj?.lessons?.map(les => {
                const hasPlaceholders = les.content?.sections?.some(sec => {
                  const isEditable = sec.title.includes('📖') || 
                    sec.title.includes('🎯') || sec.title.includes('🔍') ||
                    sec.title.includes('💡') || sec.title.includes('🥣')
                  return isEditable && isSectionPending(sec.text)
                })
                return (
                  <div key={les.id} className="p-3.5 rounded-2xl border border-[var(--border-moss)] bg-[var(--bg-card)]">
                    <div className="flex items-center justify-between text-xs font-bold mb-3 border-b border-[var(--border-moss)] pb-2">
                      <span className="truncate flex-1 text-[var(--text-primary)]">{les.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {les.type === 'exam' ? (
                          <span className="text-[9px] bg-[var(--accent-gold)] text-black px-2 py-0.5 rounded-full font-bold">Examen</span>
                        ) : (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            hasPlaceholders ? 'bg-red-950/40 text-red-300 border border-red-900/40' : 'bg-green-950/40 text-green-300 border border-green-900/40'
                          }`}>
                            {hasPlaceholders ? 'Pendiente' : 'Completo'}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteWeek(les.id)}
                          className="text-red-500 hover:text-red-400 p-1 transition-all tap-active"
                          title="Eliminar esta semana"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                      {les.content?.sections?.map((sec, idx) => {
                        const isTheory = sec.title.includes('📖') || 
                          sec.title.includes('🎯') || sec.title.includes('🔍') ||
                          sec.title.includes('💡') || sec.title.includes('🥣')
                        const isPending = isTheory && isSectionPending(sec.text)
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectSection(les, idx)}
                            className="w-full p-2 rounded-xl text-left text-[11px] flex items-center justify-between border border-[var(--border-moss)] bg-[var(--bg-elevated)] hover:bg-[var(--border-moss)] text-[var(--text-secondary)] transition-all tap-active"
                          >
                            <span className="truncate flex-1 mr-2">{sec.title}</span>
                            {isTheory && (
                              <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-red-500' : 'bg-green-500'}`} />
                            )}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => handleAddSubsection(les)}
                        className="w-full p-2 rounded-xl text-center text-[10px] border border-dashed border-[var(--border-moss)] hover:bg-[var(--bg-elevated)] text-[var(--accent-teal)] flex items-center justify-center gap-1 mt-1 transition-all tap-active"
                      >
                        <Plus size={12} />
                        Añadir Subsección
                      </button>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={handleAddWeek}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-[var(--border-moss)] hover:bg-[var(--bg-card)] text-xs font-bold text-[var(--accent-mint)] flex items-center justify-center gap-2 transition-all tap-active mt-2"
              >
                <Plus size={15} />
                Agregar Nueva Semana
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: EDITOR AND PREVIEW */}
        {viewStep === 'editor' && selectedLesson && selectedSecIdx !== null && (
          <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-primary)]">
            <div className="p-3.5 border-b border-[var(--border-moss)] bg-[var(--bg-card)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold">{selectedLesson.title}</span>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-moss)] rounded-xl px-2 py-1 text-xs font-bold w-60 mt-1 focus:outline-none focus:border-[var(--accent-mint)]"
                  />
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDeleteSubsection}
                    className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all tap-active"
                    title="Eliminar subsección"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--accent-mint)] text-black text-xs font-bold flex items-center gap-1.5 tap-active disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save size={14} />}
                    {saving ? 'Subiendo...' : 'Sincronizar'}
                  </button>
                </div>
              </div>

              {/* Tabs and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex bg-[var(--bg-elevated)] p-0.5 rounded-lg border border-[var(--border-moss)]">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'edit' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <Edit3 size={13} />
                    Editar
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <Eye size={13} />
                    Previsualizar
                  </button>
                </div>

                {activeTab === 'edit' && editorSubTab === 'markdown' && (
                  <label className="flex items-center gap-1.5 text-[10px] bg-[var(--bg-elevated)] border border-[var(--border-moss)] px-2.5 py-1.5 rounded-xl hover:bg-[var(--border-moss)] cursor-pointer tap-active transition-all font-bold text-[var(--text-secondary)]">
                    {uploadingImage ? <Loader2 size={11} className="animate-spin text-[var(--accent-mint)]" /> : <Image size={11} />}
                    {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Save Success Alert */}
            {saveSuccess && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-green-950/80 border border-green-800 text-green-300 text-xs flex items-center gap-2 animate-float-in">
                <CheckCircle size={14} />
                <span>¡Sincronizado con Supabase!</span>
              </div>
            )}

            {/* Editor Workspace */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden min-h-[300px]">
              {activeTab === 'edit' ? (
                <div className="flex-1 flex flex-col gap-3">
                  {/* Editor sub-tabs */}
                  <div className="flex border-b border-[var(--border-moss)] gap-4">
                    <button
                      onClick={() => setEditorSubTab('markdown')}
                      className={`pb-1 text-xs font-bold transition-all border-b-2 ${
                        editorSubTab === 'markdown' ? 'border-[var(--accent-mint)] text-[var(--accent-mint)]' : 'border-transparent text-[var(--text-secondary)]'
                      }`}
                    >
                      Teoría (Markdown)
                    </button>
                    <button
                      onClick={() => setEditorSubTab('animation')}
                      className={`pb-1 text-xs font-bold transition-all border-b-2 ${
                        editorSubTab === 'animation' ? 'border-[var(--accent-mint)] text-[var(--accent-mint)]' : 'border-transparent text-[var(--text-secondary)]'
                      }`}
                    >
                      Animación HTML/CSS/JS (Opcional)
                    </button>
                  </div>

                  {editorSubTab === 'markdown' ? (
                    <textarea
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                      className="w-full h-80 p-4 rounded-xl border border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent-mint)] resize-none"
                      placeholder="Pega aquí el contenido Markdown de 1000 palabras..."
                    />
                  ) : (
                    <textarea
                      value={editorHtml}
                      onChange={(e) => setEditorHtml(e.target.value)}
                      className="w-full h-80 p-4 rounded-xl border border-[var(--border-moss)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent-mint)] resize-none"
                      placeholder={`Ejemplo de código para tu animación:

<div style="text-align:center; padding: 20px;">
  <h3>Simulador de Calor Celular</h3>
  <div id="status" style="font-size: 30px; margin: 15px;">🌱 Celda Turgente</div>
  <button onclick="aplicarCalor()" style="background:#2EE59D; color:#000; padding:8px 16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
    Aplicar Transferencia Térmica
  </button>
</div>

<style>
  #status { transition: transform 0.3s ease; }
</style>

<script>
  function aplicarCalor() {
    const el = document.getElementById('status');
    el.innerHTML = '🔥 Transfiriendo Calor...';
    el.style.transform = 'scale(1.2)';
    setTimeout(() => {
      el.innerHTML = '🍂 Celda Plasmolizada';
      el.style.transform = 'scale(1)';
    }, 1500);
  }
</script>`}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-80 overflow-y-auto bg-[var(--bg-card)] rounded-xl border border-[var(--border-moss)] p-4 prose-lesson">
                  {renderStyledMarkdown(editorText, editorHtml)}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
