'use client';

import { useState } from 'react';
import WorkflowCanvas from '../components/WorkflowCanvas';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/generate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      setError(err.message || 'Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">FlowForge</h1>
          <p className="text-lg text-slate-600">
            Forge automations from plain English
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                Describe your automation
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., When I upload a YouTube video, create 3 tweets and a LinkedIn post"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Workflow'
                )}
              </button>
            </div>
          </form>

          {workflow && (
            <div className="mt-8 p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Workflow Canvas</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <WorkflowCanvas workflow={workflow} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
