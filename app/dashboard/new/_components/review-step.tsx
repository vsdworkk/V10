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
import AIThinkingLoader from "./ai-thinking-loader"
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
}

export default function ReviewStep({ isPitchLoading, onPitchLoaded, errorMessage }: ReviewStepProps) {
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
    if (editor && pitchContent && pitchContent !== editor.getHTML()) {
      editor.commands.setContent(pitchContent, false);
    }
  }, [editor, pitchContent]);
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

  // Add custom styles for spacing between sections
  useEffect(() => {
    if (editor) {
      const style = document.createElement('style');
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
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [editor]);

  /* ----------------------------------------------------------- */
  /* 4) Loading skeleton if pitch is not ready                   */
  /* ----------------------------------------------------------- */
  // If isPitchLoading or no pitch content, show a skeleton/spinner
  if (isPitchLoading || !pitchContent.trim()) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          <strong>Generating your pitch...</strong> The content will appear below as soon as it's ready.
        </div>

        {/* Editor toolbar (disabled during loading) */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/30 bg-white/40 dark:bg-gray-900/30 backdrop-blur-md p-3 opacity-60 shadow-lg">
          <Button type="button" size="sm" variant="outline" disabled>
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled>
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">Loading...</div>
        </div>

        {/* Loading animation in the editor area */}
        <div className="min-h-[300px] rounded-xl border border-white/30 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md p-0 shadow-inner">
          <AIThinkingLoader 
            visible={true}
            errorMessage={errorMessage}
            onCancel={() => {
              // Set empty content to exit loading state
              setValue("pitchContent", "<p>Your pitch content...</p>", { shouldDirty: true });
              onPitchLoaded(); // Reset isLoading in parent
            }}
            onComplete={() => {
              // This shouldn't be needed as the content should
              // be loaded via Supabase realtime, but just in case
              onPitchLoaded();
            }}
            className="h-full min-h-[300px]"
          />
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
      <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-white/30 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-3 shadow-lg">
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
      <ScrollArea className="h-[50vh] w-full overflow-hidden rounded-xl border border-white/30 bg-white/50 dark:bg-gray-900/40 backdrop-blur-md shadow-inner">
        <div
          className="prose prose-slate prose-neutral text-neutral-900 dark:prose-invert max-w-none p-6"
          style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
        >
          <EditorContent editor={editor} />
        </div>
      </ScrollArea>
    </div>
  )
}