import { observer } from "mobx-react";
import * as React from "react";
import { Switch } from "react-router-dom";
import { InstanceLicensesSite } from "../sites/dashboard/instance/InstanceLicensesSite";
import { InstanceSettingsSite } from "../sites/dashboard/instance/InstanceSettingsSite";
import { InstanceSite } from "../sites/dashboard/instance/InstanceSite";
import { InstanceUsersSite } from "../sites/dashboard/instance/InstanceUsersSite";
import { Routes } from "./Routes";
import { SuperadminRoute } from "./SuperadminRoute";

@observer
class InstanceRouter extends React.Component {
    render() {
        return (
            <>
                <Switch>
                    <SuperadminRoute exact path={Routes.DASHBOARD.INSTANCE.ROOT} component={InstanceSite} />
                    <SuperadminRoute exact path={Routes.DASHBOARD.INSTANCE.LICENSES} component={InstanceLicensesSite} />
                    <SuperadminRoute exact path={Routes.DASHBOARD.INSTANCE.USERS} component={InstanceUsersSite} />
                    <SuperadminRoute exact path={Routes.DASHBOARD.INSTANCE.SETTINGS} component={InstanceSettingsSite} />
                </Switch>
            </>
        );
    }
}

export { InstanceRouter };
