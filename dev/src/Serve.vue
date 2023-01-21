<template>
  <div id="app">
    <div class="row">
      <div class="col-3 offset-3 q-mt-lg">
        <q-phone-input
          v-model="input"
          label="Phone"
          :input-options="{
            dense: true,
            filled: true,
          }"
          default-country="de"
        />
      </div>
    </div>
    <div>entered telephone number : {{ input }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const input = ref('');
</script>
