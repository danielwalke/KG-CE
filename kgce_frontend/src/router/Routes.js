import HomeView from '../components/home/Home.vue'
import AboutView from '../components/about/About.vue'
import ChatView from '../components/chat/Chat.vue'

export const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/chat', component: ChatView },
]

