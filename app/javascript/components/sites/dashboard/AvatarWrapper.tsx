import * as React from "react";
import { Styles } from "../../ui/Styles";

export function AvatarWrapper(props: { children: React.ReactNode }) {
    const { children, ...restProps } = props;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                border: "1px solid var(--border-color)"
            }}
            {...restProps}
        >
            {children}
        </div>
    );
}
