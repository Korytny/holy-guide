import * as React from "react"

const SMALL_SCREEN_BREAKPOINT = 640 // Новый breakpoint

export function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Функция для проверки и установки состояния
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < SMALL_SCREEN_BREAKPOINT)
    }

    // Проверяем размер при монтировании компонента
    checkScreenSize()

    // Добавляем слушатель события resize
    window.addEventListener("resize", checkScreenSize)

    // Удаляем слушатель при размонтировании компонента
    return () => window.removeEventListener("resize", checkScreenSize)
  }, []) // Пустой массив зависимостей гарантирует, что эффект запустится один раз

  return isSmallScreen // Возвращаем undefined при первой отрисовке, затем boolean
}
