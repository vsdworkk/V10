"use client"

/**
 * ReviewStep
 * ----------
 * Final wizard screen where the user polishes the pitch.
 *
 * Enhancements:
 *  • Accepts `isPitchLoading` from parent. If true or if pitchContent is empty,
 *    show a loading skeleton rather than the TipTap editor.
 *  • Subscribes to Supabase realtime updates on the row whose
 *    `agent_execution_id` matches the one stored in the form, to update pitchContent automatically.
 */

import React, { useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { supabase } from "@/lib/supabase-browser"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading1
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
import { Skeleton } from "@/components/ui/skeleton"

interface ReviewStepProps {
  /** 
   * If true, show a loading skeleton/spinner instead of the actual pitch content.
   * This is set when the user transitions from the last STAR step to this step and
   * we haven't yet received the final pitch text from the agent.
   */
  isPitchLoading: boolean

  /** Callback invoked when the pitch content has loaded */
  onPitchLoaded: () => void
}

export default function ReviewStep({ isPitchLoading, onPitchLoaded }: ReviewStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  /* ----------------------------------------------------------- */
  /* 1) Observed pitch content and execution ID from form        */
  /* ----------------------------------------------------------- */
  const pitchContent = watch("pitchContent") || ""
  const execId = watch("agentExecutionId") || null

  /* ----------------------------------------------------------- */
  /* 2) Editor setup (TipTap)                                    */
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
  /* 3) Supabase Realtime subscription for agent exec ID         */
  /* ----------------------------------------------------------- */
  const subscribedRef = useRef<boolean>(false)

  useEffect(() => {
    if (!execId) return
    if (subscribedRef.current) return
    subscribedRef.current = true

    const channel = supabase
      .channel(`pitch-exec-${execId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pitches",
          filter: `agent_execution_id=eq.${execId}`
        },
        payload => {
          const newHtml = (payload.new as any)?.pitch_content
          if (newHtml && newHtml.length > 0) {
            setValue("pitchContent", newHtml, { shouldDirty: true })
            editor?.commands.setContent(newHtml, false)

            toast({
              title: "Pitch ready!",
              description: "Albert has finished generating your pitch."
            })

            // Step 3 addition: Call the callback from parent
            onPitchLoaded()
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [execId, editor, toast, setValue, onPitchLoaded])

  /* ----------------------------------------------------------- */
  /* 4) Loading skeleton if pitch is not ready                   */
  /* ----------------------------------------------------------- */
  // If isPitchLoading or no pitch content, show a skeleton/spinner
  if (isPitchLoading || !pitchContent.trim()) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          <strong>Generating final pitch...</strong> If you don't see the pitch yet,
          hang tight – it will appear below once ready.
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 px-4 py-10 bg-white border rounded-md">
          <svg
            className="h-6 w-6 animate-spin text-muted-foreground"
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

          {/* Some skeleton placeholders */}
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  /* ----------------------------------------------------------- */
  /* 5) If content is loaded and not in isPitchLoading state,    */
  /*    show the final editor                                    */
  /* ----------------------------------------------------------- */
  if (!editor) {
    return (
      <div className="flex flex-col items-center space-y-2 py-4">
        <svg
          className="h-6 w-6 animate-spin text-muted-foreground"
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
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    )
  }

  /* ----------------------------------------------------------- */
  /* 6) Editor Toolbar                                           */
  /* ----------------------------------------------------------- */
  const handleBold = () => editor.chain().focus().toggleBold().run()
  const handleItalic = () => editor.chain().focus().toggleItalic().run()
  const handleHeading = (lvl: 1 | 2 | 3) =>
    editor.chain().focus().toggleHeading({ level: lvl }).run()
  const handleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const handleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const handleUndo = () => editor.chain().focus().undo().run()
  const handleRedo = () => editor.chain().focus().redo().run()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your pitch is now ready. Feel free to refine the wording or formatting below.
      </p>

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted p-2">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={handleBold}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={handleItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={() => handleHeading(1)}>
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          onClick={handleBulletList}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          onClick={handleOrderedList}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={handleUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button type="button" size="sm" variant="outline" onClick={handleRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="ml-auto text-xs text-muted-foreground">
          {editor.storage.characterCount
            ? `Characters: ${editor.storage.characterCount.characters() ?? 0}`
            : null}
        </div>
      </div>

      {/* The Editor Content */}
      <div className="min-h-[300px] rounded-md border p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
