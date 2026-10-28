/* WebToApp site behaviour: mobile menu and local website address check.
   This file makes no network requests. The hero form only validates the
   address format; it does not submit the address or start app setup. */
(function () {
  'use strict';

  // ---- Mobile navigation -------------------------------------------------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenuOpen(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenuOpen(!nav.classList.contains('open'));
    });

    // Close the menu after choosing a link inside it.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenuOpen(false);
      }
    });

    // Escape closes the menu and returns focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    // Reset the mobile state when the layout becomes desktop-width.
    var desktop = window.matchMedia('(min-width: 901px)');
    var onLayoutChange = function (event) {
      if (event.matches) setMenuOpen(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', onLayoutChange);
    } else if (desktop.addListener) {
      desktop.addListener(onLayoutChange);
    }
  }

  // ---- Website address check (hero form) -------------------------------
  var form = document.getElementById('convert-form');
  var input = document.getElementById('website-url');
  var statusEl = document.getElementById('form-status');

  if (!form || !input || !statusEl) return;

  var MESSAGES = {
    empty: 'Enter your website address to continue.',
    noScheme: 'Add https:// at the start, for example https://yourwebsite.com.',
    invalid: 'Enter a full address that starts with https:// and includes a domain, such as https://yourwebsite.com.',
    valid: 'This address is formatted correctly. Nothing has been sent, and app setup is not connected yet.'
  };

  function isWebAddress(value) {
    try {
      var url = new URL(value);
      return (url.protocol === 'http:' || url.protocol === 'https:') &&
        url.hostname.indexOf('.') > 0 &&
        !/\s/.test(value);
    } catch (err) {
      return false;
    }
  }

  // A bare domain such as "yourwebsite.com" is a common input; point to the fix.
  function looksLikeBareDomain(value) {
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(value);
  }

  function showStatus(text, state) {
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (state ? ' ' + state : '');
  }

  function setInvalid(isInvalid) {
    input.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
    form.classList.toggle('is-error', isInvalid);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();

    if (!value) {
      setInvalid(true);
      showStatus(MESSAGES.empty, 'error');
      input.focus();
      return;
    }

    if (!isWebAddress(value)) {
      setInvalid(true);
      showStatus(looksLikeBareDomain(value) ? MESSAGES.noScheme : MESSAGES.invalid, 'error');
      input.focus();
      return;
    }

    setInvalid(false);
    showStatus(MESSAGES.valid, 'ok');
  });

  // Clear the message as the person edits, so stale errors do not linger.
  input.addEventListener('input', function () {
    if (statusEl.textContent) {
      setInvalid(false);
      showStatus('', '');
    }
  });
})();

/* Hero animation: scale the composition to its container and pause it
   when the hero is off-screen or the tab is hidden. Animation itself is
   CSS-only; reduced-motion users get a static layout from theme.css. */
(function () {
  'use strict';

  var demo = document.querySelector('.flow-demo');
  if (!demo) return;

  var DESIGN_WIDTH = 648; // 600px stage plus a 24px frame on each side

  function fit() {
    var scale = Math.min(1, demo.clientWidth / DESIGN_WIDTH);
    demo.style.setProperty('--fd-scale', scale.toFixed(4));
  }

  fit();
  if ('ResizeObserver' in window) {
    new ResizeObserver(fit).observe(demo);
  } else {
    window.addEventListener('resize', fit);
  }

  var offScreen = false;
  var hidden = document.hidden;

  function applyPause() {
    demo.classList.toggle('is-paused', offScreen || hidden);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      offScreen = !entries[0].isIntersecting;
      applyPause();
    }).observe(demo);
  }

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    applyPause();
  });
})();
