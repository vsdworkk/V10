"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import BoldExtension from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Underline from "@tiptap/extension-underline"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import CharacterCount from "@tiptap/extension-character-count"
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Type as TypeIcon
} from "lucide-react"
import { toast } from "sonner"

interface PitchEditorProps {
  pitchId: string
  initialContent: string
}

export default function PitchEditor({
  pitchId,
  initialContent
}: PitchEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      BoldExtension,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      CharacterCount.configure()
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "w-full min-h-[600px] focus:outline-none p-4 border rounded-md",
        spellCheck: "true"
      }
    },
    onUpdate: () => setHasChanges(true)
  })

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  const handleSave = useCallback(async () => {
    if (!editor) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/pitchContent/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitchContent: editor.getHTML() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Pitch saved")
      setHasChanges(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }, [editor, pitchId])

  const handleExit = useCallback(() => {
    if (hasChanges && !confirm("You have unsaved changes. Exit anyway?")) return
    router.push("/dashboard")
  }, [hasChanges, router])

  const wordCount = useMemo(
    () => (editor ? editor.storage.characterCount.words() : 0),
    [editor, editor?.state]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 pb-8">
      <div className="bg-muted flex w-full items-center gap-2 overflow-x-auto rounded-md border p-2">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          icon={<BoldIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          icon={<ItalicIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
          icon={<UnderlineIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor?.isActive("heading", { level: 2 })}
          icon={<TypeIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          icon={<ListIcon className="size-4" />}
        />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          icon={<OrderedListIcon className="size-4" />}
        />
        <span className="text-muted-foreground ml-auto whitespace-nowrap text-sm">
          Words: {wordCount}
        </span>
      </div>

      <div className="min-h-0 w-full flex-1">
        <EditorContent editor={editor} className="h-full" />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleExit}>
          Exit
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  icon: React.ReactNode
}

function ToolbarButton({ onClick, active, icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hover:bg-accent rounded-md p-1.5 transition-colors ${active ? "bg-accent" : ""}`}
    >
      {icon}
    </button>
  )
}
