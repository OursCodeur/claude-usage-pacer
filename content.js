// Mark how much of the week has passed on Claude's weekly usage bar. We find the
// bar by its progressbar role rather than by class names (which change often),
// then read the reset day and time from the bar's own row. The weekday and the
// AM/PM words are matched in the page's language via Intl, so this works
// whatever language Claude is set to.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LOCALE = document.documentElement.lang || 'en';
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
// A normalized word with surrounding punctuation removed ("Dim." -> "dim"),
// keeping combining marks so Indic vowel signs stay attached to their letter.
const slug = (s) => norm(s).replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, '');

// Localized weekday name -> day index (0 = Sunday), for the page's language.
const WEEKDAYS = (() => {
  const map = Object.create(null);
  for (let d = 0; d < 7; d++) {
    const day = new Date(Date.UTC(2023, 0, 1 + d)); // 2023-01-01 was a Sunday
    for (const weekday of ['long', 'short'])
      map[slug(new Intl.DateTimeFormat(LOCALE, { weekday, timeZone: 'UTC' }).format(day))] = d;
  }
  return map;
})();

// The locale's AM/PM words (blank where it uses 24-hour time).
const MERIDIEM = (() => {
  const word = (h) => new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', hour12: true })
    .formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === 'dayPeriod');
  return { am: norm(word(1)?.value || ''), pm: norm(word(13)?.value || '') };
})();

// Pull "<weekday> <h>:<mm> [am/pm]" out of a row's text, in any language.
function parseReset(text) {
  const t = norm(text);
  const time = t.match(/(\d{1,2})[:.](\d{2})/); // ":" or "." separator (e.g. Indonesian)
  const dayWord = t.split(/\s+/).map(slug).find((w) => w in WEEKDAYS);
  if (!time || dayWord === undefined) return null;

  let hour = Number(time[1]);
  const pm = MERIDIEM.pm && t.includes(MERIDIEM.pm);
  if (pm || (MERIDIEM.am && t.includes(MERIDIEM.am))) hour %= 12; // 12-hour clock
  if (pm) hour += 12;
  return { day: WEEKDAYS[dayWord], hour, minute: Number(time[2]) };
}

// Fraction (0 to 1) of the current reset window that has already passed.
function weekElapsed({ day, hour, minute }) {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(hour, minute, 0, 0);
  reset.setDate(reset.getDate() - ((now.getDay() - day + 7) % 7));
  if (reset > now) reset.setDate(reset.getDate() - 7);
  return (now - reset) / WEEK_MS;
}

// The reset for a bar, but only when it comes from the bar's own row. The
// single-progressbar check keeps us from reading a neighbouring row's time.
function weeklyReset(bar) {
  for (let el = bar.parentElement; el; el = el.parentElement) {
    const reset = parseReset(el.textContent);
    if (reset) return el.querySelectorAll('[role="progressbar"]').length === 1 ? reset : null;
  }
  return null;
}

function addMarker(bar) {
  const track = bar.parentElement;
  if (track.querySelector('.cup-marker')) return;
  const reset = weeklyReset(bar);
  if (!reset) return;

  const pct = weekElapsed(reset) * 100;
  const marker = document.createElement('div');
  marker.className = 'cup-marker';
  marker.style.left = `${pct}%`;
  marker.title = `${Math.round(pct)}% of the week elapsed`;
  track.style.position = 'relative';
  track.append(marker);
}

function decorate() {
  document.querySelectorAll('[role="progressbar"][aria-label="Usage"]').forEach(addMarker);
}

// The usage panel mounts on demand and re-renders, so watch for it and redraw.
new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
decorate();
