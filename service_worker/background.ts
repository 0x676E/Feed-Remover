async function sendMessageToTabs(tabs: browser.tabs.Tab[], message: Message): Promise<void> {
	if (tabs[0].id !== undefined) {
		try {
			await browser.tabs.sendMessage(tabs[0].id, message);
		} catch (error: unknown) {
			console.log(`Error: ${error}`);
		}
	}
}

browser.runtime.onInstalled.addListener(async () => {
	await browser.storage.local.set({ "hide": true });
});

browser.commands.onCommand.addListener(async (command: string): Promise<void> => {
	if (command === "toggle-feature") {

		let toggle: { hide?: boolean } = await browser.storage.local.get("hide");

		toggle = { hide: !toggle.hide };

		await browser.storage.local.set({ "hide": toggle.hide });

		const message: Message = {
			action: toggle.hide || false
		};

		browser.tabs
			.query({
				currentWindow: true,
				active: true,
			})
			.then((result: browser.tabs.Tab[]) => sendMessageToTabs(result, message));
	}
});