import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Tworzymy instancję aplikacji Vue i podłączamy router
createApp(App)
    .use(router)
    .mount('#app')