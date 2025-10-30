/**
 * Server-only utility functions for sending notifications via ntfy.sh
 */
import { PRIVATE_VITE_NTFY_TOPIC, PRIVATE_VITE_NTFY_TOPIC_CONTACT } from '$env/static/private';

export interface NtfyNotification {
	title: string;
	message: string;
	priority?: 'min' | 'low' | 'default' | 'high' | 'max';
	tags?: string[];
	click?: string;
	attach?: string;
	icon?: string;
}

/**
 * Sends a notification to ntfy.sh
 * @param topic - The ntfy topic (e.g., 'Bookmaru-entry')
 * @param notification - The notification data
 * @returns Promise<boolean> - Returns true if successful, false otherwise
 */
export async function sendNtfyNotification(
	topic: string,
	notification: NtfyNotification
): Promise<boolean> {
	try {
		const url = `https://ntfy.sh/${topic}`;

		const headers: Record<string, string> = {
			'Title': notification.title
		};

		if (notification.priority) headers['Priority'] = notification.priority;
		if (notification.tags) headers['Tags'] = notification.tags.join(',');
		if (notification.click) headers['Click'] = notification.click;
		if (notification.attach) headers['Attach'] = notification.attach;

		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: notification.message
		});

		return response.ok;
	} catch (error) {
		console.error('Failed to send ntfy notification:', error);
		return false;
	}
}

/**
 * Sends a notification for a new location entry
 * @param locationData - The location data that was submitted
 * @returns Promise<boolean> - Returns true if successful, false otherwise
 */
export async function sendNewEntryNotification(locationData: {
	name_en?: string | null;
	name_ko?: string | null;
	city_en?: string | null;
	city_ko?: string | null;
	district_en?: string | null;
	district_ko?: string | null;
	category?: string | null;
	original_language?: string | null;
}): Promise<boolean> {
	const topic = PRIVATE_VITE_NTFY_TOPIC;

	// Determine the display name and location
	const name =
		locationData.original_language === 'ko' ? locationData.name_ko : locationData.name_en;

	const city =
		locationData.original_language === 'ko' ? locationData.city_ko : locationData.city_en;

	const district =
		locationData.original_language === 'ko' ? locationData.district_ko : locationData.district_en;

	const location = [city, district].filter(Boolean).join(', ');

	const messageParts = [
		`Location: ${name || 'N/A'}`
	];
	
	if (location) {
		messageParts.push(`Area: ${location}`);
	}
	
	if (locationData.category) {
		messageParts.push(`Category: ${locationData.category}`);
	}
	
	if (locationData.original_language) {
		messageParts.push(`Language: ${locationData.original_language}`);
	}

	const notification: NtfyNotification = {
		title: 'New Bookmaru Entry',  // ❌ REMOVED EMOJI FROM TITLE
		message: messageParts.join('\n'),
		priority: 'default',
		tags: ['books', 'bookmaru', 'new-entry', locationData.category || 'location']  // ✅ 'books' tag = 📚 emoji
	};

	return await sendNtfyNotification(topic, notification);
}

/**
 * Sends a notification for a contact message
 * @param contactData - { email?, message }
 */
export async function sendContactNotification(contactData: {
	email?: string | null;
	message: string;
}): Promise<boolean> {
	const topic = PRIVATE_VITE_NTFY_TOPIC_CONTACT;

	const messageParts = [
		contactData.email ? `From: ${contactData.email}` : 'From: Anonymous',
		'',
		'Message:',
		contactData.message
	];

	const notification: NtfyNotification = {
		title: 'Contact Message',  // ❌ REMOVED EMOJI FROM TITLE
		message: messageParts.join('\n'),
		priority: 'default',
		tags: ['email', 'bookmaru', 'contact']  // ✅ 'email' tag = ✉️ emoji
	};

	return await sendNtfyNotification(topic, notification);
}