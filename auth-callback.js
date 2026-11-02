if (/(access_token|refresh_token|code)=/.test(window.location.hash + window.location.search)) {
  import("https://esm.sh/@supabase/supabase-js@2")
    .then(({ createClient }) => {
      const client = createClient(
        "https://qnmdmsxxcxwzddomwkea.supabase.co",
        "sb_publishable_2bGIWYXcOTSi_jveUCkaFw_jAXly3Z9",
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
      );
      return client.auth.getSession();
    })
    .then(({ error }) => {
      if (error) return;
      const url = new URL(window.location.href);
      url.hash = "";
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    })
    .catch(() => {});
}
