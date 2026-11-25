// Client-side navigation guard. Database security is enforced separately by RLS.
(async () => {
  const client = window.supabaseClient;
  if (!client) {
    location.replace("login.html?next=dashboard.html");
    return;
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    location.replace("login.html?next=dashboard.html");
    return;
  }
  const { data: roles, error: roleError } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);
  if (roleError || !roles || !roles.some(item => ["member", "buyer", "seller", "admin"].includes(item.role))) {
    await client.auth.signOut();
    location.replace("login.html?next=dashboard.html");
    return;
  }
  document.documentElement.dataset.authenticated = "true";
  document.body.style.display = "";
  const label = document.getElementById("signedInAs");
  if (label) label.textContent = data.user.email || "کاربر واردشده";
  const logout = document.getElementById("logoutButton");
  if (logout) logout.addEventListener("click", async () => {
    await client.auth.signOut();
    location.replace("index.html");
  });
})();
