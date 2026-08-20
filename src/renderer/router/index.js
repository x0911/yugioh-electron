import { createRouter, createWebHashHistory } from 'vue-router';
import LoadingView from '../views/LoadingView.vue';
import MainMenuView from '../views/MainMenuView.vue';
import SettingsView from '../views/SettingsView.vue';
import DeckEditView from '../views/DeckEditView.vue';
import CoinTossView from '../views/CoinTossView.vue';
import PreDuelVideoView from '../views/PreDuelVideoView.vue';
import DuelView from '../views/DuelView.vue';
const routes = [
    {
        path: '/',
        name: 'loading',
        component: LoadingView,
    },
    {
        path: '/main-menu',
        name: 'main-menu',
        component: MainMenuView,
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView,
    },
    {
        path: '/deck-edit',
        name: 'deck-edit',
        component: DeckEditView,
    },
    {
        path: '/coin-toss',
        name: 'coin-toss',
        component: CoinTossView,
    },
    {
        path: '/pre-duel-video',
        name: 'pre-duel-video',
        component: PreDuelVideoView,
    },
    {
        path: '/duel',
        name: 'duel',
        component: DuelView,
    },
    {
        path: '/characters',
        redirect: '/main-menu',
    },
];
// Dev-only Kitchen Sink QA route (excluded from production builds)
if (import.meta.env.DEV) {
    routes.push({
        path: '/dev/kitchen-sink',
        name: 'dev-kitchen-sink',
        component: () => import('../views/KitchenSinkView.vue'),
    });
}
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
export default router;
