import { useRouter } from 'vue-router'

export const useQuickRouter = () => {
  const router = useRouter()

  const back = () => {
    if (history.length > 0) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const push = (path: string) => {
    router.push(path)
  }

  return {
    back,
    push
  }
}
