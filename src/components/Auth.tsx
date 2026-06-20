// src/components/Auth.tsx
'use client';
import { useState } from 'react';
import { createClient, isSupabaseConfigured } from '../utils/supabase/client';
import { motion } from 'framer-motion';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isSupabaseConfigured) {
      setMessage('Operating in local offline mode. Add your environment credentials to enable active accounts.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Registration successful! Please open your email inbox to verify your registration.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-neonCyan relative border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonCyan to-neonPink rounded-t-2xl" />
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 text-center">
          {isSignUp ? 'Create Workspace' : 'Garage Hub Login'}
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Access your revenue statistics, customer database, and service alerts
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-lg glass-input text-sm"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 rounded-lg glass-input text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-neonCyan to-neonPurple hover:opacity-95 text-white font-semibold py-3 rounded-lg transition shadow-neonCyan cursor-pointer text-sm"
          >
            {loading ? 'Processing...' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-neonPink bg-neonPink/10 border border-neonPink/20 p-2.5 rounded-lg">
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          {isSignUp ? 'Already have a secure workspace?' : 'First time running the system?'}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="ml-1 text-neonCyan hover:underline focus:outline-none cursor-pointer font-semibold"
          >
            {isSignUp ? 'Login Here' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}