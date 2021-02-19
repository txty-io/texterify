import { Form, Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { IGetOrganizationsOptions, OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { IProject } from "../stores/DashboardStore";
import { ErrorUtils } from "../ui/ErrorUtils";
import { OrganizationAvatar } from "../ui/OrganizationAvatar";

interface IFormValues {
    selectedOrganization: string;
    projectName: string;
}

interface IProps {
    project: IProject;
    onSuccess(): void;
}

interface IState {
    organizationsResponse: any;
    organizationsLoading: boolean;
}

class TransferProjectForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        organizationsResponse: null,
        organizationsLoading: false
    };

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

    handleSubmit = async (values: IFormValues) => {
        const response = await ProjectsAPI.transferProject({
            projectId: this.props.project.id,
            organizationId: values.selectedOrganization
        });

        if (response.errors) {
            ErrorUtils.showErrors(response.errors);

            return;
        } else {
            this.props.onSuccess();
        }
    };

    render() {
        return (
            <Form id="transferProjectForm" ref={this.formRef} onFinish={this.handleSubmit}>
                <p>
                    Select an organization you want your project transfer to. Users of the organization will then have
                    access to the project.
                </p>
                <Form.Item
                    name="selectedOrganization"
                    rules={[
                        {
                            required: true,
                            message: "Please select an organization to transfer the project to."
                        }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Select an organization"
                        optionFilterProp="children"
                        filterOption={false}
                        style={{ width: "100%" }}
                        loading={this.state.organizationsLoading}
                        onSearch={(value) => {
                            this.reloadOrganizations({ search: value });
                        }}
                    >
                        {this.state.organizationsResponse?.data.map((organization) => {
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
                </Form.Item>

                <p style={{ marginTop: 24 }}>
                    For security reasons please type in the name of the project you are currently transfering:{" "}
                    <b>{this.props.project.attributes.name}</b>
                </p>
                <Form.Item
                    name="projectName"
                    rules={[
                        {
                            required: true,
                            message: "Please enter the name of the project to transfer."
                        },
                        {
                            type: "enum",
                            // Allow "" because this is already handled by "required: true".
                            // Avoid showing both error messages at once.
                            enum: ["", this.props.project.attributes.name],
                            message: "The name does not match the name of the project you are trying to transfer."
                        }
                    ]}
                >
                    <Input placeholder="Enter name of the project to transfer" />
                </Form.Item>
            </Form>
        );
    }
}

export { TransferProjectForm };
