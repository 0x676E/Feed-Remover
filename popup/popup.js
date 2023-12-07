"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
browser.tabs
    .query({
    currentWindow: true,
    active: true,
})
    .then((result) => {
    if (result[0].url) {
        const url = new URL(result[0].url);
        const regex = /^.*\.linkedin\.com$/;
        if (!regex.test(url.hostname)) {
            document.querySelector("#popup-content").classList.add("hidden");
            document.querySelector("#error-content").classList.remove("hidden");
        }
    }
});
const toggleButton = document.querySelector(".toggle-button");
toggleButton.addEventListener("click", userAction);
function userAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const toggle = (yield browser.storage.local.get("hide"));
        toggle.hide = !toggle.hide;
        yield browser.storage.local.set({ "hide": toggle.hide });
        const message = {
            action: toggle.hide,
        };
        browser.tabs
            .query({
            currentWindow: true,
            active: true,
        })
            .then((result) => {
            sendMessageToScript(result, message);
        })
            .catch(handleError);
        checkButtonState();
    });
}
function sendMessageToScript(tabs, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tabs[0].id) {
            try {
                yield browser.tabs.sendMessage(tabs[0].id, message);
            }
            catch (error) {
                if (browser.runtime.lastError) {
                    handleError(error);
                }
            }
        }
    });
}
function checkButtonState() {
    return __awaiter(this, void 0, void 0, function* () {
        const buttonState = yield browser.storage.local.get("hide");
        if (buttonState.hide) {
            toggleButton.classList.add("active");
        }
        else {
            toggleButton.classList.remove("active");
        }
    });
}
function handleError(error) {
    console.log(`Error: ${error}`);
}
checkButtonState();
