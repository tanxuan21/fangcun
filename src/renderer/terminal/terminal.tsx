import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import styles from './styles.module.scss'
import './terminal-main.scss'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function Terminal({
  user = 'user',
  host = 'localhost',
  cwd = '~',
  onCommand,
  placeholder = 'Type a command and hit Enter…'
}) {
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Scrollback entries: one per executed command
  const [entries, setEntries] = useState([]) // { id, cmd, output?: string[] }

  // Current input + history navigation
  const [current, setCurrent] = useState('')
  const [history, setHistory] = useState([]) // list of command strings
  const [histIndex, setHistIndex] = useState(-1) // -1 means fresh line

  // Demo completion dictionary (first token only)
  const completions = useMemo(
    () => [
      'help',
      'ls',
      'cd',
      'cat',
      'echo',
      'touch',
      'mkdir',
      'rmdir',
      'rm',
      'pwd',
      'whoami',
      'clear',
      'git',
      'node',
      'npm',
      'yarn',
      'pnpm',
      'python',
      'pip',
      'grep',
      'tail',
      'top',
      'htop',
      'ssh',
      'scp',
      'chmod',
      'chown'
    ],
    []
  )

  const prompt = (
    <span>
      <span className="text-emerald-400">{user}</span>
      <span className="text-neutral-500">@</span>
      <span className="text-sky-400">{host}</span>
      <span className="text-neutral-500">:</span>
      <span className="text-cyan-300">{cwd}</span>
      <span className="text-neutral-500">$</span>
    </span>
  )

  // Focus input when container clicked
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Auto scroll to bottom whenever entries change
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [entries])

  // Handle command run
  const runCommand = useCallback(
    (cmd) => {
      const trimmed = cmd.replace(/\r/g, '').trimEnd()
      if (!trimmed && cmd.length === 0) return // empty + no spaces

      // Add to scrollback
      setEntries((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          cmd: trimmed
          // You can pre-render a stub output if you want visual feedback
          // output: ["(logged to console)"]
        }
      ])

      // Update history (skip duplicates in a row)
      setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]))
      setHistIndex(-1)
      setCurrent('')

      // Console only (user will wire real executor later)
      if (typeof onCommand === 'function') {
        onCommand(trimmed)
      } else {
        // eslint-disable-next-line no-console
        console.log('[terminal] run:', trimmed)
      }

      // Frontend niceties: emulate clear without backend
      if (trimmed === 'clear') {
        setEntries([])
      }
    },
    [onCommand]
  )

  // Handle key events on the input
  const onKeyDown = useCallback(
    (e) => {
      // ENTER -> run
      if (e.key === 'Enter') {
        e.preventDefault()
        runCommand(current)
        return
      }

      // UP / DOWN -> history nav
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (history.length === 0) return
        const nextIndex = histIndex === -1 ? history.length - 1 : Math.max(0, histIndex - 1)
        setHistIndex(nextIndex)
        setCurrent(history[nextIndex] ?? '')
        // Move caret to end on next tick
        requestAnimationFrame(() => {
          const i = inputRef.current
          if (i) i.selectionStart = i.selectionEnd = i.value.length
        })
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (history.length === 0) return
        const nextIndex = histIndex === -1 ? -1 : Math.min(history.length - 1, histIndex + 1)
        setHistIndex(nextIndex)
        setCurrent(nextIndex === -1 ? '' : (history[nextIndex] ?? ''))
        requestAnimationFrame(() => {
          const i = inputRef.current
          if (i) i.selectionStart = i.selectionEnd = i.value.length
        })
        return
      }

      // TAB -> demo completion on first token
      if (e.key === 'Tab') {
        e.preventDefault()
        const [first, ...rest] = current.split(/\s+/)
        if (!first) return
        const matches = completions.filter((c) => c.startsWith(first))
        // eslint-disable-next-line no-console
        console.log('[terminal] tab:', { first, matches })
        if (matches.length === 1) {
          const completed = [matches[0], ...rest].join(' ')
          setCurrent(completed)
          requestAnimationFrame(() => {
            const i = inputRef.current
            if (i) i.selectionStart = i.selectionEnd = completed.length
          })
        } else if (matches.length > 1) {
          // Show matches as a visual output list (like real terminals)
          setEntries((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), cmd: current, output: matches }
          ])
          setCurrent(current)
        }
        return
      }

      // CTRL + C -> cancel current line
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        setEntries((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), cmd: current, output: ['^C'] }
        ])
        setCurrent('')
        setHistIndex(-1)
        // eslint-disable-next-line no-console
        console.log('[terminal] SIGINT (^C) on:', current)
        return
      }

      // CTRL + L -> clear screen
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        setEntries([])
        // eslint-disable-next-line no-console
        console.log('[terminal] clear screen')
        return
      }

      // CTRL + U -> kill line
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault()
        setCurrent('')
        return
      }
    },
    [current, completions, histIndex, history, runCommand]
  )

  // Multi-line paste -> run each line
  const onPaste = useCallback(
    (e) => {
      const text = e.clipboardData?.getData('text') ?? ''
      if (!text.includes('\n')) return // let browser handle single-line paste
      e.preventDefault()
      const lines = text
        .replace(/\r/g, '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      if (lines.length === 0) return // Queue sequentially; simple microtask chain
      ;(async () => {
        for (const line of lines) {
          await new Promise((r) => setTimeout(r, 0))
          runCommand(line)
        }
      })()
    },
    [runCommand]
  )

  return (
    <div className="w-full max-w-3xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-neutral-300 rounded-t-xl border border-neutral-800">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="text-xs ml-2 select-none">
          {user}@{host} — bash
        </div>
        <div className="ml-auto text-xs opacity-60">frontend only</div>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="bg-black text-green-200 font-mono text-sm leading-relaxed h-[420px] overflow-y-auto p-4 rounded-b-xl border border-t-0 border-neutral-800 shadow-xl focus:outline-none resize-y"
        onClick={focusInput}
        role="textbox"
        aria-label="Terminal"
      >
        {/* Scrollback */}
        {entries.map((item) => (
          <div key={item.id} className="mb-1">
            <div className="whitespace-pre-wrap break-words">
              <span className="select-none">{prompt}&nbsp;</span>
              <span>{item.cmd}</span>
            </div>
            {Array.isArray(item.output) && item.output.length > 0 && (
              <div className="pl-0 mt-1">
                {item.output.map((out, i) => (
                  <div key={i} className="whitespace-pre-wrap break-words text-green-300">
                    {out}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Active prompt line */}
        <div className="flex items-start gap-2">
          <div className="select-none">{prompt}</div>
          <input
            ref={inputRef}
            className="bg-transparent outline-none border-none text-green-100 placeholder:text-green-800/70 flex-1 min-w-0 caret-emerald-400"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            placeholder={entries.length === 0 ? placeholder : undefined}
          />
        </div>

        {/* Tiny footer hint */}
        <div className="mt-4 text-xs text-green-900/70 select-none">
          ↑/↓ history • Tab complete • Ctrl+C cancel • Ctrl+L clear • Ctrl+U kill line
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <div className={styles['terminal-container']} contentEditable="true">
      terminal
    </div> */}

    <Terminal
      user="root"
      host="monstar"
      cwd="~/project"
      onCommand={(cmd) => {
        // 你自己的处理逻辑
        console.log('EXECUTE:', cmd)
      }}
    />
  </StrictMode>
)
