<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-14 text-center">
		<p class="motto" aria-hidden="true">Mors certa, hora incerta</p>
		<nav aria-label="Legal">
			<ul class="flex items-center gap-2 text-sm">
				<li><a class="footer-link" href="/terms">Terms of Service</a></li>
				<li class="divider" aria-hidden="true">·</li>
				<li><a class="footer-link" href="/privacy">Privacy Policy</a></li>
			</ul>
		</nav>
		<p class="copyright">© DeathCulture.co {year}</p>
	</div>
</footer>

<style>
	.site-footer {
		background: var(--background);
		border-top: 1px dashed var(--border);
	}

	.motto {
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--base-400);
	}

	.footer-link {
		color: var(--muted-foreground);
		transition: color var(--duration-fast, 150ms) ease;
	}

	.footer-link:hover,
	.footer-link:focus-visible {
		color: var(--secondary);
	}

	.divider {
		color: var(--base-300);
	}

	.copyright {
		font-size: 0.75rem;
		color: var(--base-400);
	}
</style>
