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

/* Scroll-triggered reveals for major content blocks and visual groups. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || document.hidden || !('IntersectionObserver' in window)) return;

  var groups = [
    {
      selector: '.section-head, .webtoapp_features-head, .webtoapp_features-cta, .plan-note, .pricing-demo-notice, .pricing-final-card, .hero-caption',
      effect: 'fade'
    },
    {
      selector: '.feature-card-grid > .feature-card, .steps > .step, .use-list > li, .concept-row > .concept, .promise-grid > .promise, .plans > .plan-card, .mini-steps > li, .faq-list > .faq-item',
      effect: 'fade',
      stagger: true
    },
    {
      selector: '.dashboard-preview, .pricing-table-scroll',
      effect: 'scale'
    },
    {
      selector: '.split > .frame',
      effect: 'mask'
    },
    {
      selector: '.split:not(.split--top) > :first-child',
      effect: 'left'
    },
    {
      selector: '.split:not(.split--top) > :last-child',
      effect: 'right'
    }
  ];
  var elements = [];
  var effects = new WeakMap();
  groups.forEach(function (group) {
    document.querySelectorAll(group.selector).forEach(function (element) {
      if (effects.has(element)) return;
      effects.set(element, group);
      elements.push(element);
    });
  });
  if (!elements.length) return;

  var delayByGroup = new WeakMap();
  elements.forEach(function (element) {
    var groupConfig = effects.get(element);
    var group = element.parentElement;
    var delay = groupConfig.stagger ? delayByGroup.get(group) || 0 : 0;
    element.dataset.motion = 'reveal';
    element.dataset.motionEffect = groupConfig.effect;
    element.style.setProperty('--reveal-delay', Math.min(delay, 280) + 'ms');
    if (groupConfig.stagger) delayByGroup.set(group, delay + 65);
  });

  var remaining = elements.length;
  var observer;
  var checkFrame = 0;

  function stopFallbackCheck() {
    window.removeEventListener('scroll', scheduleCheck);
    window.removeEventListener('resize', scheduleCheck);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (checkFrame) window.cancelAnimationFrame(checkFrame);
    checkFrame = 0;
  }

  function show(element) {
    if (element.dataset.motion !== 'reveal') return;
    element.dataset.motion = 'visible';
    observer.unobserve(element);
    remaining -= 1;
    if (!remaining) stopFallbackCheck();
  }

  function checkVisible() {
    checkFrame = 0;
    if (document.hidden) return;

    elements.forEach(function (element) {
      if (element.dataset.motion !== 'reveal') return;
      var bounds = element.getBoundingClientRect();
      if (bounds.bottom >= 0 && bounds.top <= window.innerHeight) show(element);
    });
  }

  function scheduleCheck() {
    if (!checkFrame) checkFrame = window.requestAnimationFrame(checkVisible);
  }

  function onVisibilityChange() {
    if (!document.hidden) scheduleCheck();
  }

  observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -24px 0px'
  });

  elements.forEach(function (element) {
    observer.observe(element);
  });
  document.documentElement.classList.add('motion-ready');
  window.addEventListener('scroll', scheduleCheck, { passive: true });
  window.addEventListener('resize', scheduleCheck);
  document.addEventListener('visibilitychange', onVisibilityChange);
  scheduleCheck();

  document.addEventListener('focusin', function (event) {
    var target = event.target.closest('[data-motion="reveal"]');
    if (target) show(target);
  });

  var showAll = function (event) {
    if (!event.matches) return;
    elements.forEach(function (element) {
      show(element);
    });
    observer.disconnect();
    stopFallbackCheck();
  };
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', showAll);
  } else if (reduceMotion.addListener) {
    reduceMotion.addListener(showAll);
  }
})();

/* Pricing platform switcher: update the selected platform on each plan card. */
(function () {
  'use strict';

  var switcher = document.querySelector('.pricing-platform-switch');
  var label = document.querySelector('.pricing-platform-label');
  if (!switcher || !label) return;

  var buttons = switcher.querySelectorAll('button[data-platform]');
  var planLabels = document.querySelectorAll('[data-platform-plan]');
  var comparisonLabels = document.querySelectorAll('[data-platform-comparison]');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var platform = button.getAttribute('data-platform');
      if (!platform) return;

      buttons.forEach(function (option) {
        var selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      label.textContent = 'Plans for ' + platform;
      planLabels.forEach(function (planLabel) {
        planLabel.textContent = platform + ' app';
      });
      comparisonLabels.forEach(function (comparisonLabel) {
        comparisonLabel.textContent = platform;
      });
    });
  });
})();

/* Pricing competitor comparison: keep WebToApp fixed and swap the selected competitor row. */
(function () {
  'use strict';

  var switcher = document.querySelector('.competitor-switch');
  if (!switcher) return;

  var buttons = switcher.querySelectorAll('button[data-competitor]');
  var valueCells = document.querySelectorAll('[data-competitor-value]');
  var competitorLink = document.querySelector('[data-competitor-link]');
  var status = document.getElementById('competitor-selection-status');
  var competitors = {
    appilix: {
      name: 'Appilix',
      url: 'https://appilix.com/pricing',
      android: 'Included with combo',
      ios: 'Included with combo',
      bundle: 'Standard combo: 1 Android + 1 iOS app',
      price: '$229 Standard; $439 Premium combo',
      billing: 'One-time payment',
      publishing: 'Standard: self-publish; Premium: publishing service'
    },
    median: {
      name: 'Median',
      url: 'https://median.co/pricing',
      android: 'Android build platform listed',
      ios: 'iOS build platform listed',
      bundle: 'Both build platforms listed',
      price: 'Free; Starter $229 activation',
      billing: '$229 activation, then $179/year from month 12',
      publishing: 'Build tools listed; confirm publishing services'
    },
    web2native: {
      name: 'Web2Native',
      url: 'https://www.webtonative.com/pricing',
      android: '1 Android app in Starter',
      ios: '1 iOS app in Starter',
      bundle: 'Starter includes 1 Android + 1 iOS app',
      price: 'From $129/year',
      billing: 'Annual plans; tiers listed up to $999/year',
      publishing: 'Premium tier lists store publishing; build limits vary'
    },
    buildnatively: {
      name: 'BuildNatively',
      url: 'https://www.buildnatively.com/',
      android: 'Android apps supported',
      ios: 'iOS apps supported',
      bundle: 'Create iOS and Android apps',
      price: 'Free to get started; paid price not shown',
      billing: 'Paid billing terms not publicly listed',
      publishing: 'App Store approval support is advertised; confirm scope'
    }
  };

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var selectedCompetitor = button.getAttribute('data-competitor');
      var competitor = competitors[selectedCompetitor];
      if (!competitor) return;

      buttons.forEach(function (option) {
        var selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      valueCells.forEach(function (cell) {
        var value = competitor[cell.getAttribute('data-competitor-value')];
        if (value) cell.textContent = value;
      });

      if (competitorLink) {
        competitorLink.textContent = competitor.name;
        competitorLink.href = competitor.url;
      }
      if (status) {
        status.textContent = 'Comparing WebToApp with ' + competitor.name + '.';
      }
    });
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
