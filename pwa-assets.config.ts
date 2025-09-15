import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        fit: 'contain',
        background: '#1e40af',
      },
    },
    apple: {
      ...preset.apple,
      resizeOptions: {
        fit: 'contain',
        background: '#1e40af',
      },
    },
  },
  images: ['public/logo-source.svg'],
});
