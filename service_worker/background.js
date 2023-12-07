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
function sendMessageToTabs(tabs, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tabs[0].id !== undefined) {
            try {
                yield browser.tabs.sendMessage(tabs[0].id, message);
            }
            catch (error) {
                console.log(`Error: ${error}`);
            }
        }
    });
}
browser.runtime.onInstalled.addListener(() => __awaiter(void 0, void 0, void 0, function* () {
    yield browser.storage.local.set({ "hide": true });
}));
browser.commands.onCommand.addListener((command) => __awaiter(void 0, void 0, void 0, function* () {
    if (command === "toggle-feature") {
        let toggle = yield browser.storage.local.get("hide");
        toggle = { hide: !toggle.hide };
        yield browser.storage.local.set({ "hide": toggle.hide });
        const message = {
            action: toggle.hide || false
        };
        browser.tabs
            .query({
            currentWindow: true,
            active: true,
        })
            .then((result) => sendMessageToTabs(result, message));
    }
}));
