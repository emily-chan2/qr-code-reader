# QR Code Reader

[https://emily-chan2.github.io/qr-code-reader/](https://emily-chan2.github.io/qr-code-reader/)

A QR code reader that lets you upload images and decode them directly in the browser. Sometimes someone texts me a QR code and I'm like, how do I scan this thing?

---

## ✨ Features

- Upload a QR code image and read it instantly  
- Countdown timer during scanning so you know it’s working
- Result is clickable if it contains a URL  
- Dark mode support (follows your system theme)
- Fully client-side — no backend/server needed (you could even save `index.html` to your computer and use it locally)

---

## ⚠️ Limitations

- QR code reading just works better with your native phone camera since you essentially get like 30 tries per second. With a single image it has to be perfectly clear.
- You'll have better results if you crop your image so just the QR code is visible. Sharpening, straightening, increasing the contrast, adjusting the black point, and denoising can help as well.
