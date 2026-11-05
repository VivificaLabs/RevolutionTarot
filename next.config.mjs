/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // A página relê estes arquivos ao revalidar, então eles precisam ir junto para o servidor
    outputFileTracingIncludes: {
      '/revoleituras': ['./content/revoleituras/**', './public/revoleituras/capas/**'],
    },
  },
};

export default nextConfig;
