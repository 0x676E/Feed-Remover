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
        categoryButtons.forEach((button) => {
            button.disabled = !buttonState.hide;
        });
        infiniteScrollCheckbox.disabled = !buttonState.hide;
    });
}
function handleError(error) {
    console.log(`Error: ${error}`);
}
const categoryButtons = document.querySelectorAll(".category-button");
categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;
        categoryAction(category);
    });
});
function categoryAction(category) {
    return __awaiter(this, void 0, void 0, function* () {
        yield browser.storage.local.set({ imageCategory: category });
        checkCategoryState();
        browser.tabs
            .query({
            currentWindow: true,
            active: true,
        })
            .then((result) => {
            if (result[0].id !== undefined) {
                browser.tabs.reload(result[0].id);
            }
        })
            .catch(handleError);
    });
}
function checkCategoryState() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield browser.storage.local.get("imageCategory");
        const current = (_a = stored.imageCategory) !== null && _a !== void 0 ? _a : "both";
        categoryButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.category === current);
        });
    });
}
const infiniteScrollCheckbox = document.querySelector(".infinite-scroll-checkbox");
infiniteScrollCheckbox.addEventListener("change", () => {
    // singlePostMode is the inverse of the "Infinite Scroll" switch: checked (on)
    // means infinite scroll, unchecked (off) means single-post mode.
    infiniteScrollAction(!infiniteScrollCheckbox.checked);
});
function infiniteScrollAction(singlePostMode) {
    return __awaiter(this, void 0, void 0, function* () {
        yield browser.storage.local.set({ singlePostMode });
        browser.tabs
            .query({
            currentWindow: true,
            active: true,
        })
            .then((result) => {
            if (result[0].id !== undefined) {
                browser.tabs.reload(result[0].id);
            }
        })
            .catch(handleError);
    });
}
function checkInfiniteScrollState() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const stored = yield browser.storage.local.get("singlePostMode");
        infiniteScrollCheckbox.checked = !((_a = stored.singlePostMode) !== null && _a !== void 0 ? _a : false);
    });
}
checkButtonState();
checkCategoryState();
checkInfiniteScrollState();
