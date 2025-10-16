/**
 * Type definitions for the Bookmaru application
 * This file re-exports and extends the Supabase database types
 */

import type { Database } from './database.types';

// ===========================
// Database Types (from Supabase)
// ===========================

/** Database row type for the places table */
export type PlaceRow = Database['public']['Tables']['places']['Row'];

/** Insert type for creating new places */
export type PlaceInsert = Database['public']['Tables']['places']['Insert'];

/** Update type for modifying existing places */
export type PlaceUpdate = Database['public']['Tables']['places']['Update'];

// ===========================
// Enum Types
// ===========================

/** Supported languages in the application */
export type Language = 'en' | 'ko';

/** Status values for place submissions */
export type PlaceStatus = 'pending' | 'approved' | 'rejected';

// ===========================
// UI Models
// ===========================

/**
 * Represents a recommended book with title, author, and optional link
 */
export interface RecommendedBook {
	title: string;
	author: string;
	link?: string;
}

/**
 * Simplified place model for UI display
 */
export interface UiPlace {
	id: string;
	name: string;
	description: string | null;
	region: string | null;
	category: string | null;
	quietness: number | null;
	photos: string[] | null;
	latitude: number | null;
	longitude: number | null;
	recommended_book: RecommendedBook | null;
}

/**
 * Form data for submitting a new place
 */
export interface PlaceFormData {
	original_language: Language;
	name_en: string | null;
	name_ko: string | null;
	description_en: string | null;
	description_ko: string | null;
	region_en: string | null;
	region_ko: string | null;
	latitude: number | null;
	longitude: number | null;
	category: string | null;
	quietness: number | null;
	photos: string[] | null;
}
