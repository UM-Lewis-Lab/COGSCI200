const mode = process.env.NODE_ENV || "production";
const dev = mode === "development"

module.exports = {
  purge: dev ? [] : [

    './src/**/*.html',

    './src/**/*.js',

  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
