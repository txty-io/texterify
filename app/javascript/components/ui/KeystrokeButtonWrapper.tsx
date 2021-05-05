import * as React from "react";
import { getKeystrokePreview, IKeys } from "./KeystrokePreview";

export function KeystrokeButtonWrapper(props: { keys: IKeys[] }) {
    return <span style={{ marginLeft: 8, fontSize: 10, fontWeight: "bold" }}>({getKeystrokePreview(props.keys)})</span>;
}
