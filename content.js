document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
  
    if (selectedText) {
        // Save selected text temporarily
        chrome.storage.local.set({ selectedText }, () => {
            console.log("Selected text saved:", selectedText);
            
            // Send message to trigger popup
            chrome.runtime.sendMessage({ action: "triggerPopup" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                } else {
                    console.log("Popup trigger message sent:", response);
                }
            });
        });
  
        // Save selected text permanently to "favorites"
        chrome.storage.local.get({ favorites: [] }, ({ favorites }) => {
            if (!favorites.includes(selectedText)) {
                favorites.push(selectedText);
                chrome.storage.local.set({ favorites }, () => {
                    console.log("Added to favorites:", favorites);
                });
            }
        });
    }
  });
  







// document.addEventListener("mouseup", () => {
//   const selectedText = window.getSelection().toString().trim();

//   if (selectedText) {
//       chrome.storage.local.set({ selectedText }, () => {
//           console.log("Selected text saved:", selectedText);
//           chrome.runtime.sendMessage({ action: "triggerPopup" }, (response) => {
//               if (chrome.runtime.lastError) {
//                   console.error("Error sending message:", chrome.runtime.lastError.message);
//               } else {
//                   console.log("Popup trigger message sent:", response);
//               }
//           });
//       });
//   }
// });
