import * as React from "react";
import ReactHotkeys from "react-hot-keys";
import { IKeys } from "./KeystrokePreview";

export function KeystrokeHandler(props: { keys: IKeys[]; onActivated(): void }) {
    const keystroke = [props.keys.join("+")];

    if (props.keys.includes("ctrl")) {
        keystroke.push(
            props.keys
                .map((key) => {
                    return key === "ctrl" ? "command" : key;
                })
                .join("+")
        );
    }

    return (
        <ReactHotkeys
            keyName={keystroke.join(",")}
            onKeyDown={props.onActivated}
            filter={() => {
                return true;
            }}
            allowRepeat
        />
    );
}
