import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './styles.css'
import SideRail from './components/SideRail'
import HomeHero from './components/HomeHero'
import Ticker from './components/Ticker'
import NowSnapshot from './components/NowSnapshot'
import MorningBriefing from './components/MorningBriefing'
import HomeStats from './components/HomeStats'
import HomeWriting from './components/HomeWriting'
import CTABlock from './components/CTABlock'
import AboutPage from './components/AboutPage'
import BlogPost from './components/BlogPost'
import SocialPostGenerator from './components/SocialPostGenerator'
import Tools from './components/Tools'
import ToolDetail from './components/ToolDetail'
import CursorGlow from './components/CursorGlow'

const ZendeskDashboard = lazy(() => import('./components/zendesk/ZendeskDashboard'))

function HomePage() {
  return (
    <div className="h-home">
      <CursorGlow />
      <a className="skip-to-content" href="#now-snapshot">Skip to content</a>
      <SideRail currentPage="home" />
      <main>
        <HomeHero />
        <Ticker />
        <NowSnapshot />
        <MorningBriefing />
        <HomeStats />
        <HomeWriting />
        <CTABlock />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/post/:id" element={<BlogPost />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/tools/:slug" element={<ToolDetail />} />
      <Route path="/social" element={<SocialPostGenerator />} />
      <Route path="/zendesk" element={<Suspense fallback={<div className="zd-loading"><p>Loading dashboard...</p></div>}><ZendeskDashboard /></Suspense>} />
    </Routes>
  )
}

export default App
