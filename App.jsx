import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  GraduationCap,
  LayoutTemplate,
  Lock,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
} from 'lucide-react'

const STORAGE_KEY = 'resumecraft_offline_data_v1'

const sampleResume = {
  personal: {
    fullName: 'Rahul Sharma',
    title: 'Data Analyst',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Delhi, India',
    linkedin: 'linkedin.com/in/rahulsharma',
    portfolio: 'github.com/rahuldata',
  },
  summary:
    'Detail-oriented Data Analyst skilled in Excel, SQL, Power BI, and dashboard reporting. Experienced in cleaning datasets, analyzing business trends, and preparing actionable reports that support faster decision-making.',
  skills: ['Excel', 'SQL', 'Power BI', 'Data Cleaning', 'Dashboard Reporting', 'Business Analysis'],
  experience: [
    {
      role: 'Data Analyst Intern',
      company: 'InsightEdge Solutions',
      location: 'Delhi',
      start: 'Jan 2025',
      end: 'Jun 2025',
      bullets: [
        'Created weekly performance dashboards to track sales trends and operational KPIs.',
        'Cleaned and organized raw datasets to improve reporting accuracy and reduce manual errors.',
        'Prepared business reports that helped teams identify high-performing products and customer segments.',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Commerce',
      school: 'Delhi University',
      location: 'Delhi',
      year: '2024',
    },
  ],
  projects: [
    {
      name: 'Sales Dashboard Analysis',
      tools: 'Excel, Power BI',
      description:
        'Built an interactive dashboard to track monthly sales, product performance, and regional revenue trends.',
    },
  ],
  certifications: ['Data Analytics Certification', 'Advanced Excel Training'],
  languages: ['Hindi', 'English'],
}

const emptyResume = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
}

const roleSuggestions = {
  data: ['Excel', 'SQL', 'Power BI', 'Python', 'Data Cleaning', 'Dashboard Reporting', 'Data Visualization', 'Business Analysis'],
  sales: ['Lead Generation', 'Client Communication', 'CRM', 'Negotiation', 'Sales Reporting', 'Customer Relationship Management'],
  fresher: ['Communication', 'Teamwork', 'MS Office', 'Problem Solving', 'Time Management', 'Basic Excel'],
}

const bulletBank = {
  data: [
    'Analyzed business data to identify trends, gaps, and performance improvement opportunities.',
    'Created dashboards to track sales, revenue, and operational metrics for management review.',
    'Cleaned and organized datasets to improve reporting accuracy and reduce manual effort.',
  ],
  sales: [
    'Generated new business opportunities through outbound calls, follow-ups, and client meetings.',
    'Maintained CRM records and tracked pipeline progress to improve sales visibility.',
    'Built strong client relationships to support repeat business and better customer retention.',
  ],
  fresher: [
    'Completed academic projects focused on practical problem-solving and business communication.',
    'Developed strong teamwork, analytical, and presentation skills through coursework and training.',
    'Participated in skill-building programs to gain industry-relevant practical knowledge.',
  ],
}

function safeLoadResume() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleResume
  } catch {
    return sampleResume
  }
}

function calculateATSScore(data, jobDescription) {
  let score = 0
  const suggestions = []
  const emailValid = /\S+@\S+\.\S+/.test(data.personal.email)
  const phoneValid = data.personal.phone.replace(/\D/g, '').length >= 10

  if (data.personal.fullName.trim()) score += 4
  else suggestions.push('Full name add karein.')

  if (emailValid) score += 3
  else suggestions.push('Valid email address add karein.')

  if (phoneValid) score += 3
  else suggestions.push('Valid phone number add karein.')

  if (data.summary.trim().length >= 90) score += 12
  else suggestions.push('Professional summary ko 2–3 strong lines mein improve karein.')

  if (data.skills.length >= 6) score += 16
  else suggestions.push('Kam se kam 6 relevant skills add karein.')

  const bulletCount = data.experience.reduce((total, job) => total + job.bullets.filter(Boolean).length, 0)
  if (data.experience.length && bulletCount >= 2) score += 18
  else suggestions.push('Experience ya projects mein achievement-style bullet points add karein.')

  if (data.education.length) score += 10
  else suggestions.push('Education section complete karein.')

  if (data.projects.length || data.certifications.length) score += 10
  else suggestions.push('Project ya certification add karke profile stronger banayein.')

  const hasNumbers = JSON.stringify(data).match(/\d+%|\d+\+|\d+x|\d+\s?(reports|customers|projects|leads|dashboards)/i)
  if (hasNumbers) score += 8
  else suggestions.push('Bullets mein measurable numbers add karein, jaise 20+ leads, 15% improvement.')

  if (jobDescription.trim()) {
    const jd = jobDescription.toLowerCase()
    const matched = data.skills.filter((skill) => jd.includes(skill.toLowerCase()))
    score += Math.min(19, matched.length * 4)
    if (matched.length < 3) suggestions.push('Job description ke keywords ke hisaab se skills optimize karein.')
  } else {
    score += 10
    suggestions.push('JD paste karke keyword match aur accurate bana sakte hain.')
  }

  return { score: Math.min(score, 100), suggestions: suggestions.slice(0, 5) }
}

function Field({ label, value, onChange, placeholder, textarea = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  )
}

function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div className="section-title">
          <span className="section-icon"><Icon size={18} /></span>
          <h3>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Button({ children, onClick, variant = 'dark', icon: Icon, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${variant}`}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}

function ResumePreview({ data }) {
  const contactItems = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.portfolio,
  ].filter(Boolean)

  return (
    <article id="resume-print-area" className="resume-paper">
      <header className="resume-header">
        <h1>{data.personal.fullName || 'Your Name'}</h1>
        <p>{data.personal.title || 'Professional Title'}</p>
        <div>{contactItems.map((item) => <span key={item}>{item}</span>)}</div>
      </header>

      {data.summary ? (
        <ResumeSection title="Professional Summary">
          <p>{data.summary}</p>
        </ResumeSection>
      ) : null}

      {data.skills.length ? (
        <ResumeSection title="Skills">
          <div className="resume-skills">
            {data.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </ResumeSection>
      ) : null}

      {data.experience.length ? (
        <ResumeSection title="Work Experience">
          {data.experience.map((job, index) => (
            <div className="resume-item" key={`${job.company}-${index}`}>
              <div className="resume-item-top">
                <div>
                  <h3>{job.role || 'Job Title'}</h3>
                  <strong>{job.company || 'Company'}{job.location ? ` • ${job.location}` : ''}</strong>
                </div>
                <span>{job.start || 'Start'} — {job.end || 'End'}</span>
              </div>
              <ul>
                {job.bullets.filter(Boolean).map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}
              </ul>
            </div>
          ))}
        </ResumeSection>
      ) : null}

      {data.projects.length ? (
        <ResumeSection title="Projects">
          {data.projects.map((project, index) => (
            <div className="resume-item" key={`${project.name}-${index}`}>
              <h3>{project.name || 'Project Name'}</h3>
              <strong>{project.tools}</strong>
              <p>{project.description}</p>
            </div>
          ))}
        </ResumeSection>
      ) : null}

      {data.education.length ? (
        <ResumeSection title="Education">
          {data.education.map((edu, index) => (
            <div className="resume-item resume-row" key={`${edu.school}-${index}`}>
              <div>
                <h3>{edu.degree || 'Degree'}</h3>
                <strong>{edu.school || 'Institute'}{edu.location ? ` • ${edu.location}` : ''}</strong>
              </div>
              <span>{edu.year || 'Year'}</span>
            </div>
          ))}
        </ResumeSection>
      ) : null}

      {data.certifications.length || data.languages.length ? (
        <ResumeSection title="Additional Details">
          <div className="resume-two-col">
            {data.certifications.length ? <p><b>Certifications:</b> {data.certifications.join(', ')}</p> : null}
            {data.languages.length ? <p><b>Languages:</b> {data.languages.join(', ')}</p> : null}
          </div>
        </ResumeSection>
      ) : null}
    </article>
  )
}

function ResumeSection({ title, children }) {
  return (
    <section className="resume-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function App() {
  const [data, setData] = useState(safeLoadResume)
  const [role, setRole] = useState('data')
  const [jobDescription, setJobDescription] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const ats = useMemo(() => calculateATSScore(data, jobDescription), [data, jobDescription])

  const matchedSkills = useMemo(() => {
    const jd = jobDescription.toLowerCase()
    return jobDescription ? data.skills.filter((skill) => jd.includes(skill.toLowerCase())) : []
  }, [data.skills, jobDescription])

  const updatePersonal = (key, value) => {
    setData((prev) => ({ ...prev, personal: { ...prev.personal, [key]: value } }))
  }

  const addSkill = (skill) => {
    const clean = skill.trim()
    if (!clean) return
    setData((prev) => ({ ...prev, skills: Array.from(new Set([...prev.skills, clean])) }))
  }

  const removeSkill = (skill) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }))
  }

  const addRoleSkills = () => {
    setData((prev) => ({ ...prev, skills: Array.from(new Set([...prev.skills, ...roleSuggestions[role]])) }))
  }

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, { role: '', company: '', location: '', start: '', end: '', bullets: [''] }],
    }))
  }

  const updateExperience = (index, key, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((job, jobIndex) => jobIndex === index ? { ...job, [key]: value } : job),
    }))
  }

  const updateBullet = (jobIndex, bulletIndex, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) => index === jobIndex
        ? { ...job, bullets: job.bullets.map((bullet, currentBulletIndex) => currentBulletIndex === bulletIndex ? value : bullet) }
        : job),
    }))
  }

  const addBullet = (jobIndex, text = '') => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((job, index) => index === jobIndex ? { ...job, bullets: [...job.bullets, text] } : job),
    }))
  }

  const removeExperience = (index) => {
    setData((prev) => ({ ...prev, experience: prev.experience.filter((_, currentIndex) => currentIndex !== index) }))
  }

  const addEducation = () => {
    setData((prev) => ({ ...prev, education: [...prev.education, { degree: '', school: '', location: '', year: '' }] }))
  }

  const updateEducation = (index, key, value) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu, currentIndex) => currentIndex === index ? { ...edu, [key]: value } : edu),
    }))
  }

  const addProject = () => {
    setData((prev) => ({ ...prev, projects: [...prev.projects, { name: '', tools: '', description: '' }] }))
  }

  const updateProject = (index, key, value) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((project, currentIndex) => currentIndex === index ? { ...project, [key]: value } : project),
    }))
  }

  const setCommaList = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value.split(',').map((item) => item.trim()).filter(Boolean) }))
  }

  const printResume = () => window.print()

  return (
    <div className="app-shell">
      <nav className="navbar no-print">
        <div className="brand">
          <span className="brand-icon"><FileText size={22} /></span>
          <div>
            <strong>ResumeCraft</strong>
            <small>Offline ATS Resume Builder</small>
          </div>
        </div>
        <div className="nav-badges">
          <span>No API</span>
          <span>Auto Save</span>
          <span>ATS Score</span>
        </div>
        <Button onClick={printResume} variant="blue" icon={Download}>Download PDF</Button>
      </nav>

      <main>
        <section className="hero no-print">
          <div>
            <span className="eyebrow"><Sparkles size={16} /> Modern SaaS UI • 100% Browser Based</span>
            <h1>Build a polished, ATS-friendly resume without any API.</h1>
            <p>
              Premium frontend-only resume builder with live A4 preview, local auto-save, rule-based ATS scoring,
              job keyword matching, and print-ready PDF export.
            </p>
            <div className="hero-actions">
              <a className="btn btn-dark" href="#builder">Start Building <ArrowRight size={16} /></a>
              <Button onClick={() => setData(sampleResume)} variant="light" icon={Wand2}>Use Sample Resume</Button>
            </div>
          </div>
          <div className="feature-grid">
            {[
              [Lock, 'Private', 'Data stays in browser'],
              [Gauge, 'ATS Score', `${ats.score}/100 profile health`],
              [LayoutTemplate, 'Modern UI', 'Clean SaaS layout'],
              [Download, 'PDF Ready', 'A4 print export'],
            ].map(([Icon, title, description]) => (
              <div className="feature-card" key={title}>
                <span><Icon size={20} /></span>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="builder" className="builder-layout">
          <div className="editor-panel no-print">
            <SectionCard title="Personal Details" icon={UserRound}>
              <div className="form-grid">
                <Field label="Full Name" value={data.personal.fullName} onChange={(value) => updatePersonal('fullName', value)} placeholder="Your full name" />
                <Field label="Professional Title" value={data.personal.title} onChange={(value) => updatePersonal('title', value)} placeholder="Data Analyst" />
                <Field label="Email" value={data.personal.email} onChange={(value) => updatePersonal('email', value)} placeholder="name@email.com" />
                <Field label="Phone" value={data.personal.phone} onChange={(value) => updatePersonal('phone', value)} placeholder="+91..." />
                <Field label="Location" value={data.personal.location} onChange={(value) => updatePersonal('location', value)} placeholder="City, Country" />
                <Field label="LinkedIn" value={data.personal.linkedin} onChange={(value) => updatePersonal('linkedin', value)} placeholder="linkedin.com/in/..." />
                <Field label="Portfolio" value={data.personal.portfolio} onChange={(value) => updatePersonal('portfolio', value)} placeholder="github.com/..." />
              </div>
            </SectionCard>

            <SectionCard title="Summary" icon={Sparkles}>
              <Field label="Professional Summary" value={data.summary} onChange={(value) => setData((prev) => ({ ...prev, summary: value }))} placeholder="Write 2–3 lines about your role, skills, and value." textarea />
            </SectionCard>

            <SectionCard title="Skills" icon={CheckCircle2} action={<Button onClick={addRoleSkills} variant="light" icon={Plus}>Role Skills</Button>}>
              <div className="skill-controls">
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="data">Data Analyst</option>
                  <option value="sales">Sales / Business</option>
                  <option value="fresher">Fresher</option>
                </select>
                <Button onClick={() => addSkill(prompt('Skill name') || '')} variant="dark">Add</Button>
              </div>
              <div className="chips">
                {data.skills.map((skill) => <button type="button" key={skill} onClick={() => removeSkill(skill)}>{skill} ×</button>)}
              </div>
            </SectionCard>

            <SectionCard title="Experience" icon={Briefcase} action={<Button onClick={addExperience} variant="light" icon={Plus}>Add</Button>}>
              <div className="stack">
                {data.experience.map((job, index) => (
                  <div className="nested-card" key={index}>
                    <div className="nested-head">
                      <strong>Experience #{index + 1}</strong>
                      <button type="button" onClick={() => removeExperience(index)}><Trash2 size={16} /></button>
                    </div>
                    <div className="form-grid">
                      <Field label="Role" value={job.role} onChange={(value) => updateExperience(index, 'role', value)} placeholder="Job title" />
                      <Field label="Company" value={job.company} onChange={(value) => updateExperience(index, 'company', value)} placeholder="Company name" />
                      <Field label="Location" value={job.location} onChange={(value) => updateExperience(index, 'location', value)} placeholder="City" />
                      <Field label="Start" value={job.start} onChange={(value) => updateExperience(index, 'start', value)} placeholder="Jan 2025" />
                      <Field label="End" value={job.end} onChange={(value) => updateExperience(index, 'end', value)} placeholder="Present" />
                    </div>
                    {job.bullets.map((bullet, bulletIndex) => (
                      <Field key={bulletIndex} label={`Bullet ${bulletIndex + 1}`} value={bullet} onChange={(value) => updateBullet(index, bulletIndex, value)} placeholder="Achievement bullet" />
                    ))}
                    <div className="inline-actions">
                      <Button onClick={() => addBullet(index)} variant="light" icon={Plus}>Blank Bullet</Button>
                      <Button onClick={() => addBullet(index, bulletBank[role][0])} variant="light" icon={Wand2}>Suggested Bullet</Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Education" icon={GraduationCap} action={<Button onClick={addEducation} variant="light" icon={Plus}>Add</Button>}>
              <div className="stack">
                {data.education.map((edu, index) => (
                  <div className="nested-card" key={index}>
                    <div className="form-grid">
                      <Field label="Degree" value={edu.degree} onChange={(value) => updateEducation(index, 'degree', value)} placeholder="Degree / Course" />
                      <Field label="Institute" value={edu.school} onChange={(value) => updateEducation(index, 'school', value)} placeholder="College / School" />
                      <Field label="Location" value={edu.location} onChange={(value) => updateEducation(index, 'location', value)} placeholder="City" />
                      <Field label="Year" value={edu.year} onChange={(value) => updateEducation(index, 'year', value)} placeholder="2024" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Projects" icon={LayoutTemplate} action={<Button onClick={addProject} variant="light" icon={Plus}>Add</Button>}>
              <div className="stack">
                {data.projects.map((project, index) => (
                  <div className="nested-card" key={index}>
                    <Field label="Project Name" value={project.name} onChange={(value) => updateProject(index, 'name', value)} placeholder="Project name" />
                    <Field label="Tools" value={project.tools} onChange={(value) => updateProject(index, 'tools', value)} placeholder="Excel, Power BI" />
                    <Field label="Description" value={project.description} onChange={(value) => updateProject(index, 'description', value)} placeholder="What you built and outcome" textarea />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Extra Details" icon={Plus}>
              <div className="form-grid">
                <Field label="Certifications" value={data.certifications.join(', ')} onChange={(value) => setCommaList('certifications', value)} placeholder="Certification 1, Certification 2" />
                <Field label="Languages" value={data.languages.join(', ')} onChange={(value) => setCommaList('languages', value)} placeholder="Hindi, English" />
              </div>
            </SectionCard>
          </div>

          <div className="preview-wrap">
            <ResumePreview data={data} />
          </div>

          <aside className="insights-panel no-print">
            <section className="score-card">
              <div className="score-top">
                <div>
                  <span>ATS Health</span>
                  <h2>{ats.score}<small>/100</small></h2>
                </div>
                <Gauge size={28} />
              </div>
              <div className="score-bar"><i style={{ width: `${ats.score}%` }} /></div>
              <div className="suggestions">
                {ats.suggestions.map((item, index) => (
                  <p key={index}><CheckCircle2 size={16} /> {item}</p>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <h3>JD Keyword Match</h3>
              <p>Local text matching, no API.</p>
              <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste job description here..." rows={7} />
              <div className="match-box">
                <span>Matched Skills</span>
                <strong>{matchedSkills.length}</strong>
                <p>{matchedSkills.length ? matchedSkills.join(', ') : 'Paste JD to check keywords.'}</p>
              </div>
            </section>

            <section className="panel-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Button onClick={printResume} variant="blue" icon={Download}>Download / Print PDF</Button>
                <Button onClick={() => setData(sampleResume)} variant="light" icon={Wand2}>Load Sample Data</Button>
                <Button onClick={() => setData(emptyResume)} variant="light" icon={RefreshCcw}>Start Fresh</Button>
              </div>
              <p className="privacy-note">Your resume data is saved only in this browser using localStorage. Nothing is uploaded.</p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}
