const client = window.supabaseClient;

const loginForm = document.getElementById("authForm");
const message = document.getElementById("authMessage");
const submitButton = document.getElementById("authSubmit");
const modeButtons = document.querySelectorAll("[data-auth-mode]");
let mode = "signin";

function setMessage(text, error = false) {
  message.textContent = text;
  message.dataset.error = error ? "true" : "false";
}
modeButtons.forEach(button => button.addEventListener("click", () => {
  mode = button.dataset.authMode;
  modeButtons.forEach(item => item.classList.toggle("active", item === button));
  document.getElementById("displayNameField").hidden = mode !== "signup";
  submitButton.textContent = mode === "signup" ? "ساخت حساب کاربری" : "ورود به حساب";
  setMessage("");
}));

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  submitButton.disabled = true;
  setMessage("در حال ارتباط با سامانه...");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  let result;

  if (mode === "signup") {
    const displayName = document.getElementById("displayName").value.trim();
    result = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
  } else {
    result = await client.auth.signInWithPassword({ email, password });
  }

  submitButton.disabled = false;
  if (result.error) {
    setMessage("خطا: " + result.error.message, true);
    return;
  }

  if (mode === "signup" && !result.data.session) {
    setMessage("حساب ساخته شد. ایمیل خود را برای تأیید باز کنید؛ سپس وارد شوید.");
    return;
  }

  const next = new URLSearchParams(location.search).get("next");
  location.replace(next === "index.html" ? "index.html" : "dashboard.html");
});

(async () => {
  const { data } = await client.auth.getUser();
  if (data.user) location.replace("dashboard.html");
})();
