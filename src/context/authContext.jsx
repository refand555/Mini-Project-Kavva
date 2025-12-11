import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // -----------------------
  // FETCH USER SESSION
  // -----------------------
useEffect(() => {
  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session) {
      setUser(data.session.user);
    }
    setLoading(false);
  };

  getSession();

 const { data: authListener } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    setUser(session?.user || null);

    if (event === "PASSWORD_RECOVERY") {
      // simpan flag recovery
      localStorage.setItem("reset-mode", "active");

      // redirect HARUS dilakukan DI SINI
      window.location.replace("/reset-password");
    }
  }
);

return () => {
  authListener.subscription.unsubscribe();
};
}, []);


  // -----------------------
  // FETCH PROFILE
  // -----------------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }

      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);

  // -----------------------
  // LOGIN
  // -----------------------
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  // -----------------------
  // LOGOUT
  // -----------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // -----------------------
  // UPDATE PROFILE
  // -----------------------
  const updateProfile = async (updates) => {
    if (!user) throw new Error("User tidak ditemukan.");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    setProfile((prev) => ({ ...prev, ...updates }));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        login,
        logout,
        updateProfile, // ← sudah ditambahkan
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}