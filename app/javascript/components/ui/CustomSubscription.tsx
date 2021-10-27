import { StarOutlined } from "@ant-design/icons";
import { Button, Card, message } from "antd";
import moment from "moment";
import * as React from "react";
import { ICustomSubscription } from "../api/v1/OrganizationsAPI";
import { DATE_FORMAT, Utils } from "./Utils";

export function CustomSubscription(props: {
    customSubscription: ICustomSubscription;
    style?: React.CSSProperties;
    onClick?(): Promise<void>;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);

    const plan = Utils.getPlanByPlanName(props.customSubscription.attributes.plan);

    return (
        <Card
            type="inner"
            title={
                <>
                    <StarOutlined style={{ marginRight: 16, color: "var(--color-golden)" }} />
                    {props.customSubscription.attributes.provider}
                </>
            }
            style={{ maxWidth: 640, ...props.style }}
        >
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "5fr 3fr", columnGap: 16, rowGap: 8 }}>
                        <div style={{ fontWeight: "bold" }}>Plan:</div>
                        <div>{plan.name}</div>
                        <div style={{ fontWeight: "bold" }}>Provider:</div>
                        <div>{props.customSubscription.attributes.provider}</div>
                        <div style={{ fontWeight: "bold" }}>Max users:</div>
                        <div>{props.customSubscription.attributes.max_users}</div>
                        <div style={{ fontWeight: "bold" }}>Machine translation characters/month:</div>
                        <div>{props.customSubscription.attributes.machine_translation_character_limit}</div>
                        <div style={{ fontWeight: "bold" }}>Expires at:</div>
                        <div>
                            {props.customSubscription.attributes.ends_at
                                ? moment(props.customSubscription.attributes.ends_at).format(DATE_FORMAT)
                                : "Unlimited"}
                        </div>
                    </div>
                </div>
                {props.onClick && (
                    <Button
                        type="primary"
                        style={{ marginTop: 24, marginLeft: "auto" }}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await props.onClick();
                                message.success("Subscription activated.");
                            } catch (error) {
                                console.error(error);
                                message.error("Failed to activate special subscription.");
                            }
                            setLoading(false);
                        }}
                        loading={loading}
                    >
                        Activate
                    </Button>
                )}
            </div>
        </Card>
    );
}
