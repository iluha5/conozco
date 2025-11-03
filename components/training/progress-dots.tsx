import { useRef, useEffect } from 'react'

type ProgressDotsProps = {
  results: boolean[]
  currentIndex: number
}

export function ProgressDots({ results, currentIndex }: ProgressDotsProps) {
  const dotsRef = useRef<HTMLDivElement>(null)

  // Прокрутка к текущей точке отключена
  // useEffect(() => {
  //   // Автоматическая прокрутка к текущей точке
  //   if (dotsRef.current) {
  //     const dotElement = dotsRef.current.children[currentIndex] as HTMLElement
  //     if (dotElement) {
  //       dotElement.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'nearest',
  //         inline: 'center'
  //       })
  //     }
  //   }
  // }, [currentIndex])

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={dotsRef}
        className="flex gap-2 px-4 py-2 min-w-max justify-center"
        style={{ scrollbarWidth: 'thin' }}
      >
        {results.map((result, index) => {
          let dotClass = 'w-3 h-3 rounded-full transition-colors duration-300 '

          if (index === currentIndex) {
            dotClass += 'ring-2 ring-purple-400 ring-offset-1 '
          }

          if (result === true) {
            dotClass += 'bg-green-500'
          } else if (result === false) {
            dotClass += 'bg-red-500'
          } else {
            dotClass += 'bg-gray-300'
          }

          return (
            <div
              key={index}
              className={dotClass}
              title={`Exercise ${index + 1}: ${result === true ? 'Correct' : result === false ? 'Incorrect' : 'Pending'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
