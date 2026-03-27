/* ═══════════════════════════════════════════════════
   components.js — Shared Nav & Footer for all pages
   ═══════════════════════════════════════════════════ */

const NAV_HTML = `
<div class="topbar">
  🎓 Now enrolling for <strong>2026–27</strong> — <strong>Grade 10 & 11 students and parents:</strong> secure your spot before seats fill. <a href="contact.html" style="color:#fff;font-weight:700;text-decoration:underline;margin-left:8px">Register Now →</a>
</div>
<nav>
  <div class="nav-inner">
    <a href="index.html" class="logo">
      <img src="images/oly_logo.jpg" alt="Olympiad Global Talent" class="logo-img" />
      <div class="logo-text">
        <span class="logo-main">Olympiad Global Talent</span>
        <span class="logo-sub">College Consulting · Career Orientation</span>
      </div>
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html"    data-page="index">Home</a></li>
      <li><a href="about.html"    data-page="about">About</a></li>
      <li><a href="services.html" data-page="services">Services</a></li>
      <!-- <li><a href="resources.html" data-page="resources">Resources</a></li> -->
      <li><a href="blog.html"     data-page="blog">Blog</a></li>
      <li><a href="contact.html"  data-page="contact" class="nav-cta">Contact Us</a></li>
    </ul>
    <button class="hamburger" onclick="toggleMenu()" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo-text">
        <span class="logo-main">Olympiad Global Talent</span>
        <span class="logo-sub">College Consulting · Career Orientation</span>
      </div>
      <p>Helping ambitious students worldwide gain admission to the world's top universities and launch exceptional careers.</p>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <ul>
        <li><a href="services.html">University Application Consulting</a></li>
        <li><a href="services.html">Essay Coaching</a></li>
        <li><a href="services.html">Interview Preparation</a></li>
        <li><a href="services.html">Career Orientation</a></li>
        <li><a href="services.html">Scholarship Advising</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Navigate</h5>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="resources.html">Resources</a></li>
        <li><a href="blog.html">Blog & Insights</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h5>Get Started</h5>
      <ul>
        <li><a href="contact.html">Contact Our Team</a></li>
        <li><a href="services.html">View Services & Pricing</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 Olympiad Global Talent. All rights reserved.</span>
    <span>Built for <a href="https://olympiadglobaltalent.com" target="_blank">olympiadglobaltalent.com</a></span>
  </div>
</footer>`;

/* ── Silent analytics tracker (admin-only dashboard: /admin.html) ── */
(function(){
  if (location.pathname.includes('admin.html')) return;
  var s = document.createElement('script');
  s.src = 'js/tracker.js';
  s.async = true;
  document.head.appendChild(s);
})();

/* ── Inject nav + footer ── */
document.addEventListener('DOMContentLoaded', () => {
  const navPlaceholder    = document.getElementById('nav-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (navPlaceholder)    navPlaceholder.innerHTML    = NAV_HTML;
  if (footerPlaceholder) footerPlaceholder.innerHTML = FOOTER_HTML;

  /* Highlight the active nav link based on current filename */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const currentPage = currentFile.replace('.html', '') || 'index';
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      /* Keep CTA styling on Contact even when active */
      if (link.classList.contains('nav-cta')) link.classList.add('active');
    }
  });
});

/* ── Mobile menu toggle ── */
function toggleMenu() {
  const links = document.getElementById('nav-links');
  if (!links) return;
  const isOpen = links.style.display === 'flex';
  if (isOpen) {
    links.removeAttribute('style');
  } else {
    links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:68px;left:0;right:0;background:white;padding:20px 32px;border-bottom:2px solid var(--red);gap:4px;z-index:200;';
  }
}
