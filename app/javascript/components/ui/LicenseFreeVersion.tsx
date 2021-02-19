import { CloseCircleFilled } from "@ant-design/icons";
import * as moment from "moment";
import * as React from "react";
import styled from "styled-components";
import { Constants } from "./Constants";
import { TransparentButton } from "./TransparentButton";

const CloseIcon = styled(CloseCircleFilled)`
    opacity: 0.5;

    &:hover {
        opacity: 1;
    }
`;

export function LicenseFreeTrial(props: { hasLicense: boolean; expiresAt: string }) {
    const [hidden, setHidden] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (!props.expiresAt || moment().isAfter(moment(props.expiresAt, "YYYY-MM-DD"))) {
            if (!localStorage.getItem("freeVersionHeaderHidden")) {
                setHidden(false);
            } else {
                const time = moment(localStorage.getItem("freeVersionHeaderHidden"));
                if (time.add(1, "week").isBefore(moment())) {
                    setHidden(false);
                }
            }
        }
    }, []);

    if (hidden) {
        return null;
    }

    return (
        <div
            style={{
                padding: "12px 24px",
                background: "var(--primary-btn-color)",
                display: "flex",
                alignItems: "center"
            }}
        >
            {props.hasLicense ? (
                <>Your license expired and you are now using the free version of Texterify.</>
            ) : (
                <>You are currently using the free version of Texterify.</>
            )}{" "}
            Upgrade to a paid plan to get access to the premium features.
            <TransparentButton
                type="primary"
                onClick={() => {
                    window.open(Constants.TEXTERIFY_NEW_LICENSE_SITE, "_blank", "noopener noreferrer");
                }}
                style={{ marginLeft: 24, marginRight: 40 }}
            >
                Upgrade plan
            </TransparentButton>
            <div style={{ marginLeft: "auto" }}>
                <CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        localStorage.setItem("freeVersionHeaderHidden", moment().toISOString());
                        setHidden(true);
                    }}
                />
            </div>
        </div>
    );
}
