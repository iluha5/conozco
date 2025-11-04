import { useRef, useEffect } from 'react'

type ProgressDotsProps = {
  totalExercises: number
  completedExercises: number
  exerciseResults?: (boolean | null)[]
  currentIndex?: number
}

export function ProgressDots({ totalExercises, completedExercises, exerciseResults = [], currentIndex }: ProgressDotsProps) {
  const dotsRef = useRef<HTMLDivElement>(null)

  // Прокрутка к текущей точке отключена
  // useEffect(() => {
  //   // Автоматическая прокрутка к текущей точке
  //   if (dotsRef.current) {
  //     const dotElement = dotsRef.current.children[completedExercises] as HTMLElement
  //     if (dotElement) {
  //       dotElement.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'nearest',
  //         inline: 'center'
  //       })
  //     }
  //   }
  // }, [completedExercises])

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={dotsRef}
        className="flex gap-2 px-4 py-2 min-w-max justify-center"
        style={{ scrollbarWidth: 'thin' }}
      >
        {Array.from({ length: totalExercises }, (_, index) => {
          let dotClass = 'w-3 h-3 rounded-full transition-colors duration-300 '

          // Показываем индикатор на текущей карточке
          const activeIndex = currentIndex !== undefined ? currentIndex : completedExercises
          if (index === activeIndex) {
            dotClass += 'ring-2 ring-purple-400 ring-offset-1 '
          }

          // Определяем цвет точки на основе результата
          const result = exerciseResults[index]
          if (result === true) {
            dotClass += 'bg-green-500'
          } else if (result === false) {
            dotClass += 'bg-red-500'
          } else if (result === null) {
            // Еще не завершено
            dotClass += 'bg-gray-300'
          } else {
            // Для совместимости
            dotClass += 'bg-gray-300'
          }

          const getStatus = () => {
            if (index < completedExercises) {
              const result = exerciseResults[index]
              return result === true ? 'Correct' : result === false ? 'Incorrect' : 'Completed'
            } else if (index === completedExercises) {
              return 'Current'
            } else {
              return 'Pending'
            }
          }

          return (
            <div
              key={index}
              className={dotClass}
              title={`Exercise ${index + 1}: ${getStatus()}`}
            />
          )
        })}
      </div>
    </div>
  )
}
