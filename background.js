// Store course codes with timestamps for cleanup
let courseCodesByTab = {};
let courseCodesByUrl = {};
let resourcesByUrl = {};

console.log("Background script loaded");

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const expiryTime = 30 * 60 * 1000; // 30 minutes
  
  // Clean up tab entries
  for (let tabId in courseCodesByTab) {
    if (now - courseCodesByTab[tabId].timestamp > expiryTime) {
      delete courseCodesByTab[tabId];
    }
  }
  
  // Clean up URL entries
  for (let url in courseCodesByUrl) {
    if (now - courseCodesByUrl[url].timestamp > expiryTime) {
      delete courseCodesByUrl[url];
    }
  }
  
  // Clean up resource entries
  for (let url in resourcesByUrl) {
    if (now - resourcesByUrl[url].timestamp > expiryTime) {
      delete resourcesByUrl[url];
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Receive course code and resource info from content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received in background script: ", msg);
  
  if (sender.tab) {
    const tabId = sender.tab.id;
    const url = sender.tab.url;
    
    if (msg.type === "PAGE_INFO") {
      // Store course code by tab ID
      if (msg.courseCode) {
        courseCodesByTab[tabId] = {
          courseCode: msg.courseCode,
          timestamp: Date.now()
        };
        
        // Also store by URL for broader access
        if (url) {
          courseCodesByUrl[url] = {
            courseCode: msg.courseCode,
            timestamp: Date.now()
          };
        }
        
        console.log("Course code stored for tab " + tabId + ": " + msg.courseCode);
        console.log("Course code stored for URL: " + url);
      }
      
      // Store resource information
      if (msg.resources && url) {
        resourcesByUrl[url] = {
          resources: msg.resources,
          timestamp: Date.now()
        };
        
        console.log("Resources stored for URL: " + url);
        console.log("Resource count: " + Object.keys(msg.resources).length);
      }
      
      // Send a response to prevent errors
      sendResponse({status: "received"});
    }
  }
});

// When a download starts
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  console.log("Download listener triggered for item: ", item);
  
  try {
    const url = new URL(item.url);
    if (url.hostname !== "moodle.hku.hk") {
      console.log("Not a Moodle download, skipping. Hostname: " + url.hostname);
      return; // not a Moodle download
    }

    console.log("=== DOWNLOAD DETECTION ===");
    console.log("Download detected from URL: " + item.url);
    console.log("Download initiated from tab ID: " + item.tabId);
    console.log("Download referrer: " + item.referrer);
    console.log("Original filename: " + item.filename);
    console.log("Available tab course codes: ", Object.keys(courseCodesByTab));
    console.log("Available URL course codes: ", Object.keys(courseCodesByUrl));
    console.log("Available resource URLs: ", Object.keys(resourcesByUrl));

    let courseCode = null;
    let resourceName = null;
    
    // Try to get course code and resource name from tab ID first
    if (item.tabId && courseCodesByTab[item.tabId]) {
      courseCode = courseCodesByTab[item.tabId].courseCode;
      console.log("Course code found from tab ID: " + courseCode);
    }
    
    // Try to get resource info using referrer and item URL
    if (item.referrer) {
      console.log("Looking up resources for referrer: " + item.referrer);
      const pageResources = resourcesByUrl[item.referrer];
      if (pageResources) {
        const resources = pageResources.resources;
        const resource = resources[item.url];
        if (resource) {
          resourceName = resource.instanceName;
          if (!courseCode && resource.courseCode) {
            courseCode = resource.courseCode;
          }
          console.log("Resource info found for item URL: " + item.url);
          console.log("Resource name: " + resourceName);
        }
      }
    }
    
    // If still not found, try to get from any stored URL that matches the referrer pattern
    if (!courseCode && item.referrer) {
      console.log("Trying to find course code from stored URLs");
      for (let storedUrl in courseCodesByUrl) {
        if (item.referrer.startsWith(storedUrl)) {
          courseCode = courseCodesByUrl[storedUrl].courseCode;
          console.log("Course code found from stored URL pattern match: " + courseCode);
          console.log("Matched stored URL: " + storedUrl);
          break;
        }
      }
    }
    
    // Last resort: try to find any URL that contains moodle.hku.hk
    if (!courseCode) {
      console.log("Trying last resort course code lookup");
      for (let storedUrl in courseCodesByUrl) {
        if (storedUrl.includes("moodle.hku.hk")) {
          courseCode = courseCodesByUrl[storedUrl].courseCode;
          console.log("Course code found from any Moodle URL: " + courseCode);
          console.log("From stored URL: " + storedUrl);
          break;
        }
      }
    }

    console.log("Final course code to use: " + courseCode);
    console.log("Final resource name to use: " + resourceName);

    // If we have a course code, use it as prefix
    if (courseCode) {
      // Clean original filename and extract extension
      let originalName = item.filename.split("/").pop();
      const extensionIndex = originalName.lastIndexOf(".");
      const extension = extensionIndex !== -1 ? originalName.substring(extensionIndex) : "";
      originalName = originalName.replace(/_/g, " ").trim();

      // If we have a resource name, construct filename from course code and resource name
      if (resourceName) {
        // Clean resource name
        resourceName = resourceName.replace(/[\\/:*?"<>|]+/g, "").trim();

        // Create new filename with course code, resource name and original extension
        let newFilename = `${courseCode} ${resourceName}${extension}`;
        newFilename = newFilename.replace(/[\\/:*?"<>|]+/g, "");
        console.log("Renaming file to: " + newFilename);
        suggest({ filename: newFilename, conflictAction: "uniquify" });
        return;
      }

      // Check if filename already starts with the course code
      if (originalName.startsWith(courseCode)) {
        // Already properly prefixed, don't duplicate
        console.log("Filename already prefixed with course code, keeping as is: " + originalName);
        suggest({ filename: originalName, conflictAction: "uniquify" });
        return;
      }

      // Sanitize illegal characters
      originalName = originalName.replace(/[\\/:*?"<>|]+/g, "");

      // Final new filename with course code prefix
      const newFilename = `${courseCode} ${originalName}`;
      console.log("Renaming file to: " + newFilename);
      suggest({ filename: newFilename, conflictAction: "uniquify" });
    } else {
      // Fallback: use original filename if no course code found
      console.log("No course code found, using original filename: " + item.filename);
      suggest({ filename: item.filename, conflictAction: "uniquify" });
    }
    
    console.log("=== END DOWNLOAD DETECTION ===");
  } catch (e) {
    console.error("Rename error:", e);
    // On error, just use the original filename
    suggest({ filename: item.filename, conflictAction: "uniquify" });
  }
});