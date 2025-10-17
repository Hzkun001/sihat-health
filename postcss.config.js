const tailwindcss = require("tailwindcss")
const autoprefixer = require("autoprefixer")

const ensureSourcesForGeneratedNodes = () => ({
  postcssPlugin: "ensure-sources-for-generated-nodes",
  Once(root) {
    const input = root.source?.input
    if (!input) return

    root.walk((node) => {
      if (!node.source) {
        node.source = { input }
        return
      }

      if (!node.source.input) {
        node.source.input = input
      }
    })
  },
})

ensureSourcesForGeneratedNodes.postcss = true

module.exports = {
  plugins: [tailwindcss, autoprefixer, ensureSourcesForGeneratedNodes()],
}
