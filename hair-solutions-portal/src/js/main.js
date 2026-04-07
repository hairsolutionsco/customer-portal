(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  var sidebar = qs('[data-portal-sidebar]');
  var toggle = qs('[data-sidebar-toggle]');
  var overlay = qs('[data-portal-overlay]');

  function setSidebarOpen(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    if (overlay) overlay.classList.toggle('is-visible', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !sidebar.classList.contains('is-open');
      setSidebarOpen(open);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      setSidebarOpen(false);
    });
  }

  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  qsa('[data-nav-link]').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    try {
      var u = new URL(href, window.location.origin);
      var p = u.pathname.replace(/\/+$/, '') || '/';
      if (p === path || (path !== '/portal' && path.indexOf(p) === 0 && p !== '/portal')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      }
    } catch (e) {}
  });

  qsa('[data-dismiss-alert]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = btn.closest('[data-alert]');
      if (el) el.hidden = true;
    });
  });

  qsa('[data-settings-tabs]').forEach(function (root) {
    var tabs = qsa('[data-tab]', root);
    var panels = qsa('[data-tab-panel]', root);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-tab-panel') !== id;
        });
      });
    });
  });
})();
