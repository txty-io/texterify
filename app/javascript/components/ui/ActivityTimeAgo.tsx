import { Duration } from "moment";
import * as React from "react";

function ActivityTimeAgo(props: { duration: Duration }) {
    const isOlderThenOneDay = props.duration.days() > 0;
    const isOlderThenOneHour = props.duration.hours() > 0;
    const isOlderThenOneMinute = props.duration.minutes() > 0;

    if (isOlderThenOneDay) {
        return <>{`${props.duration.days()} day${props.duration.days() > 1 ? "s" : ""} ago`}</>;
    } else if (isOlderThenOneHour) {
        return <>{`${props.duration.hours()} hour${props.duration.hours() > 1 ? "s" : ""} ago`}</>;
    } else if (isOlderThenOneMinute) {
        return <>{`${props.duration.minutes()} minute${props.duration.minutes() > 1 ? "s" : ""} ago`}</>;
    } else {
        return <>{`${props.duration.seconds()} second${props.duration.seconds() > 1 ? "s" : ""} ago`}</>;
    }
}

export { ActivityTimeAgo };
