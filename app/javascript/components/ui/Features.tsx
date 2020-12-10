import { CheckCircleFilled } from "@ant-design/icons";
import * as React from "react";

export function Features(props: { features: string[]; style?: React.CSSProperties }) {
    return (
        <ul style={{ listStyleType: "none", margin: 0, padding: 0, ...props.style }}>
            {props.features.map((feature, index) => {
                const isLast = index === props.features.length - 1;

                return (
                    <li key={feature}>
                        <CheckCircleFilled
                            style={{
                                color: "#25b546",
                                marginRight: 16,
                                marginBottom: isLast ? 0 : 8
                            }}
                        />
                        {feature}
                    </li>
                );
            })}
        </ul>
    );
}
