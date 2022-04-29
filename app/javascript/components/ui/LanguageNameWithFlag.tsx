import * as React from "react";
import FlagIcon from "./FlagIcons";

export function LanguageNameWithFlag(props: {
    languageName: string;
    countryCode: string;
    showNameWithCountryCode?: boolean;
}) {
    return (
        <>
            {props.countryCode && (
                <span style={{ marginRight: 8 }}>
                    <FlagIcon code={props.countryCode.toLowerCase()} />
                </span>
            )}
            {props.languageName}
            {props.showNameWithCountryCode && <>-{props.countryCode}</>}
        </>
    );
}
