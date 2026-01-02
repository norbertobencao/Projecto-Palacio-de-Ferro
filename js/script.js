document.addEventListener("DOMContentLoaded", () => {
  let sliderInterval = null
  let isSliderPaused = false
  let currentSlide = 0
  let currentModalIndex = 0
  let visibleImages = []

  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const safeQuerySelector = (selector) => {
    try {
      return document.querySelector(selector)
    } catch (e) {
      console.warn(`Seletor inválido: ${selector}`)
      return null
    }
  }

  const safeQuerySelectorAll = (selector) => {
    try {
      return document.querySelectorAll(selector)
    } catch (e) {
      console.warn(`Seletor inválido: ${selector}`)
      return []
    }
  }

  const initMobileMenu = () => {
    const menuToggle = safeQuerySelector(".menu-toggle")
    const navMenu = safeQuerySelector(".nav-menu")

    if (!menuToggle || !navMenu) return

    const toggleMenu = () => {
      const isActive = navMenu.classList.contains("active")
      const icon = menuToggle.querySelector("i")

      if (!icon) return

      navMenu.classList.toggle("active")

      if (!isActive) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-times")
        menuToggle.setAttribute("aria-expanded", "true")
        document.body.style.overflow = "hidden"
      } else {
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
        menuToggle.setAttribute("aria-expanded", "false")
        document.body.style.overflow = ""
      }
    }

    const closeMenu = () => {
      const icon = menuToggle.querySelector("i")
      if (!icon) return

      navMenu.classList.remove("active")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
      menuToggle.setAttribute("aria-expanded", "false")
      document.body.style.overflow = ""
    }

    menuToggle.addEventListener("click", toggleMenu)

    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        closeMenu()
      }
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        closeMenu()
      }
    })

    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains("active")) {
        closeMenu()
      }
    })
  }

  const initHeroSlider = () => {
    const slides = safeQuerySelectorAll(".slide")
    const indicators = safeQuerySelectorAll(".indicator")
    const prevBtn = safeQuerySelector(".slider-prev")
    const nextBtn = safeQuerySelector(".slider-next")
    const heroSection = safeQuerySelector(".hero")

    if (slides.length === 0) return

    const showSlide = (index) => {
      if (index < 0 || index >= slides.length) return

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index)
        slide.setAttribute("aria-hidden", i !== index)
      })

      indicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === index)
        indicator.setAttribute("aria-selected", i === index)
      })

      currentSlide = index
    }

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length
      showSlide(currentSlide)
    }

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length
      showSlide(currentSlide)
    }

    const startAutoPlay = () => {
      if (!isSliderPaused && !sliderInterval) {
        sliderInterval = setInterval(nextSlide, 5000)
      }
    }

    const stopAutoPlay = () => {
      if (sliderInterval) {
        clearInterval(sliderInterval)
        sliderInterval = null
      }
    }

    const pauseAutoPlay = () => {
      isSliderPaused = true
      stopAutoPlay()
    }

    const resumeAutoPlay = () => {
      isSliderPaused = false
      startAutoPlay()
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pauseAutoPlay()
        nextSlide()
        setTimeout(resumeAutoPlay, 3000)
      })
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pauseAutoPlay()
        prevSlide()
        setTimeout(resumeAutoPlay, 3000)
      })
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        pauseAutoPlay()
        showSlide(index)
        setTimeout(resumeAutoPlay, 3000)
      })
    })

    if (heroSection) {
      heroSection.addEventListener("mouseenter", pauseAutoPlay)
      heroSection.addEventListener("mouseleave", resumeAutoPlay)
    }

    const handleKeydown = (e) => {
      if (!heroSection || !isElementInViewport(heroSection)) return

      if (e.key === "ArrowLeft" && prevBtn) {
        pauseAutoPlay()
        prevSlide()
        setTimeout(resumeAutoPlay, 3000)
      } else if (e.key === "ArrowRight" && nextBtn) {
        pauseAutoPlay()
        nextSlide()
        setTimeout(resumeAutoPlay, 3000)
      }
    }

    document.addEventListener("keydown", handleKeydown)

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoPlay()
      } else if (!isSliderPaused) {
        startAutoPlay()
      }
    })

    showSlide(0)
    startAutoPlay()

    return () => {
      stopAutoPlay()
      document.removeEventListener("keydown", handleKeydown)
    }
  }

  const initGalleryFilter = () => {
    const filterBtns = safeQuerySelectorAll(".gallery-filters .filter-btn")
    const galleryItems = safeQuerySelectorAll(".gallery-grid .gallery-item")

    if (filterBtns.length === 0 || galleryItems.length === 0) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        const filter = btn.getAttribute("data-filter")

        galleryItems.forEach((item, index) => {
          const category = item.getAttribute("data-category")
          const shouldShow = filter === "all" || category === filter

          const delay = prefersReducedMotion ? 0 : index * 50

          setTimeout(() => {
            if (shouldShow) {
              item.style.display = "block"

              if (!prefersReducedMotion) {
                item.style.opacity = "0"
                item.style.transform = "translateY(20px)"

                requestAnimationFrame(() => {
                  item.style.opacity = "1"
                  item.style.transform = "translateY(0)"
                })
              } else {
                item.style.opacity = "1"
              }
            } else {
              if (!prefersReducedMotion) {
                item.style.opacity = "0"
                item.style.transform = "translateY(-20px)"

                setTimeout(() => {
                  item.style.display = "none"
                }, 300)
              } else {
                item.style.display = "none"
              }
            }
          }, delay)
        })
      })
    })
  }

  const initGalleryModal = () => {
    const galleryImages = safeQuerySelectorAll(".gallery-grid .gallery-item img")
    const modal = safeQuerySelector(".modal")

    if (galleryImages.length === 0 || !modal) return

    const modalImg = modal.querySelector(".modal-content")
    const modalCaption = modal.querySelector(".modal-caption")
    const closeModal = modal.querySelector(".close-modal")
    const prevBtn = modal.querySelector(".prev")
    const nextBtn = modal.querySelector(".next")

    if (!modalImg) return

    const updateVisibleImages = () => {
      visibleImages = Array.from(galleryImages).filter((img) => {
        const item = img.closest(".gallery-item")
        return item && getComputedStyle(item).display !== "none"
      })
    }

    const showModalImage = (index) => {
      if (index < 0 || index >= visibleImages.length) return

      const img = visibleImages[index]
      if (!img) return

      modalImg.src = img.src
      modalImg.alt = img.alt

      const caption = img.closest(".gallery-item")?.querySelector(".gallery-caption")
      if (caption && modalCaption) {
        modalCaption.innerHTML = caption.innerHTML
      }

      currentModalIndex = index
    }

    const openModal = (imgIndex) => {
      updateVisibleImages()
      if (imgIndex >= 0 && imgIndex < visibleImages.length) {
        modal.style.display = "block"
        document.body.style.overflow = "hidden"
        showModalImage(imgIndex)
        modalImg.focus()
      }
    }

    const closeModalHandler = () => {
      modal.style.display = "none"
      document.body.style.overflow = ""
    }

    const navigateModal = (direction) => {
      const newIndex =
        direction === "next"
          ? (currentModalIndex + 1) % visibleImages.length
          : (currentModalIndex - 1 + visibleImages.length) % visibleImages.length
      showModalImage(newIndex)
    }

    galleryImages.forEach((img, index) => {
      img.addEventListener("click", () => {
        updateVisibleImages()
        const imgIndex = visibleImages.indexOf(img)
        if (imgIndex !== -1) {
          openModal(imgIndex)
        }
      })
    })

    if (closeModal) {
      closeModal.addEventListener("click", closeModalHandler)
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModalHandler()
      }
    })

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        navigateModal("prev")
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        navigateModal("next")
      })
    }

    const handleModalKeydown = (e) => {
      if (modal.style.display === "block") {
        switch (e.key) {
          case "Escape":
            closeModalHandler()
            break
          case "ArrowLeft":
            navigateModal("prev")
            break
          case "ArrowRight":
            navigateModal("next")
            break
        }
      }
    }

    document.addEventListener("keydown", handleModalKeydown)

    return () => {
      document.removeEventListener("keydown", handleModalKeydown)
    }
  }

  const initSmoothScrolling = () => {
    const anchors = safeQuerySelectorAll('a[href^="#"]')

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href")
        if (targetId === "#" || targetId === "#!") return

        const targetElement = safeQuerySelector(targetId)
        if (targetElement) {
          e.preventDefault()

          const header = safeQuerySelector("header")
          const headerHeight = header ? header.offsetHeight : 0
          const targetPosition = targetElement.offsetTop - headerHeight - 20

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
          })
        }
      })
    })
  }

  const initScrollAnimations = () => {
    if (!window.IntersectionObserver) return

    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target
          const delay = element.dataset.delay || 0

          setTimeout(() => {
            element.classList.add("animate-in")
          }, delay)

          observer.unobserve(element)
        }
      })
    }, observerOptions)

    const elementsToAnimate = safeQuerySelectorAll(".feature-box, .gallery-item, .rubrica-card, .especial-card")

    elementsToAnimate.forEach((element, index) => {
      element.classList.add("animate-element")

      if (element.classList.contains("feature-box")) {
        element.dataset.delay = index * 100
      } else if (element.classList.contains("gallery-item")) {
        element.dataset.delay = (index % 3) * 100
      } else {
        element.dataset.delay = index * 50
      }

      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }

  const initLazyLoading = () => {
    const images = safeQuerySelectorAll("img[loading='lazy']")

    if (!window.IntersectionObserver || images.length === 0) return

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
          }
          img.classList.remove("lazy")
          img.classList.add("loaded")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => {
      img.classList.add("lazy")
      imageObserver.observe(img)
    })

    return () => {
      imageObserver.disconnect()
    }
  }

  const initErrorHandling = () => {
    const images = safeQuerySelectorAll("img")
    images.forEach((img) => {
      img.addEventListener("error", function () {
        if (!this.dataset.errorHandled) {
          this.src = "/placeholder.svg?height=250&width=400"
          this.alt = "Imagem não disponível"
          this.dataset.errorHandled = "true"
        }
      })
    })

    window.addEventListener("error", (e) => {
      console.error("Erro capturado:", e.error)
    })

    window.addEventListener("unhandledrejection", (e) => {
      console.error("Promise rejeitada:", e.reason)
    })
  }

  const isElementInViewport = (el) => {
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  const detectReducedMotion = () => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleMediaChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add("reduced-motion")
      } else {
        document.documentElement.classList.remove("reduced-motion")
      }
    }

    mediaQuery.addEventListener("change", handleMediaChange)
    handleMediaChange()

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }

  const cleanupFunctions = []

  try {
    initMobileMenu()

    const sliderCleanup = initHeroSlider()
    if (sliderCleanup) cleanupFunctions.push(sliderCleanup)

    initGalleryFilter()

    const modalCleanup = initGalleryModal()
    if (modalCleanup) cleanupFunctions.push(modalCleanup)

    initSmoothScrolling()

    const animationCleanup = initScrollAnimations()
    if (animationCleanup) cleanupFunctions.push(animationCleanup)

    const lazyCleanup = initLazyLoading()
    if (lazyCleanup) cleanupFunctions.push(lazyCleanup)

    const motionCleanup = detectReducedMotion()
    if (motionCleanup) cleanupFunctions.push(motionCleanup)

    initErrorHandling()

    console.log("✅ Todas as funcionalidades inicializadas com sucesso!")
  } catch (error) {
    console.error("❌ Erro na inicialização:", error)
  }

  window.addEventListener("beforeunload", () => {
    if (sliderInterval) {
      clearInterval(sliderInterval)
      sliderInterval = null
    }

    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup()
      } catch (e) {
        console.warn("Erro no cleanup:", e)
      }
    })

    document.body.style.overflow = ""
  })

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && sliderInterval) {
      clearInterval(sliderInterval)
      sliderInterval = null
    }
  })
})
