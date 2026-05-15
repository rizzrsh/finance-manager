import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user on component mount
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
        } else {
          // Try to get user if session doesn't work
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="user-profile">
        <div className="user-avatar">-</div>
        <div className="user-info">
          <p className="user-name">Loading...</p>
          <p className="user-email">-</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="user-avatar">?</div>
        <div className="user-info">
          <p className="user-name">No User</p>
          <p className="user-email">Not logged in</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'No email';
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="user-profile">
      <div className="user-avatar">{initials}</div>
      <div className="user-info">
        <p className="user-name">{userName}</p>
        <p className="user-email">{userEmail}</p>
      </div>
    </div>
  );
}