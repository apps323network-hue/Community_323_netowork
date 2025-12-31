import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface AnimationOptions {
    threshold?: number
    rootMargin?: string
    once?: boolean
    delay?: number
    stagger?: number
}

export interface ScrollProgress {
    progress: Ref<number>
    isInView: Ref<boolean>
}

/**
 * Composable for scroll-triggered animations
 * Provides intersection observer and scroll progress tracking
 */
export function useScrollAnimations() {
    const observedElements = new Map<Element, IntersectionObserverCallback>()
    let observer: IntersectionObserver | null = null

    const defaultOptions: AnimationOptions = {
        threshold: 0.1,
        rootMargin: '0px',
        once: true,
        delay: 0,
        stagger: 100,
    }

    onMounted(() => {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const callback = observedElements.get(entry.target)
                    if (callback) {
                        callback([entry], observer!)
                    }
                })
            },
            { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
        )
    })

    onUnmounted(() => {
        if (observer) {
            observer.disconnect()
        }
        observedElements.clear()
    })

    /**
     * Observe an element for viewport entry
     */
    function observe(
        element: Element | null,
        onIntersect: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
        options: AnimationOptions = {}
    ) {
        if (!element || !observer) return

        const opts = { ...defaultOptions, ...options }

        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                const isIntersecting = entry.intersectionRatio >= (opts.threshold || 0.1)

                if (isIntersecting && opts.delay) {
                    setTimeout(() => onIntersect(true, entry), opts.delay)
                } else {
                    onIntersect(isIntersecting, entry)
                }

                if (isIntersecting && opts.once) {
                    observer?.unobserve(entry.target)
                    observedElements.delete(entry.target)
                }
            })
        }

        observedElements.set(element, callback)
        observer.observe(element)
    }

    /**
     * Observe multiple elements with staggered animation
     */
    function observeStaggered(
        elements: Element[] | NodeListOf<Element>,
        onIntersect: (el: Element, index: number) => void,
        options: AnimationOptions = {}
    ) {
        const opts = { ...defaultOptions, ...options }
        const elementsArray = Array.from(elements)
        let hasTriggered = false

        elementsArray.forEach((el) => {
            observe(
                el,
                (isIntersecting) => {
                    if (isIntersecting && !hasTriggered) {
                        hasTriggered = true
                        // Trigger all elements with stagger
                        elementsArray.forEach((element, i) => {
                            setTimeout(() => {
                                onIntersect(element, i)
                            }, i * (opts.stagger || 100))
                        })
                    }
                },
                { ...opts, once: true }
            )
        })
    }

    /**
     * Track scroll progress for an element (0 = top of viewport, 1 = left viewport)
     */
    function useScrollProgress(element: Ref<Element | null>): ScrollProgress {
        const progress = ref(0)
        const isInView = ref(false)

        const handleScroll = () => {
            if (!element.value) return

            const rect = element.value.getBoundingClientRect()
            const windowHeight = window.innerHeight

            // Calculate progress: 0 when element enters, 1 when it leaves
            const elementTop = rect.top
            const elementHeight = rect.height

            if (elementTop >= windowHeight) {
                progress.value = 0
                isInView.value = false
            } else if (elementTop + elementHeight <= 0) {
                progress.value = 1
                isInView.value = false
            } else {
                const visibleHeight = Math.min(windowHeight, elementTop + elementHeight) - Math.max(0, elementTop)
                progress.value = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight)
                isInView.value = visibleHeight > 0
            }
        }

        onMounted(() => {
            window.addEventListener('scroll', handleScroll, { passive: true })
            handleScroll()
        })

        onUnmounted(() => {
            window.removeEventListener('scroll', handleScroll)
        })

        return { progress, isInView }
    }

    return {
        observe,
        observeStaggered,
        useScrollProgress,
    }
}

/**
 * Split text into spans for character-by-character animation
 */
export function splitTextToChars(text: string): string {
    return text
        .split('')
        .map((char, i) => {
            if (char === ' ') {
                return '<span class="split-char" style="--char-index: ' + i + '">&nbsp;</span>'
            }
            return `<span class="split-char" style="--char-index: ${i}">${char}</span>`
        })
        .join('')
}

/**
 * Animate counter from 0 to target value
 */
export function useCounterAnimation(
    targetValue: number,
    duration: number = 2000,
    startOnMount: boolean = false
) {
    const currentValue = ref(0)
    const isAnimating = ref(false)
    let animationFrame: number | null = null

    function start() {
        if (isAnimating.value) return
        isAnimating.value = true

        const startTime = performance.now()
        const startValue = currentValue.value

        function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            currentValue.value = Math.round(startValue + (targetValue - startValue) * eased)

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            } else {
                isAnimating.value = false
                currentValue.value = targetValue
            }
        }

        animationFrame = requestAnimationFrame(animate)
    }

    function reset() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }
        currentValue.value = 0
        isAnimating.value = false
    }

    onMounted(() => {
        if (startOnMount) {
            start()
        }
    })

    onUnmounted(() => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }
    })

    return {
        currentValue,
        isAnimating,
        start,
        reset,
    }
}
