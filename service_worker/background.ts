async function sendMessageToTabs(tabs: chrome.tabs.Tab[], message: Message): Promise<void> {
	if (tabs[0].id !== undefined) {
		try {
			await chrome.tabs.sendMessage(tabs[0].id, message);
		} catch (error: unknown) {
			console.log(`Error: ${error}`);
		}
	}
}

chrome.runtime.onInstalled.addListener(async () => {
	await chrome.storage.local.set({ "hide": true });
});

chrome.commands.onCommand.addListener(async (command: string): Promise<void> => {
	if (command === "toggle-feature") {

		let toggle: { hide?: boolean } = await chrome.storage.local.get("hide");

		toggle = { hide: !toggle.hide };

		await chrome.storage.local.set({ "hide": toggle.hide });

		const message: Message = {
			action: toggle.hide || false
		};

		chrome.tabs
			.query({
				currentWindow: true,
				active: true,
			})
			.then((result: chrome.tabs.Tab[]) => sendMessageToTabs(result, message));
	}
});