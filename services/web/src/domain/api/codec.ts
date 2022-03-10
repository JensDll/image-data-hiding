import { ref } from 'vue'

import { useDownload, useFetch } from '~/domain'

export function codec() {
  const loading = ref(false)

  return {
    loading,
    async encodeText(coverImage: File, message: string) {
      loading.value = true

      const formData = new FormData()
      formData.append('coverImage', coverImage)
      formData.append('message', message)

      const { isNetworkError, response } = await useFetch(
        '/codec/encode/text'
      ).post({
        body: formData
      })

      if (!isNetworkError) {
        if (response.ok) {
          const zip = await response.blob()
          useDownload('secret.zip').file(zip)
        }
      }

      loading.value = false
    },

    async encodeBinary(coverImage: File, files: File[]) {
      loading.value = true

      const formData = new FormData()
      formData.append('coverImage', coverImage)
      for (let i = 0; i < files.length; ++i) {
        formData.append(i.toString(), files[i])
      }

      const { isNetworkError, response } = await useFetch(
        '/codec/encode/binary'
      ).post({
        body: formData
      })

      if (!isNetworkError) {
        if (response.ok) {
          const zip = await response.blob()
          useDownload('secret.zip').file(zip)
        }
      }

      loading.value = false
    },

    async decode(coverImage: File, key: string) {
      loading.value = true

      const formData = new FormData()
      formData.append('coverImage', coverImage)
      formData.append('key', key)

      const { isNetworkError, response, responseType } = await useFetch(
        '/codec/decode'
      ).post({
        body: formData
      })

      if (!isNetworkError) {
        if (response.ok) {
          if (responseType === 'text') {
            const text = await response.text()
            useDownload('secret.txt').text(text)
          } else if (responseType === 'blob') {
            const zip = await response.blob()
            useDownload('result.zip').file(zip)
          }
        }
      }

      loading.value = false
    }
  }
}
