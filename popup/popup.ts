browser.tabs
	.query({
		currentWindow: true,
		active: true,
	})
	.then((result: any[]) => {
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
		.then((result: any[]) => {
			sendMessageToScript(result, message);
		})
		.catch(handleError);

	checkButtonState();
}

async function sendMessageToScript(tabs: any[], message: Message): Promise<void> {
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

	categoryButtons.forEach((button) => {
		button.disabled = !buttonState.hide;
	});

	infiniteScrollCheckbox.disabled = !buttonState.hide;
}

function handleError(error: unknown): void {
	console.log(`Error: ${error}`);
}

const categoryButtons = document.querySelectorAll(".category-button") as NodeListOf<HTMLButtonElement>;

categoryButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const category = button.dataset.category as ImageCategory;
		categoryAction(category);
	});
});

async function categoryAction(category: ImageCategory): Promise<void> {
	await browser.storage.local.set({ imageCategory: category });

	checkCategoryState();

	browser.tabs
		.query({
			currentWindow: true,
			active: true,
		})
		.then((result: any[]) => {
			if (result[0].id !== undefined) {
				browser.tabs.reload(result[0].id);
			}
		})
		.catch(handleError);
}

async function checkCategoryState(): Promise<void> {
	const stored = await browser.storage.local.get("imageCategory") as { imageCategory?: ImageCategory };
	const current: ImageCategory = stored.imageCategory ?? "both";

	categoryButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.category === current);
	});
}

const infiniteScrollCheckbox = document.querySelector(".infinite-scroll-checkbox") as HTMLInputElement;

infiniteScrollCheckbox.addEventListener("change", () => {
	// singlePostMode is the inverse of the "Infinite Scroll" switch: checked (on)
	// means infinite scroll, unchecked (off) means single-post mode.
	infiniteScrollAction(!infiniteScrollCheckbox.checked);
});

async function infiniteScrollAction(singlePostMode: boolean): Promise<void> {
	await browser.storage.local.set({ singlePostMode });

	browser.tabs
		.query({
			currentWindow: true,
			active: true,
		})
		.then((result: any[]) => {
			if (result[0].id !== undefined) {
				browser.tabs.reload(result[0].id);
			}
		})
		.catch(handleError);
}

async function checkInfiniteScrollState(): Promise<void> {
	const stored = await browser.storage.local.get("singlePostMode") as { singlePostMode?: boolean };
	infiniteScrollCheckbox.checked = !(stored.singlePostMode ?? false);
}

checkButtonState();
checkCategoryState();
checkInfiniteScrollState();