document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn")
  const eventCards = document.querySelectorAll(".event-card")
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      // Remover classe active de todos os botões
      filterButtons.forEach((btn) => btn.classList.remove("active"))

      // Adicionar classe active ao botão clicado
      this.classList.add("active")

      // Filtrar eventos com animações escalonadas
      eventCards.forEach((card, index) => {
        const category = card.getAttribute("data-category")
        const shouldShow = filter === "all" || category === filter

        // Remover classes anteriores de animação
        card.classList.remove("filtered-in", "filtered-out")

        if (shouldShow) {
          // Delay escalonado para entrada
          const delay = prefersReducedMotion ? 0 : index * 50

          setTimeout(() => {
            card.style.display = "block"

            if (!prefersReducedMotion) {
              // Força reflow para ativar a animação
              card.offsetHeight

              card.classList.add("filtered-in")
              card.style.opacity = "1"
              card.style.transform = "translateX(0)"
            } else {
              card.style.opacity = "1"
              card.style.transform = "none"
            }
          }, delay)
        } else {
          if (!prefersReducedMotion) {
            card.classList.add("filtered-out")
            card.style.opacity = "0"
            card.style.transform = "translateX(-30px)"

            // Hide após animação
            setTimeout(() => {
              card.style.display = "none"
            }, 400)
          } else {
            card.style.display = "none"
            card.style.opacity = "1"
          }
        }
      })
    })

    button.addEventListener("mouseenter", function () {
      if (!prefersReducedMotion) {
        this.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }
    })
  })

  eventCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      if (!prefersReducedMotion) {
        // Aplicar efeito subtle ao passar o mouse
        const btn = this.querySelector(".btn")
        if (btn) {
          btn.style.transform = "translateY(-2px)"
        }
      }
    })

    card.addEventListener("mouseleave", function () {
      if (!prefersReducedMotion) {
        const btn = this.querySelector(".btn")
        if (btn) {
          btn.style.transform = "translateY(0)"
        }
      }
    })

    card.addEventListener("click", function (e) {
      if (!e.target.closest(".btn")) {
        // Se não clicou num botão, pode adicionar lógica aqui
        const btn = this.querySelector(".btn")
        if (btn) {
          btn.focus()
        }
      }
    })
  })

  console.log("✅ Agenda interativa inicializada com sucesso!")
})
