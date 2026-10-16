// Marca la imagen del póster tocado para que "vuele" hasta la ficha (View Transitions API).
// Solo se nombra al hacer clic, porque el mismo póster puede repetirse en varios carruseles.
export function marcarTransicion(e) {
  document.querySelectorAll('[data-vt-activo]').forEach((el) => {
    el.style.viewTransitionName = ''
    el.removeAttribute('data-vt-activo')
  })
  const img = e.currentTarget.querySelector('[data-vt]')
  if (img) {
    img.style.viewTransitionName = 'poster-activo'
    img.setAttribute('data-vt-activo', '')
  }
}

