<template>
  <q-input
    v-bind="inputOptions"
    :model-value="number"
    :error="!!errorMessage || undefined"
    :error-message="errorMessage"
    :class="[
      'vue3-q-tel-input', 'no-inherit-feedback',
      { 'vue3-q-tel-input--has-value': !!number }
    ]"
    :rules="[...(rules ?? []), validate]"
    :lazy-rules="lazyRules"
    @update:model-value="phoneChanged"
  >
    <template #prepend>
      <CountrySelection
        v-model="country"
        :use-icon="useIcon"
        :searching="searching"
        :dropdown-options="dropdownOptions"
        :search-input-options="searchInputOptions"
        class="no-border-field-before no-padding-field font-reduced-input-adon"
        :countries="countriesReordered"
        :hide-country-code="hideCountryCode"
        @country-changed="countryChanged()"
      />
    </template>
    <template #append>
      <slot name="append" />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import {
  ref,
  nextTick,
  watch,
  computed,
} from 'vue';
import {
  QInput, ValidationRule,
} from 'quasar';
import {
  PhoneNumberUtil,
  PhoneNumber,
  PhoneNumberFormat,
} from 'google-libphonenumber';
import CountrySelection from './CountrySelection.vue';
import type {
  Country,
  QInputRestProps,
  QSelectRestProps,
} from './types';
import countries, {
  getCountryByDialCode,
  getDefault,
  getCountryCodeFromPhoneNumber,
} from './countries';

const phoneNumberUtil: PhoneNumberUtil = new PhoneNumberUtil();
const props = withDefaults(defineProps<{
  modelValue: string | number;
  searching?: boolean;
  required?: boolean;
  inputOptions?: QInputRestProps;
  dropdownOptions?: QSelectRestProps;
  searchInputOptions?: QInputRestProps;
  defaultCountry?: string;
  rules?: ValidationRule[],
  lazyRules?: boolean;
  useIcon?: boolean;
  validationMessage?: string,
  errorMessage?: string,
  error?: boolean,
  preferCountries?: Country['iso2'][],
  hideCountryCode?: boolean,
}>(), {
  modelValue: '',
  required: false,
  searching: false,
  dropdownOptions: undefined,
  defaultCountry: 'us',
  lazyRules: false,
  rules: undefined,
  useIcon: false,
  validationMessage: 'Please enter correct phone number',
  errorMessage: undefined,
  error: false,
  hideCountryCode: false,
  inputOptions: undefined,
  searchInputOptions: undefined,
  preferCountries: undefined,
});

const emits = defineEmits<{
  (event: 'update:model-value', value: string): void;
  (event: 'input', value: string): void;
  (event: 'update:error', value: boolean): void;
  (event: 'country-changed', value: Country): void,
}>();

const country = ref(<Country>getDefault(props.defaultCountry));
emits('country-changed', country.value);
const oldCountry = ref<Country>();
const number = ref('');
const hasError = ref(false);
const prevValue = ref('01234567890123456789');
const phoneNumber = ref<PhoneNumber>();

const error = computed(() => (!props.inputOptions?.disable ? hasError.value : undefined));

const countriesReordered = computed(() => {
  if (!props.preferCountries || !props.preferCountries.length) return countries;

  const preferedCountries:Country[] = [];
  const newCountries = [...countries].filter((country) => {
    const isPrefered = props.preferCountries?.includes(country.iso2);
    if (isPrefered) {
      preferedCountries.push(country);
    }
    return !isPrefered;
  });
  return [...preferedCountries, ...newCountries];
});

function getNumber(instance: PhoneNumber): string {
  if (!phoneNumber.value) {
    return '';
  }
  let phone: string = phoneNumberUtil.format(instance, PhoneNumberFormat.NATIONAL);
  if (phone.indexOf('0') === 0) {
    phone = phone.replace(/^0/, '');
  }
  return phone;
}

function setCountry(c: Country) {
  if (c.iso2 === country.value.iso2) return;
  country.value = c;
  emits('country-changed', country.value);
}

async function validate() {
  await setPhone();

  return hasError.value ? props.validationMessage : true;
}

async function setPhone() {
  let currCountry = country.value;
  const stringModelValue = props.modelValue.toString().trim();

  if (stringModelValue !== '' && stringModelValue.includes('+')) {
    const inCountry = getCountryCodeFromPhoneNumber(stringModelValue, countriesReordered.value);
    if (inCountry && country.value?.iso2 !== inCountry.iso2) {
      currCountry = inCountry;
      await nextTick(() => {
        setCountry(currCountry);
      });
    }
  }
  try {
    phoneNumber.value = phoneNumberUtil.parse(stringModelValue, country.value.iso2);
    number.value = getNumber(phoneNumber.value);
    hasError.value = !phoneNumberUtil.isValidNumberForRegion(phoneNumber.value, country.value.iso2);
  } catch (e) {
    phoneNumber.value = undefined;
    hasError.value = stringModelValue.length ? props.required : true;

    number.value = stringModelValue;
  }

  emits('update:error', hasError.value);
}

function phoneChanged(v: string | number | null) {
  const val = v === null ? '' : v.toString();
  let phone: PhoneNumber | undefined;
  try {
    phone = phoneNumberUtil.parse(val.trim(), country.value.iso2);
  } catch {
    phone = undefined;
  }
  const filteredVal = val.replace(/ /g, '');
  if (filteredVal.length > 2 && filteredVal.indexOf('+') === 0) {
    // some country code is in action
    const parsedCountry = getCountryByDialCode(filteredVal);
    if (parsedCountry) {
      setCountry(parsedCountry);
      countryChanged(filteredVal.replace(`+${parsedCountry.dialCode}`, ''));
    }
  }
  const num = phone ? getNumber(phone) : val;
  const isPhoneExistsAndValid = phone && phoneNumberUtil.isValidNumberForRegion(phone, country.value.iso2);
  prevValue.value = isPhoneExistsAndValid
    ? getNumber(phone!)
    : prevValue.value;
  if (num.replace(/ /g, '').length > prevValue.value.replace(/ /g, '').length) {
    setPhone(); // no need to update as its not valid
    return;
  }
  const phoneFormatted = phone
    ? phoneNumberUtil.format(phone, PhoneNumberFormat.INTERNATIONAL)
    : val.trim();
  emits('update:model-value', phoneFormatted);
  emits('input', phoneFormatted);
}

function countryChanged(val?: string, force?: boolean) {
  emits('country-changed', country.value);

  prevValue.value = '01234567890123456789';
  const value = (
    (
      force
        ? val
        : (val || props.modelValue).toString())
      || ''
  ).trim();
  phoneChanged(
    oldCountry.value
      ? value.replace(`+${oldCountry.value.dialCode}`, `+${country.value.dialCode}`)
      : value,
  );
  setPhone();
}

watch(() => props.modelValue, setPhone, { immediate: true });

watch(() => props.defaultCountry, (defaultCountry) => {
  if (defaultCountry) {
    setCountry(<Country>getDefault(defaultCountry));
  }
}, { immediate: true });

watch(() => country.value, () => {
  nextTick(() => {
    oldCountry.value = country.value;
  });
}, { immediate: true });
</script>

<style lang="scss">
@import './component.scss';
</style>
