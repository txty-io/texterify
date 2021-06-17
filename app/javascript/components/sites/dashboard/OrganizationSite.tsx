import { Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ISubscription, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { IProject } from "../../api/v1/ProjectsAPI";
import { NewProjectFormModal } from "../../forms/NewProjectFormModal";
import { Routes } from "../../routing/Routes";
import { subscriptionService } from "../../services/SubscriptionService";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { OrganizationAvatar } from "../../ui/OrganizationAvatar";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ProjectsList } from "../../ui/ProjectsList";
import { Utils } from "../../ui/Utils";

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    addDialogVisible: boolean;
    responseOrganization: any;
    subscription: ISubscription;
}

@observer
class OrganizationSite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        responseOrganization: null,
        subscription: null
    };

    async componentDidMount() {
        try {
            const responseOrganization = await OrganizationsAPI.getOrganization(this.props.match.params.organizationId);
            const subscription = await subscriptionService.getActiveSubscription(dashboardStore.currentOrganization.id);

            this.setState({
                responseOrganization: responseOrganization,
                subscription: subscription
            });
        } catch (error) {
            console.error(error);
            message.error("Failed to load organization.");
        }
    }

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="organization" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 640 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                            <h1 style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
                                <OrganizationAvatar
                                    organization={dashboardStore.currentOrganization}
                                    style={{ marginRight: 16 }}
                                />
                                {dashboardStore.currentOrganization &&
                                    dashboardStore.currentOrganization.attributes.name}
                                <PrimaryButton
                                    data-id="organization-create-project"
                                    style={{ marginLeft: 40 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                >
                                    Create project
                                </PrimaryButton>
                            </h1>
                            {this.state.subscription && (
                                <div
                                    style={{
                                        marginLeft: 120,
                                        borderRadius: 4,
                                        padding: "8px 24px",
                                        background: "var(--primary-light-color)",
                                        color: "var(--blue-color)"
                                    }}
                                >
                                    {Utils.capitalize(this.state.subscription.attributes.plan)} Plan
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", marginTop: 40 }}>
                            <div style={{ width: "100%" }}>
                                <h3 style={{ marginBottom: 24 }}>Projects</h3>
                                <ProjectsList
                                    loading={!this.state.responseOrganization}
                                    projects={
                                        this.state.responseOrganization && this.state.responseOrganization.included
                                            ? this.state.responseOrganization.included.filter((included) => {
                                                  return included.type === "project";
                                              })
                                            : []
                                    }
                                />
                            </div>
                        </div>
                    </Layout.Content>
                </Layout>

                <NewProjectFormModal
                    organization={dashboardStore.currentOrganization}
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({ addDialogVisible: false });
                    }}
                    newProjectFormProps={{
                        organizationId: this.props.match.params.organizationId,
                        onChanged: (project: IProject) => {
                            this.props.history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
                        }
                    }}
                />
            </>
        );
    }
}

export { OrganizationSite };
