import { Layout, Switch, Tooltip, Button } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { dashboardStore } from "../../stores/DashboardStore";
import { AddEditValidationRuleForm } from "../../forms/AddEditValidationRuleForm";
import { ValidationRulesAPI } from "../../api/v1/ValidationRulesAPI";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    ruleToEdit: any;
    rulesResponse: any;
    rulesLoading: boolean;
}

@observer
class ProjectValidationsSite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        ruleToEdit: null,
        rulesResponse: null,
        rulesLoading: false
    };

    renderValidationRule = (props: { name: string; tooltip: string }) => {
        return (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16, maxWidth: 240 }}>
                {props.name}
                <Tooltip title={props.tooltip}>
                    <QuestionCircleOutlined style={{ marginLeft: 8, marginRight: "auto" }} />
                </Tooltip>
                <Switch defaultChecked style={{ marginLeft: 8 }} />
            </div>
        );
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="projectValidations" />
                    <Layout.Content
                        style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                    >
                        <h1>Validations</h1>
                        <p>Create rules to ensure the quality of your translations.</p>

                        <div style={{ display: "flex", marginBottom: 32 }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    style={{ marginRight: 10 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                >
                                    Create validation rule
                                </Button>
                            </div>
                        </div>

                        {this.renderValidationRule({
                            name: "Leading whitespace",
                            tooltip: "Checks if a translation starts with a whitespace."
                        })}

                        {this.renderValidationRule({
                            name: "Trailing whitespace",
                            tooltip: "Checks if a translation ends with a whitespace."
                        })}

                        {this.renderValidationRule({
                            name: "Double whitespace",
                            tooltip: "Checks if a translation contains two or more whitespaces in a row."
                        })}

                        {this.renderValidationRule({
                            name: "Insecure HTTP URL",
                            tooltip:
                                "Checks if insecure HTTP URLs (http://) are used inside the translations. The secure protocol HTTPS (https://) should be used instead."
                        })}
                    </Layout.Content>
                </Layout>

                <AddEditValidationRuleForm
                    projectId={this.props.match.params.projectId}
                    ruleToEdit={this.state.ruleToEdit}
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addDialogVisible: false,
                            ruleToEdit: null
                        });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addDialogVisible: false,
                            ruleToEdit: null
                        });

                        const responseRules = await ValidationRulesAPI.getValidationRules(
                            this.props.match.params.projectId
                        );
                        this.setState({
                            rulesResponse: responseRules
                        });
                    }}
                />
            </>
        );
    }
}

export { ProjectValidationsSite };
