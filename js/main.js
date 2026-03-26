/* ═══════════════════════════════════
   main.js — Page-specific interactions
   ═══════════════════════════════════ */

/* ── Resource tab filter (resources.html) ── */
function filterResources(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#resource-grid .resource-item').forEach(item => {
    item.style.display = (type === 'all' || item.dataset.type === type) ? 'flex' : 'none';
  });
}
