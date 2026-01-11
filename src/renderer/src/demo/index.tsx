import React from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  InsertThematicBreak
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
export function EmptyDemo() {
  const markdown = `
* Item 1
* Item 2
* Item 3
  * nested item

1. Item 1
2. Item 2

> This is a quote
> This is a quote

## Heading 2
  `

  return (
    <MDXEditor
      markdown={markdown}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin()
        // toolbarPlugin({
        //   toolbarContents: () => (
        //     <>
        //       <UndoRedo />
        //       <BoldItalicUnderlineToggles />
        //       <InsertThematicBreak />
        //     </>
        //   )
        // })
      ]}
      onChange={(md) => console.log(md)}
    />
  )
}
