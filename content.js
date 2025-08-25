// Content script injected into Moodle pages.
// Collects course codes and resource names and forwards them to the background script.

(function() {
    console.log("Content script loaded");
    
    function extractCourseCode() {
      // Extract course code from document title only
      // Example title: "Course: CIVL1113 Engineering Mechanics and Materials ..."
      const title = document.title || "";
      console.log("Page title: " + title);
      
      // More permissive regex to capture course codes
      const match = title.match(/([A-Z]{2,6}\d{3,4})/);
      if (match) {
        console.log("Course code found: " + match[1]);
        return match[1];
      } else {
        console.log("No course code found in title");
        return null;
      }
    }
    
    function extractResourceInfo() {
      // Extract resource information from the page
      // Look for activity instances with instancename class
      const instanceElements = document.querySelectorAll('.instancename');
      
      const resources = {};
      
      instanceElements.forEach((element, index) => {
        // Get the link associated with this instance
        const link = element.closest('a');
        if (link && link.href) {
          // Get the text content (instance name) without the hidden access text
          // Updated to better handle the structure with potential nested spans
          let instanceName = '';
          for (let node of element.childNodes) {
            // Text nodes or non-span elements contain the visible name
            if (node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN')) {
              instanceName += node.textContent;
            }
          }
          instanceName = instanceName.trim();
          
          // Store the resource info
          resources[link.href] = {
            instanceName: instanceName,
            courseCode: extractCourseCode()
          };
          
          console.log("Resource found - URL: " + link.href + ", Instance Name: " + instanceName);
        } else {
          console.log("No link found for element: ", element);
        }
      });
      
      console.log("All resources found: ", resources);
      return resources;
    }
  
    const courseCode = extractCourseCode();
    const resources = extractResourceInfo();
    
    console.log("Sending to background - Course Code: " + courseCode);
    console.log("Sending to background - Resources Count: " + Object.keys(resources).length);
    console.log("Sending to background - Resources: ", resources);
    
    // Send message with both course code and resource information
    chrome.runtime.sendMessage({
      type: "PAGE_INFO",
      courseCode: courseCode,
      resources: resources
    }, function(response) {
      if (chrome.runtime.lastError) {
        // This is normal when the background script doesn't send a response
        // We don't need a response, so we can ignore this error
      } else {
        // Log successful message sending
        console.log("Message successfully sent to background script");
      }
    });
  })();
