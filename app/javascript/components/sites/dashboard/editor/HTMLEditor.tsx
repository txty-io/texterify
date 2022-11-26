import { Input } from "antd";
import * as React from "react";
import { EditorToolbar } from "./EditorToolbar";
import * as Squire from "./squire";

function prepareHTML(content: string) {
    // The editor returns "<p><br></p>" if there is no content.
    // If this is the case we use an empty string because otherwise when deleting
    // the content with the HTML editor the saved translation is never empty and therefore the
    // "show untranslated" filter won't work.
    if (content === "<p><br></p>" || content === "<p></p>") {
        content = "";
    }

    return content;
}

export function HTMLEditor(props: { value?: string; disabled?: boolean; onChange?(value: string, x: any): void }) {
    const [editor, setEditor] = React.useState(null);
    const [editorHTMLPreview, setEditorHTMLPreview] = React.useState(null);
    const [showHTMLActive, setShowHTMLActive] = React.useState<boolean>(false);

    const editorElementRef = React.useRef<HTMLDivElement>();

    React.useEffect(() => {
        if (editorElementRef?.current) {
            const squire = new Squire(editorElementRef.current, { blockTag: "P" });

            if (props.value) {
                squire.setHTML(props.value);
            }

            setEditor(squire);
            setEditorHTMLPreview(prepareHTML(squire.getHTML()));

            squire.addEventListener("input", () => {
                const content = prepareHTML(squire.getHTML());

                setEditorHTMLPreview(content);

                if (props.onChange) {
                    props.onChange(content, 1);
                }
            });
        }
    }, []);

    React.useEffect(() => {
        if (editor && props.value) {
            if (props.value !== prepareHTML(editor.getHTML())) {
                editor.setHTML(props.value);
                const content = prepareHTML(editor.getHTML());
                setEditorHTMLPreview(content);
            }
        }
    }, [props.value]);

    return (
        <div className="html-editor">
            {!props.disabled && (
                <EditorToolbar
                    editor={editor}
                    showHTMLChanged={(active) => {
                        setShowHTMLActive(active);
                    }}
                />
            )}
            {!props.disabled && <div ref={editorElementRef} className="ant-input" />}
            {props.disabled && <Input value={props.value} disabled />}
            {showHTMLActive && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: "bold" }}>HTML preview</div>
                    <code style={{ marginTop: 8, display: "block" }}>{editorHTMLPreview}</code>
                </div>
            )}
        </div>
    );
}
