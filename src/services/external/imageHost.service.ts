/**
 * Simple wrapper around ImgBB API v1 for avatar uploads.
 *
 * This is a client-side bitirme projesi, o yüzden API key burada
 * direkt gömülü. Ticari ortamda backend proxy ile saklamak gerekir.
 */

const uploadUrl =
  'https://api.imgbb.com/1/upload?key=5c430b2d8df8bd6db833d465b94d8602'
const imageFieldName = 'image'

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append(imageFieldName, file)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`)
  }

  const data = (await response.json()) as {
    data?: {
      url?: string
      display_url?: string
    }
    url?: string
    image?: { url?: string }
  }

  /**
   * We try a couple of common response shapes without hard-coding a specific provider:
   * - { data: { url: string } }
   * - { data: { display_url: string } }
   * - { url: string }
   */
  const url =
    data?.data?.url ??
    data?.data?.display_url ??
    data?.url ??
    data?.image?.url ??
    null

  if (!url || typeof url !== 'string') {
    throw new Error('Image upload response did not contain a usable URL')
  }

  return url
}

