import {
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin
} from '@mdxeditor/editor'
import { MarkdownRenderMode } from './types'

interface props {
  markdown: string
  onChange?: (md: string) => void
  mode: MarkdownRenderMode
}
export function MDXRender({ markdown, onChange, mode }: props) {
  return (
    <MDXEditor
      readOnly={mode === 'preview'}
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
      onChange={onChange}
    />
  )
}
