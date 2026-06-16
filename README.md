# Claude Usage Pacer

A tiny browser extension that marks how much of the week has already passed on Claude's weekly usage bar, so you can tell at a glance whether you're on track to run out before the limit resets.

If 40% of the week has gone by but you've already used 60% of your weekly limit, you're burning through it too fast. The extension makes that comparison instant: usage is the filled bar, time elapsed is the small marker above it.

Works in Brave, Chrome, Edge, Opera, and Firefox.

## How it works

Claude's settings show a weekly "All models" limit that resets on a fixed day and time (for example, "Resets Sun 6:00 AM"). The extension reads that reset label (in whatever language Claude is set to), works out how far into the current week you are, and draws a marker at that spot on the bar. Nothing is stored or sent anywhere.

## Install

- **Chrome, Brave, Edge, Opera:** [Chrome Web Store](https://chromewebstore.google.com/detail/claude-usage-pacer/nmkemfcdgopjkbichkplkhfnbckajigh)
- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/claude-usage-pacer/)

Then open Claude's settings → Usage, and the marker shows up on the weekly bar.

### From source

There's no build step, so you can also load it straight from this repo. Download or clone it (or grab the zip from the [latest release](https://github.com/OursCodeur/claude-usage-pacer/releases/latest) and unzip it), then:

**Brave / Chrome / Edge / Opera**

1. Open `brave://extensions` (or `chrome://extensions`, `edge://extensions`).
2. Turn on Developer mode.
3. Click "Load unpacked" and pick the repo folder.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on" and pick `manifest.json`.

Firefox drops temporary add-ons when it restarts, so you'll need to load it again after a restart.

## Permissions and privacy

The extension runs only on `claude.ai`, asks for no other permissions, makes no network requests, and collects nothing. It reads the reset time already shown on the page and draws a single element. That's the whole thing.

## License

MIT. See [LICENSE](LICENSE).
