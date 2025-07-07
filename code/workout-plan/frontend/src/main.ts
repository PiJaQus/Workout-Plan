import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faEdit, 
  faSave, 
  faTrashAlt, 
  faTimes, 
  faPlus,
  faPlusCircle,
  faArrowLeft, 
  faDumbbell, 
  faInfoCircle,
  faLayerGroup,
  faRepeat,
  faMale,
  faFemale,
  faImage,
  faArrowRight,
    faSort,
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faEdit, 
  faSave, 
  faTrashAlt, 
  faTimes, 
  faPlus,
  faPlusCircle,
  faArrowLeft, 
  faDumbbell,
  faInfoCircle,
  faLayerGroup,
  faRepeat,
  faMale,
  faFemale,
    faImage,
    faArrowRight,
    faSort,
)

// Tworzymy instancję aplikacji Vue i podłączamy router
const app = createApp(App)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.mount('#app')