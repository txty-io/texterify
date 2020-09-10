import { BulbFilled, BulbOutlined, AlertFilled, AlertOutlined, FireFilled, FireOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import * as React from "react";
import { generalStore } from "../stores/GeneralStore";
import { observer } from "mobx-react";

function toggleLightDarkTheme() {
    if (generalStore.theme === "light") {
        generalStore.theme = "dark";
    } else {
        generalStore.theme = "light";
    }
}

export const DarkModeToggle = observer(
    (props: { text?: string; disableTooltip?: boolean; style?: React.CSSProperties }) => {
        let Element = FireFilled;

        if (generalStore.theme === "dark") {
            Element = FireOutlined;
        }

        const toggle = (
            <span onClick={toggleLightDarkTheme} style={{ cursor: "pointer", ...props.style }}>
                {props.text && <span style={{ marginRight: 16 }}>{props.text}</span>}
                <Element
                    style={{
                        fontSize: 16,
                        color: generalStore.theme === "light" ? "#fff" : undefined
                    }}
                />
            </span>
        );

        if (props.disableTooltip) {
            return toggle;
        }

        return <Tooltip title="Toggle light/dark theme">{toggle}</Tooltip>;
    }
);
