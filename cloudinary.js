/**
 * Unsigned upload to Cloudinary (images / videos).
 * Requires VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET
 */
export function isCloudinaryConfigured() {
  return !!(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  )
}

export async function uploadToCloudinary(file, onProgress) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) {
    throw new Error('Cloudinary not configured')
  }

  const isVideo = file.type.startsWith('video/')
  const resource = isVideo ? 'video' : 'image'
  const url = `https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  form.append('folder', 'pulse')

  // XHR for progress
  const result = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data)
        } else {
          reject(new Error(data.error?.message || 'Cloudinary upload failed'))
        }
      } catch (err) {
        reject(err)
      }
    }
    xhr.onerror = () => reject(new Error('Network error uploading to Cloudinary'))
    xhr.send(form)
  })

  return {
    url: result.secure_url,
    path: result.public_id,
    type: isVideo ? 'video' : 'image',
    width: result.width,
    height: result.height,
  }
}

export async function uploadManyToCloudinary(files, onProgress) {
  const media = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      throw new Error('Only images/videos allowed')
    }
    if (file.size > 12 * 1024 * 1024) {
      throw new Error('File too large (max ~12MB on free tier)')
    }
    const part = await uploadToCloudinary(file, (pct) => {
      if (onProgress) {
        const overall = Math.round(((i + pct / 100) / files.length) * 100)
        onProgress(overall)
      }
    })
    media.push(part)
  }
  return media
}
