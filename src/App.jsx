import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './styles.css'
import Navbar from './components/Navbar'
import HomeHero from './components/HomeHero'
import Ticker from './components/Ticker'
import NowSnapshot from './components/NowSnapshot'
import MorningBriefing from './components/MorningBriefing'
import HomeStats from './components/HomeStats'
import CTABlock from './components/CTABlock'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Blog from './components/Blog'
import Journey from './components/Journey'
import BlogPost from './components/BlogPost'
import SocialPostGenerator from './components/SocialPostGenerator'
import Tools from './components/Tools'
import ToolDetail from './components/ToolDetail'
import ClaudePlugins from './components/ClaudePlugins'
import CursorGlow from './components/CursorGlow'

const ZendeskDashboard = lazy(() => import('./components/zendesk/ZendeskDashboard'))

function HomePage() {
  return (
    <div className="h-home">
      <CursorGlow />
      <a className="skip-to-content" href="#blog">Skip to content</a>
      <Navbar />
      <HomeHero />
      <Ticker />
      <NowSnapshot />
      <MorningBriefing />
      <HomeStats />
      <Blog />
      <Projects />
      <ClaudePlugins />
      <About />
      <Journey />
      <Skills />
      <CTABlock />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/post/:id" element={<BlogPost />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/tools/:slug" element={<ToolDetail />} />
      <Route path="/social" element={<SocialPostGenerator />} />
      <Route path="/zendesk" element={<Suspense fallback={<div className="zd-loading"><p>Loading dashboard...</p></div>}><ZendeskDashboard /></Suspense>} />
    </Routes>
  )
}

export default App
