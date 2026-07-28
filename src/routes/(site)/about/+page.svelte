<svelte:head>
	<title>About — DeathCulture.co</title>
	<meta
		name="description"
		content="Every human will die. That is inevitable. DeathCulture.co exists to challenge the American experience around death with emotional support alongside practical advice."
	/>
</svelte:head>

<div class="about-page">
	<header class="about-hero">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<p class="kicker">About</p>
			<h1>Every human will die. That is inevitable.</h1>
			<p class="lede">What isn't is the bullshit. It's the death culture.</p>
		</div>
	</header>

	<section class="about-body" aria-label="Why we exist">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<div class="measure">
				<p>
					In a culture that fears death, people are left to navigate loss in isolation — stripped of
					support, silenced by discomfort, and forced to face life's inevitable end confused and
					unprepared. Unfortunately, we experienced this.
				</p>
				<p>
					We exist to challenge the American experience around death by providing emotional and
					social support alongside practical advice. By addressing systemic challenges, bridging
					emotional and practical gaps, and providing resources for all ages, we empower individuals
					to navigate death with understanding, connection, and meaning.
				</p>
			</div>
		</div>
	</section>

	<section class="mission" aria-label="Our mission">
		<div class="mx-auto max-w-4xl px-5 sm:px-8">
			<p class="motto">Mors certa, hora incerta</p>
			<blockquote>
				Our mission is to reshape death culture by fostering a healthier, more open relationship
				with life's most universal experience.
			</blockquote>
		</div>
	</section>

	<section class="about-what" aria-labelledby="what-heading">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<h2 id="what-heading">What do we do?</h2>
			<div class="measure">
				<p>
					Our online content is designed to encourage the hard conversations around death in a way
					that is accessible and welcoming. Through storytelling, education, and community support,
					we aim to reduce fear, ease grief, and shift perspectives toward celebrating life rather
					than solely mourning loss alone. You can also access practical support through our
					proprietary tools — everything from pre-planning to accessing resources post-death.
				</p>
			</div>

			<a class="who-cta" href="/team">
				Who are we?
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M5 12h14m0 0-6-6m6 6-6 6"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		</div>
	</section>
</div>

<style>
	.about-page {
		background: var(--background);
	}

	.about-hero {
		padding-block: clamp(7rem, 5rem + 8vw, 11rem) clamp(1rem, 0.5rem + 1.5vw, 2rem);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
		margin-bottom: 0.75rem;
	}

	h1 {
		max-width: 22em;
		font-size: clamp(2.2rem, 1.6rem + 3vw, 4rem);
		line-height: 1.08;
		color: var(--foreground);
		text-wrap: balance;
	}

	.lede {
		margin-top: 1.25rem;
		max-width: 34rem;
		font-size: clamp(1.05rem, 1rem + 0.4vw, 1.3rem);
		line-height: 1.55;
		color: var(--muted-foreground);
	}

	.measure {
		max-width: 38rem;
	}

	.measure p {
		font-size: 1.05rem;
		line-height: 1.75;
		color: var(--foreground);
	}

	.measure p + p {
		margin-top: 1.1rem;
	}

	.about-body {
		padding-block: clamp(2rem, 1.5rem + 2vw, 3.5rem) clamp(3rem, 2.5rem + 3vw, 6rem);
	}

	/* Tonal band — the section separator in this system is a shift in ground, not a card. */
	.mission {
		padding-block: clamp(4rem, 3rem + 4vw, 7rem);
		background: var(--base-1000);
	}

	.motto {
		font-size: 0.7rem;
		letter-spacing: 0.4em;
		text-transform: uppercase;
		color: var(--base-400);
	}

	blockquote {
		margin-top: 1.5rem;
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
		line-height: 1.25;
		color: var(--base-50);
		text-wrap: balance;
	}

	.about-what {
		padding-block: clamp(3.5rem, 3rem + 3vw, 6rem) clamp(4rem, 3rem + 4vw, 7rem);
	}

	h2 {
		margin-bottom: 1.5rem;
		font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
		line-height: 1.2;
		color: var(--foreground);
		text-wrap: balance;
	}

	/* The page's single ember — one warm note, per The One Ember Rule. */
	.who-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 0.55rem 1.3rem;
		font-size: 0.85rem;
		letter-spacing: 0.03em;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			gap var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.who-cta:hover,
	.who-cta:focus-visible {
		background: var(--secondary-600);
		gap: 0.8rem;
	}
</style>
