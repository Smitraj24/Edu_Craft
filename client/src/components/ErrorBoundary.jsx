import { useRouteError, useNavigate } from 'react-router-dom';
import { Home, RefreshCw, ArrowLeft } from 'lucide-react';

const ErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    console.error('Route Error:', error);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <span className="text-4xl">⚠️</span>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    {error?.status === 404 ? 'Page Not Found' : 'Oops! Something went wrong'}
                </h1>
                
                <p className="text-slate-400 mb-2">
                    {error?.status === 404 
                        ? "The page you're looking for doesn't exist."
                        : 'An unexpected error occurred. Please try again.'}
                </p>

                {error?.statusText && (
                    <p className="text-sm text-slate-500 mb-8 font-mono bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        {error.statusText}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/20"
                    >
                        <Home size={18} />
                        Home
                    </button>
                </div>

                {/* Debug Info (Development Only) */}
                {import.meta.env.DEV && error?.message && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-slate-400 hover:text-white text-sm font-medium mb-2">
                            Debug Information
                        </summary>
                        <pre className="text-xs text-red-400 bg-slate-900 p-4 rounded-lg overflow-auto border border-slate-700">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

export default ErrorBoundary;
