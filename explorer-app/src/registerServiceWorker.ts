/* eslint-disable no-console */

import {register} from 'register-service-worker'
import {alertController} from '@ionic/vue';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    async updated() {
      console.log('New content is available; please refresh.');
      const alert = await alertController.create({
        header: 'Update available',
        message: 'Restart the app to apply update.',
        buttons: [
          {
            text: 'Later',
            role: 'cancel',
            id: 'cancel-button'
          },
          {
            text: 'Restart Now',
            id: 'restart-button',
            handler: () => {
              console.log('Restarting app to apply update');
              location.reload();
            }
          }
        ]
      });
      await alert.present();
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
      services.notificationService.pushNotification({
        title: 'Offline',
        description: 'No internet connection. App is running in offline mode.',
        type: NotificationType.TOAST
      })
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
