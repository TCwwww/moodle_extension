# Moodle Download Renamer

A Chromium extension that automatically prefixes downloaded files from Moodle with the course code and resource name.

## Features

- Automatically detects course codes from Moodle page titles (HTML `<title>` tag)
- Extracts resource names from Moodle activity instances
- Renames downloaded files to include both course code and resource name
- Works specifically with https://moodle.hku.hk
- Clean, conflict-free file naming
- Prevents duplicate prefixes (intelligent renaming)
- Fallback handling for edge cases

## How It Works

1. When you visit a Moodle course page, the extension extracts:
   - The course code from the HTML title tag (e.g., "CIVL1113")
   - Resource names from activity instances (e.g., "ComplexTrussTextbookExample")
2. When you download a file from Moodle, the extension intercepts the download
3. The downloaded file is automatically renamed to include both the course code and resource name

### Example

Before: `document.pdf`
After: `CIVL2112 ComplexTrussTextbookExample document.pdf`

If the file already contains the course code: `CIVL2112 lecture1.pdf`
After: `CIVL2112 lecture1.pdf` (no change, prevents duplication)

## Installation

1. Clone or download this repository
2. Open Chrome/Chromium and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will be active when visiting Moodle

## Permissions

- `downloads`: To intercept and rename downloaded files
- `storage`: To temporarily store course codes and resource information
- `https://moodle.hku.hk/*`: To access Moodle course pages

## Technical Details

The extension consists of:

1. **Content Script** (`content.js`): Extracts course codes and resource information from the HTML title and activity instances
2. **Background Script** (`background.js`): Intercepts downloads and renames files intelligently using both course codes and resource names
3. **Manifest** (`manifest.json`): Configuration and permissions

## Debugging

If you're experiencing issues with the renaming:

1. Open Chrome DevTools (F12) on a Moodle page
2. Check the console for messages about course code and resource extraction
3. When downloading a file, check the background script console for messages

To access the background script console:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Find "Moodle Download Renamer" and click "Inspect views: service worker"

## Supported Platforms

- Chrome
- Chromium
- Edge (Chromium-based)
- Brave
- Other Chromium-based browsers

## Limitations

- Only works with https://moodle.hku.hk
- Requires JavaScript to be enabled
- Course codes must be in the title tag in a format similar to 2-6 uppercase letters followed by 3-4 digits
- Resource names are extracted from elements with the "instancename" class# moodle_extension
