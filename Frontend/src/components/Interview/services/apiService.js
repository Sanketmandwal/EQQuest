export class ApiService {
  constructor() {
    this.PROXY_ENDPOINT = import.meta.env.VITE_PROXY_ENDPOINT;
    this.WORQAT_DIRECT_URL = import.meta.env.VITE_WORQAT_DIRECT_URL;
    this.WORQHAT_API_KEY = import.meta.env.VITE_WORQHAT_API_KEY;
  }

  async getBlobForSending(canvas, { width = null, height = null, quality = 0.75 } = {}) {
    return new Promise((resolve) => {
      let targetCanvas = canvas;

      if (width && height) {
        targetCanvas = document.createElement('canvas');
        targetCanvas.width = width;
        targetCanvas.height = height;

        const ctx = targetCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, width, height);
      }

      targetCanvas.toBlob(resolve, 'image/jpeg', quality);
    });
  }

  async sendFrameToProxy(canvas, { resize = true, width = 224, height = 224, quality = 0.75 } = {}) {
    try {
      const blob = await this.getBlobForSending(canvas, {
        width: resize ? width : null,
        height: resize ? height : null,
        quality
      });

      if (!blob) {
        throw new Error("Failed to create blob");
      }

      const formData = new FormData();
      formData.append("file", blob);

      console.log("Sending frame to proxy", blob);

      const response = await fetch(this.PROXY_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.WORQHAT_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Worqhat response:", response.status, data);

      return { status: response.status, data };

    } catch (error) {
      console.error('Proxy API call failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();