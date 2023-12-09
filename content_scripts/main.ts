interface UserOption {
	hide: boolean;
}

(async function (): Promise<void> {
	let firstTime: boolean = true;

	let userOption = await chrome.storage.local.get("hide") as UserOption;

	if (!Object.prototype.hasOwnProperty.call(userOption, "hide")) {
		await chrome.storage.local.set({ "hide": true });
		userOption = await chrome.storage.local.get("hide") as UserOption;
	}

	userOption.hide && hideContent();

	chrome.runtime.onMessage.addListener((message: Message) => {
		if (message.action) {
			hideContent();
		}
		else {
			showContent();
		}
	});

	function showContent(): void {
		window.location.reload();
	}

	function hideContent(): void {
		if (firstTime) {
			removeContent();
			firstTime = false;
		}

		const targetElement: HTMLElement = document.body;

		const observer: MutationObserver = new MutationObserver(function (mutations: MutationRecord[]) {
			mutations.forEach(function (mutation: MutationRecord) {
				if ((mutation.target as Element).classList.contains("feed-shared-update-v2")) {
					removeContent();
				}
			});
		});
		const observerConfig: MutationObserverInit = { attributes: true, attributeFilter: ["class"], subtree: true, childList: true };

		observer.observe(targetElement, observerConfig);
	}

	function removeContent(): void {
		const contents: NodeListOf<Element> = document.querySelectorAll(".feed-shared-update-v2");
		const premiumContent: Element | null = document.querySelector(".launchpad-v2.artdeco-card");
		contents.forEach(content => {
			const catContent: Element | null = document.querySelector("div.card");
			content.remove();
			premiumContent && premiumContent.remove();
			if (!catContent) {
				showCat();
			}
		});
	}

	function showCat(): void {
		const parentContent: Element | null = document.querySelector(".relative div.full-height");

		if (parentContent) {
			parentContent.innerHTML += isDarkMode() ? themeChanger("dark") : themeChanger("light");
		}
	}

	function isDarkMode(): Element | null {
		return document.querySelector("html.theme--dark");
	}

	function themeChanger(theme: string): string {
		const backgroundColor: string = theme === "light" ? "#fff" : "#1b1f23";
		const textColor: string = theme === "light" ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)";
		const titleColor: string = theme === "light" ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";
		const descriptionColor: string = theme === "light" ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";

		return `<div class="card" style="padding:0;margin:0 0 .8rem;height:100%;position:relative;border-radius:8px;border:none;box-shadow:rgba(104,104,104,.184) 0 0 0 1px,rgba(0,0,0,.063) 0 .626365px .939548px 0;background-color:${backgroundColor}"><div><div style="display:flex;flex-wrap:nowrap;padding:1.2rem 1.6rem 0;margin-bottom:.8rem;align-items:center"><span><div><div style="display:flex"><img width="32" src="https://i.imgur.com/FInlbRP.png" height="32"></div></div></span><div style="position:relative;flex-grow:1;flex-basis:0;margin-left:.8rem;overflow:hidden"><span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:top;display:flex;font-weight:600;font-size:1.4rem;color:${titleColor}"><span><span>Feed Remover</span></span></span></span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;font-size:1.2rem;line-height:1.33333;font-weight:400;color:${textColor}">Extension</span></div></div><div class="card-content-description" style="display:block;line-height:2rem;max-height:4rem;overflow:hidden;position:relative;max-width:928px;margin:0 1.6rem;font-size:1.4rem;line-height:1.42857;word-wrap:break-word;word-break:break-word;color:${descriptionColor}"><span>Feed Remover is working!<br>Here's a cute cat to beautify your day!</span></div><article class="card-image-base" style="margin-top:.8rem;overflow:hidden;max-width:100%;position:relative"><div class="card-image-content" style="width:100%;height:100%;display:flex"><img src="https://i.imgur.com/VCC2Yli.jpg" alt="" style="position:static;top:auto;left:auto;object-fit:cover;width:100%;height:100%;background-position:50%;background-size:cover;object-position:center;border-radius:0 0 8px 8px"></div></article></div></div>`;
	}

})();