<script lang="ts">
	import { _, locale } from 'svelte-i18n';
	import { createEventDispatcher } from 'svelte';
	import koreanRegions from './data/korean-regions.json';

	export let selectedRegion: string = '';
	export let selectedDistrict: string = '';

	const dispatch = createEventDispatcher<{
		regionChange: {
			region: string;
			district: string;
			regionData?: { ko: string; en: string } | null;
			districtData?: { ko: string; en: string } | null;
		};
	}>();

	// Get current language
	$: currentLang = $locale || 'en';

	// 시/도 목록 생성 (Korean names as keys, but display in current language)
	const regions = [
		'서울특별시',
		'부산광역시',
		'대구광역시',
		'인천광역시',
		'광주광역시',
		'대전광역시',
		'울산광역시',
		'세종특별자치시',
		'제주특별자치도',
		...Object.keys(koreanRegions.대한민국_도시_행정구.경기도_주요도시)
	];

	// 선택된 시/도에 따른 하위 행정구 목록 생성
	$: districts = getDistricts(selectedRegion);

	function getDistricts(region: string): Array<{ korean: string; english: string }> {
		if (!region) return [];

		const data = koreanRegions.대한민국_도시_행정구 as any;

		// 특별시, 광역시, 특별자치시
		if (data[region] && data[region].행정구) {
			return data[region].행정구 || [];
		}

		// 경기도 주요도시
		if (data.경기도_주요도시[region]) {
			const districts = data.경기도_주요도시[region].행정구;
			// "단일 행정구역"인 경우 해당 시 이름을 반환
			if (districts.some((d: any) => d.korean === '단일 행정구역')) {
				return [{ korean: region, english: getEnglishName(region) }];
			}
			return districts;
		}

		// 제주특별자치도
		if (region === '제주특별자치도') {
			return data.제주.제주특별자치도.행정시;
		}

		return [];
	}

	function getEnglishName(koreanName: string): string {
		const data = koreanRegions.대한민국_도시_행정구 as any;

		// Check special cities and metropolitan cities
		if (data[koreanName] && data[koreanName].english_name) {
			return data[koreanName].english_name.trim();
		}

		// Check Gyeonggi major cities
		if (data.경기도_주요도시[koreanName] && data.경기도_주요도시[koreanName].english_name) {
			return data.경기도_주요도시[koreanName].english_name.trim();
		}

		// Check Jeju
		if (koreanName === '제주특별자치도') {
			return data.제주.제주특별자치도.english_name.trim();
		}

		return koreanName; // fallback to Korean name
	}

	function getDisplayName(koreanName: string): string {
		return currentLang === 'ko' ? koreanName : getEnglishName(koreanName);
	}

	function getDistrictDisplayName(district: { korean: string; english: string }): string {
		return currentLang === 'ko' ? district.korean : district.english;
	}

	function handleRegionChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedRegion = target.value;
		selectedDistrict = ''; // 시/도가 바뀌면 하위 행정구 초기화

		// Get bilingual region data
		const regionData = getRegionData(selectedRegion);
		dispatch('regionChange', {
			region: selectedRegion,
			district: selectedDistrict,
			regionData: regionData,
			districtData: null
		});
	}

	function handleDistrictChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedDistrict = target.value;

		// Get bilingual data for both region and district
		const regionData = getRegionData(selectedRegion);
		const districtData = getDistrictData(selectedRegion, selectedDistrict);
		dispatch('regionChange', {
			region: selectedRegion,
			district: selectedDistrict,
			regionData: regionData,
			districtData: districtData
		});
	}

	function getRegionData(koreanName: string) {
		if (!koreanName) return null;

		return {
			ko: koreanName,
			en: getEnglishName(koreanName)
		};
	}

	function getDistrictData(regionKorean: string, districtKorean: string) {
		if (!regionKorean || !districtKorean) return null;

		const districts = getDistricts(regionKorean);
		const districtObj = districts.find((d) => d.korean === districtKorean);

		if (!districtObj) return null;

		return {
			ko: districtObj.korean,
			en: districtObj.english
		};
	}

	// 전체 지역명 생성 (예: "서울특별시 강남구", "수원시 장안구")
	$: fullRegionName = (() => {
		if (!selectedRegion) return '';

		const regionDisplay = getDisplayName(selectedRegion);

		if (selectedDistrict) {
			// Find the district object to get the display name
			const districtObj = districts.find((d) => d.korean === selectedDistrict);
			const districtDisplay = districtObj ? getDistrictDisplayName(districtObj) : selectedDistrict;
			return `${regionDisplay} ${districtDisplay}`;
		}

		return regionDisplay;
	})();
</script>

<div class="space-y-4">
	<!-- 시/도 선택 -->
	<div>
		<label for="region-select" class="mb-2 block text-sm font-medium text-gray-700">
			{@html $_('submit.region')}
		</label>
		<select
			id="region-select"
			bind:value={selectedRegion}
			on:change={handleRegionChange}
			class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
		>
			<option value="">{@html $_('submit.select_region')}</option>
			{#each regions as region}
				<option value={region}>{getDisplayName(region)}</option>
			{/each}
		</select>
	</div>

	<!-- 하위 행정구 선택 (시/도가 선택된 경우에만 표시) -->
	{#if selectedRegion && districts.length > 0}
		<div>
			<label for="district-select" class="mb-2 block text-sm font-medium text-gray-700">
				{@html $_('submit.district')}
			</label>
			<select
				id="district-select"
				bind:value={selectedDistrict}
				on:change={handleDistrictChange}
				class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
			>
				<option value="">{@html $_('submit.select_district')}</option>
				{#each districts as district}
					<option value={district.korean}>{getDistrictDisplayName(district)}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- 선택된 전체 지역명 표시 -->
	{#if fullRegionName}
		<div class="text-sm text-gray-600">
			<strong>{@html $_('submit.selected_region')}:</strong>
			{fullRegionName}
		</div>
	{/if}
</div>
