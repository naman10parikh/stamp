// cockpit/app.js — stamp cockpit SPA (vanilla JS, zero framework; PLAN §10).
// Four views (brain / runs / evals / ask). Each fetches its own JSON endpoint and renders.
// The ask-the-employee view is the load-bearing one (G2): it must render the gap report
// (never the word "compliant") and the badge handoff (the mechanism→badge boundary, visible).

// ── tiny DOM helpers ──────────────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
// Escape text so brain markdown / CLI output can never inject HTML into the page.
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
async function getJson(url) {
  const r = await fetch(url);
  const data = await r.json().catch(() => ({ error: `bad JSON from ${url}` }));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

// ── nav ──────────────────────────────────────────────────────────────────────────────
const loaded = {}; // lazy-load each view once
function showView(name) {
  $$(".view").forEach((v) => v.classList.add("hidden"));
  $("#view-" + name).classList.remove("hidden");
  $$("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  if (!loaded[name]) {
    loaded[name] = true;
    if (name === "brain") loadBrain();
    if (name === "runs") loadRuns();
    if (name === "evals") loadEvals();
    if (name === "ask") setupAsk();
  }
}
$$("#nav button").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

// ── view 1: brain browser ──────────────────────────────────────────────────────────────
async function loadBrain() {
  try {
    const { files } = await getJson("/api/brain");
    const list = $("#brain-list");
    list.innerHTML = "";
    files.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "file" + (f.present ? "" : " faint");
      btn.innerHTML = `<span class="fname">${esc(f.name)}</span>${esc(f.title)}`;
      btn.addEventListener("click", () => {
        $$(".brain-list .file").forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
        openBrainFile(f.name);
      });
      list.appendChild(btn);
    });
    // open the first one by default so the view is never empty
    if (files[0]) {
      list.firstChild.classList.add("active");
      openBrainFile(files[0].name);
    }
  } catch (err) {
    $("#brain-list").innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}
async function openBrainFile(name) {
  const pane = $("#brain-content");
  pane.innerHTML = '<span class="loading">loading…</span>';
  try {
    const { markdown } = await getJson("/api/brain/file?name=" + encodeURIComponent(name));
    pane.innerHTML = `<pre>${esc(markdown)}</pre>`;
    pane.scrollTop = 0;
  } catch (err) {
    pane.innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}
async function runBrainSearch() {
  const q = $("#brain-q").value.trim();
  const out = $("#brain-results");
  if (!q) {
    out.innerHTML = "";
    return;
  }
  out.innerHTML = '<span class="loading">searching the brain (BM25)…</span>';
  try {
    const { hits } = await getJson("/api/brain/search?q=" + encodeURIComponent(q));
    if (!hits.length) {
      out.innerHTML = `<div class="card muted">No brain hits for "${esc(q)}".</div>`;
      return;
    }
    out.innerHTML =
      '<div class="card"><h3>BM25 hits</h3>' +
      hits
        .map(
          (h) =>
            `<div class="hit"><span class="f">${esc(h.file)}</span><span class="s">score ${esc(
              h.score,
            )}</span>${h.cite ? `<div class="c">↳ ${esc(h.cite)}</div>` : ""}</div>`,
        )
        .join("") +
      "</div>";
  } catch (err) {
    out.innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}
$("#brain-search-btn").addEventListener("click", runBrainSearch);
$("#brain-q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") runBrainSearch();
});

// ── view 2: run log ──────────────────────────────────────────────────────────────────────
async function loadRuns() {
  try {
    const { summary, recent } = await getJson("/api/runs");
    const stats = $("#runs-stats");
    if (summary) {
      stats.innerHTML = [
        ["total", summary.total],
        ["ok", summary.ok],
        ["error", summary.error],
        ["unattributed", summary.unattributed],
      ]
        .map(([l, n]) => `<div class="stat"><div class="n">${esc(n)}</div><div class="l">${l}</div></div>`)
        .join("");
    } else {
      stats.innerHTML = '<span class="faint">no aggregate (runs-view unavailable)</span>';
    }
    const tb = $("#runs-tbody");
    if (!recent.length) {
      tb.innerHTML = '<tr><td colspan="7" class="faint">no runs yet — invoke the CLI to populate logs/runs.jsonl</td></tr>';
      return;
    }
    tb.innerHTML = recent
      .map((r) => {
        const t = (r.ts || "").replace("T", " ").replace(/\..*$/, "");
        const ok = r.outcome === "ok";
        return `<tr>
          <td class="mono">${esc(t)}</td>
          <td class="cmd">${esc(r.cmd)}</td>
          <td>${esc(r.jtbd)}</td>
          <td class="mono faint">${esc(r.model)}</td>
          <td>${esc(r.duration_ms)}</td>
          <td class="${ok ? "ok" : "err"}">${esc(r.outcome)}</td>
          <td class="owner">${esc(r.human_owner)}</td>
        </tr>`;
      })
      .join("");
  } catch (err) {
    $("#runs-tbody").innerHTML = `<tr><td colspan="7"><div class="error-box">${esc(err.message)}</div></td></tr>`;
  }
}

// ── view 3: eval scores ──────────────────────────────────────────────────────────────────
async function loadEvals() {
  const body = $("#evals-body");
  try {
    const e = await getJson("/api/eval");
    const gateCls = e.gate === "green" ? "green" : e.gate === "red" ? "red" : "unknown";
    const l1html =
      `<ul class="checklist">` +
      e.l1.map((a) => `<li class="${a.ok ? "" : "fail"}">${esc(a.name)}</li>`).join("") +
      `</ul>`;
    const l2html =
      `<div class="task-grid">` +
      e.l2
        .map(
          (g) =>
            `<span class="task ${g.ok ? "pass" : "fail"}">${esc(g.id)} F1=${esc(g.f1)}${
              g.ci_block ? '<span class="ci">CI</span>' : ""
            }</span>`,
        )
        .join("") +
      `</div>`;
    body.innerHTML = `
      <div class="card">
        <h3>The gate
          <span class="gate-badge ${gateCls}" style="margin-left:10px">${esc((e.gate || "?").toUpperCase())}</span>
        </h3>
        <p class="muted">pass <span class="green">${esc(e.pass)}</span> / fail <span class="${
          e.fail ? "red" : "green"
        }">${esc(e.fail)}</span> &nbsp;·&nbsp; exit ${esc(e.exit_code)} &nbsp;·&nbsp;
          golden: ${esc(e.golden.total)} tasks (${esc(e.golden.ci_blocking)} CI-blocking, F1 ≥ ${esc(
            e.golden.threshold,
          )})</p>
        ${e.l3_note ? `<p class="faint">${esc(e.l3_note)}</p>` : ""}
      </div>
      <div class="card"><h3>L1 — structural assertions</h3>${l1html}</div>
      <div class="card"><h3>L2 — golden tasks</h3>${l2html}</div>`;
  } catch (err) {
    body.innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}

// ── view 4: ask the employee ─────────────────────────────────────────────────────────────
function setupAsk() {
  const verbSel = $("#ask-verb");
  const extra = $("#ask-extra");
  // verb-specific controls
  function renderExtra() {
    const v = verbSel.value;
    if (v === "audit") {
      extra.innerHTML = `<select id="ask-framework">
        <option value="soc2">SOC 2</option><option value="iso27001">ISO 27001</option><option value="gdpr">GDPR</option>
      </select>`;
    } else if (v === "sso-plan") {
      extra.innerHTML = `<input type="number" id="ask-acv" placeholder="ACV ($)" value="300000" style="width:140px" />`;
    } else if (v === "advise") {
      extra.innerHTML = `<select id="ask-on">
        <option value="grc-platform">grc-platform</option><option value="privacy">privacy</option>
        <option value="pentest">pentest</option><option value="residency">residency</option><option value="repos">repos</option>
      </select>`;
    }
  }
  verbSel.addEventListener("change", renderExtra);
  renderExtra();
  $("#ask-btn").addEventListener("click", ask);
}

async function ask() {
  const v = $("#ask-verb").value;
  const out = $("#ask-answer");
  out.innerHTML = `<span class="loading">stamp is thinking (running \`stamp ${esc(v)}\`)…</span>`;
  let url = "/api/ask?verb=" + encodeURIComponent(v);
  if (v === "audit") url += "&framework=" + encodeURIComponent($("#ask-framework").value);
  if (v === "sso-plan") url += "&acv=" + encodeURIComponent($("#ask-acv").value || "300000");
  if (v === "advise") url += "&on=" + encodeURIComponent($("#ask-on").value);
  try {
    const { result } = await getJson(url);
    if (v === "audit") return renderAudit(out, result);
    if (v === "sso-plan") return renderSso(out, result);
    if (v === "advise") return renderAdvise(out, result);
  } catch (err) {
    out.innerHTML = `<div class="error-box">${esc(err.message)}</div>`;
  }
}

function renderAudit(out, r) {
  const findings = (r.findings || [])
    .map(
      (f) => `<div class="finding ${esc(f.severity)}">
        <span class="ctrl">${esc(f.control)}</span><span class="sev">${esc(f.severity)}</span>
        <div class="gap">${esc(f.evidence_gap)}</div>
        <div class="fix">→ ${esc(f.fix)}</div>
        <div class="cite">${esc(f.brain_cite)}</div>
      </div>`,
    )
    .join("");
  // Note: stamp's audit JSON never contains the word "compliant" except inside the disclaimer's
  // "readiness is not certification" framing — we surface that disclaimer verbatim so the
  // never-claim-compliant creed is visible to the chairman.
  out.innerHTML = `
    <div class="card">
      <h3>SOC 2 readiness — gap report</h3>
      <p class="muted">framework <span class="amber">${esc(r.framework)}</span> ·
        target <span class="mono">${esc(r.target)}</span> ·
        ${esc(r.controls_checked)} controls checked</p>
      ${findings}
      <p class="muted"><b>${esc(r.readiness_summary)}</b></p>
      <div class="disclaimer-line">${esc(r.disclaimer)}</div>
    </div>`;
}

function renderSso(out, r) {
  const checklist = (r.buyer_readiness_checklist || [])
    .map((c) => `<li>${esc(c)}</li>`)
    .join("");
  const wiring = (r.workos_wiring_plan || []).map((c) => `<li>${esc(c)}</li>`).join("");
  const proof = (r.deprovisioning_proof_spec || []).map((c) => `<li>${esc(c)}</li>`).join("");
  out.innerHTML = `
    <div class="card">
      <h3>Enterprise-SSO program plan</h3>
      <p class="muted"><b>${esc(r.trigger_decision)}</b></p>
      <!-- the load-bearing boundary: the MECHANISM is handed to badge, NO auth code emitted -->
      <div class="badge-handoff">
        <span class="label">mechanism → badge handoff</span>
        <code>${esc(r.badge_handoff)}</code>
      </div>
      <p class="faint">${esc(r.boundary_note)}</p>
      <h3 style="margin-top:16px">Buyer-readiness checklist</h3>
      <ul class="checklist">${checklist}</ul>
      <h3 style="margin-top:16px">WorkOS wiring plan (the program — badge implements)</h3>
      <ul class="checklist">${wiring}</ul>
      <h3 style="margin-top:16px">Deprovisioning proof spec</h3>
      <ul class="checklist">${proof}</ul>
      <div class="disclaimer-line">${esc(r.sso_tax_stance)}</div>
    </div>`;
}

function renderAdvise(out, r) {
  out.innerHTML = `
    <div class="card">
      <h3>advise — ${esc(r.on)}</h3>
      <p class="gap">${esc(r.recommendation)}</p>
      <h3 style="margin-top:14px">The honest cost</h3>
      <p class="muted">${esc(r.honest_cost)}</p>
      <p class="faint" style="margin-top:10px">${esc(r.boundary_note)}</p>
      <div class="disclaimer-line">${esc(r.caveat)} · ${esc(r.brain_cite)}</div>
    </div>`;
}

// boot: open the default view
showView("brain");
