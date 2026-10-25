import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
        <Boxes className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-lg font-semibold text-slate-700 mt-2">Page Not Found</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The inventory module or resource route you requested does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
