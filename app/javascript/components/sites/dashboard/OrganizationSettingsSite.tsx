import { Alert, Button, Collapse, Layout, message, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { NewOrganizationForm } from "../../forms/NewOrganizationForm";
import { OrganizationMachineTranslationSettingsForm } from "../../forms/OrganizationMachineTranslationSettingsForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { PermissionUtils } from "../../utilities/PermissionUtils";
const { Content } = Layout;

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    isDeletingOrganization: boolean;
}

@observer
class OrganizationSettingsSite extends React.Component<IProps, IState> {
    state: IState = {
        isDeletingOrganization: false
    };

    onDeleteOrganizationClick = () => {
        Modal.confirm({
            title: "Do you really want to delete this organization?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                this.setState({ isDeletingOrganization: true });
                await OrganizationsAPI.deleteOrganization(this.props.match.params.organizationId);
                this.setState({ isDeletingOrganization: false });
                history.push(Routes.DASHBOARD.ORGANIZATIONS);
            },
            onCancel: () => {
                this.setState({ isDeletingOrganization: false });
            }
        });
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="organizationSettings" />
                <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
                    <h1>Settings</h1>
                    <Collapse bordered={false} defaultActiveKey="general">
                        <Collapse.Panel header="General settings" key="general">
                            <SettingsSectionWrapper>
                                <NewOrganizationForm
                                    isEdit
                                    onChanged={() => {
                                        message.success("Successfully updated organization settings.");
                                    }}
                                    onError={() => {
                                        message.error("Error while updating organization settings.");
                                    }}
                                />
                                <Button
                                    form="newOrganizationForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end" }}
                                >
                                    Save
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel
                            header="Machine translation settings"
                            key="machine-translation"
                            collapsible={
                                !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())
                                    ? "disabled"
                                    : undefined
                            }
                        >
                            <SettingsSectionWrapper>
                                <OrganizationMachineTranslationSettingsForm
                                    organization={dashboardStore.currentOrganization}
                                />
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel
                            header="Advanced settings"
                            key="advanced"
                            collapsible={
                                !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())
                                    ? "disabled"
                                    : undefined
                            }
                        >
                            <SettingsSectionWrapper>
                                <Alert
                                    message="Remove organization"
                                    description={
                                        <>
                                            <p>
                                                Removing the organization will delete the organization and all
                                                ressources related to the organization.
                                            </p>
                                            <p>
                                                <b>This cannot be undone.</b>
                                            </p>
                                        </>
                                    }
                                    type="warning"
                                    showIcon
                                />
                                <Button
                                    danger
                                    onClick={this.onDeleteOrganizationClick}
                                    style={{ alignSelf: "flex-end", marginTop: 16 }}
                                >
                                    Remove organization
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                    </Collapse>
                </Content>
            </Layout>
        );
    }
}

export { OrganizationSettingsSite };
