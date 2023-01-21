<template>
  <q-input
    :error="hasError"
    :model-value="number"
    class="vue3-q-tel-input no-inherit-feedback"
    @update:model-value="phoneChanged"
    :maxlength="prevValue.length"
    :v-bind="inputOptions"
    :error-message="errorMessage"
  >
    <template #prepend>
      <CountrySelection
        v-model="country"
        :use-icon="useIcon"
        @countryChanged="countryChanged()"
        :searching="searching"
        :dropdown-options="dropdownOptions"
        :search-input-options="searchInputOptions"
        class="no-border-field-before no-padding-field font-reduced-input-adon"
      />
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import {
  ref,
  onMounted,
  nextTick,
  watch
} from 'vue';
import {
  QInput,
  type QInputProps,
  type QSelectProps,
} from 'quasar';
import {
  PhoneNumberUtil,
  PhoneNumber,
  PhoneNumberFormat,
} from 'google-libphonenumber';
import CountrySelection from '@/component/CountrySelection.vue';
import type { Country, QInputRestProps, QSelectRestProps } from '@/component/types';
import {
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
  eagerValidate?: boolean;
  useIcon?: boolean;
  errorMessage?: string,
}>(), {
  modelValue: '',
  required: false,
  searching: false,
  dropdownOptions: undefined,
  defaultCountry: 'us',
  eagerValidate: false,
  useIcon: false,
  errorMessage: 'Please type coppect phone number'
});

const emits = defineEmits<{
  (event: 'update:model-value', value: string): void;
  (event: 'input', value: string): void;
  (event: 'error', value: boolean): void;
}>();

const country = ref(<Country>getDefault(props.defaultCountry));
const oldCountry = ref<Country | undefined>(undefined);
const number = ref('');
const hasError = ref(false);
const prevValue = ref('01234567890123456789');
const phoneNumber = ref<PhoneNumber | undefined>(undefined);

onMounted(() => {

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
function setPhone() {
  let currCountry = country.value;
  const stringModelValue = props.modelValue.toString().trim();

  if (props.modelValue.toString() !== '') {
    const inCountry = getCountryCodeFromPhoneNumber(stringModelValue);

    if (inCountry && country.value?.iso2 !== inCountry.iso2) {
      currCountry = inCountry;
      nextTick(() => {
        country.value = currCountry;
      });
    }
  }

  try {
    phoneNumber.value = phoneNumberUtil.parse(stringModelValue, country.value.iso2);
    number.value = getNumber(phoneNumber.value);
    hasError.value = !phoneNumberUtil.isValidNumberForRegion(phoneNumber.value, country.value.iso2);
  } catch (e) {
    phoneNumber.value = undefined;
    hasError.value = props.eagerValidate
      ? (
        stringModelValue.trim() === ''
          ? props.required
          : true
        )
      : false;
    number.value = props.modelValue.toString().trim();
  }
  emits('error', hasError.value);
}
function phoneChanged(val: string | number | null) {
  val = val === null ? '' : val.toString();
  let phone: PhoneNumber | undefined;

  try {
    phone = phoneNumberUtil.parse(val.trim(), country.value.iso2);
  } catch {
    phone = undefined;
  }

  const filtered_val = val.replace(/ /g, '');

  if (filtered_val.length > 2 && filtered_val.indexOf('+') === 0) {
    // some country code is in action
    const parsedCountry = getCountryByDialCode(filtered_val);
    if (parsedCountry) {
      country.value = parsedCountry;
      countryChanged(filtered_val.replace(`+${parsedCountry.dialCode}`, ''));
    }
  }
  const num = phone ? getNumber(phone) : val;
  const isPhoneExistsAndValid = phone && phoneNumberUtil.isValidNumberForRegion(phone, country.value.iso2);
  prevValue.value = isPhoneExistsAndValid
    ? getNumber(phone!)
    : prevValue.value;

  if (num.replace(/ /g, '').length > prevValue.value.replace(/ /g, '').length) {
    return setPhone(); // no need to update as its not valid
  }
  const phoneFormatted = phone
    ? phoneNumberUtil.format(phone, PhoneNumberFormat.INTERNATIONAL)
    : val.trim();

  emits('update:model-value', phoneFormatted);
  emits('input', phoneFormatted);
}

function countryChanged(val?: string, force?: boolean) {
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
    : value);
  setPhone();
}

watch(
  () => props.modelValue,
  setPhone,
  { immediate: true, },
);

watch(() => props.defaultCountry, (defaultCountry) => {
  if (defaultCountry) {

    country.value = <Country>getDefault(defaultCountry);
  }
}, { immediate: true, });

watch(() => country.value, () => {
  nextTick(() => {
    oldCountry.value = country.value;
  });
}, { immediate: true, })

</script>

<style lang="scss">
@import '@/style';
</style>
