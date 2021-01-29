import { CloseCircleFilled } from "@ant-design/icons";
import * as moment from "moment";
import * as React from "react";
import styled from "styled-components";
import { authStore } from "../stores/AuthStore";
import { Constants } from "./Constants";
import { TransparentButton } from "./TransparentButton";

const CloseIcon = styled(CloseCircleFilled)`
    opacity: 0.5;

    &:hover {
        opacity: 1;
    }
`;

export function LicenseExpiring(props: { expiresAt: string }) {
    const [hidden, setHidden] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (moment().isBefore(moment(props.expiresAt, "YYYY-MM-DD"))) {
            if (!localStorage.getItem("expiredHeaderHidden")) {
                setHidden(false);
            } else {
                const time = moment(localStorage.getItem("expiredHeaderHidden"));
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
                background: "#ca1111",
                display: "flex",
                alignItems: "center"
            }}
        >
            The Texterify license will expire soon on{" "}
            <span style={{ fontWeight: "bold", marginLeft: 4 }}>{props.expiresAt}</span>.{" "}
            {authStore.currentUser?.is_superadmin ? (
                <>
                    Get a new license before you loose access to the premium features of Texterify.
                    <TransparentButton
                        type="primary"
                        onClick={() => {
                            window.open(Constants.TEXTERIFY_NEW_LICENSE_SITE, "_blank", "noopener noreferrer");
                        }}
                        style={{ marginLeft: 24 }}
                    >
                        Get new license
                    </TransparentButton>
                </>
            ) : (
                <>If the license is not renewed you will loose access to the premium features.</>
            )}
            <div style={{ marginLeft: "auto", paddingLeft: 40 }}>
                <CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        localStorage.setItem("expiredHeaderHidden", moment().toISOString());
                        setHidden(true);
                    }}
                />
            </div>
        </div>
    );
}
