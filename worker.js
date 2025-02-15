/*
 * TO-DO
 * Turn those depended on scholar's site structure into functions and keep them marked
 * Warn if load result is unexpected (or the link to content conversion gives ouput type html)
 * Oganize code nicely
*/

let current = {
    id: null,
    loading: 0
};

const accumulateSpace = document.createElement("div");
const convertSpace = document.createElement("div");

function addWorkSpaces() {
    accumulateSpace.style.visibility = "hidden";
    document.body.appendChild(accumulateSpace);
    convertSpace.style.visibility = "hidden";
    document.body.appendChild(convertSpace);
}
function resetWorkSpaces() {
    accumulateSpace.innerHTML = "";
    convertSpace.innerHTML = "";
}


function addButtons() {
    const searchResults = document.getElementsByClassName("gs_ri");
    for (let i = 0; i < searchResults.length; i++) {
        const target = searchResults[i].querySelector("div.gs_fl"); // add `.gs_flb`?
        target.innerHTML = `<a class="gs_or_btn" role="button"><svg viewBox="0 0 16 16" class="gs_or_svg"><path d="M 12.023438 13.480469 C 13.289062 12.246094 14 10.46875 14 8.492188 C 14 4.773438 11.5 1.765625 7.5 1.765625 C 3.5 1.765625 1 4.777344 1 8.492188 C 1 12.207031 3.5 15.21875 7.5 15.21875 C 8.402344 15.21875 9.226562 15.066406 9.960938 14.785156 L 10.660156 15.851562 C 10.722656 15.945312 10.828125 15.984375 10.929688 15.953125 L 12.863281 15.359375 C 12.9375 15.335938 13 15.277344 13.027344 15.195312 C 13.050781 15.117188 13.042969 15.03125 12.996094 14.960938 Z M 7.5 11.984375 C 5.421875 11.984375 4.125 10.421875 4.125 8.492188 C 4.125 6.5625 5.421875 4.996094 7.5 4.996094 C 9.578125 4.996094 10.875 6.5625 10.875 8.492188 C 10.875 9.324219 10.632812 10.085938 10.195312 10.6875 L 9.34375 9.390625 C 9.285156 9.296875 9.175781 9.257812 9.078125 9.289062 L 7.140625 9.882812 C 7.066406 9.90625 7.003906 9.964844 6.976562 10.046875 C 6.953125 10.125 6.960938 10.210938 7.007812 10.28125 L 8.09375 11.9375 C 7.90625 11.96875 7.707031 11.984375 7.5 11.984375 Z M 7.5 11.984375 "></path></svg><span class="gs_or_btn_lbl">Quick Cite</span></a>`
            + target.innerHTML;
        const resultID = searchResults[i].parentElement.getAttribute("data-cid"); //used by scholar
        target.firstChild.href = getTag(resultID);
        target.firstChild.onclick = () => { quickCite(resultID); return false; };
    }
}


function loadMain() {
    let url = (document.getElementById("gs_citd").getAttribute("data-u") || "").replace("{id}", current.id).replace("{p}", "0");
    scholarLoad(url, "", function (status, content) {
        if (status == 200) {
            accumulateSpace.innerHTML = content;
            process();
            console.log(processed);
            resetWorkSpaces();
            appendNeededParts();
            return;
        }
        console.error("Response status: " + status);
    })
}
function allLoaded() {
    if (current.loading) return;
    console.log("workSpace.innerHTML: " + accumulateSpace.innerHTML);
    copyWorkSpace();
}
function scholarLoad(url, message, afterLoad) {
    let request = new XMLHttpRequest;
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            let status = request.status,
                resText = request.responseText,
                resHeader = request.getResponseHeader("Content-Type"),
                resURL = request.responseURL,
                winLoc = window.location,
                protocol = winLoc.protocol;
            winLoc = "//" + winLoc.host + "/";
            resURL && resURL.indexOf(protocol + winLoc) && resURL.indexOf("https:" + winLoc) && (status = 0,
                resHeader = resText = "");
            afterLoad(status, resText, resHeader || "")
        }
    };
    request.open(message ? "POST" : "GET", url, !0);
    request.setRequestHeader("X-Requested-With", "XHR");
    message && request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    message ? request.send(message) : request.send();
}

function getTag(id) {
    return "#!" + id;

}


function quickCite(resultID) {
    if (!settings.selectedIndexes.length) return;
    current.id = resultID;
    current.loading = 0;
    loadMain();
}
function markCurrentAsSeen() {
    let current_url = window.location.href;

    history.replaceState({}, "", current_url + getTag(current.id));

    history.replaceState({}, "", current_url);
}
class CiteContainer {
    constructor(style, content, linked) {
        this.style = style.innerHTML;
        if (linked) {
            this.link = content.href;
            this.content = "<a href=\"" + content.href + "\">" + content.href + "</a>";
        } else {
            this.content = content.innerHTML;
        }
    }
    async appendToWorkSpace() {
        if (this.link && settings.convertLinks) {
            chrome.runtime.sendMessage({ action: "fetchContent", url: this.link }, response => {
                if (response.error) {
                    console.error("Error: " + response.error);
                } else {
                    this.content = textToHTML(response.content);
                    this.append();
                }
            });
        } else {
            this.append();
        }
    }
    append() {
        console.log(this);
        //must resetWorkSpace before first one
        accumulateSpace.innerHTML += (accumulateSpace.innerHTML ? textToHTML(settings.joinWith) : "") + this.toString();

        current.loading--;
        allLoaded();
    }
    toString() {
        return (settings.includeStyleNames ? (this.style + ": ") : "") + this.content;
    }
}
function textToHTML(text) {
    convertSpace.innerText = text;
    return convertSpace.innerHTML;
}
let processed;
function process() {
    processed = [];
    const sytles = accumulateSpace.querySelectorAll(".gs_cith");
    const refText = accumulateSpace.querySelectorAll(".gs_citr");
    const refLink = accumulateSpace.querySelectorAll(".gs_citi");
    for (let i = 0; i < sytles.length; i++) {
        processed.push(new CiteContainer(sytles[i], refText[i], false));
    }
    for (let i = 0; i < refLink.length; i++) {
        processed.push(new CiteContainer(refLink[i], refLink[i], true));
    }
}
let unfound = [];
let settings;
let options;

function appendNeededParts() {
    current.loading = settings.selectedIndexes.length;
    settings.selectedIndexes.map(index => {
        if (options[index].style == processed[index].style)
            return processed[index].appendToWorkSpace();
        //Micro-optimized fallback code for when scholar changes something
        console.warn("Something might have changed");
        for (let i = 0; i < index; i++)
            if (options[index].style == processed[i].style)
                return processed[i].appendToWorkSpace();
        for (let i = index + 1; i < processed.length; i++)
            if (options[index].style == processed[i].style)
                return processed[i].appendToWorkSpace();
        unfound.push(options[index].style);
    });
    if (unfound.length) console.error(unfound.join(", ") + " not found");
}


function copyWorkSpace() { //requires workSpace and addWorkSpace to run beforehand
    navigator.clipboard
        .write([new ClipboardItem({
            'text/plain': new Blob([accumulateSpace.textContent], { type: 'text/plain' }),
            ...(settings.keepFormatting && {
                'text/html': new Blob([accumulateSpace.innerHTML], { type: 'text/html' })
            })
        })])
        .then(() => {
            console.log("Copied");
            markCurrentAsSeen();
        })
        .catch(err => console.error('Could not copy text: ' + err));
    resetWorkSpaces();
}


(function init() {
    chrome.storage.sync.get("settings", (data) => { settings = data.settings });
    chrome.storage.sync.get("options", (data) => { options = data.options });
    addWorkSpaces();
    addButtons();
})();
