# Publishing to the stores

Notes for putting Claude Usage Pacer on the Chrome Web Store and Firefox Add-ons. None of this is needed to use the extension; it's for whoever publishes it.

## Build the package

There's no build step. The package is a zip of the runtime files:

    zip claude-usage-pacer.zip manifest.json content.js content.css icon-16.png icon-48.png icon-128.png

`icon.svg` is the source for the PNGs and doesn't need to ship. The same zip works for both stores.

## Listing copy

Name: Claude Usage Pacer

Summary (132 characters or fewer): Marks how much of the week has elapsed on Claude's weekly usage bars, so you can pace usage before each limit resets.

Description:

Claude's weekly usage limits reset on a fixed day and time. This extension reads each reset from the settings page and marks elapsed time on every weekly bar, including the bars for All models and Fable. If a marker sits ahead of the filled bar you have room to spare; if it's behind, you're spending faster than the clock.

It runs only on claude.ai, asks for no other permissions, makes no network requests, and stores nothing. It reads the reset times already shown on the page and draws one element per weekly bar.

Category: Productivity. Language: English.

## Data and permissions

Data collected: none. In the Chrome dashboard, certify that no user data is collected.

The only access it asks for is running on claude.ai, which it needs to find and annotate the weekly usage bars. Single purpose: show how much of the week has elapsed on Claude's weekly usage limits.

## Chrome Web Store

1. Upload the zip as a new item.
2. Add at least one screenshot (1280x800 or 640x400). The usage panel with its markers works well.
3. Privacy tab:
   - Single purpose: show how much of the week has elapsed on Claude's weekly usage limit bars.
   - Host permission: the content script on claude.ai is needed to find and annotate those bars.
   - Remote code: no. Every script ships inside the package.
   - Data usage: nothing is collected; certify all three disclosures.
   - Privacy policy: https://github.com/OursCodeur/claude-usage-pacer/blob/main/PRIVACY.md

## Firefox Add-ons (AMO)

1. Upload the same zip. AMO signs it for you.
2. The add-on id and minimum Firefox version are already set in `browser_specific_settings`.
3. No privacy policy is required, since nothing is collected.
