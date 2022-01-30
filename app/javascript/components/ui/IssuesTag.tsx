import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Skeleton, Tag } from "antd";
import * as React from "react";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";

export function IssuesTag(props: {
    loading: boolean;
    projectId: string;
    issuesCount: number;
    style?: React.CSSProperties;
}) {
    if (props.loading) {
        return (
            <div style={{ width: 82 }}>
                <Skeleton active paragraph={false} className="skeleton-no-padding skeleton-small-22" />
            </div>
        );
    }

    return (
        <Tag
            icon={props.issuesCount > 0 ? <ExclamationCircleOutlined /> : undefined}
            color={props.issuesCount > 0 ? "var(--color-warn)" : "var(--color-success)"}
            onClick={() => {
                history.push(Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(":projectId", props.projectId));
            }}
            style={{ cursor: "pointer", marginRight: 0, ...props.style }}
        >
            {props.issuesCount} {props.issuesCount === 1 ? "Issue" : "Issues"}
        </Tag>
    );
}
