/* =========================================================================
   CONFIGURE THESE THREE VALUES for your repository — this is the ONLY
   place you need to edit them. Both /admin/index.html (homepage photos)
   and /admin/products.html (product catalog) load this file.
   ========================================================================= */
window.TS_ADMIN_CONFIG = {
  OWNER: "YOUR-GITHUB-USERNAME-OR-ORG",
  REPO: "YOUR-REPO-NAME",
  BRANCH: "main"
};
/* ========================================================================= */

const TS_API = "https://api.github.com";

function tsGetToken() {
  return localStorage.getItem("ts_admin_token") || "";
}
function tsSetToken(token) {
  localStorage.setItem("ts_admin_token", token);
}
function tsClearToken() {
  localStorage.removeItem("ts_admin_token");
}

function tsRepoBase() {
  const { OWNER, REPO } = window.TS_ADMIN_CONFIG;
  return `${TS_API}/repos/${OWNER}/${REPO}/contents`;
}

async function tsGhGet(path) {
  const { BRANCH } = window.TS_ADMIN_CONFIG;
  const res = await fetch(`${tsRepoBase()}/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${tsGetToken()}`, Accept: "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

async function tsGhPut(path, contentBase64, sha, message) {
  const { BRANCH } = window.TS_ADMIN_CONFIG;
  const body = { message, content: contentBase64, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${tsRepoBase()}/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tsGetToken()}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} failed (${res.status})`);
  return res.json();
}

async function tsGhDelete(path, sha, message) {
  const { BRANCH } = window.TS_ADMIN_CONFIG;
  const res = await fetch(`${tsRepoBase()}/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${tsGetToken()}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, sha, branch: BRANCH })
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed (${res.status})`);
}

function tsB64FromDataUrl(dataUrl) {
  return dataUrl.split(",")[1];
}

async function tsLoadJson(path) {
  const file = await tsGhGet(path);
  const json = JSON.parse(decodeURIComponent(escape(atob(file.content))));
  return { entries: json, sha: file.sha };
}

async function tsSaveJson(path, entries, sha, message) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(entries, null, 2))));
  return tsGhPut(path, encoded, sha, message);
}

function tsReadFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
