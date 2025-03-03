/**
@description
Client sub-component for wizard Step 5: Final Preview & Editing with TipTap.
We replace the old "Review Your Data" text area with a TipTap editor, allowing
the user to format the final pitch. The user may also click "Generate Final Pitch"
to re-run AI generation if they've changed their data (role, experience, STAR examples).
Key Features:
1. TipTap Editor for final pitch content:
   - Bold, Italic, Headings, Bullet/Ordered List, Undo/Redo, Word Count.
   - We store the result in form state via pitchContent.
2. "Generate Final Pitch" button uses /api/finalPitch to fetch AI text and sets
   pitchContent. If data changed since last generation, it prompts user to re-generate.
3. The rest of the wizard's data is not displayed here (unlike prior "Review" step),
   focusing on final editing. The user can see the rest in prior steps.
4. We continue to track "dataChanged" to highlight that the user's underlying
   answers have changed. If so, we show a small warning prompting them to
   "Regenerate" to incorporate the new data.

@dependencies
React Hook Form: to read/write pitchContent
TipTap: for the text editor
fetch: for server call to /api/finalPitch
useToast: for user notifications
@notes
- We assume the user has installed TipTap libraries: 
  npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-* ...
- If user wants advanced grammar checks or other extension packs, they can add them,
  but for now we handle a minimal set of formatting.

Edge Cases & Error Handling:
- If AI generation fails, we toast an error. 
- If the user has not filled out prior steps, they might get an error from the server
  or an incomplete pitch. Typically the wizard flow ensures required fields are set
  before Step 5.
*/

"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"
import { AlertCircle, Bold, Italic, List, ListOrdered, RotateCw, 
   Undo2, Redo2, Heading1 } from "lucide-react"

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

/**
@interface ReviewStepProps
We don't receive separate props here; we rely on form context (RHF).
*/

/**
@function ReviewStep
@description
The final step in the pitch wizard. Renders a TipTap-based editor for the final
pitch, plus a button to (re)generate final pitch text from the server if the user
has changed data since the last generation. 
*/
export default function ReviewStep() {
  const { getValues, watch, setValue } = useFormContext<PitchWizardFormData>()
  const { toast } = useToast()

  // We'll track whether we are currently calling the AI
  const [generating, setGenerating] = useState(false)
  // We'll also track if data changed since last pitch generation
  const [dataChanged, setDataChanged] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // The final pitch text is stored in pitchContent
  const pitchContent = watch("pitchContent") || ""

  // Watch the underlying wizard data that would affect generation
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const pitchWordLimit = watch("pitchWordLimit")
  const roleDescription = watch("roleDescription")
  const yearsExperience = watch("yearsExperience")
  const relevantExperience = watch("relevantExperience")
  const starExample1 = watch("starExample1")
  const starExample2 = watch("starExample2")

  /**
  Build a key that represents all relevant data for final pitch generation. If the user
  modifies any of these fields, we consider data "changed."
  */
  const formDataKey = JSON.stringify({
    roleName,
    roleLevel,
    pitchWordLimit,
    roleDescription,
    yearsExperience,
    relevantExperience,
    starExample1,
    starExample2
  })

  // We store the last generation's "key" in a ref so that re-renders don't discard it
  const lastGenerationKeyRef = useRef("")

  // On mount, mark as initialized
  useEffect(() => {
    setHasInitialized(true)
  }, [])

  // Whenever form data changes, if we already had pitch content,
  // we mark dataChanged = true if the new key doesn't match the old key
  useEffect(() => {
    if (!hasInitialized) return
    // If there's no pitchContent, user hasn't generated anything yet
    if (!pitchContent) return
    // If the user has already generated content before:
    if (lastGenerationKeyRef.current && formDataKey !== lastGenerationKeyRef.current) {
      setDataChanged(true)
    }
  }, [formDataKey, pitchContent, hasInitialized])

  /**
  handleGenerateFinalPitch
  Makes a POST to /api/finalPitch, passing all relevant wizard data,
  updates the pitchContent in our form state upon success.
  */
  const handleGenerateFinalPitch = useCallback(async () => {
    try {
      setGenerating(true)
      setDataChanged(false)

      // Build request body
      const bodyData = {
        roleName,
        roleLevel,
        pitchWordLimit,
        roleDescription: roleDescription || "",
        yearsExperience,
        relevantExperience,
        starExample1,
        starExample2
      }

      const res = await fetch("/api/finalPitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to fetch final pitch")
      }
      const result = await res.json()
      if (!result.isSuccess) {
        throw new Error(result.message || "Error generating final pitch")
      }

      // Insert the text into pitchContent
      setValue("pitchContent", result.data, { shouldDirty: true })
      // Mark the last generation key to the current data's signature
      lastGenerationKeyRef.current = formDataKey

      toast({
        title: "Final Pitch Generated",
        description: "Albert has created a complete pitch using your data."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate final pitch",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }, [
    formDataKey,
    roleName,
    roleLevel,
    pitchWordLimit,
    roleDescription,
    yearsExperience,
    relevantExperience,
    starExample1,
    starExample2,
    setValue,
    toast
  ])

  /**
  Create the TipTap editor instance
  - We use StarterKit plus some extra extensions (bold, italic, lists, heading, character count).
  - We set the initial content to pitchContent from the wizard.
  - On each update, we sync the text back to the form (pitchContent).
  */
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
      CharacterCountExtension.configure({ limit: 10000 }) // optional limit
    ],
    content: pitchContent,
    autofocus: false,
    onUpdate: ({ editor }: { editor: any }) => {
      // Sync changes to RHF
      const currentText = editor.getHTML()
      setValue("pitchContent", currentText, { shouldDirty: true })
    }
  })

  /**
  Simple toolbar with buttons for Bold, Italic, Heading, Bullet/Ordered List, Undo, Redo.
  We also show character count or word count if desired.
  */
  const handleBold = () => editor?.chain().focus().toggleBold().run()
  const handleItalic = () => editor?.chain().focus().toggleItalic().run()
  const handleHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
    editor?.chain().focus().toggleHeading({ level }).run()
  const handleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const handleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const handleUndo = () => editor?.chain().focus().undo().run()
  const handleRedo = () => editor?.chain().focus().redo().run()

  // If the editor is not yet ready, we show a small fallback
  if (!editor) {
    return (
      <div className="space-y-2">
        <p className="text-sm">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Final Preview</h2>

      <p className="text-sm text-muted-foreground">
        Click "Generate Final Pitch" to have Albert produce a complete APS pitch from
        your wizard inputs. Then use the formatting tools to refine your text before
        submitting.
      </p>

      <Button onClick={handleGenerateFinalPitch} disabled={generating}>
        {generating
          ? "Generating..."
          : dataChanged && pitchContent
          ? "Regenerate Final Pitch"
          : "Generate Final Pitch"}
      </Button>

      {/* If data changed after last generation, show a small warning */}
      {dataChanged && pitchContent && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-800">
            Your details have changed since generating this pitch. Click{" "}
            <strong>Regenerate Final Pitch</strong> to incorporate your latest data.
          </p>
        </div>
      )}

      {/* Editor Toolbar */}
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

        {/* Optional: If you want to show a word or character count from tiptap */}
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

      {/* Helpful note */}
      <p className="text-xs text-muted-foreground">
        Feel free to use the formatting tools above. Once satisfied, click{" "}
        <strong>Submit</strong> on the final wizard screen to save your pitch.
      </p>
    </div>
  )
}