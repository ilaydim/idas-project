import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../utils/supabase";

const PrivateRoute = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Supabase'den mevcut oturum durumunu al
        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (mounted) {
                if (error) {
                    console.error("Session fetch error:", error);
                    setSession(null);
                } else {
                    setSession(data.session);
                }
                setLoading(false);
            }
        };

        getSession();

        // Kullanıcı login/logout yaparken state'i gerçek zamanlı dinle
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (mounted) {
                    setSession(session);
                }
            }
        );

        return () => {
            mounted = false;
            authListener?.subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Eğer oturum varsa Outlet (çocuk sayfa) göster, yoksa Login'e şutla
    return session ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
