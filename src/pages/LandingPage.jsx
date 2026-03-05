import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import s from './LandingPage.module.css'

const FEATURES = [
  { icon: '⚡', title: 'Ajout ultra-rapide', desc: 'Une ligne, Entrée. Ta tâche est là.' },
  { icon: '📁', title: 'Projets & sous-tâches', desc: 'Structure tes tâches en projets avec sous-tâches rattachées.' },
  { icon: '📅', title: 'Dates d\'échéance', desc: 'Deadlines visuelles avec alertes automatiques par couleur.' },
  { icon: '📝', title: 'Notes par tâche', desc: 'Un champ libre pour chaque tâche, toujours accessible.' },
  { icon: '📦', title: 'Archivage', desc: 'Garde un historique propre sans encombrer ta vue active.' },
  { icon: '🔒', title: 'Données privées', desc: 'Chaque compte ne voit que ses propres données. Toujours.' },
]

// Mini task card for mockup
function MockTask({ title, priority, age, project, done, delay = 0 }) {
  const colors = { high: '#f76a6a', medium: '#f7d16a', low: '#52c97e', none: '#3a3a44' }
  const ageColors = { green: '#52c97e', yellow: '#f7d16a', red: '#f76a6a' }
  return (
    <div className={s.mockTask} style={{ animationDelay: `${delay}ms`, opacity: done ? 0.4 : 1 }}>
      <div className={s.mockPriorityBar} style={{ background: colors[priority] }} />
      <div className={s.mockCheck} style={{ background: done ? '#7c6af7' : 'transparent', borderColor: done ? '#7c6af7' : '#3a3a44' }}>
        {done && <span style={{color:'white',fontSize:8,fontWeight:700}}>✓</span>}
      </div>
      <div className={s.mockBody}>
        <div className={s.mockTitle} style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{title}</div>
        <div className={s.mockMeta}>
          <div className={s.mockDot} style={{ background: ageColors[age] }} />
          {project && <span className={s.mockProject}>{project}</span>}
          {priority !== 'none' && <span className={s.mockPrio} style={{ color: colors[priority], background: `${colors[priority]}18` }}>{priority}</span>}
        </div>
      </div>
    </div>
  )
}

function MockScreen() {
  return (
    <div className={s.mockWindow}>
      {/* Window chrome */}
      <div className={s.mockChrome}>
        <div className={s.mockDots}>
          <span style={{background:'#f76a6a'}} />
          <span style={{background:'#f7d16a'}} />
          <span style={{background:'#52c97e'}} />
        </div>
        <div className={s.mockUrl}>flowdesk.vercel.app/app</div>
      </div>
      {/* App header */}
      <div className={s.mockHeader}>
        <div className={s.mockLogo}><div className={s.mockLogoDot}/>FlowDesk</div>
        <div className={s.mockTabs}>
          <span className={s.mockTabActive}>Toutes les tâches</span>
          <span className={s.mockTab}>Par projet</span>
        </div>
      </div>
      {/* Quick add */}
      <div className={s.mockQuickAdd}>
        <span style={{color:'#4a4a5c',marginRight:6}}>+</span>
        <span style={{color:'#4a4a5c',fontSize:11}}>Nouvelle tâche...</span>
      </div>
      {/* Content area */}
      <div className={s.mockContent}>
        <div className={s.mockSidebar}>
          {['📋 Toutes','☀️ Récentes','🔴 Priorité','📅 Échéances','✅ Complétées'].map((item, i) => (
            <div key={i} className={`${s.mockNavItem} ${i === 0 ? s.mockNavActive : ''}`}>{item}</div>
          ))}
          <div className={s.mockSep}/>
          <div className={s.mockNavItem}><span style={{width:6,height:6,borderRadius:'50%',background:'#7c6af7',display:'inline-block',marginRight:6}}/>Travail</div>
          <div className={s.mockNavItem}><span style={{width:6,height:6,borderRadius:'50%',background:'#f7a26a',display:'inline-block',marginRight:6}}/>Personnel</div>
        </div>
        <div className={s.mockTasks}>
          <div className={s.mockGroupLabel}>⚡ En cours</div>
          <MockTask title="Préparer la réunion client" priority="high" age="red" project="Travail" delay={100} />
          <MockTask title="Revoir les specs du projet" priority="medium" age="yellow" project="Travail" delay={150} />
          <MockTask title="Appeler le médecin" priority="high" age="green" delay={200} />
          <MockTask title="Mettre à jour le README" priority="low" age="green" project="Travail" delay={250} />
          <div className={s.mockGroupLabel} style={{marginTop:10}}>✅ Complétées</div>
          <MockTask title="Créer le design system" priority="none" age="green" project="Travail" done delay={300} />
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className={s.page}>
      <div className={s.bgGlow1} />
      <div className={s.bgGlow2} />
      <div className={s.bgGrid} />

      {/* NAV */}
      <nav className={s.nav}>
        <div className={s.navLogo}>
          <div className={s.navDot} />
          FlowDesk
        </div>
        <div className={s.navLinks}>
          <Link to="/login" className={s.navLogin}>Connexion</Link>
          <Link to="/signup" className={s.navCta}>Commencer</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.heroEyebrow}>Productivity · Personal · Private</div>
          <h1 className={s.heroTitle}>
            Ton dashboard.<br />
            <span className={s.heroAccent}>Tes règles.</span>
          </h1>
          <p className={s.heroSub}>
            FlowDesk remplace ton Notion surchargé par un espace de travail taillé pour toi — rapide, clair, et entièrement privé.
          </p>
          <div className={s.heroCtas}>
            <Link to="/signup" className={s.ctaPrimary}>Créer mon espace</Link>
            <Link to="/login" className={s.ctaSecondary}>J'ai déjà un compte →</Link>
          </div>
        </div>
        <div className={s.heroRight}>
          <MockScreen />
        </div>
      </section>

      {/* FEATURES */}
      <section className={s.features}>
        <h2 className={s.featuresTitle}>Tout ce qu'il te faut. Rien de plus.</h2>
        <div className={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={s.featureCard} style={{ animationDelay: `${i * 60}ms` }}>
              <div className={s.featureIcon}>{f.icon}</div>
              <div className={s.featureTitle}>{f.title}</div>
              <div className={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className={s.ctaBottom}>
        <div className={s.ctaBottomInner}>
          <h2 className={s.ctaBottomTitle}>Prêt à reprendre le contrôle ?</h2>
          <p className={s.ctaBottomSub}>Crée ton compte et commence à organiser ta journée en 30 secondes.</p>
          <Link to="/signup" className={s.ctaPrimary}>Créer mon espace gratuitement</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerLogo}><div className={s.navDot} style={{width:6,height:6}}/>FlowDesk</div>
        <div className={s.footerLinks}>
          <Link to="/login">Connexion</Link>
          <Link to="/signup">Créer un compte</Link>
        </div>
      </footer>
    </div>
  )
}
