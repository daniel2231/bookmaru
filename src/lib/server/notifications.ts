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

		const payload = {
			title: notification.title,
			message: notification.message,
			...(notification.priority && { priority: notification.priority }),
			...(notification.tags && { tags: notification.tags }),
			...(notification.click && { click: notification.click }),
			...(notification.attach && { attach: notification.attach }),
			...(notification.icon && { icon: notification.icon })
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
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

	const notification: NtfyNotification = {
		title: '📚 New Bookmaru Entry',
		message: `New location submitted: ${name}${location ? ` in ${location}` : ''}`,
		priority: 'default',
		tags: ['bookmaru', 'new-entry', locationData.category || 'location'],
		icon: '📚'
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

	const sender = contactData.email ? `From: ${contactData.email}\n\n` : '';

	const notification: NtfyNotification = {
		title: '📨 Contact Message',
		message: `${sender}${contactData.message}`,
		priority: 'default',
		tags: ['bookmaru', 'contact'],
		icon: '✉️'
	};

	return await sendNtfyNotification(topic, notification);
}
