import * as React from "react";
import { Styles } from "./Styles";
import { TextCopier } from "./TextCopier";

function TextBadge(props: { text: string; withCopy?: string; style?: React.CSSProperties }) {
    return (
        <span
            style={{
                background: Styles.COLOR_SECONDARY_LIGHT,
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 11,
                color: Styles.COLOR_SECONDARY_GREY,
                ...props.style
            }}
        >
            {props.text}
            {props.withCopy && <TextCopier textToCopy={props.withCopy} />}
        </span>
    );
}

export { TextBadge };
