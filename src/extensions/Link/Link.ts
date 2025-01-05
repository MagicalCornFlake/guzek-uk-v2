import { isScriptUrl } from "@/lib/utils";
import { mergeAttributes } from "@tiptap/core";
import TiptapLink from "@tiptap/extension-link";
import { Plugin } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

export const Link = TiptapLink.extend({
  inclusive: false,

  parseHTML() {
    return [
      {
        tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])',
        getAttrs: (element) => {
          // check if link starts with javascript:
          if (isScriptUrl(element.getAttribute("href"))) {
            return false;
          }

          return null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (isScriptUrl(HTMLAttributes.href)) {
      return [
        "a",
        mergeAttributes(
          this.options.HTMLAttributes,
          { ...HTMLAttributes, href: "" },
          { class: "link" },
        ),
        0,
      ];
    }

    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "link",
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      ...(this.parent?.() || []),
      new Plugin({
        props: {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            const { selection } = editor.state;

            if (event.key === "Escape" && selection.empty !== true) {
              editor.commands.focus(selection.to, { scrollIntoView: false });
            }

            return false;
          },
        },
      }),
    ];
  },
});

export default Link;