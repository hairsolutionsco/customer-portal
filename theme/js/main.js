(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  // Optional: CMS serverless smoke (GET). Path is account-specific; set after first successful deploy.
  // Example pattern: /_hcms/api/<HUB_ID>/portal-api/ping — see Design Manager → portal-api.functions
  var ping = document.body.getAttribute('data-portal-serverless-ping');
  if (ping) {
    fetch(ping, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) document.body.setAttribute('data-portal-api-ok', '1');
      })
      .catch(function () {});
  }

  var sidebar = qs('[data-portal-sidebar]');
  var toggle = qs('[data-sidebar-toggle]');
  var overlay = qs('[data-portal-overlay]');

  function setSidebarOpen(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    if (overlay) {
      overlay.classList.toggle('is-visible', open);
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = toggle.querySelector('[data-sidebar-toggle-label]');
      if (label) {
        label.textContent = open ? 'Close navigation menu' : 'Open navigation menu';
      }
    }
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

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') setSidebarOpen(false);
  });

  var mqDesktop = window.matchMedia('(min-width: 1024px)');
  function onViewportChange() {
    if (mqDesktop.matches) setSidebarOpen(false);
  }
  if (typeof mqDesktop.addEventListener === 'function') {
    mqDesktop.addEventListener('change', onViewportChange);
  } else if (typeof mqDesktop.addListener === 'function') {
    mqDesktop.addListener(onViewportChange);
  }

  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  qsa('[data-nav-link]').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) {
        return;
      }
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
          var show = p.getAttribute('data-tab-panel') === id;
          p.hidden = !show;
          p.setAttribute('aria-hidden', show ? 'false' : 'true');
        });
      });
    });
  });
})();
