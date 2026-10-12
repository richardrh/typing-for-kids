import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { getLesson, lessons } from '../lessons/catalog'
import { getLastLessonId, loadProgress } from '../progress/storage'
import { loadTheme, themes } from '../themes/catalog'
import LessonPage from './LessonPage.vue'
import NotFoundPage from './NotFoundPage.vue'

export const router = createRouter({
  history: import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createWebHashHistory(`${import.meta.env.BASE_URL}app/`)
    : createWebHistory(`${import.meta.env.BASE_URL}app/`),
  routes: [
    { path: '/', redirect: to => {
      const theme = themes.find(item => item.id === to.query.theme)?.id ?? loadTheme()
      const completed = loadProgress().animals[theme].completed
      const next = lessons.find(lesson => !completed.includes(lesson.id)) ?? lessons[0]
      return { name: 'lesson', params: { lessonId: getLastLessonId() ?? next.id }, query: to.query }
    } },
    { path: '/lessons/:lessonId', name: 'lesson', component: LessonPage,
      beforeEnter: to => getLesson(String(to.params.lessonId)) ? true : { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach(to => {
  const lesson = to.name === 'lesson' ? getLesson(String(to.params.lessonId)) : undefined
  document.title = lesson ? `${lesson.title} — Typing for Kids` : 'Typing for Kids'
})
