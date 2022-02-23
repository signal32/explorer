import {createPinia} from 'pinia';
import {createApp} from 'vue';
import App from './App.vue';
import router from './router';

import {IonButton, IonicVue} from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {createI18n} from "vue-i18n";
import enUS from './locales/en-us.json';

// Internationalization
export type MessageSchema = typeof enUS;
const i18n = createI18n<[MessageSchema], 'en-US'>(
    {
      legacy: false,
      locale: "en-US",
      messages: {
        'en-US': enUS,
      }
    }
);

/* Init global data store */
export const pinia = createPinia();

const app = createApp(App)
    .use(IonicVue, {
      //mode: 'ios'
    })
    .use(router)
    .use(pinia)
    .use(i18n)
    .component("IonButton", IonButton); //todo move global registration to separate file and add more


router.isReady().then(() => {
    app.mount('#app');
});