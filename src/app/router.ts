import { createRouter, createWebHistory } from 'vue-router'
import { getLesson } from '../lessons/catalog'
import { getLastLessonId } from '../progress/storage'
import LessonPage from './LessonPage.vue'
import NotFoundPage from './NotFoundPage.vue'

export const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/', redirect: to => ({ name: 'lesson', params: { lessonId: getLastLessonId() ?? 'easy-animal-words' }, query: to.query }) },
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
