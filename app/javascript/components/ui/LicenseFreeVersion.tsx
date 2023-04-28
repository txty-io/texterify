import { CloseCircleFilled } from "@ant-design/icons";
import { ArrowTopRightOnSquareIcon, ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { Button } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Constants } from "./Constants";

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
                padding: "16px 24px",
                background: "var(--color-primary-200)",
                color: "#fff",
                display: "flex",
                alignItems: "center"
            }}
        >
            {props.hasLicense ? (
                <>Your license expired and you are now using the free version of Texterify.</>
            ) : (
                <>You are currently using the free version of Texterify.</>
            )}{" "}
            Upgrade to a paid plan to get access to premium features.
            <a
                href={Constants.TEXTERIFY_NEW_LICENSE_SITE}
                target="_blank"
                style={{ whiteSpace: "nowrap", marginLeft: 24, marginRight: 40, display: "flex", alignItems: "center" }}
            >
                Upgrade plan <ArrowUpRightIcon width={16} style={{ marginLeft: 8 }} />
            </a>
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
