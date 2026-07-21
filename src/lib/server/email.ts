interface EmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

/**
 * Sends via the Resend HTTP API when RESEND_API_KEY is configured.
 * Without a key (local dev) the message text is logged instead so the
 * verification link can be followed from the terminal.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
	// Optional vars — read from process.env so absence doesn't fail startup.
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		console.info(`[email:dev] To: ${message.to}\n[email:dev] ${message.subject}\n${message.text}`);
		return;
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: process.env.EMAIL_FROM ?? 'DeathCulture.co <noreply@deathculture.co>',
			to: message.to,
			subject: message.subject,
			html: message.html,
			text: message.text
		})
	});

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error(`Email delivery failed (${response.status}): ${detail}`);
	}
}

export async function sendCommentVerificationEmail(options: {
	to: string;
	name: string;
	postTitle: string;
	verifyUrl: string;
}): Promise<void> {
	const { to, name, postTitle, verifyUrl } = options;

	await sendEmail({
		to,
		subject: 'Confirm your comment on DeathCulture.co',
		text: [
			`Hi ${name},`,
			'',
			`You left a comment on "${postTitle}". Confirm it by opening this link:`,
			verifyUrl,
			'',
			'The link expires in 24 hours. If this was not you, ignore this email.'
		].join('\n'),
		html: `
			<p>Hi ${escapeHtml(name)},</p>
			<p>You left a comment on &ldquo;${escapeHtml(postTitle)}&rdquo;. Confirm it below:</p>
			<p><a href="${escapeHtml(verifyUrl)}">Publish my comment</a></p>
			<p>The link expires in 24 hours. If this was not you, ignore this email.</p>
		`
	});
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}
