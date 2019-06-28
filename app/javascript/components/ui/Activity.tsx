import { Icon, Timeline } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { APIUtils } from "../api/v1/APIUtils";
import { Routes } from "../routing/Routes";
import { Styles } from "./Styles";

const ActivityItemWrapper = styled.div`
  word-break: break-all;
`;

type IActivityKeyElementProps = { color: string; background: string };
const ActivityKeyElement = styled.span`
  font-family: 'Source Code Pro', monospace;
  background: ${(props: IActivityKeyElementProps) => props.background};
  margin: 0 8px;
  color: ${(props: IActivityKeyElementProps) => props.color};
  padding: 0 6px;
  border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
`;

const ProjectElement = styled(Link)`
  padding: 0 6px;
  border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
`;

type IProps = {
  activitiesResponse: any;
  mode?: "left" | "alternate" | "right";
  showTimeAgo?: boolean;
  includeProjectLink?: boolean;
};
type IState = {};

class Activity extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {};
  }

  // tslint:disable-next-line:max-func-body-length cyclomatic-complexity
  getActivityElement = (activity: any) => {
    const user = APIUtils.getIncludedObject(activity.relationships.user && activity.relationships.user.data, this.props.activitiesResponse.included);
    const project = APIUtils.getIncludedObject(activity.relationships.project && activity.relationships.project.data, this.props.activitiesResponse.included);

    const userElement = (
      <div style={{ fontSize: 12, color: Styles.COLOR_TEXT_DISABLED }}>
        <div><Icon type="user" /> {user ? user.attributes.username : "Deleted user"}</div>
        <div><Icon type="clock-circle" /> {moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss").local().format("DD.MM.YYYY HH:mm")}</div>
      </div>
    );

    const projectElement = this.props.includeProjectLink ? (
      <div>
        <Link to={Routes.DASHBOARD.PROJECT.replace(":projectId", activity.relationships.project.data.id)}>
          Go to {project.attributes.name}
        </Link>
      </div>
    ) : null;

    const event = activity.attributes.event;

    let activityElement;
    if (activity.attributes.item_type === "Key") {
      const isNameChange = activity.attributes.object_changes.name;
      const isDescriptionChange = activity.attributes.object_changes.description;

      if (event === "destroy") {
        activityElement = (
          <ActivityItemWrapper>
            {activity.attributes.item_type} with name
            <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background}>
              {activity.attributes.object_changes.name[0]}
            </ActivityKeyElement>
            {`${activity.attributes.event}ed`}.
            {userElement}
            {projectElement}
          </ActivityItemWrapper>
        );
      } else if (isNameChange) {
        if (event === "create") {
          activityElement = (
            <ActivityItemWrapper>
              Key with name
              <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background}>
                {activity.attributes.object_changes.name[1]}
              </ActivityKeyElement>
              {`${activity.attributes.event}d`}.
              {userElement}
              {projectElement}
            </ActivityItemWrapper>
          );
        } else {
          activityElement = (
            <ActivityItemWrapper>
              Renamed key
              <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background}>
                {activity.attributes.object_changes.name[0]}
              </ActivityKeyElement>
              to
            <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background} style={{ marginRight: 0 }}>
                {activity.attributes.object_changes.name[1]}
              </ActivityKeyElement>.
              {userElement}
              {projectElement}
            </ActivityItemWrapper>
          );
        }
      } else if (isDescriptionChange) {
        activityElement = (
          <ActivityItemWrapper>
            Description of key
            <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background}>
              {activity.attributes.object.name}
            </ActivityKeyElement>
            {`${activity.attributes.event}d`}.
            {userElement}
            {projectElement}
          </ActivityItemWrapper>
        );
      }
    } else if (activity.attributes.item_type === "Translation") {
      activityElement = (
        <ActivityItemWrapper>
          {activity.attributes.item_type} with content
          <ActivityKeyElement color={this.getStylesForEvent(event).color} background={this.getStylesForEvent(event).background}>
            {activity.attributes.object_changes.content[1]}
          </ActivityKeyElement>
          {`${activity.attributes.event}d`}.
          {userElement}
          {projectElement}
        </ActivityItemWrapper>
      );
    }

    const diffToNow = moment().diff(moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss"));
    const diffToNowDuration = moment.duration(diffToNow);
    const isOlderThenOneDay = diffToNowDuration.days() > 0;
    const isOlderThenOneHour = diffToNowDuration.hours() > 0;
    const isOlderThenOneMinute = diffToNowDuration.minutes() > 0;

    return (
      <div style={{ display: "flex" }}>
        <div style={{ flexGrow: 1, marginRight: (this.props.showTimeAgo || this.props.includeProjectLink) ? 40 : 0 }}>
          {activityElement}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
          {this.props.showTimeAgo && <div>
            {isOlderThenOneDay ? `${diffToNowDuration.days()}d ` : ""}
            {isOlderThenOneDay || isOlderThenOneHour ? `${diffToNowDuration.hours()}h ` : ""}
            {isOlderThenOneDay || isOlderThenOneHour || isOlderThenOneMinute ? `${diffToNowDuration.minutes()}m ` : ""}
            {`${diffToNowDuration.seconds()}s ago`}
          </div>}
          {this.props.includeProjectLink && <div>
            <ProjectElement to={Routes.DASHBOARD.PROJECT.replace(":projectId", activity.relationships.project.data.id)}>
              {project.attributes.name}
            </ProjectElement>
          </div>}
        </div>
      </div>
    );
  }

  getIconForEvent = (event: "create" | "update" | "destroy") => {
    if (event === "create") {
      return "plus";
    } else if (event === "update") {
      return "edit";
    } else if (event === "destroy") {
      return "delete";
    }
  }

  getStylesForEvent = (event: "create" | "update" | "destroy") => {
    if (event === "create") {
      return {
        iconColor: "#333",
        color: Styles.COLOR_GREEN,
        background: Styles.COLOR_GREEN_LIGHT
      };
    } else if (event === "update") {
      return {
        iconColor: "#333",
        color: Styles.COLOR_SECONDARY,
        background: Styles.COLOR_PRIMARY_LIGHT
      };
    } else if (event === "destroy") {
      return {
        iconColor: "#333",
        color: Styles.COLOR_RED,
        background: Styles.COLOR_RED_LIGHT
      };
    }
  }

  render() {
    if (this.props.activitiesResponse.data.length === 0) {
      return (
        <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>No activity available.</p>
      );
    }

    return (
      <Timeline style={{ marginTop: 24 }} mode={this.props.mode}>
        {this.props.activitiesResponse.data.map((activity) => {
          return (
            <Timeline.Item
              key={activity.id}
              dot={<Icon
                type={this.getIconForEvent(activity.attributes.event)}
                style={{ fontSize: "16px", color: this.getStylesForEvent(activity.attributes.event).iconColor }}
              />}
            >
              {this.getActivityElement(activity)}
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  }
}

export { Activity };
