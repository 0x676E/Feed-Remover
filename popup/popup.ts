browser.tabs
	.query({
		currentWindow: true,
		active: true,
	})
	.then((result: browser.tabs.Tab[]) => {
		if (result[0].url) {
			const url = new URL(result[0].url);
			const regex = /^.*\.linkedin\.com$/;

			if (!regex.test(url.hostname)) {
				(document.querySelector("#popup-content") as HTMLElement).classList.add("hidden");
				(document.querySelector("#error-content") as HTMLElement).classList.remove("hidden");
			}
		}
	});

const toggleButton = document.querySelector(".toggle-button") as HTMLElement;
toggleButton.addEventListener("click", userAction);

async function userAction(): Promise<void> {
	const toggle = (await browser.storage.local.get("hide")) as { hide: boolean };

	toggle.hide = !toggle.hide;

	await browser.storage.local.set({ "hide": toggle.hide });

	const message: Message = {
		action: toggle.hide,
	};

	browser.tabs
		.query({
			currentWindow: true,
			active: true,
		})
		.then((result: browser.tabs.Tab[]) => {
			sendMessageToScript(result, message);
		})
		.catch(handleError);

	checkButtonState();
}

async function sendMessageToScript(tabs: browser.tabs.Tab[], message: Message): Promise<void> {
	if (tabs[0].id) {
		try {
			await browser.tabs.sendMessage(tabs[0].id, message);
		} catch (error: unknown) {
			if (browser.runtime.lastError) {
				handleError(error);
			}
		}
	}
}

async function checkButtonState(): Promise<void> {
	const buttonState = await browser.storage.local.get("hide") as { hide: boolean };
	if (buttonState.hide) {
		toggleButton.classList.add("active");
	} else {
		toggleButton.classList.remove("active");
	}
}

function handleError(error: unknown): void {
	console.log(`Error: ${error}`);
}

checkButtonState();