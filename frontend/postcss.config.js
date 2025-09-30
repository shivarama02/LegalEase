// Tailwind CSS v4: use the separate @tailwindcss/postcss plugin (not tailwindcss directly)
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
