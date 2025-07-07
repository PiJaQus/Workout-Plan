import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ManView from '../views/ManView.vue'
import WomanView from '../views/WomanView.vue'
import ManWeekView from '../views/ManWeekView.vue'
import WomanWeekView from '../views/WomanWeekView.vue'

const routes = [
    //mappowanie url do komponentow
    { path: '/', name: 'home', component: HomeView },
    { path: '/man', name: 'man', component: ManView },
    { path: '/woman', name: 'woman', component: WomanView },
    { path: '/man/week/:id', name: 'man-week', component: ManWeekView, props: true },
    { path: '/woman/week/:id', name: 'woman-week', component: WomanWeekView, props: true },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router