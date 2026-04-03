// Runs on magiclink.reneebe.workers.dev — syncs the token from
// the page's localStorage into chrome.storage.local so the
// extension popup can detect demo mode automatically.
const token = localStorage.getItem("magiclink_token");
if (token) {
  chrome.storage.local.set({ magiclink_token: token });
}
