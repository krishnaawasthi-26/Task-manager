import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Shield, Tag, Zap } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Button from '../components/UI/Button';

export default function LandingPage() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  const swaggerUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '') + '/swagger-ui.html';

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mesh-bg absolute inset-0 opacity-90" />
      <div className="relative z-10">
        <Navbar />
        <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-center px-6 py-16">
          <h1 className="max-w-5xl font-display text-5xl font-extrabold leading-tight md:text-7xl">Task Management.<br /><span className="gradient-text">Built for Scale.</span></h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">Secure JWT auth, role-based access, and a full REST API — ready to deploy in minutes.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register"><Button className="px-6 py-3">Get Started <ArrowRight size={18} /></Button></Link>
            <a href={swaggerUrl} target="_blank" rel="noreferrer"><Button variant="secondary" className="px-6 py-3">View API Docs <ExternalLink size={18} /></Button></a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">{['🔐 JWT Auth', '👥 RBAC', '📋 Categories', '📊 REST v1'].map((chip) => <span key={chip} className="glass rounded-full px-4 py-2 text-sm font-bold">{chip}</span>)}</div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              [Shield, 'Secure Auth', 'Access and refresh token rotation with Spring Security 6.'],
              [Tag, 'Categories', 'Organize tasks with colored categories, description, and icon.'],
              [Zap, 'Role-Based API', 'Admin panel and user dashboard backed by RBAC routes.']
            ].map(([Icon, title, text]) => <article key={title} className="glass card-hover rounded-2xl p-6"><Icon className="mb-4 text-accent" /><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-2 text-textMuted">{text}</p></article>)}
          </div>
        </section>
      </div>
    </main>
  );
}
