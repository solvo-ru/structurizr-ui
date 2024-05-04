(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) :
      (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.markdownItTextualUml = factory());
})(this, (function () {
  "use strict";

  const mermaidFunctions = {
    options: {},

    initialize(options) {
      if (options) {
        this.options = options
      }
    },

    getMarkup(code) {
      let content = removeTripleBackticks(code)
      return `<pre class="mermaid">\n${content}\n</pre>\n`
    },
  }

  function removeTripleBackticks(inputString) {
    if (inputString.endsWith('```')) {
      // Remove the last 3 characters
      return inputString.slice(0, -3)
    } else {
      // String doesn't end with "```", return as is
      return inputString
    }
  }

  const platumlFunctions = {
    options: {},

    initialize(options) {
      if (options) {
        this.options = options
      }
    },

    getMarkup(code, diagramName) {
      const srcVal = this.generateSource(code, diagramName, this.options)
      return '<img src="' + srcVal + '" alt="uml diagram">\n'
    },

    generateSource(umlCode, diagramMarker, pluginOptions) {
      const imageFormat = pluginOptions.imageFormat || 'svg'
      const server = pluginOptions.server || 'https://www.plantuml.com/plantuml'
      const zippedCode = deflate.encode64(
          deflate.zip_deflate(
              unescape(
                  encodeURIComponent(
                      '@start' +
                      diagramMarker +
                      '\n' +
                      umlCode +
                      '\n@end' +
                      diagramMarker,
                  ),
              ),
          ),
          9,
      )
      return server + '/' + imageFormat + '/' + zippedCode
    },
  }

  function umlPlugin(md, options) {
    options = options || {}

    platumlFunctions.initialize(options)
    mermaidFunctions.initialize(options)

    const defaultRenderer = md.renderer.rules.fence.bind(md.renderer.rules)

    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const token = tokens[idx]
      const code = token.content.trim()
      const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
      let langName = ''

      if (info) {
        langName = info.split(/\s+/g)[0]
      }

      switch (langName) {
        case 'mermaid':
          return mermaidFunctions.getMarkup(code)
        case 'plantuml':
        case 'dot':
          return platumlFunctions.getMarkup(code, 'uml')
        case 'ditaa':
          return platumlFunctions.getMarkup(code, 'ditaa')
      }

      return defaultRenderer(tokens, idx, options, env, slf)
    }
  }



  return umlPlugin;
}));
/*
export default {
  umlPlugin
}
*/
