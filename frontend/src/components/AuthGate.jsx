import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── Helper: Material Icon shorthand ── */
function Icon({ name, fill = false, size = 'text-[20px]', className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${size} ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
      {name}
    </span>
  );
}

export default function AuthGate() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row font-body bg-surface">
      {/* Left Branding Panel */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-surface-container-lowest items-center justify-center overflow-hidden p-16 h-full">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-container blur-[120px]" />
          <div className="absolute right-40 bottom-20 w-64 h-64 rounded-full bg-secondary-container blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center gap-4 mb-12">
            <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-12 h-12 rounded-full shadow-[0_0_15px_rgba(74,142,255,0.3)]" />
            <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">NEXUS AI</h1>
          </div>
          <h2 className="font-headline text-5xl font-extrabold text-on-surface leading-tight">
            Precision AI for the <span className="text-primary">Next Generation</span> of Medicine.
          </h2>
          <p className="mt-8 text-on-surface-variant text-lg leading-relaxed">
            Access unlimited clinical consultations, diagnostic AI assistance, and curated medical resources.
          </p>
          <div className="flex gap-8 mt-16">
            <div className="flex flex-col">
              <span className="font-headline text-3xl font-bold text-primary">MBBS</span>
              <span className="text-xs font-bold uppercase tracking-widest text-outline">2027 Cohort</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-3xl font-bold text-primary">AI</span>
              <span className="text-xs font-bold uppercase tracking-widest text-outline">Clinical Support</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-3xl font-bold text-primary">24/7</span>
              <span className="text-xs font-bold uppercase tracking-widest text-outline">Availability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Login/Register Panel */}
      <section className="flex-1 w-full h-full overflow-y-auto flex flex-col p-6 lg:p-12 relative">
        <div className="m-auto w-full max-w-md py-12">
          <div className="lg:hidden mb-12 flex items-center justify-center gap-3">
            <img src="/avatar.png" alt="NEXUS AI" className="w-10 h-10 rounded-full" />
            <span className="font-headline font-extrabold text-xl tracking-tight text-primary">NEXUS AI</span>
          </div>

        <div className="w-full max-w-md">
          <header className="mb-8 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">Clinical Access Required</span>
            <h3 className="font-headline text-3xl font-bold text-on-surface">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-on-surface-variant mt-2">
              {isLogin 
                ? 'Sign in to continue your clinical consultations.'
                : 'Register to unlock the Clinical Engine.'}
            </p>
          </header>

          {/* Form Widget */}
          <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 shadow-lg">
            {/* Tabs */}
            <div className="flex mb-6 bg-surface-container-highest p-1 rounded-lg">
              <button 
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors ${isLogin ? 'bg-surface shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => { setIsLogin(true); setError(null); }}
              >
                Login
              </button>
              <button 
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors ${!isLogin ? 'bg-surface shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => { setIsLogin(false); setError(null); }}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2 text-error text-sm">
                <Icon name="error" size="text-[18px]" className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
                  <div className="relative">
                    <Icon name="person" size="text-[18px]" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder-on-surface-variant/50"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
                <div className="relative">
                  <Icon name="mail" size="text-[18px]" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder-on-surface-variant/50"
                    placeholder="doctor@nexus.ai"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Password</label>
                <div className="relative">
                  <Icon name="lock" size="text-[18px]" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder-on-surface-variant/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 surgical-gradient text-on-primary font-headline font-bold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(74,142,255,0.2)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Icon name="progress_activity" className="animate-spin" size="text-[20px]" />
                ) : (
                  <>
                    <Icon name={isLogin ? "login" : "person_add"} size="text-[18px]" />
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>
            
            {/* Google OAuth (optional backend implementation) */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant/20"></div>
                <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">OR</span>
                <div className="flex-1 h-px bg-outline-variant/20"></div>
              </div>
              <a 
                href="http://localhost:8000/api/auth/login/google"
                className="w-full bg-surface-container-highest hover:bg-surface-container-highest/80 border border-outline-variant/30 text-on-surface font-headline font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </a>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-on-surface-variant text-sm">
              Secured by NEXUS AI Authentication
            </p>
          </div>
        </div>

          <div className="mt-auto pt-12 flex flex-wrap justify-center gap-6 opacity-40">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <Icon name="verified_user" size="text-sm" /> SECURE
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <Icon name="health_and_safety" size="text-sm" /> CLINICAL GRADE
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
