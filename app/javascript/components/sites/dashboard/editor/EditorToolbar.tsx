import {
    BoldOutlined,
    CodeOutlined,
    Html5Outlined,
    ItalicOutlined,
    OrderedListOutlined,
    UnderlineOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";
import * as React from "react";

function isActive(editor, format, validation) {
    const path = editor.getPath();
    return validation.test(path) || editor.hasFormat(format);
}

function hasFormatBold(editor) {
    return isActive(editor, "B", />B\b/);
}

function hasFormatItalic(editor) {
    return isActive(editor, "I", />I\b/);
}

function hasFormatUnderline(editor) {
    return isActive(editor, "U", />U\b/);
}

function hasFormatOrderedList(editor) {
    return isActive(editor, "OL", />OL\b/);
}

function hasFormatUnorderedList(editor) {
    return isActive(editor, "UL", />UL\b/);
}

function hasFormatCode(editor) {
    return isActive(editor, "PRE", />pre\b/);
}

export function EditorToolbar(props: { editor: any; showHTMLChanged(active: boolean): void }) {
    const [boldActive, setBoldActive] = React.useState<boolean>(false);
    const [italicActive, setItalicActive] = React.useState<boolean>(false);
    const [underlineActive, setUnderlineActive] = React.useState<boolean>(false);
    const [codeActive, setCodeActive] = React.useState<boolean>(false);
    const [orderedListActive, setOrderedListActive] = React.useState<boolean>(false);
    const [unorderedListActive, setUnorderedListActive] = React.useState<boolean>(false);
    const [showHTMLActive, setShowHTMLActive] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (props.editor) {
            props.editor.addEventListener("pathChange", () => {
                setBoldActive(hasFormatBold(props.editor));
                setItalicActive(hasFormatItalic(props.editor));
                setUnderlineActive(hasFormatUnderline(props.editor));
                setCodeActive(hasFormatCode(props.editor));
                setOrderedListActive(hasFormatOrderedList(props.editor));
                setUnorderedListActive(hasFormatUnorderedList(props.editor));
            });
        }
    }, [props.editor]);

    React.useEffect(() => {
        props.showHTMLChanged(showHTMLActive);
    }, [showHTMLActive]);

    if (!props.editor) {
        return null;
    }

    return (
        <div className="toolbar">
            <button
                onClick={(event) => {
                    if (boldActive) {
                        props.editor.removeBold();
                    } else {
                        props.editor.bold();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (boldActive ? "active" : "")}
                aria-label="format bold"
            >
                <BoldOutlined />
            </button>
            <button
                onClick={(event) => {
                    if (italicActive) {
                        props.editor.removeItalic();
                    } else {
                        props.editor.italic();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (italicActive ? "active" : "")}
                aria-label="format italics"
            >
                <ItalicOutlined />
            </button>
            <button
                onClick={(event) => {
                    if (underlineActive) {
                        props.editor.removeUnderline();
                    } else {
                        props.editor.underline();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (underlineActive ? "active" : "")}
                aria-label="format underline"
            >
                <UnderlineOutlined />
            </button>
            <button
                onClick={(event) => {
                    if (orderedListActive) {
                        props.editor.removeList();
                    } else {
                        props.editor.makeOrderedList();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (orderedListActive ? "active" : "")}
                aria-label="format ordered list"
            >
                <OrderedListOutlined />
            </button>
            <button
                onClick={(event) => {
                    if (unorderedListActive) {
                        props.editor.removeList();
                    } else {
                        props.editor.makeUnorderedList();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (unorderedListActive ? "active" : "")}
                aria-label="format unordered list"
            >
                <UnorderedListOutlined />
            </button>
            <button
                onClick={(event) => {
                    if (codeActive) {
                        props.editor.removeCode();
                    } else {
                        props.editor.code();
                    }

                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (codeActive ? "active" : "")}
                aria-label="format code"
            >
                <CodeOutlined />
            </button>
            <button
                onClick={(event) => {
                    setShowHTMLActive(!showHTMLActive);
                    event.preventDefault();
                }}
                className={"toolbar-item spaced " + (showHTMLActive ? "active" : "")}
                aria-label="show html markup"
                style={{ marginLeft: "auto" }}
            >
                <Html5Outlined />
            </button>
        </div>
    );
}
