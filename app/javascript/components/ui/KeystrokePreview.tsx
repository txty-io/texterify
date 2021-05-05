import { Utils } from "./Utils";

export type IKeys =
    | "ctrl"
    | "esc"
    | "enter"
    | "shift"
    | "alt"
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f"
    | "g"
    | "h"
    | "i"
    | "j"
    | "k"
    | "l"
    | "m"
    | "n"
    | "o"
    | "p"
    | "q"
    | "r"
    | "s"
    | "t"
    | "u"
    | "v"
    | "w"
    | "x"
    | "y"
    | "z";

export function getKeystrokePreview(keys: IKeys[]) {
    return keys
        .map((key) => {
            let transformedKey;

            if (key === "ctrl") {
                transformedKey = Utils.getCommandKeyDependingOnPlatform();
            } else if (key === "enter") {
                transformedKey = "Enter";
            } else if (key === "shift") {
                transformedKey = "⇧";
            } else if (key === "alt") {
                transformedKey = "Alt";
            } else if (key === "esc") {
                transformedKey = "Esc";
            } else {
                transformedKey = key.toUpperCase();
            }

            return transformedKey;
        })
        .join(" + ");
}
