import { UserOutlined } from "@ant-design/icons";
import { Empty, Tag, Timeline } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { APIUtils } from "../api/v1/APIUtils";
import { Routes } from "../routing/Routes";
import { ActivityTimeAgo } from "./ActivityTimeAgo";
import FlagIcon from "./FlagIcons";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";
import { generalStore } from "../stores/GeneralStore";

const ActivityItemWrapper = styled.div`
    word-break: break-all;
`;

interface IActivityKeyElementProps {
    color: string;
    background: string;
    noMarginRight?: boolean;
}
const ActivityKeyElement = styled.span`
    font-family: "Source Code Pro", monospace;
    background: ${(props: IActivityKeyElementProps) => {
        return props.background;
    }};
    margin: 0
        ${(props: IActivityKeyElementProps) => {
            return props.noMarginRight ? 0 : "4px";
        }}
        0 4px;
    color: ${(props: IActivityKeyElementProps) => {
        return props.color;
    }};
    padding: 0 6px;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
`;

const ProjectElement = styled(Link)`
    display: flex;
    align-items: center;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
`;

interface IProps {
    activitiesResponse: any;
    hideTime?: boolean;
    mode?: "left" | "alternate" | "right";
    showTimeAgo?: boolean;
    includeProjectLink?: boolean;
}

class Activity extends React.Component<IProps> {
    getActivityElement = (activity: any) => {
        const user = APIUtils.getIncludedObject(
            activity.relationships.user && activity.relationships.user.data,
            this.props.activitiesResponse.included
        );
        const project = APIUtils.getIncludedObject(
            activity.relationships.project && activity.relationships.project.data,
            this.props.activitiesResponse.included
        );

        const userElement = (
            <div style={{ fontSize: 12, display: "flex", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", lineHeight: 0 }}>
                    <div style={{ width: 16, marginRight: 8 }}>
                        {user ? (
                            <UserAvatar user={user.attributes} style={{ width: 16, height: 16, fontSize: 8 }} />
                        ) : (
                            <UserOutlined />
                        )}
                    </div>
                    {user ? (
                        user.attributes.username
                    ) : (
                        <span style={{ textDecoration: "line-through" }}>Deleted user</span>
                    )}
                </div>
                {!this.props.hideTime && (
                    <div style={{ display: "flex", alignItems: "center", lineHeight: 0, marginLeft: "auto" }}>
                        {moment
                            .utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss")
                            .local()
                            .format("DD.MM.YYYY HH:mm")}
                    </div>
                )}
            </div>
        );

        const event = activity.attributes.event;
        const itemType = activity.attributes.item_type;

        let activityElement;
        if (activity.attributes.item_type === "Key") {
            const isNameChange = activity.attributes.object_changes.name;
            const isDescriptionChange = activity.attributes.object_changes.description;
            const isHTMLEnabledChange = activity.attributes.object_changes.html_enabled;

            if (event === "destroy") {
                activityElement = (
                    <ActivityItemWrapper>
                        {activity.attributes.item_type} with name
                        <ActivityKeyElement
                            color={this.getStylesForEvent(itemType, event).color}
                            background={this.getStylesForEvent(itemType, event).background}
                        >
                            {activity.attributes.object_changes.name[0]}
                        </ActivityKeyElement>
                        {`${activity.attributes.event}ed`}.{userElement}
                    </ActivityItemWrapper>
                );
            } else if (isNameChange) {
                if (event === "create") {
                    activityElement = (
                        <ActivityItemWrapper>
                            Key with name
                            <ActivityKeyElement
                                color={this.getStylesForEvent(itemType, event).color}
                                background={this.getStylesForEvent(itemType, event).background}
                            >
                                {activity.attributes.object_changes.name[1]}
                            </ActivityKeyElement>
                            {`${activity.attributes.event}d`}.{userElement}
                        </ActivityItemWrapper>
                    );
                } else {
                    activityElement = (
                        <ActivityItemWrapper>
                            Renamed key
                            <ActivityKeyElement
                                color={this.getStylesForEvent(itemType, event).color}
                                background={this.getStylesForEvent(itemType, event).background}
                            >
                                {activity.attributes.object_changes.name[0]}
                            </ActivityKeyElement>
                            to
                            <ActivityKeyElement
                                color={this.getStylesForEvent(itemType, event).color}
                                background={this.getStylesForEvent(itemType, event).background}
                                style={{ marginRight: 0 }}
                            >
                                {activity.attributes.object_changes.name[1]}
                            </ActivityKeyElement>
                            .{userElement}
                        </ActivityItemWrapper>
                    );
                }
            } else if (isDescriptionChange) {
                activityElement = (
                    <ActivityItemWrapper>
                        Description of key
                        <ActivityKeyElement
                            color={this.getStylesForEvent(itemType, event).color}
                            background={this.getStylesForEvent(itemType, event).background}
                        >
                            {activity.attributes.object.name}
                        </ActivityKeyElement>
                        {`${activity.attributes.event}d`}.{userElement}
                    </ActivityItemWrapper>
                );
            } else if (isHTMLEnabledChange) {
                activityElement = (
                    <ActivityItemWrapper>
                        {activity.attributes.object_changes.html_enabled[1] ? "Added " : "Removed "}
                        tag{" "}
                        <Tag color="magenta" style={{ margin: 0 }}>
                            HTML
                        </Tag>
                        {activity.attributes.object_changes.html_enabled[1] ? " to" : " from"} key
                        <ActivityKeyElement
                            noMarginRight
                            color={this.getStylesForEvent(itemType, event).color}
                            background={this.getStylesForEvent(itemType, event).background}
                        >
                            {activity.attributes.object.name}
                        </ActivityKeyElement>
                        .{userElement}
                    </ActivityItemWrapper>
                );
            }
        } else if (activity.attributes.item_type === "Translation") {
            const key = APIUtils.getIncludedObject(
                activity.relationships.key.data,
                this.props.activitiesResponse.included
            );
            const language = APIUtils.getIncludedObject(
                activity.relationships.language.data,
                this.props.activitiesResponse.included
            );
            const countryCode =
                language &&
                APIUtils.getIncludedObject(
                    language.relationships.country_code.data,
                    this.props.activitiesResponse.included
                );

            activityElement = (
                <ActivityItemWrapper>
                    Translation for language
                    {countryCode ? (
                        <>
                            <span style={{ marginLeft: 8, marginRight: 4, width: 16, display: "inline-block" }}>
                                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                            </span>
                            <b>{language.attributes.name}</b>
                        </>
                    ) : (
                        <span style={{ textDecoration: "line-through", marginLeft: 4 }}>Deleted</span>
                    )}{" "}
                    of key
                    <ActivityKeyElement
                        color={this.getStylesForEvent(itemType, event).color}
                        background={this.getStylesForEvent(itemType, event).background}
                    >
                        {key ? key.attributes.name : <span style={{ textDecoration: "line-through" }}>deleted</span>}
                    </ActivityKeyElement>
                    updated.
                    {userElement}
                </ActivityItemWrapper>
            );
        }

        const diffToNow = moment().diff(moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss"));
        const diffToNowDuration = moment.duration(diffToNow);

        return (
            <div style={{ display: "flex" }}>
                <div
                    style={{
                        flexGrow: 1,
                        marginRight: this.props.showTimeAgo || this.props.includeProjectLink ? 40 : 0
                    }}
                >
                    {activityElement}
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        flexShrink: 0,
                        maxWidth: 200,
                        wordBreak: "break-all"
                    }}
                >
                    {this.props.showTimeAgo && <ActivityTimeAgo duration={diffToNowDuration} />}
                    {this.props.includeProjectLink && (
                        <div>
                            <ProjectElement
                                to={Routes.DASHBOARD.PROJECT.replace(
                                    ":projectId",
                                    activity.relationships.project.data.id
                                )}
                                style={{ marginTop: 8 }}
                            >
                                {project.attributes.name}
                            </ProjectElement>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    getIconForEvent = (event: "create" | "update" | "destroy") => {
        if (event === "create") {
            return "plus";
        } else if (event === "update") {
            return "edit";
        } else if (event === "destroy") {
            return "delete";
        }
    };

    getStylesForEvent = (itemType: string, event: "create" | "update" | "destroy") => {
        if (event === "create" && itemType !== "Translation") {
            return {
                iconColor: "#333",
                color: Styles.COLOR_GREEN,
                background: Styles.COLOR_GREEN_LIGHT
            };
        } else if (event === "update" || itemType === "Translation") {
            return {
                iconColor: "#333",
                color: generalStore.theme === "light" ? Styles.COLOR_SECONDARY : "#fff",
                background: generalStore.theme === "light" ? Styles.COLOR_SECONDARY_LIGHT : "#303030"
            };
        } else if (event === "destroy") {
            return {
                iconColor: "#333",
                color: Styles.COLOR_RED,
                background: Styles.COLOR_RED_LIGHT
            };
        }
    };

    render() {
        if (!this.props.activitiesResponse || !this.props.activitiesResponse.data) {
            return null;
        }

        if (this.props.activitiesResponse.data.length === 0) {
            return (
                <Empty
                    description="No activity available"
                    style={{ margin: "40px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <Timeline style={{ marginTop: 24 }} mode={this.props.mode}>
                {this.props.activitiesResponse.data.map((activity) => {
                    const activityElement = this.getActivityElement(activity);

                    return <Timeline.Item key={activity.id}>{activityElement}</Timeline.Item>;
                })}
            </Timeline>
        );
    }
}

export { Activity };
