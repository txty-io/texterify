import { Button, Input, Layout, Modal, Table, Form } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { AccessTokensAPI, AccessTokensAPIErrors } from "../../api/v1/AccessTokensAPI";
import { FormInstance } from "antd/lib/form";
const { Content } = Layout;

interface IState {
    getTokensResponse: any;
    deleteDialogVisible: boolean;
}

@observer
class UserAccessTokensSettingsSite extends React.Component<{}, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        getTokensResponse: null,
        deleteDialogVisible: false
    };

    async componentDidMount() {
        const getTokensResponse = await AccessTokensAPI.getTokens();

        this.setState({
            getTokensResponse: getTokensResponse
        });
    }

    getColumns = (): any[] => {
        return [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Created",
                dataIndex: "created",
                key: "created"
            },
            {
                title: "",
                key: "actions",
                width: 80,
                render: (_text: any, record: any): JSX.Element => {
                    return (
                        <Button
                            onClick={async () => {
                                this.setState({
                                    deleteDialogVisible: true
                                });

                                Modal.confirm({
                                    title: "Do you really want to remove this access token?",
                                    content: "This cannot be undone.",
                                    okText: "Yes",
                                    okButtonProps: {
                                        danger: true
                                    },
                                    cancelText: "No",
                                    visible: this.state.deleteDialogVisible,
                                    onOk: async () => {
                                        await AccessTokensAPI.deleteToken(record.key);
                                        const getTokensResponse = await AccessTokensAPI.getTokens();
                                        this.setState({
                                            getTokensResponse: getTokensResponse,
                                            deleteDialogVisible: false
                                        });
                                    },
                                    onCancel: () => {
                                        this.setState({
                                            deleteDialogVisible: false
                                        });
                                    }
                                });
                            }}
                            danger
                        >
                            Revoke
                        </Button>
                    );
                }
            }
        ];
    };

    getRows = (): any[] => {
        if (!this.state.getTokensResponse || !this.state.getTokensResponse.data) {
            return [];
        }

        return this.state.getTokensResponse.data.map((token: any) => {
            return {
                key: token.id,
                name: token.attributes.name,
                created: moment(token.attributes.created_at, "YYYY-MM-DD HH:mm:ss").format("DD.MM.YYYY")
            };
        }, []);
    };

    handleSubmit = async (values: { name: string }) => {
        const response = await AccessTokensAPI.createToken({
            name: values.name
        });

        if (response.errors) {
            response.errors.map((error) => {
                if (error.details === AccessTokensAPIErrors.NAME_ALREADY_TAKEN) {
                    this.formRef.current.setFieldsValue({
                        name: {
                            value: values.name,
                            errors: [new Error(error.details)]
                        }
                    });
                }
            });

            return;
        }

        Modal.success({
            title: "Success",
            content: (
                <>
                    Your new access token is:
                    <Paragraph code copyable>
                        {response.data.secret}
                    </Paragraph>
                    Store your token somewhere safe because you won't be able to access it again.
                </>
            )
        });

        const getTokensResponse = await AccessTokensAPI.getTokens();
        this.setState({
            getTokensResponse: getTokensResponse
        });

        this.formRef.current.setFieldsValue({
            name: {
                value: undefined
            }
        });
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Access tokens</h1>
                    <p>Access tokens can be used to perform actions against the API.</p>
                    <div style={{ display: "flex" }}>
                        <div style={{ display: "flex", flexDirection: "column", width: "40%", marginRight: 16 }}>
                            <h3>Create access token</h3>
                            <Form
                                ref={this.formRef}
                                id="newProjectForm"
                                onFinish={this.handleSubmit}
                                style={{ maxWidth: "100%" }}
                            >
                                <h3>Name</h3>
                                <p>The name of the access token for later identification.</p>
                                <Form.Item
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            whitespace: true,
                                            message: "Please enter a name for the access token."
                                        }
                                    ]}
                                >
                                    <Input placeholder="Name" />
                                </Form.Item>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button type="primary" htmlType="submit">
                                        Create access token
                                    </Button>
                                </div>
                            </Form>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", width: "60%", marginLeft: 16 }}>
                            <h3>Active access tokens</h3>
                            <Table
                                dataSource={this.getRows()}
                                columns={this.getColumns()}
                                loading={!this.state.getTokensResponse}
                                size="middle"
                                pagination={false}
                            />
                        </div>
                    </div>
                </Content>
            </Layout>
        );
    }
}

export { UserAccessTokensSettingsSite };
