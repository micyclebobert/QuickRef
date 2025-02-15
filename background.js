chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchContent") {
        fetch(request.url)
            .then(response => response.text())
            .then(data => sendResponse({ content: data }))
            .catch(error => sendResponse({ error: error.toString() }));
        return true;
    }
});


// Will also run after update
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("settings", (data) => {
        if (!data.settings) { // make sure to check for and provide values to any new attributes added
            chrome.storage.sync.set({
                settings: {
                    selectedIndexes: [],
                    convertLinks: true,
                    includeStyleNames: true,
                    work: "Copy", // Options: Copy, Download
                    workType: "Text", // Options: Text, JSON
                    keepFormatting: true,
                    joinWith: "<br>"
                }
            });
        }
    });
    chrome.storage.sync.set({
        options: [
            {
                style: "MLA",
                linked: false
            },
            {
                style: "APA",
                linked: false
            },
            {
                style: "Chicago",
                linked: false
            },
            {
                style: "Harvard",
                linked: false
            },
            {
                style: "Vancouver",
                linked: false
            },
            {
                style: "BibTeX",
                linked: true
            },
            {
                style: "EndNote",
                linked: true
            },
            {
                style: "RefMan",
                linked: true
            },
            {
                style: "RefWorks",
                linked: true
            }]
    });
});