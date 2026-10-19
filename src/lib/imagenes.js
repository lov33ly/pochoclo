// Recorta una imagen al cuadrado central, la achica y la comprime en JPEG.
// Devuelve un "data URL" liviano (~20–40 KB) que se puede guardar directo en Firestore,
// sin necesidad de Firebase Storage.
export const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
export const PESO_MAXIMO = 10 * 1024 * 1024 // 10 MB de archivo original

export function comprimirImagen(archivo, lado = 320, calidad = 0.82) {
  return new Promise((resolve, reject) => {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      reject(new Error('El archivo tiene que ser una imagen JPG, PNG o WEBP.'))
      return
    }
    if (archivo.size > PESO_MAXIMO) {
      reject(new Error('La imagen pesa más de 10 MB.'))
      return
    }
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const min = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = lado
      canvas.height = lado
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, lado, lado)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', calidad))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    img.src = url
  })
}
