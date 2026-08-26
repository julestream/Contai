// Client-side image resizing before upload.
// Phone photos are 4-8MB; we never need more than ~1600px for display.
// Runs entirely in the browser — no server cost, no extra packages.
//
// Transparency is preserved: a cut-out PNG stays a PNG so it can sit on
// the browse frame with no background of its own. Everything else becomes
// JPEG, which compresses photographs far better.

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // Preferred path: respects EXIF rotation so portrait phone photos
  // don't come out sideways.
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Older Safari doesn't accept the orientation option.
    try {
      return await createImageBitmap(file)
    } catch {
      // Last resort: plain <img>. Modern browsers apply EXIF rotation here too.
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')) }
        img.src = url
      })
    }
  }
}

/**
 * Looks for any pixel that isn't fully opaque. Sampling every 4th pixel is
 * plenty — a cut-out has large transparent regions, not a stray pixel or two —
 * and keeps this fast on a phone.
 */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const { data } = ctx.getImageData(0, 0, w, h)
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 250) return true
    }
    return false
  } catch {
    // getImageData can throw on a tainted canvas. Assume opaque.
    return false
  }
}

/**
 * Shrinks an image file to fit within maxDim on its longest edge.
 * Returns the original file untouched if anything goes wrong — uploading
 * a big file is better than a failed upload.
 *
 * @param file    the file from the <input type="file">
 * @param maxDim  longest edge in pixels (1600 for artwork, 400 for avatars)
 * @param quality JPEG quality, 0 to 1 (ignored for transparent images)
 */
export async function resizeImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  // GIFs would lose their animation on a canvas, and SVGs don't need resizing.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  try {
    const source = await loadBitmap(file)
    const width = 'width' in source ? source.width : 0
    const height = 'height' in source ? source.height : 0
    if (!width || !height) return file

    const scale = Math.min(1, maxDim / Math.max(width, height))
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    // Draw first, with nothing behind it, so we can check for transparency.
    ctx.drawImage(source as CanvasImageSource, 0, 0, w, h)

    // Only formats that can carry an alpha channel are worth checking.
    const mayHaveAlpha = file.type === 'image/png' || file.type === 'image/webp'
    const keepAlpha = mayHaveAlpha && hasTransparency(ctx, w, h)

    if (!keepAlpha) {
      // Opaque image: put white behind it and re-draw, so a transparent
      // PNG that we're about to flatten doesn't turn black as JPEG.
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }

    if ('close' in source && typeof source.close === 'function') source.close()

    const outType = keepAlpha ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, outType, keepAlpha ? undefined : quality)
    )
    if (!blob) return file

    // If we somehow made it bigger and didn't shrink it, keep the original.
    if (scale === 1 && blob.size >= file.size) return file

    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    const ext = keepAlpha ? 'png' : 'jpg'
    return new File([blob], `${base}.${ext}`, { type: outType })
  } catch {
    return file
  }
}