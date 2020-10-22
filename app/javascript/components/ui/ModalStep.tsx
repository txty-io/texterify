import * as React from "react";

export function ModalStep(props: { step: number; steps: number; style?: React.CSSProperties }) {
    return (
        <div style={{ fontSize: 12, opacity: 0.5, ...props.style }}>
            Step {props.step}/{props.steps}
        </div>
    );
}
