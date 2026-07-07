export interface MetaTags {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	path?: string;
	type?: 'website' | 'article';
	author?: string;
	robots?: string;
	locale?: string;
	structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export const SITE_URL = 'https://bookmaru.site';
export const SITE_NAME = 'BookMaru';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_AUTHOR = 'Daniel Kang (@danielkang)';

const defaultStructuredData = [
	{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		inLanguage: ['en', 'ko'],
		description: 'BookMaru helps readers discover and share quiet reading spots across Korea.'
	},
	{
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: DEFAULT_IMAGE,
		sameAs: ['https://github.com/daniel2231/bookmaru']
	}
];

export const metaConfigs = {
	home: {
		title: 'BookMaru - Reading Spots in Korea',
		description:
			'Discover libraries, cafes, bookstores, parks, and quiet public spaces for reading across Korea. Browse community-recommended reading spots in English and Korean.',
		keywords:
			'reading spots Korea, quiet cafes Korea, Korean libraries, bookstores Korea, places to read Seoul, study cafes Korea, BookMaru',
		path: '/',
		structuredData: defaultStructuredData
	},

	about: {
		title: 'About BookMaru - Reading Spots in Korea',
		description:
			'Learn about BookMaru, a bilingual community project for discovering and sharing great places to read across Korea.',
		keywords:
			'about BookMaru, Korea reading community, reading spots Korea, bilingual reading platform',
		path: '/about',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About BookMaru',
			url: `${SITE_URL}/about`,
			isPartOf: {
				'@type': 'WebSite',
				name: SITE_NAME,
				url: SITE_URL
			}
		}
	},

	submit: {
		title: 'Add a Reading Spot - BookMaru',
		description:
			'Share a library, cafe, bookstore, park, or other quiet reading location in Korea with the BookMaru community.',
		keywords:
			'add reading spot, submit reading location, share quiet place Korea, BookMaru submission',
		path: '/submit'
	},

	contact: {
		title: 'Contact BookMaru',
		description:
			'Contact BookMaru with feedback, corrections, or questions about reading spots in Korea.',
		keywords: 'contact BookMaru, BookMaru feedback, reading spots Korea corrections',
		path: '/contact'
	},

	admin: {
		title: 'Admin Panel - BookMaru',
		description: 'Manage BookMaru reading spot submissions.',
		path: '/admin',
		robots: 'noindex, nofollow'
	}
} satisfies Record<string, MetaTags>;

export function absoluteUrl(path = '/'): string {
	if (/^https?:\/\//.test(path)) return path;
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function getPageMeta(
	page: keyof typeof metaConfigs,
	customMeta?: Partial<MetaTags>
): MetaTags {
	return { ...metaConfigs[page], ...customMeta };
}

export function getLocationMeta(location: {
	name: string;
	description?: string;
	city?: string;
	category?: string;
	image?: string;
}): MetaTags {
	const { name, description, city, category, image } = location;
	const title = `${name} - Reading Spot in ${city || 'Korea'} | BookMaru`;
	const metaDescription = description
		? `${description.slice(0, 150)}${description.length > 150 ? '...' : ''} Find this ${category || 'reading spot'} and more on BookMaru.`
		: `Discover ${name}, a great ${category || 'reading spot'} in ${city || 'Korea'}. Find more reading locations on BookMaru.`;

	return {
		title,
		description: metaDescription,
		keywords: [name, city, category, 'reading spot', 'Korea', 'book lovers', 'quiet place']
			.filter(Boolean)
			.join(', '),
		image: image || DEFAULT_IMAGE,
		path: `/location/${encodeURIComponent(name)}`,
		type: 'article',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'Place',
			name,
			description: metaDescription,
			address: city
				? { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'KR' }
				: undefined,
			image: image || DEFAULT_IMAGE,
			url: absoluteUrl(`/location/${encodeURIComponent(name)}`)
		}
	};
}
