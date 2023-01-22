<template>
  <q-select
    :model-value="modelValue"
    :options="countryOptions"
    virtual-scroll-slice-size="9999"
    class="no-inherit-feedback no-feedback v3-q-tel-input--country"
    :menu-offset="[12, 0]"
    options-dense
    v-bind="dropdownOptions ?? defaultDropdownOptions"
    @update:model-value="countryChanged"
    @popup-hide="searchText = ''"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            <span
              :class="!useIcon ? ['v3q_tel__flag', scope.opt.iso2LC] : ''"
            >{{ useIcon ? scope.opt.emoji : '' }}</span>
            <span class="text-no-wrap ellipsis q-ml-md">{{ scope.opt.name }}</span>
            <span class="q-ml-sm">+{{ scope.opt.dialCode }}</span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected-item="scope">
      <div
        v-if="scope.opt"
        class="q-pa-none ellipsis"
        style="min-height: unset"
      >
        <div class="flex items-center no-wrap">
          <span
            :class="{
              v3q_tel__flag: !useIcon,
              [scope.opt.iso2LC]: !useIcon,
            }"
          >{{ useIcon ? scope.opt.emoji : '' }}</span>
          <span class="ellipsis text-no-wrap q-ml-xs" v-html="`+${scope.opt.dialCode}`"></span>
        </div>
      </div>
    </template>
    <template
      v-if="searching"
      v-slot:after-options
    >
      <div class="v3-q-tel--country-selector last-search-item q-pa-sm">
        <q-input
          v-model="searchText"
          ref="input"
          v-bind="searchInputOptions ?? defaultSearchInputOptions"
          @update:model-value="performSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import countries, { filterCountries } from './countries';
import { Country, QInputRestProps, QSelectRestProps } from './types';
import { QSelect, QIcon, QInput } from 'quasar';

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
}
const props = withDefaults(defineProps<{
  modelValue: Country;
  searching: boolean;
  dropdownOptions?: QSelectRestProps;
  searchInputOptions?: QInputRestProps;
  useIcon?: boolean;
}>(), {
  dropdownOptions: undefined,
  useIcon: false,
});

const emits = defineEmits<{
  (event: 'update:model-value', value: Country): void;
  (event: 'country-changed', value: Country): void;
}>();

const searchText = ref('');
const countryOptions = ref<Country[]>([]);

onMounted(() => {
  countryOptions.value = countries;
});


function performSearch() {
  const needle = searchText.value.toLowerCase().trim();
  countryOptions.value = needle === '' ? countries : filterCountries(needle);
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
