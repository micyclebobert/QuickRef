
let styles = document.getElementsByClassName("s");
document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.sync.get("options", (data) => {
        const options = data.options;
        const container = document.getElementById("container");
        options.forEach(o => container.innerHTML += `  <label>
<input type="checkbox" class="s"> ${o.style}
</label>
<br>`);
        updateUI();
        setUpSave();
        setUpSR();
    });
});
function updateUI() {
    chrome.storage.sync.get("settings", (data) => {
        let settings = data.settings;

        settings.selectedIndexes.forEach(idx => styles[idx].checked = true);
        document.getElementById("work").value = settings.work;
        document.getElementById("workType").value = settings.workType;
        document.getElementById("joinWith").value = settings.joinWith;
        document.getElementById("convertLinks").checked = settings.convertLinks;
        document.getElementById("keepFormatting").checked = settings.keepFormatting;
        document.getElementById("includeStyleNames").checked = settings.includeStyleNames;
    });


}
function setUpSave() {
    document.getElementById("save").addEventListener("click", () => saveData());
}
function setUpSR() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0].url.startsWith("https://scholar.google.com/scholar?")) {
            document.getElementById("sr").disabled = true;
            return;
        }
        document.getElementById("sr").addEventListener("click", () => saveData(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
        }));
    });
}

function saveData(after) {
    let settings = {
        selectedIndexes: [],
        work: document.getElementById("work").value,
        workType: document.getElementById("workType").value,
        joinWith: document.getElementById("joinWith").value,
        convertLinks: document.getElementById("convertLinks").checked,
        keepFormatting: document.getElementById("keepFormatting").checked,
        includeStyleNames: document.getElementById("includeStyleNames").checked,
    };
    for (let i = 0; i < styles.length; i++)
        styles[i].checked && settings.selectedIndexes.push(i);

    chrome.storage.sync.set({ settings }, () => {
        console.log(settings);
        after && after();
        window.close();

    });
}