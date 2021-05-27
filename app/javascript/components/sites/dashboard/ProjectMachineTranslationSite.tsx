import { Alert, Button, Checkbox, Form, Layout, List, message, Popconfirm, Tabs } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IGetLanguagesOptions, IGetLanguagesResponse, LanguagesAPI } from "../../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    MachineTranslationsAPI
} from "../../api/v1/MachineTranslationsAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { LanguageUtils } from "../../utilities/LanguageUtils";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    languagesResponse: IGetLanguagesResponse;
    languagesLoading: boolean;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
    supportedMachineTranslationLanguagesLoading: boolean;
    translatingLanguage: boolean;
    settingsSubmitting: boolean;
}

interface IAutoTranslation {
    machineTranslationEnabled: boolean;
    autoTranslateNewKeys: boolean;
    autoTranslateNewLanguages: boolean;
}

@observer
class ProjectMachineTranslationSite extends React.Component<IProps, IState> {
    state: IState = {
        languagesResponse: null,
        languagesLoading: true,
        supportedSourceLanguages: null,
        supportedTargetLanguages: null,
        supportedMachineTranslationLanguagesLoading: true,
        translatingLanguage: false,
        settingsSubmitting: false
    };

    handleSubmit = async (values: IAutoTranslation) => {
        this.setState({ settingsSubmitting: true });
        try {
            await ProjectsAPI.updateProject({
                projectId: dashboardStore.currentProject.id,
                machineTranslationEnabled: values.machineTranslationEnabled,
                autoTranslateNewKeys: values.autoTranslateNewKeys,
                autoTranslateNewLanguages: values.autoTranslateNewLanguages
            });
            message.success("Settings updated.");
        } catch (error) {
            console.error(error);
            message.error("Failed to update machine translation settings.");
        }
        this.setState({ settingsSubmitting: false });
    };

    async componentDidMount() {
        await Promise.all([this.fetchLanguages(), this.fetchSupportedLanguagesMachineTranslation()]);
    }

    fetchSupportedLanguagesMachineTranslation = async () => {
        if (dashboardStore.currentProject.attributes.machine_translation_active) {
            this.setState({ supportedMachineTranslationLanguagesLoading: true });
            try {
                const supportedSourceLanguages = await MachineTranslationsAPI.getSourceLanguages();
                const supportedTargetLanguages = await MachineTranslationsAPI.getTargetLanguages();

                this.setState({
                    supportedSourceLanguages: supportedSourceLanguages,
                    supportedTargetLanguages: supportedTargetLanguages
                });
            } catch (error) {
                console.error(error);
                message.error("Failed to load supported languages for machine translation.");
            }
        }

        this.setState({ supportedMachineTranslationLanguagesLoading: false });
    };

    fetchLanguages = async (options?: IGetLanguagesOptions) => {
        this.setState({ languagesLoading: true });
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, options);
            this.setState({
                languagesResponse: responseLanguages
            });
        } catch (err) {
            console.error(err);
            message.error("Failed to load languages.");
        }
        this.setState({ languagesLoading: false });
    };

    render() {
        const defaultLanguage = LanguageUtils.getDefaultLanguage(this.state.languagesResponse);

        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectMachineTranslation" />
                <Layout.Content
                    style={{
                        margin: "24px 16px 0",
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 560
                    }}
                >
                    <h1>Machine Translation</h1>
                    <p>
                        Machine translation allows you to automatically translate your project into different languages
                        with the click of a button.
                    </p>

                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab="Machine translation" key="1">
                            {!this.state.languagesLoading &&
                                !this.state.supportedMachineTranslationLanguagesLoading &&
                                !defaultLanguage && (
                                    <Alert
                                        showIcon
                                        type="info"
                                        message="Please specify a default language for machine translation."
                                    />
                                )}
                            {defaultLanguage && (
                                <List
                                    itemLayout="horizontal"
                                    loading={
                                        this.state.languagesLoading ||
                                        this.state.supportedMachineTranslationLanguagesLoading ||
                                        this.state.translatingLanguage
                                    }
                                    dataSource={this.state.languagesResponse?.data
                                        .filter((language) => {
                                            return !language.attributes.is_default;
                                        })
                                        .map((language) => {
                                            const countryCode = APIUtils.getIncludedObject(
                                                language.relationships.country_code.data,
                                                this.state.languagesResponse.included
                                            );

                                            return {
                                                id: language.id,
                                                countryCode: countryCode,
                                                name: language.attributes.name
                                            };
                                        })}
                                    renderItem={(item) => {
                                        return (
                                            <List.Item>
                                                <div>
                                                    {item.countryCode && (
                                                        <span>
                                                            <FlagIcon
                                                                code={item.countryCode.attributes.code.toLowerCase()}
                                                            />
                                                            <span style={{ marginLeft: 8 }}>
                                                                {item.countryCode.attributes.code}
                                                            </span>
                                                        </span>
                                                    )}
                                                    <span style={{ fontWeight: "bold", marginLeft: 24 }}>
                                                        {item.name}
                                                    </span>
                                                </div>

                                                <Popconfirm
                                                    title="Do you want to translate all empty keys using machine translation? Keys with existing translations are not overwritten."
                                                    onConfirm={async () => {
                                                        this.setState({ translatingLanguage: true });
                                                        try {
                                                            await MachineTranslationsAPI.translateLanguage({
                                                                languageId: item.id,
                                                                projectId: dashboardStore.currentProject.id
                                                            });
                                                            message.success("Texts of language auto-translated.");
                                                        } catch (error) {
                                                            console.error(error);
                                                            message.error("Failed to auto-translate language.");
                                                        }
                                                        this.setState({ translatingLanguage: false });
                                                    }}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    placement="top"
                                                >
                                                    <Button type="primary">Translate</Button>
                                                </Popconfirm>
                                            </List.Item>
                                        );
                                    }}
                                    style={{ width: "100%" }}
                                />
                            )}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Settings" key="2">
                            <Form
                                id="machineTranslationSettingsForm"
                                onFinish={this.handleSubmit}
                                style={{ maxWidth: "100%", marginTop: 24, display: "flex", flexDirection: "column" }}
                                initialValues={{
                                    machineTranslationEnabled:
                                        dashboardStore.currentProject.attributes.machine_translation_enabled,
                                    autoTranslateNewKeys:
                                        dashboardStore.currentProject.attributes.auto_translate_new_keys,
                                    autoTranslateNewLanguages:
                                        dashboardStore.currentProject.attributes.auto_translate_new_languages
                                }}
                            >
                                <Form.Item noStyle shouldUpdate>
                                    {() => {
                                        return (
                                            <>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <Form.Item
                                                        name="machineTranslationEnabled"
                                                        rules={[{ required: false }]}
                                                        valuePropName="checked"
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Checkbox disabled={this.state.settingsSubmitting}>
                                                            <div style={{ display: "inline-block" }}>
                                                                <div style={{ fontWeight: "bold" }}>
                                                                    Enable auto machine translation
                                                                </div>
                                                                <div>
                                                                    Enable auto machine translation for this project.
                                                                </div>
                                                            </div>
                                                        </Checkbox>
                                                    </Form.Item>
                                                </div>
                                            </>
                                        );
                                    }}
                                </Form.Item>

                                <div style={{ marginLeft: 40, marginTop: 24 }}>
                                    <Form.Item noStyle shouldUpdate>
                                        {({ getFieldValue }) => {
                                            return (
                                                <>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <Form.Item
                                                            name="autoTranslateNewKeys"
                                                            rules={[{ required: false }]}
                                                            valuePropName="checked"
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Checkbox
                                                                disabled={
                                                                    !getFieldValue("machineTranslationEnabled") ||
                                                                    this.state.settingsSubmitting
                                                                }
                                                            >
                                                                <div style={{ display: "inline-block" }}>
                                                                    <div style={{ fontWeight: "bold" }}>
                                                                        Automatically translate new keys
                                                                    </div>
                                                                    <div>
                                                                        Automatically translate new keys using machine
                                                                        translation.
                                                                    </div>
                                                                </div>
                                                            </Checkbox>
                                                        </Form.Item>
                                                    </div>
                                                </>
                                            );
                                        }}
                                    </Form.Item>

                                    <Form.Item noStyle shouldUpdate>
                                        {({ getFieldValue }) => {
                                            return (
                                                <>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            marginTop: 24
                                                        }}
                                                    >
                                                        <Form.Item
                                                            name="autoTranslateNewLanguages"
                                                            rules={[{ required: false }]}
                                                            valuePropName="checked"
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Checkbox
                                                                disabled={
                                                                    !getFieldValue("machineTranslationEnabled") ||
                                                                    this.state.settingsSubmitting
                                                                }
                                                            >
                                                                <div style={{ display: "inline-block" }}>
                                                                    <div style={{ fontWeight: "bold" }}>
                                                                        Automatically translate new languages
                                                                    </div>
                                                                    <div>
                                                                        When you add a new language all keys are
                                                                        automatically translated.
                                                                    </div>
                                                                </div>
                                                            </Checkbox>
                                                        </Form.Item>
                                                    </div>
                                                </>
                                            );
                                        }}
                                    </Form.Item>
                                </div>

                                <Button
                                    form="machineTranslationSettingsForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end", marginTop: 24 }}
                                    loading={this.state.settingsSubmitting}
                                >
                                    Save
                                </Button>
                            </Form>
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectMachineTranslationSite };
