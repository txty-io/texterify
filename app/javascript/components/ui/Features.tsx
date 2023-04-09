import { CheckCircleFilled } from "@ant-design/icons";
import * as React from "react";
import { IFeature } from "./Licenses";

export function Features(props: {
    features: IFeature[];
    featureIndex: number;
    highlighted?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <ul style={{ listStyleType: "none", margin: 0, padding: 0, ...props.style }}>
            {props.features.map((feature, index) => {
                const isLast = index === props.features.length - 1;

                return (
                    <li key={feature.name} style={{ display: "flex", marginBottom: isLast ? 0 : 8 }}>
                        <CheckCircleFilled
                            style={{
                                color: props.highlighted ? "#fff" : "#0e942d",
                                marginRight: 16,

                                marginTop: 4
                            }}
                        />
                        {feature.values[props.featureIndex] === true
                            ? feature.name
                            : `${feature.values[props.featureIndex]} ${feature.name}`}
                    </li>
                );
            })}
        </ul>
    );
}
