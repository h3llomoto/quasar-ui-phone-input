<template>
  <q-select
    :model-value="modelValue"
    :options="countryOptions"
    virtual-scroll-slice-size="9999"
    class="no-inherit-feedback no-feedback vue3-q-tel-input--country"
    :menu-offset="[12, 0]"
    options-dense
    v-bind="dropdownOptions ?? defaultDropdownOptions"
    @update:model-value="countryChanged"
    @popup-hide="searchText = ''"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            <span
              :class="!useIcon ? ['fi', `fi-${scope.opt.iso2LC}`] : ''"
            >{{ useIcon ? scope.opt.emoji : '' }}</span>
            <span class="text-no-wrap ellipsis q-ml-md">{{ scope.opt.name }}</span>
            <span class="q-ml-sm">+{{ scope.opt.dialCode }}</span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #selected-item="scope">
      <div
        v-if="scope.opt"
        class="q-pa-none ellipsis"
        style="min-height: unset"
      >
        <div class="flex items-center no-wrap">
          <span
            :class="!useIcon ? ['fi', `fi-${scope.opt.iso2LC}`] : ''"
          >{{ useIcon ? scope.opt.emoji : '' }}</span>
          <span
            v-if="!hideCountryCode"
            class="ellipsis text-no-wrap q-ml-xs"
            v-html="`+${scope.opt.dialCode}`"
          />
        </div>
      </div>
    </template>
    <template
      v-if="searching"
      #after-options
    >
      <div class="vue3-q-tel--country-selector last-search-item q-pa-sm">
        <q-input
          ref="input"
          v-model="searchText"
          v-bind="searchInputOptions ?? defaultSearchInputOptions"
          @update:model-value="performSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </template>
  </q-select>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { QSelect, QIcon, QInput } from 'quasar';
import { filterCountries } from './countries';
import type { Country, QInputRestProps, QSelectRestProps } from './types';

const defaultDropdownOptions:QSelectRestProps = {
  hideBottomSpace: true,
  hideDropdownIcon: true,
  borderless: true,
  dense: true,
};
const defaultSearchInputOptions:QInputRestProps = {
  dense: true,
  outlined: true,
  filled: true,
  label: 'Search',
};

const props = withDefaults(defineProps<{
  modelValue: Country;
  searching: boolean;
  dropdownOptions?: QSelectRestProps;
  searchInputOptions?: QInputRestProps;
  useIcon?: boolean;
  countries: Country[],
  hideCountryCode: boolean,
}>(), {
  dropdownOptions: undefined,
  useIcon: false,
  searchInputOptions: undefined,
});
const emits = defineEmits<{
  (event: 'update:model-value', value: Country): void;
  (event: 'country-changed', value: Country): void;
}>();

const searchText = ref('');
const countryOptions = ref<Country[]>([]);

onMounted(() => {
  countryOptions.value = props.countries;
});

function performSearch() {
  const needle = searchText.value.toLowerCase().trim();
  countryOptions.value = needle === '' ? props.countries : filterCountries(needle, props.countries);
}
function countryChanged(val: Country) {
  emits('update:model-value', val);
  emits('country-changed', val);
}

watch(() => props.modelValue, () => {
  searchText.value = '';
  performSearch();
});
</script>
