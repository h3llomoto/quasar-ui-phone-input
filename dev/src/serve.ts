import { createApp } from 'vue';
import Dev from './Serve.vue';
import quasarOptions from './quasar-user-options';
import { Quasar } from 'quasar';
import 'quasar/dist/quasar.sass'

const app = createApp(Dev);
app.use(Quasar, quasarOptions);
app.mount('#app');
