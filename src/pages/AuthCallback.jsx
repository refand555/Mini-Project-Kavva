import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function processHash() {
      // Proses hash (#access_token, #refresh_token, dll)
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("EXCHANGE ERROR:", error);
        // tetap redirect, nanti ResetPassword yang handle
      }

      navigate("/reset-password", { replace: true });
    }

    processHash();
  }, []);

  return <p style={{ padding: 20 }}>Loading...</p>;
}