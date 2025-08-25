# Moodle Download Renamer

A Chromium extension that automatically prefixes files downloaded from Moodle with the corresponding course code and resource name.

## Features
- Detects course codes from the page title
- Extracts resource names from Moodle activity instances
- Renames downloads to include both pieces of information
- Works exclusively with https://moodle.hku.hk
- Prevents duplicate prefixes and sanitizes filenames

## How it works
1. **Content script** (`content.js`) runs on Moodle pages and gathers the course code and resource names.
2. It sends this information to the **background script** (`background.js`).
3. When a file is downloaded, the background script renames it using the stored course code and resource name.

## Installation
1. Clone or download this repository.
2. In Chrome/Chromium, open `chrome://extensions`.
3. Enable *Developer mode*.
4. Choose *Load unpacked* and select this directory.

## Debugging
If renaming doesn't work:
1. Open DevTools on a Moodle page and check the console.
2. Inspect the service worker from `chrome://extensions` for background messages.

## Permissions
- `downloads`: rename files as they are saved
- `storage`: temporarily store course and resource info
- `https://moodle.hku.hk/*`: access Moodle content

## Supported browsers
Chrome, Chromium, Edge, Brave, and other Chromium-based browsers.

## Limitations
- Only supports `moodle.hku.hk`.
- Course code must appear in the page title.
- Resource names are extracted from elements with the `instancename` class.
