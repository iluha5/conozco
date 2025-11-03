import { useRef, useEffect } from 'react'

type ProgressDotsProps = {
  totalExercises: number
  completedExercises: number
}

export function ProgressDots({ totalExercises, completedExercises }: ProgressDotsProps) {
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

          if (index === completedExercises) {
            dotClass += 'ring-2 ring-purple-400 ring-offset-1 '
          }

          if (index < completedExercises) {
            dotClass += 'bg-green-500'
          } else {
            dotClass += 'bg-gray-300'
          }

          return (
            <div
              key={index}
              className={dotClass}
              title={`Exercise ${index + 1}: ${index < completedExercises ? 'Completed' : index === completedExercises ? 'Current' : 'Pending'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
