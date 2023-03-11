import { DeploymentUnitOutlined, LeftOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Button, Select } from "antd";
import * as React from "react";
import { Styles } from "../ui/Styles";
import { CustomModal } from "../ui/CustomModal";
import { IProps as NewProjectFormProps, NewProjectForm } from "./NewProjectForm";
import styled from "styled-components";
import { IGetOrganizationsOptions, OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { OrganizationAvatar } from "../ui/OrganizationAvatar";
import { ModalStep } from "../ui/ModalStep";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";

const TypeSelection = styled.div<{ active: boolean }>`
    border: 1px solid
        ${(props) => {
            return props.active ? "var(--color-primary)" : "var(--border-color)";
        }};
    padding: 40px 24px;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 48%;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    color: ${(props) => {
        return props.active ? "var(--color-primary)" : "unset";
    }};

    &:hover {
        border: 1px solid
            ${(props) => {
                return props.active ? "var(--color-primary)" : "var(--border-color-flashier)";
            }};
    }

    svg {
        font-size: 32px;
    }

    div {
        margin-top: 16px;
    }
`;

interface IProps {
    visible: boolean;
    newProjectFormProps: NewProjectFormProps;
    organization?: any;
    onCancelRequest?(): void;
}

interface IState {
    selectedOrganization: any;
    organizationsResponse: any;
    organizationsLoading: boolean;
    step: number;
    search: string;
}

class NewProjectFormModal extends React.Component<IProps, IState> {
    initialState: IState = {
        selectedOrganization: this.props.organization,
        organizationsResponse: null,
        organizationsLoading: false,
        step: this.props.organization ? 2 : 1,
        search: null
    };

    state: IState = this.initialState;

    async componentDidMount() {
        await this.reloadOrganizations();
    }

    reloadOrganizations = async (options?: IGetOrganizationsOptions) => {
        this.setState({ organizationsLoading: true });

        try {
            const organizationsResponse = await OrganizationsAPI.getOrganizations(options);

            this.setState({
                organizationsResponse: organizationsResponse
            });
        } catch (error) {
            console.error(error);
        }

        this.setState({ organizationsLoading: false });
    };

    renderNoOrganizationsInfo = () => {
        return (
            <Alert
                type="info"
                showIcon
                message="No organizations"
                description={
                    <p>
                        <Link to={Routes.DASHBOARD.ORGANIZATIONS}>Create an organization</Link> or join one before you
                        can create a new project for it.
                    </p>
                }
            />
        );
    };

    render() {
        return (
            <CustomModal
                afterClose={() => {
                    this.setState(this.initialState);
                }}
                visible={this.props.visible}
                title={
                    <div>
                        Add a new project
                        {!this.props.organization && (
                            <ModalStep step={this.state.step} steps={2} style={{ marginRight: 16 }} />
                        )}
                        {this.state.step > 1 && !this.props.organization && (
                            <div style={{ display: "flex", alignItems: "center", fontSize: 12, lineHeight: 0 }}>
                                <Button
                                    onClick={() => {
                                        this.setState({ step: this.state.step - 1 });
                                    }}
                                    style={{ marginRight: 16 }}
                                >
                                    <LeftOutlined />
                                    Back
                                </Button>
                                {this.state.selectedOrganization && this.state.step === 2 && (
                                    <>
                                        <OrganizationAvatar
                                            style={{ height: 16, width: 16, marginRight: 8 }}
                                            dontRenderIfNoImage
                                            organization={this.state.selectedOrganization}
                                        />
                                        {this.state.selectedOrganization.attributes.name}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                }
                footer={
                    <div style={{ margin: "6px 0" }}>
                        {this.state.step === 1 && (
                            <Button
                                disabled={!this.state.selectedOrganization}
                                onClick={() => {
                                    this.setState({ step: 2 });
                                }}
                            >
                                Next
                                <RightOutlined />
                            </Button>
                        )}

                        {this.state.step === 2 && (
                            <>
                                <Button
                                    onClick={() => {
                                        this.props.onCancelRequest();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    data-id="new-project-form-create-project"
                                    form="newProjectForm"
                                    type="primary"
                                    htmlType="submit"
                                >
                                    Create project
                                </Button>
                            </>
                        )}
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                {this.state.step === 1 && (
                    <>
                        {!this.state.organizationsLoading &&
                            this.state.organizationsResponse?.data?.length === 0 &&
                            !this.state.search &&
                            this.renderNoOrganizationsInfo()}

                        {(this.state.organizationsLoading ||
                            this.state.search ||
                            this.state.organizationsResponse?.data?.length > 0) && (
                            <>
                                <p>Select an organization for your new project.</p>
                                <Select
                                    showSearch
                                    placeholder="Select an organization"
                                    optionFilterProp="children"
                                    filterOption={false}
                                    style={{ width: "100%" }}
                                    loading={this.state.organizationsLoading}
                                    onSearch={(value) => {
                                        this.setState({ search: value });
                                        this.reloadOrganizations({ search: value });
                                    }}
                                    onSelect={(organizationId) => {
                                        const foundOrganization = this.state.organizationsResponse?.data?.find(
                                            (organization) => {
                                                return organization.id === organizationId;
                                            }
                                        );

                                        this.setState({ selectedOrganization: foundOrganization });
                                    }}
                                    value={this.state.selectedOrganization?.id}
                                >
                                    {this.state.organizationsResponse?.data?.map((organization) => {
                                        return (
                                            <Select.Option value={organization.id} key={organization.id}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <OrganizationAvatar
                                                        style={{ height: 16, width: 16, marginRight: 8 }}
                                                        dontRenderIfNoImage
                                                        organization={organization}
                                                    />
                                                    {organization.attributes.name}
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </>
                        )}
                    </>
                )}

                {this.state.step === 2 && (
                    <NewProjectForm
                        {...{
                            organizationId: this.state.selectedOrganization?.id,
                            ...this.props.newProjectFormProps
                        }}
                        orientation="vertical"
                    />
                )}
            </CustomModal>
        );
    }
}

export { NewProjectFormModal };
