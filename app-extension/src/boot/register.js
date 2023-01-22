import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-quasar-phone-input'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
