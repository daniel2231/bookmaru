import { json } from '@sveltejs/kit';
import { sendNewEntryNotification } from '$lib/server/notifications';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const testData = await request.json();

		// Default test data if none provided
		const defaultTestData = {
			name_en: 'Test Location',
			name_ko: null,
			city_en: 'Seoul',
			city_ko: null,
			district_en: 'Gangnam',
			district_ko: null,
			category: 'cafe',
			original_language: 'en'
		};

		const locationData = { ...defaultTestData, ...testData };

		console.log('Testing ntfy notification with data:', locationData);

		const success = await sendNewEntryNotification(locationData);

		if (success) {
			return json({
				success: true,
				message: 'Notification sent successfully! Check ntfy.sh/Bookmaru-entry topic.',
				data: locationData
			});
		} else {
			return json(
				{
					success: false,
					message: 'Failed to send notification',
					data: locationData
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Error testing notification:', error);
		return json(
			{
				success: false,
				message:
					'Error testing notification: ' +
					(error instanceof Error ? error.message : 'Unknown error')
			},
			{ status: 500 }
		);
	}
};
