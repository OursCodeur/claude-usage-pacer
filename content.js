// Mark elapsed weekly time on Claude's usage meters. Semantic roles avoid
// Claude's generated class names, and each meter's row supplies its reset time.
// Intl supplies weekday and AM/PM names in the page locale.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LOCALE = document.documentElement.lang || 'en';
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
// A normalized word with surrounding punctuation removed ("Dim." -> "dim"),
// keeping combining marks so Indic vowel signs stay attached to their letter.
const slug = (s) => norm(s).replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, '');
const USAGE_METER_SELECTOR = [
  '[role="progressbar"][aria-label="Usage"]',
  '[role="meter"]',
].join(', ');

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

// Fraction (0 to 1) of the weekly window already elapsed, from a "<weekday> <time>" reset.
function weekElapsed(day, hour, minute) {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(hour, minute, 0, 0);
  reset.setDate(reset.getDate() - ((now.getDay() - day + 7) % 7));
  if (reset > now) reset.setDate(reset.getDate() - 7);
  return (now - reset) / WEEK_MS;
}

// Read a row's reset label into the fraction of the week elapsed. Claude shows
// the weekly reset as a weekday and time, then as a "Resets in X hr Y min"
// countdown in the final day. `relative` flags that countdown, which the session
// bar also uses, so weeklyReset can keep the session out.
function parseReset(text) {
  const t = norm(text);
  const time = t.match(/(\d{1,2})[:.](\d{2})/); // ":" or "." separator (e.g. Indonesian)
  const dayWord = t.split(/\s+/).map(slug).find((w) => w in WEEKDAYS);

  if (time && dayWord !== undefined) {
    let hour = Number(time[1]);
    const pm = MERIDIEM.pm && t.includes(MERIDIEM.pm);
    if (pm || (MERIDIEM.am && t.includes(MERIDIEM.am))) hour %= 12; // 12-hour clock
    if (pm) hour += 12;
    return { elapsed: weekElapsed(WEEKDAYS[dayWord], hour, Number(time[2])), relative: false };
  }

  if (!time) {
    // Countdown: the numbers are hours and minutes, or just minutes under an hour.
    const nums = t.replace(/\d+\s*%/g, ' ').match(/\d+/g);
    if (nums) {
      const minutes = nums.length > 1 ? Number(nums[0]) * 60 + Number(nums[1]) : Number(nums[0]);
      return { elapsed: 1 - (minutes * 60 * 1000) / WEEK_MS, relative: true };
    }
  }
  return null;
}

// A reset must come from the meter's own row. During the final-day countdown,
// session and weekly rows both use relative text. The session meter comes first;
// plans with several weekly limits also group those meters in one section.
function weeklyReset(meter) {
  for (let el = meter.parentElement; el; el = el.parentElement) {
    const reset = parseReset(el.textContent);
    if (!reset) continue;
    if (el.querySelectorAll(USAGE_METER_SELECTOR).length !== 1) return null;
    const grouped = (meter.closest('section')?.querySelectorAll(USAGE_METER_SELECTOR).length ?? 0) > 1;
    const followsSession = meter !== document.querySelector(USAGE_METER_SELECTOR);
    return reset.relative && !grouped && !followsSession ? null : reset;
  }
  return null;
}

function addMarker(meter) {
  const track = meter.parentElement;
  if (track.querySelector('.cup-marker')) return;
  const reset = weeklyReset(meter);
  if (!reset) return;

  const pct = reset.elapsed * 100;
  const marker = document.createElement('div');
  marker.className = 'cup-marker';
  marker.style.left = `${pct}%`;
  marker.title = `${Math.round(pct)}% of the week elapsed`;
  track.style.position = 'relative';
  track.append(marker);
}

function decorate() {
  document.querySelectorAll(USAGE_METER_SELECTOR).forEach(addMarker);
}

// The usage panel mounts on demand and re-renders, so watch for it and redraw.
new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
decorate();
