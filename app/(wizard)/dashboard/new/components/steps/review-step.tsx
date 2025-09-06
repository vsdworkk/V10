"use client"

/**
 * ReviewStep
 * ----------
 * Final wizard screen where the user polishes the pitch.
 *
 * Enhancements:
 *  • Accepts `isPitchLoading` from parent. If true or if pitchContent is empty,
 *    show a loading skeleton rather than the TipTap editor.
 *  • Uses the usePitchGeneration hook to poll for pitch status when an
 *    execution ID is present
 */

import React, { useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { useToast } from "@/lib/hooks/use-toast"
import { usePitchGeneration } from "@/lib/hooks/use-pitch-generation"
import { PitchWizardFormData } from "../wizard/schema"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading1,
  RefreshCw
} from "lucide-react"

// TipTap & its extensions
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import BoldExtension from "@tiptap/extension-bold"
import ItalicExtension from "@tiptap/extension-italic"
import UnderlineExtension from "@tiptap/extension-underline"
import HeadingExtension from "@tiptap/extension-heading"
import BulletListExtension from "@tiptap/extension-bullet-list"
import OrderedListExtension from "@tiptap/extension-ordered-list"
import ListItemExtension from "@tiptap/extension-list-item"
import CharacterCountExtension from "@tiptap/extension-character-count"
import { Button } from "@/components/ui/button"
import AIThinkingLoader from "../utilities/ai-thinking-loader"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReviewStepProps {
  /**
   * If true, show a loading skeleton/spinner instead of the actual pitch content.
   * This is set when the user transitions from the last STAR step to this step and
   * we haven't yet received the final pitch text from the agent.
   */
  isPitchLoading: boolean

  /** Callback invoked when the pitch content has loaded */
  onPitchLoaded: () => void

  /** Error message if pitch generation failed */
  errorMessage?: string | null

  onRetry?: () => void
}

export default function ReviewStep({
  isPitchLoading,
  onPitchLoaded,
  errorMessage,
  onRetry
}: ReviewStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  /* ----------------------------------------------------------- */
  /* 1) Observed pitch content and execution ID from form        */
  /* ----------------------------------------------------------- */
  const pitchContent = watch("pitchContent") || ""
  const execId = watch("agentExecutionId") || null

  /* ----------------------------------------------------------- */
  /* 2) Use the new pitch generation hook                        */
  /* ----------------------------------------------------------- */
  const {
    isLoading: isPitchGenerating,
    pitchContent: generatedPitchContent,
    error: pitchGenerationError,
    startPolling,
    reset
  } = usePitchGeneration()

  /* ----------------------------------------------------------- */
  /* 3) Editor setup (TipTap)                                    */
  /* ----------------------------------------------------------- */
  const editor = useEditor({
    extensions: [
      StarterKit,
      BoldExtension,
      ItalicExtension,
      UnderlineExtension,
      HeadingExtension.configure({ levels: [1, 2, 3] }),
      BulletListExtension,
      OrderedListExtension,
      ListItemExtension,
      CharacterCountExtension.configure({ limit: 10000 })
    ],
    content: pitchContent,
    autofocus: false,
    onUpdate: ({ editor }) => {
      setValue("pitchContent", editor.getHTML(), { shouldDirty: true })
    }
  })

  /* ----------------------------------------------------------- */
  /* 4) Effect to update editor content when pitch content changes */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (editor && pitchContent && pitchContent !== editor.getHTML()) {
      editor.commands.setContent(pitchContent, false)
    }
  }, [editor, pitchContent])

  /* ----------------------------------------------------------- */
  /* 5) Effect to start polling for pitch status when component mounts */
  /* ----------------------------------------------------------- */
  const initRef = useRef<boolean>(false)
  useEffect(() => {
    // Only run this once and only if we have an execution ID but no pitch content
    if (
      !initRef.current &&
      execId &&
      (!pitchContent || pitchContent.trim() === "") &&
      !isPitchGenerating
    ) {
      initRef.current = true

      // Begin polling for the generated pitch
      startPolling(execId)
    }
  }, [execId, pitchContent, isPitchGenerating, startPolling])

  /* ----------------------------------------------------------- */
  /* 6) Effect to handle generated pitch content                 */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (generatedPitchContent) {
      setValue("pitchContent", generatedPitchContent, { shouldDirty: true })
      editor?.commands.setContent(generatedPitchContent, false)

      toast({
        title: "Pitch ready!",
        description: "Albert has finished generating your pitch."
      })

      // Call the callback from parent
      onPitchLoaded()
    }
  }, [generatedPitchContent, editor, setValue, toast, onPitchLoaded])

  /* ----------------------------------------------------------- */
  /* 7) Effect to handle pitch generation error                 */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (pitchGenerationError) {
      toast({
        title: "Error generating pitch",
        description: pitchGenerationError,
        variant: "destructive"
      })
    }
  }, [pitchGenerationError, toast])

  // Add custom styles for spacing between sections
  useEffect(() => {
    if (editor) {
      const style = document.createElement("style")
      style.innerHTML = `
        .ProseMirror h2 {
          margin-top: 2rem;
        }
        .ProseMirror h3 {
          margin-top: 1.5rem;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
        }

        /* Remove default blue node selection highlight */
        .ProseMirror-selectednode {
          outline: none !important;
          background: transparent !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [editor])

  /* ----------------------------------------------------------- */
  /* 8) Loading skeleton if pitch is not ready                   */
  /* ----------------------------------------------------------- */
  // If isPitchLoading or no pitch content, show a skeleton/spinner
  if (isPitchLoading || isPitchGenerating || !pitchContent.trim()) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center font-medium text-green-800">
          <strong>Generating your pitch...</strong> Please keep this page open
          and avoid refreshing to prevent losing your progress.
        </div>

        {/* Editor toolbar (disabled during loading) */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/30 bg-white/40 p-3 opacity-60 shadow-lg backdrop-blur-md dark:bg-gray-900/30">
          <Button type="button" size="sm" variant="outline" disabled>
            <Bold className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Italic className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Heading1 className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <List className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <ListOrdered className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Undo2 className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Redo2 className="size-4" />
          </Button>
          <div className="text-muted-foreground ml-auto text-xs">
            Loading...
          </div>
        </div>

        {/* Loading animation in the editor area */}
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-white/30 bg-white/50 p-0 px-4 py-6 text-center shadow-inner backdrop-blur-md dark:bg-gray-900/40">
          {pitchGenerationError || errorMessage ? (
            <div
              className="rounded-xl border p-5 text-center"
              role="alert"
              aria-live="polite"
              style={{ backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }}
            >
              <div
                className="mb-2 text-base font-semibold"
                style={{ color: "#444ec1" }}
              >
                Oops! We ran into a hiccup
              </div>

              <p className="mb-4 text-sm" style={{ color: "#444ec1" }}>
                It looks like something went wrong while generating your pitch.
                This can happen if the service is busy or your internet
                connection briefly dropped.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    reset()
                    onRetry?.()
                  }}
                  className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                  style={{ backgroundColor: "#444ec1" }}
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <AIThinkingLoader
              visible={true}
              className="h-full min-h-[300px]"
              onCancel={() => {
                setValue("pitchContent", "<p>Your pitch content...</p>", {
                  shouldDirty: true
                })
                onPitchLoaded()
              }}
              onComplete={() => {
                onPitchLoaded()
              }}
            />
          )}
        </div>
      </div>
    )
  }

  /* ----------------------------------------------------------- */
  /* 9) If content is loaded and not in isPitchLoading state,    */
  /*    show the final editor                                    */
  /* ----------------------------------------------------------- */
  if (!editor) {
    return (
      <div className="flex flex-col items-center space-y-2 py-4">
        <svg
          className="text-muted-foreground size-6 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="text-muted-foreground text-sm">Loading editor…</p>
      </div>
    )
  }

  /* ----------------------------------------------------------- */
  /* 10) Editor Toolbar                                           */
  /* ----------------------------------------------------------- */
  const handleBold = () => editor.chain().focus().toggleBold().run()
  const handleItalic = () => editor.chain().focus().toggleItalic().run()
  const handleHeading = (lvl: 1 | 2 | 3) =>
    editor.chain().focus().toggleHeading({ level: lvl }).run()
  const handleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const handleOrderedList = () =>
    editor.chain().focus().toggleOrderedList().run()
  const handleUndo = () => editor.chain().focus().undo().run()
  const handleRedo = () => editor.chain().focus().redo().run()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <p className="pb-2 text-center text-base font-medium text-gray-700">
          Your pitch is now ready. Feel free to refine the wording or formatting
          below.
        </p>
      </div>

      {/* Editor Toolbar */}
      <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-white/30 bg-white/60 p-3 shadow-lg backdrop-blur-md dark:bg-gray-900/40">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={handleBold}
        >
          <Bold className="size-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={handleItalic}
        >
          <Italic className="size-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleHeading(1)}
        >
          <Heading1 className="size-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          onClick={handleBulletList}
        >
          <List className="size-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          onClick={handleOrderedList}
        >
          <ListOrdered className="size-4" />
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={handleUndo}>
          <Undo2 className="size-4" />
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={handleRedo}>
          <Redo2 className="size-4" />
        </Button>

        <div className="text-muted-foreground ml-auto text-xs">
          {editor.storage.characterCount
            ? `Words: ${editor.storage.characterCount.words() ?? 0}`
            : null}
        </div>
      </div>

      {/* The Editor Content */}
      <ScrollArea className="h-[50vh] w-full overflow-hidden rounded-xl border border-white/30 bg-white/50 shadow-inner backdrop-blur-md dark:bg-gray-900/40">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none p-6 text-neutral-900"
          style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
        >
          <EditorContent editor={editor} />
        </div>
      </ScrollArea>
    </div>
  )
}
