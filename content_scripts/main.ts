interface UserOption {
	hide: boolean;
	imageCategory?: ImageCategory;
	singlePostMode?: boolean;
}

(async function (): Promise<void> {
	let firstTime: boolean = true;

	const POST_SELECTOR: string = '[data-testid="mainFeed"] > div[data-lazy-mount-id]';
	const CARD_CLASS: string = "card";
	const SPECIES_ATTRIBUTE: string = "data-companion-species";

	let userOption = await browser.storage.local.get(["hide", "imageCategory", "singlePostMode"]) as UserOption;

	if (!Object.prototype.hasOwnProperty.call(userOption, "hide")) {
		await browser.storage.local.set({ "hide": true });
		userOption = await browser.storage.local.get(["hide", "imageCategory", "singlePostMode"]) as UserOption;
	}

	const category: ImageCategory = userOption.imageCategory ?? "both";
	const singlePostMode: boolean = userOption.singlePostMode ?? false;

	userOption.hide && hideContent();

	browser.runtime.onMessage.addListener((message: Message) => {
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
			syncScrollLock();
			firstTime = false;
		}

		const targetElement: HTMLElement = document.body;

		const observer: MutationObserver = new MutationObserver(function (): void {
			removeContent();
			syncScrollLock();
		});
		const observerConfig: MutationObserverInit = { childList: true, subtree: true };

		observer.observe(targetElement, observerConfig);
	}

	function removeContent(): void {
		// LinkedIn's feed is a virtualized list: the same [data-lazy-mount-id] DOM
		// node gets reused for different posts as the user scrolls, instead of
		// creating a fresh node per post. A one-time "already processed" marker on
		// the node itself would survive that reuse and permanently skip whatever
		// LinkedIn later renders into a recycled node. So instead of marking the
		// node, we check its *current* content: if its first child isn't already
		// our fake card, it's either a fresh node or a recycled one showing new
		// real content(either way, replace it).
		const contents: NodeListOf<Element> = document.querySelectorAll(POST_SELECTOR);
		contents.forEach(content => {
			const firstChild = content.firstElementChild;
			if (firstChild && firstChild.classList.contains(CARD_CLASS)) {
				return;
			}

			const companion = pickCompanion();
			if (!companion) {
				(content as HTMLElement).style.visibility = "hidden";
				return;
			}

			(content as HTMLElement).style.visibility = "";
			content.innerHTML = isDarkMode() ? themeChanger("dark", companion) : themeChanger("light", companion);
		});
	}

	function isDarkMode(): boolean {
		return document.querySelector('[data-color-scheme]')?.getAttribute("data-color-scheme") === "dark";
	}

	function syncScrollLock(): void {
		const onFeedPage = !!document.querySelector('[data-testid="mainFeed"]');
		const shouldLock = singlePostMode && onFeedPage && category !== "both";

		const scrollContainer = document.querySelector("main") as HTMLElement | null;
		if (!scrollContainer) {
			return;
		}

		scrollContainer.style.overflow = shouldLock ? "hidden" : "";
	}

	interface Companion {
		species: "cat" | "dog";
		imageUrl: string;
		message: string;
	}

	// Single-post mode quota is derived live from the DOM (how many cat/dog cards
	// are currently showing) rather than a one-time counter. LinkedIn's feed is a
	// virtualized list that recycles [data-lazy-mount-id] nodes as the user
	// scrolls — a card we placed earlier can get silently evicted when its node
	// is reused for different real content. A sticky "already shown" flag would
	// never re-grant that slot once the visible card disappeared, eventually
	// hiding every post. Counting live self-heals:
	// if a slot's card disappears, the count drops and the next pass refills it.
	function countVisible(species: "cat" | "dog"): number {
		let count = 0;
		document.querySelectorAll(POST_SELECTOR).forEach(content => {
			const firstChild = content.firstElementChild;
			if (firstChild && firstChild.classList.contains(CARD_CLASS) && firstChild.getAttribute(SPECIES_ATTRIBUTE) === species) {
				count++;
			}
		});
		return count;
	}

	function pickCompanion(): Companion | null {
		let species: "cat" | "dog";

		if (!singlePostMode) {
			species = category === "both" ? (Math.random() < 0.5 ? "cat" : "dog") : category;
		} else {
			const needsCat = (category === "cat" || category === "both") && countVisible("cat") < 1;
			const needsDog = (category === "dog" || category === "both") && countVisible("dog") < 1;

			if (needsCat && needsDog) {
				species = Math.random() < 0.5 ? "cat" : "dog";
			} else if (needsCat) {
				species = "cat";
			} else if (needsDog) {
				species = "dog";
			} else {
				return null;
			}
		}

		const images = species === "cat" ? CAT_IMAGES : DOG_IMAGES;
		const messages = species === "cat" ? CAT_MESSAGES : DOG_MESSAGES;

		const image = images[Math.floor(Math.random() * images.length)];
		const message = messages[Math.floor(Math.random() * messages.length)];

		return { species, imageUrl: browser.runtime.getURL(image), message };
	}

	function themeChanger(theme: string, companion: Companion): string {
		const backgroundColor: string = theme === "light" ? "#fff" : "#1b1f23";
		const textColor: string = theme === "light" ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)";
		const titleColor: string = theme === "light" ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";
		const descriptionColor: string = theme === "light" ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";

		return `<div class="card" ${SPECIES_ATTRIBUTE}="${companion.species}" style="padding:0;margin:0 0 .8rem;height:100%;position:relative;border-radius:8px;border:none;box-shadow:rgba(104,104,104,.184) 0 0 0 1px,rgba(0,0,0,.063) 0 .626365px .939548px 0;background-color:${backgroundColor}"><div><div style="display:flex;flex-wrap:nowrap;padding: 0.8rem 0 0 1.2rem;align-items:center"><span><div><div style="display:flex"><img width="32" src="https://i.imgur.com/FInlbRP.png" height="32"></div></div></span><div style="position:relative;flex-grow:1;flex-basis:0;margin-left:.8rem;overflow:hidden"><span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:top;display:flex;font-weight:600;font-size:1.4rem;color:${titleColor}"><span><span>Feed Remover</span></span></span></span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;font-size:1.2rem;line-height:1.33333;font-weight:400;color:${textColor}">Extension</span></div></div><div class="card-content-description" style="display:block;line-height:2rem;max-height:4rem;overflow:hidden;position:relative;max-width:928px;padding: 0.4rem 0 0 1.2rem;font-size:1.4rem;line-height:1.42857;word-wrap:break-word;word-break:break-word;color:${descriptionColor}"><span>${companion.message}</span></div><article class="card-image-base" style="margin-top:.8rem;overflow:hidden;max-width:100%;position:relative;aspect-ratio:1"><div class="card-image-content" style="width:100%;height:100%;display:flex"><img src="${companion.imageUrl}" alt="" style="position:static;top:auto;left:auto;object-fit:cover;width:100%;height:100%;background-position:50%;background-size:cover;object-position:center;border-radius:0 0 8px 8px"></div></article></div></div>`;
	}
	
})();