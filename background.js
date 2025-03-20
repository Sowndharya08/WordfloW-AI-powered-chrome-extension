chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerPopup") {
        console.log("Opening popup...");
        chrome.action.openPopup();
        sendResponse({ success: true });
    }
});
