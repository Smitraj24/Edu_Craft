import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const GoogleAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Google authentication failed. Please try again.');
            navigate('/login');
            return;
        }

        if (token && userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                
                // Store in session
                const userWithToken = { ...userData, token };
                sessionStorage.setItem('userInfo', JSON.stringify(userWithToken));
                sessionStorage.setItem('token', token);
                
                // Update context
                setUser(userWithToken);
                
                toast.success('Successfully signed in with Google!');
                navigate('/dashboard');
            } catch (err) {
                console.error('Error parsing user data:', err);
                toast.error('Authentication error. Please try again.');
                navigate('/login');
            }
        } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
        }
    }, [searchParams, navigate, setUser]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Completing Sign In...</h2>
                <p className="text-slate-400">Please wait while we set up your account</p>
            </div>
        </div>
    );
};

export default GoogleAuthSuccess;
