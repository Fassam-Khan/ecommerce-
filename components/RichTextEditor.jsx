
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {useEffect} from 'react'

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) return null;

  const buttonClass = (active) =>
    `rounded px-3 py-2 text-sm ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b bg-white p-3">
        <button
          type="button"
          className={buttonClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          Strike
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet List
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered List
        </button>

        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          Undo
        </button>

        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          Redo
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-48 bg-white p-4 text-gray-900 [&_.tiptap]:min-h-40 [&_.tiptap]:outline-none [&_.tiptap_p]:my-2 [&_.tiptap_h2]:my-3 [&_.tiptap_h2]:text-2xl [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6"
      />
    </div>
  );
}
