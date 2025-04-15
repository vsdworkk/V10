/**
@description
Client sub-component for the final step (Review) in the pitch wizard.
We have removed the "Generate Final Pitch" button. The pitch content is
now automatically generated after the user completes the last STAR
sub-step. This step simply provides a TipTap editor for the user to refine
the pitch text if they wish. No re-generation logic is available here.
@notes
We keep the Tiptap editor so the user can edit the final text as needed.
*/

"use client"

import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useToast } from "@/lib/hooks/use-toast"
import { AlertCircle, Bold, Italic, List, ListOrdered, Undo2, Redo2, Heading1, RefreshCw } from "lucide-react"

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

/**
 * @function ReviewStep
 * The final wizard step showing a Tiptap editor for the automatically-generated
 * pitch. The user can refine wording or formatting before they submit.
 *
 * Key changes in Step 4:
 * - Removed any "Generate Final Pitch" or "Re-generate" button
 * - Only displays the Tiptap editor to let the user edit pitchContent
 */
export default function ReviewStep() {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  // The final pitch text is in pitchContent
  const pitchContent = watch("pitchContent") || ""
  
  // State for regeneration
  const [regenerating, setRegenerating] = useState(false)
  
  // Function to regenerate the pitch
  async function handleRegeneratePitch() {
    if (regenerating) return
    
    setRegenerating(true)
    try {
      const values = watch()
      const res = await fetch("/api/finalPitch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          roleName: values.roleName,
          roleLevel: values.roleLevel,
          pitchWordLimit: values.pitchWordLimit,
          roleDescription: values.roleDescription || "",
          yearsExperience: values.yearsExperience,
          relevantExperience: values.relevantExperience,
          starExamples: values.starExamples
        })
      })
      
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to regenerate pitch")
      }
      
      const result = await res.json()
      if (!result.isSuccess) {
        throw new Error(result.message || "Failed to regenerate pitch")
      }
      
      // Update the pitch content in the form and editor
      setValue("pitchContent", result.data || "", { shouldDirty: true })
      if (editor) {
        editor.commands.setContent(result.data || "")
      }
      
      toast({
        title: "Success",
        description: "Your pitch has been regenerated",
      })
    } catch (error: any) {
      console.error("Error regenerating pitch:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate pitch",
        variant: "destructive"
      })
    } finally {
      setRegenerating(false)
    }
  }

  // Initialize TipTap
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
      // Sync changes to RHF
      const currentHTML = editor.getHTML()
      setValue("pitchContent", currentHTML, { shouldDirty: true })
    }
  })

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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  // Tiptap toolbar handlers
  const handleBold = () => editor.chain().focus().toggleBold().run()
  const handleItalic = () => editor.chain().focus().toggleItalic().run()
  const handleHeading = (level: 1 | 2 | 3) =>
    editor.chain().focus().toggleHeading({ level }).run()
  const handleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const handleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const handleUndo = () => editor.chain().focus().undo().run()
  const handleRedo = () => editor.chain().focus().redo().run()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your pitch has been automatically generated by Albert based on your STAR examples. Feel free to refine the wording
        or formatting below before clicking <strong>Submit</strong> to finalize your pitch.
      </p>

      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm flex justify-between items-center">
        <span><strong>✓ Automatic generation complete!</strong> Your pitch has been created using the STAR examples you provided.</span>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={handleRegeneratePitch} 
          disabled={regenerating}
          className="ml-4 flex items-center gap-1 whitespace-nowrap"
        >
          {regenerating ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted p-2">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={handleBold}
          aria-label="Toggle Bold"
          className="flex items-center gap-1"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={handleItalic}
          aria-label="Toggle Italic"
          className="flex items-center gap-1"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleHeading(1)}
          aria-label="Heading Level 1"
          className="flex items-center gap-1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          onClick={handleBulletList}
          aria-label="Toggle Bullet List"
          className="flex items-center gap-1"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          onClick={handleOrderedList}
          aria-label="Toggle Ordered List"
          className="flex items-center gap-1"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUndo}
          aria-label="Undo"
          className="flex items-center gap-1"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRedo}
          aria-label="Redo"
          className="flex items-center gap-1"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* Character count display (optional) */}
        <div className="ml-auto text-xs text-muted-foreground">
          {editor.storage.characterCount
            ? `Characters: ${editor.storage.characterCount.characters() ?? 0}`
            : null}
        </div>
      </div>

      {/* Editor Area */}
      <div className="min-h-[300px] rounded-md border p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}