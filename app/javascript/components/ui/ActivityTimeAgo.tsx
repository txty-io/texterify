import { Duration } from "moment";
import * as React from "react";

function ActivityTimeAgo(props: { duration: Duration }) {
    const isOlderThenOneDay = props.duration.days() > 0;
    const isOlderThenOneHour = props.duration.hours() > 0;
    const isOlderThenOneMinute = props.duration.minutes() > 0;

    if (isOlderThenOneDay) {
        return <>{`${props.duration.days()} days ago`}</>;
    } else if (isOlderThenOneHour) {
        return <>{`${props.duration.hours()} hours ago`}</>;
    } else if (isOlderThenOneMinute) {
        return <>{`${props.duration.minutes()} minutes ago`}</>;
    } else {
        return <>{`${props.duration.seconds()} seconds ago`}</>;
    }
}

export { ActivityTimeAgo };
