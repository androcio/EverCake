import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseConfig";

const ADMIN_EMAIL = "info@tartasdeautor.com";

export default function Index() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  if (email === undefined) return null;

  if (email === ADMIN_EMAIL) return <Redirect href="/tabs/perfil" />;

  return <Redirect href="/tabs/cartelera" />;
}