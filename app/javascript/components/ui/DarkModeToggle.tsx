import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { Switch, Tooltip } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { generalStore } from "../stores/GeneralStore";

function toggleLightDarkTheme() {
    if (generalStore.theme === "light") {
        generalStore.theme = "dark";
    } else {
        generalStore.theme = "light";
    }
}

export const DarkModeToggle = observer(
    (props: { text?: string; disableTooltip?: boolean; style?: React.CSSProperties }) => {
        const toggle = (
            <div
                style={{ height: 40, display: "flex", alignItems: "center", cursor: "pointer", ...props.style }}
                onClick={toggleLightDarkTheme}
            >
                {props.text && <span style={{ marginRight: 16 }}>{props.text}</span>}

                <Switch
                    checked={generalStore.theme === "light"}
                    checkedChildren={<SunIcon />}
                    unCheckedChildren={<MoonIcon />}
                    style={{
                        background:
                            generalStore.theme === "light" ? "var(--color-primary-500)" : "var(--color-primary-200)"
                    }}
                />
            </div>
        );

        if (props.disableTooltip) {
            return toggle;
        }

        return <Tooltip title="Toggle light/dark theme">{toggle}</Tooltip>;
    }
);
