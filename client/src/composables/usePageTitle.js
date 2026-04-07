import { watch } from 'vue'

const SITE = 'Blog'

/**
 * @param {() => string | undefined | null} getTitle
 */
export function usePageTitle(getTitle) {
  watch(
    () => getTitle(),
    (t) => {
      document.title = t ? `${t} · ${SITE}` : SITE
    },
    { immediate: true }
  )
}
