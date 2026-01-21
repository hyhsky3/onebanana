import { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import './AuthGate.css';

const ACCESS_PASSWORD = '0760';
const SESSION_KEY = 'banana_ai_access_granted';

const AuthGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check session storage on mount
        const hasAccess = sessionStorage.getItem(SESSION_KEY);
        if (hasAccess === 'true') {
            setIsAuthenticated(true);
        }
        // Small delay to prevent flash if checking
        setIsLoading(false);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ACCESS_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
            // Focus back on input happens automatically or user clicks
        }
    };

    if (isLoading) return null; // Or a loading spinner

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="auth-overlay">
            <div className="auth-card">
                <div className="auth-icon">🔒</div>
                <h2 className="auth-title">亲爱的原始股东，欢迎回家</h2>
                <p className="auth-subtitle">请输入密码</p>

                <form className="auth-form" onSubmit={handleLogin}>
                    <input
                        type="password"
                        className="auth-input"
                        placeholder="····"
                        maxLength={4}
                        value={password}
                        onChange={(e) => {
                            setError(false);
                            setPassword(e.target.value);
                        }}
                        autoFocus
                    />
                    <button type="submit" className="auth-btn">
                        解锁 / Unlock
                    </button>
                </form>

                {error && (
                    <div className="auth-error">
                        <Lock size={16} />
                        <span>密码错误 / Incorrect Password</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthGate;
