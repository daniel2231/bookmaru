<script lang="ts">
	import { _ } from 'svelte-i18n';

	// Make translations reactive
	$: nameHeader = $_('table.header.name');
	$: cityHeader = $_('table.header.city');
	$: categoryHeader = $_('table.header.category');
	$: quietnessHeader = $_('table.header.quietness');
</script>

<thead class="border-b-2 border-brand-primary">
	<tr>
		<th class="w-16 px-4 py-2 text-left text-sm font-medium"></th>

		<!-- Name Column -->
		<th class="w-2/5 py-2 text-left text-sm font-medium text-brand-primary">
			{nameHeader}
		</th>

		<!-- City Column -->
		<th class="w-40 py-2 text-left text-sm font-medium text-brand-primary">
			{cityHeader}
		</th>

		<!-- Category Column -->
		<th class="w-36 py-2 text-left text-sm font-medium text-brand-primary">
			{categoryHeader}
		</th>

		<!-- Quietness Column -->
		<th class="w-32 py-2 text-left text-sm font-medium text-brand-primary">
			{quietnessHeader}
		</th>
	</tr>
</thead>
