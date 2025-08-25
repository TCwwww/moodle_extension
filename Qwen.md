# Moodle Download Renamer - Project Notes

## Overview
This Chromium extension automatically prefixes downloaded files from Moodle with the course code and resource name extracted from the page.

## Key Components

### manifest.json
- Manifest version 3
- Declares permissions: downloads, storage
- Host permission for moodle.hku.hk
- Background service worker: background.js
- Content script: content.js

### content.js
- Extracts course code from document.title (HTML title tag) only
- Extracts resource names from activity instances with "instancename" class
- Uses a more permissive regex pattern /([A-Z]{2,6}\d{3,4})/ to match course codes
- Sends both course code and resource information to background script
- Includes console logging for debugging
- Properly handles message responses to prevent errors

### background.js
- Receives course codes and resource info via chrome.runtime.onMessage
- Listens to download events with chrome.downloads.onDeterminingFilename
- Renames downloads by prefixing with course code and resource name
- Sanitizes filenames by removing illegal characters
- Improved logic to prevent duplicate prefixes
- Better error handling and debugging information
- Stores course codes by both tab ID and URL for better access
- Stores resource information for enhanced filename creation
- Uses referrer information to match downloads to course pages and resources
- Includes cleanup mechanism for old stored data

## Development Notes

### Course Code Extraction
The extension looks for course codes in the HTML title tag using a regex pattern /([A-Z]{2,6}\d{3,4})/ which is more permissive than the previous pattern.

### Resource Name Extraction
The extension looks for elements with the "instancename" class within activity instances to extract resource names. This provides context about what the downloaded file represents.

### File Renaming Process
1. Intercept download event
2. Verify it's from moodle.hku.hk
3. Try to retrieve course code and resource name using multiple methods:
   - From tab ID (direct association)
   - From referrer URL (where the download was initiated)
   - From stored URLs that match the referrer pattern
   - From any stored Moodle URL as a last resort
4. Create enhanced filename with both course code and resource name when available
5. Check if filename already starts with the course code
6. Clean original filename (replace underscores with spaces)
7. Sanitize for illegal characters
8. Prefix with course code and resource name if not already present
9. Apply uniquify conflict action

### Improved Logic
- Prevents duplicate prefixes (e.g., avoids "CIVL2112 CIVL2112 2024.pdf")
- Checks if filename already starts with the course code
- Uses original filename if course code is found in the filename
- Better fallback handling when course codes can't be extracted
- Multiple lookup methods for course codes and resource names to handle different download scenarios
- Enhanced filename creation that includes both course context and resource context

### Storage Strategy
- Stores course codes by tab ID for direct association
- Also stores by URL for broader access
- Stores resource information by page URL
- Includes timestamps for cleanup of old entries
- Automatic cleanup every 5 minutes of entries older than 30 minutes

### Error Handling
Try/catch blocks in download listener to prevent extension crashes on rename errors.
Fallback to original filename on error.
Extensive console logging for debugging purposes.
Proper message response handling to prevent port closure errors.

## Testing
- Navigate to a Moodle course page with a recognizable course code in the title
- Download a file from that page
- Verify the downloaded file has the correct course code and resource name in the filename
- Test with files that already contain course codes in their names

## Debugging
- Check console logs in the content script (accessible via DevTools on Moodle pages)
- Check console logs in the background script (accessible via chrome://extensions)
- Look for detailed messages about course code extraction, resource name extraction, and file renaming
- Pay attention to referrer information which helps match downloads to course pages
- Look for resource matching information in the download process logs

## Possible Improvements
1. Add options page to customize naming format
2. Support for multiple Moodle instances
3. More sophisticated regex patterns for course code matching
4. User feedback when renaming occurs
5. Logging of renaming actions for debugging
6. Better handling of edge cases in URL matching
7. Support for other resource types beyond files
8. Option to use only course code, only resource name, or both in filename