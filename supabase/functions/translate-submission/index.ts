import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

interface TranslationRequest {
	submission_id: number;
	original_language: string;
	name: string;
	description: string;
	recommended_book: any;
}

interface TranslationResponse {
	name: string;
	description: string;
	recommended_book: any;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY environment variable is required');
}

async function translateText(
	text: string,
	fromLang: string,
	toLang: string,
	isLocationName: boolean = false
): Promise<string> {
  let systemPrompt = `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. Return only the translation, no explanations or additional text.`;
  if (isLocationName) {
    if (fromLang === 'Korean' && toLang === 'English') {
      systemPrompt = `You are a professional translator specializing in Korean place names. When translating Korean location names to English, follow this specific format:
- Use romanized Korean names with hyphens for compound words
- Keep the original Korean structure but make it readable in English
- Examples: 
  * 종달리 책약방 → Jongdal-ri Chaekyakbang
  * 서울 도서관 → Seoul Library
  * 교보문고 광화문점 → Kyobo Book Center Gwanghwamun
  * 다독다독 북카페 → Dadokdadok Book Cafe
- For generic terms like "도서관" (library), "책방" (bookstore), "북카페" (book cafe), translate to English
- For specific place names, use romanization with hyphens
- Return only the translation, no explanations.`;
    } else if (fromLang === 'English' && toLang === 'Korean') {
      systemPrompt = `You are a professional translator specializing in location names. When translating English location names to Korean, follow this specific format:
- For English names, transcribe phonetically using Korean characters (외래어 표기법)
- Keep generic terms translated naturally in Korean
- Examples:
  * Checkngrow → 채그로
  * Starfield Library → 스타필드 도서관
  * Blue Square → 블루스퀘어
  * Coffee & Library → 커피앤도서관
- If it's a descriptive English name (like "Seoul Public Library"), translate meaningfully to Korean
- For brand names or unique names, use phonetic Korean transcription
- Return only the translation, no explanations.`;
    }
  }

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENAI_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: systemPrompt
				},
				{
					role: 'user',
					content: text
				}
			],
			max_tokens: 1000,
			temperature: 0.3
		})
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	}

	const data = await response.json();
	return data.choices[0].message.content.trim();
}

async function translateBook(book: any, fromLang: string, toLang: string): Promise<any> {
	if (!book || !book.title || !book.author) {
		return book;
	}

	// For book titles, use regular translation (not location name formatting)
	const translatedTitle = await translateText(book.title, fromLang, toLang, false);
	const translatedAuthor = await translateText(book.author, fromLang, toLang, false);

	return {
		...book,
		title: translatedTitle,
		author: translatedAuthor
	};
}

Deno.serve(async (req: Request) => {
	// Handle CORS
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
			}
		});
	}

	try {
		const {
			submission_id,
			original_language,
			name,
			description,
			recommended_book
		}: TranslationRequest = await req.json();

		if (!submission_id || !original_language || !name) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		const fromLang = original_language === 'ko' ? 'Korean' : 'English';
		const toLang = original_language === 'ko' ? 'English' : 'Korean';

		// Translate name (treat as location name for proper formatting)
		const translatedName = await translateText(name, fromLang, toLang, true);

		// Translate description if provided
		let translatedDescription = '';
		if (description && description.trim()) {
			translatedDescription = await translateText(description, fromLang, toLang);
		}

		// Translate recommended book if provided
		let translatedBook = null;
		if (recommended_book && recommended_book.title && recommended_book.author) {
			translatedBook = await translateBook(recommended_book, fromLang, toLang);
		}

		const result: TranslationResponse = {
			name: translatedName,
			description: translatedDescription,
			recommended_book: translatedBook
		};

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('Translation error:', error);

		return new Response(
			JSON.stringify({
				error: 'Translation failed',
				details: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	}
});
