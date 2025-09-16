// next.config.js
export function webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
        config.optimization.providedExports = true;
        config.optimization.usedExports = true;
    }
    return config;
}
  