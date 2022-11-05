import { Tooltip } from "antd";
import * as React from "react";
import { Styles } from "./Styles";

export function LanguageCodeWithTooltip() {
    return (
        <Tooltip title="This will be automatically replaced with the language code of the language during export.">
            <span style={{ color: Styles.COLOR_SECONDARY }}>{"{languageCode}"}</span>
        </Tooltip>
    );
}
