import QPhoneInput from './components/QPhoneInput.vue'


const version = __UI_VERSION__

function install (app) {
  app.component('QPhoneInput', QPhoneInput)

}

export {
  version,
  QPhoneInput,

  install
}
