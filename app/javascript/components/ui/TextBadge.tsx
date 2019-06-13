import * as React from "react";
import { TextCopier } from "./TextCopier";

function TextBadge(props: { text: string; withCopy?: string }) {
    return (
        <span
            style={{
                background: "#f0f0f0",
                padding: "4px 12px",
                borderRadius: 80,
                fontSize: 11,
                fontWeight: "bold"
            }}
        >
            {props.text}
            {props.withCopy && <TextCopier textToCopy={props.withCopy} />}
        </span>
    );
}

export { TextBadge };
