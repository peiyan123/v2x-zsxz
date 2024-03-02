<template>
  <BasicModal @register="register" :footer="null" width="800px">
    <Markdown class="mark-down" :source="source" :plugins="markDownPlugins" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
// components
import { BasicModal, useModalInner } from '@/components/Modal'
import Markdown from 'vue3-markdown-it'
import 'highlight.js/styles/monokai.css'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItDeflist from 'markdown-it-deflist'
import MarkdownItSub from 'markdown-it-sub'
import MarkdownItSup from 'markdown-it-sup'
import MarkdownItAbbr from 'markdown-it-abbr'

const [register] = useModalInner()
const source = ref('### 博客正文')
const markDownPlugins = [
  {
    plugin: MarkdownItAbbr,
  },
  {
    plugin: MarkdownItSub,
  },
  {
    plugin: MarkdownItSup,
  },
  {
    plugin: MarkdownItDeflist,
  },
  {
    plugin: MarkdownItEmoji,
  },
]
getMarkDownText()
function getMarkDownText() {
  fetch('/help-doc/README.md').then((resp) =>
    resp.text().then((txt) => {
      source.value = txt
    })
  )
}
</script>
<style lang="less">
.mark-down {
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.6em;
  }
  h3 {
    font-size: 1.4em;
  }
  h4 {
    font-size: 1.2em;
  }
  ul {
    list-style: inside;
    padding-inline-start: 1em;
  }
}
</style>
