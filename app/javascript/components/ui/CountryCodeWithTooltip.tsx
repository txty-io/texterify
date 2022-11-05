import { Tooltip } from "antd";
import * as React from "react";
import { Styles } from "./Styles";

export function CountryCodeWithTooltip() {
    return (
        <Tooltip title="This will be automatically replaced with the country code of the language during export.">
            <span style={{ color: Styles.COLOR_SECONDARY }}>{"{countryCode}"}</span>
        </Tooltip>
    );
}
