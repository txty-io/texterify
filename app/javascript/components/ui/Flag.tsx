import * as React from "react";
import { ILanguage } from "../api/v1/LanguagesAPI";
import FlagIcon from "./FlagIcons";

export function Flag(props: {
    countryCode?: any;
    languageCode?: any;
    language: ILanguage;
    style?: React.CSSProperties;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {props.countryCode && (
                <span style={{ marginRight: 8 }}>
                    <FlagIcon code={props.countryCode.attributes.code.toLowerCase()} />
                </span>
            )}
            {props.language.attributes.name}
        </div>
    );
}
