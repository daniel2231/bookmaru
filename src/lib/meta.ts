/**
 * Meta tag utilities for BookMaru
 * Provides functions to generate consistent meta tags across the application
 */

export interface MetaTags {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article';
	author?: string;
}

const BASE_URL = 'https://bookmaru.netlify.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const DEFAULT_AUTHOR = 'Daniel Kang (@danielkang)';

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(meta: MetaTags): string {
	const {
		title,
		description,
		keywords,
		image = DEFAULT_IMAGE,
		url = BASE_URL,
		type = 'website',
		author = DEFAULT_AUTHOR
	} = meta;

	return `
		<title>${title}</title>
		<meta name="title" content="${title}" />
		<meta name="description" content="${description}" />
		${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
		<meta name="author" content="${author}" />
		<meta name="robots" content="index, follow" />
		
		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="${type}" />
		<meta property="og:url" content="${url}" />
		<meta property="og:title" content="${title}" />
		<meta property="og:description" content="${description}" />
		<meta property="og:image" content="${image}" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:site_name" content="BookMaru" />
		<meta property="og:locale" content="en_US" />
		
		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content="${url}" />
		<meta property="twitter:title" content="${title}" />
		<meta property="twitter:description" content="${description}" />
		<meta property="twitter:image" content="${image}" />
		<meta property="twitter:creator" content="@danielkang" />
		<meta property="twitter:site" content="@danielkang" />
		
		<!-- Canonical URL -->
		<link rel="canonical" href="${url}" />
	`.trim();
}

/**
 * Predefined meta tag configurations for common pages
 */
export const metaConfigs = {
	home: {
		title: 'BookMaru - Find Your Perfect Reading Location',
		description:
			'Discover the best reading spots in Korea. Find libraries, cafes, parks, and other quiet places perfect for reading. Share your favorite reading locations with fellow book lovers.',
		keywords:
			'reading spots, Korea, libraries, cafes, quiet places, book lovers, study spaces, reading locations, Seoul, Busan, Daegu, reading community',
		url: BASE_URL
	},

	about: {
		title: 'About BookMaru - Find Your Perfect Reading Location',
		description:
			'Learn about BookMaru, a platform for discovering and sharing great reading spots in Korea. Built by book lovers, for book lovers.',
		keywords:
			'about bookmaru, reading community, Korea reading spots, book lovers, reading platform',
		url: `${BASE_URL}/about`
	},

	submit: {
		title: 'Add a Reading Spot - BookMaru',
		description:
			'Share your favorite reading location with the BookMaru community. Help fellow book lovers discover great places to read in Korea.',
		keywords:
			'add reading spot, share location, reading community, submit location, Korea reading spots',
		url: `${BASE_URL}/submit`
	},

	admin: {
		title: 'Admin Panel - BookMaru',
		description: 'Manage reading spot submissions and moderate content for the BookMaru community.',
		keywords: 'admin panel, content moderation, reading spots management',
		url: `${BASE_URL}/admin`
	}
};

/**
 * Generate meta tags for a specific page type
 */
export function getPageMeta(
	page: keyof typeof metaConfigs,
	customMeta?: Partial<MetaTags>
): string {
	const baseMeta = metaConfigs[page];
	const finalMeta = { ...baseMeta, ...customMeta };
	return generateMetaTags(finalMeta);
}

/**
 * Generate meta tags for a specific reading location
 */
export function getLocationMeta(location: {
	name: string;
	description?: string;
	city?: string;
	category?: string;
	image?: string;
}): string {
	const { name, description, city, category, image } = location;

	const title = `${name} - Reading Spot in ${city || 'Korea'} | BookMaru`;
	const metaDescription = description
		? `${description.substring(0, 150)}${description.length > 150 ? '...' : ''} - Find this ${category || 'reading spot'} and more on BookMaru.`
		: `Discover ${name}, a great ${category || 'reading spot'} in ${city || 'Korea'}. Find more reading locations on BookMaru.`;

	const keywords = [name, city, category, 'reading spot', 'Korea', 'book lovers', 'quiet place']
		.filter(Boolean)
		.join(', ');

	return generateMetaTags({
		title,
		description: metaDescription,
		keywords,
		image: image || DEFAULT_IMAGE,
		url: `${BASE_URL}/location/${encodeURIComponent(name)}`,
		type: 'article'
	});
}
