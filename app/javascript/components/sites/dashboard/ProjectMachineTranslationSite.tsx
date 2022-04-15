import { Alert, Button, List, message, Popconfirm } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IGetLanguagesResponse, ILanguage, LanguagesAPI } from "../../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    MachineTranslationsAPI
} from "../../api/v1/MachineTranslationsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { MachineTranslationSidebar } from "../../ui/MachineTranslationSidebar";
import { MachineTranslationSourceSupportMessage } from "../../ui/MachineTranslationSourceSupportMessage";
import { SupportedMachineTranslationLanguagesModal } from "../../ui/SupportedMachineTranslationLanguagesModal";
import { LanguageUtils } from "../../utilities/LanguageUtils";
import { MachineTranslationUtils } from "../../utilities/MachineTranslationUtils";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    languagesResponse: IGetLanguagesResponse;
    languagesLoading: boolean;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
    supportedMachineTranslationLanguagesLoading: boolean;
    translatingLanguage: boolean;
    settingsSubmitting: boolean;
    supportedMachineTranslationLanguagesModalVisible: boolean;
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
        settingsSubmitting: false,
        supportedMachineTranslationLanguagesModalVisible: false
    };

    async componentDidMount() {
        await Promise.all([this.fetchLanguages(), this.fetchSupportedLanguagesMachineTranslation()]);
    }

    fetchSupportedLanguagesMachineTranslation = async () => {
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

        this.setState({ supportedMachineTranslationLanguagesLoading: false });
    };

    fetchLanguages = async () => {
        this.setState({ languagesLoading: true });
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                showAll: true
            });
            this.setState({
                languagesResponse: responseLanguages
            });
        } catch (err) {
            console.error(err);
            message.error("Failed to load languages.");
        }
        this.setState({ languagesLoading: false });
    };

    defaultLanguageSupportsMachineTranslation() {
        if (this.state.languagesResponse) {
            const defaultLanguage = LanguageUtils.getDefaultLanguage(this.state.languagesResponse);

            return MachineTranslationUtils.supportsMachineTranslationAsSourceLanguage({
                language: defaultLanguage,
                languagesResponse: this.state.languagesResponse,
                supportedSourceLanguages: this.state.supportedSourceLanguages
            });
        } else {
            return false;
        }
    }

    languageSupportsMachineTranslation(languageId: string) {
        return MachineTranslationUtils.supportsMachineTranslationAsTargetLanguage({
            languageId: languageId,
            languagesResponse: this.state.languagesResponse,
            supportedTargetLanguages: this.state.supportedTargetLanguages
        });
    }

    translateContent(defaultLanguage: ILanguage) {
        if (!dashboardStore.featureEnabled("FEATURE_MACHINE_TRANSLATION_LANGUAGE")) {
            return <FeatureNotAvailable feature="FEATURE_MACHINE_TRANSLATION_LANGUAGE" />;
        }

        return (
            <>
                {defaultLanguage && !this.defaultLanguageSupportsMachineTranslation() && (
                    <Alert
                        showIcon
                        type="info"
                        message={
                            <>
                                Machine translation with your default language as source is not supported. <br />
                                <a
                                    onClick={() => {
                                        history.push(
                                            Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                ":projectId",
                                                this.props.match.params.projectId
                                            )
                                        );
                                    }}
                                >
                                    Change default language
                                </a>
                            </>
                        }
                    />
                )}
                {!this.state.languagesLoading &&
                    !this.state.supportedMachineTranslationLanguagesLoading &&
                    !defaultLanguage && (
                        <Alert
                            showIcon
                            type="info"
                            message="Please specify a default language for machine translation."
                        />
                    )}
                {this.defaultLanguageSupportsMachineTranslation() && (
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

                                const languageCode = APIUtils.getIncludedObject(
                                    language.relationships.language_code.data,
                                    this.state.languagesResponse.included
                                );

                                return {
                                    id: language.id,
                                    countryCode: countryCode,
                                    languageCode: languageCode,
                                    name: language.attributes.name
                                };
                            })}
                        renderItem={(item) => {
                            return (
                                <List.Item>
                                    <div>
                                        <span style={{ width: 80, display: "inline-block" }}>
                                            {item.countryCode && (
                                                <>
                                                    <span style={{ width: 24, display: "inline-block" }}>
                                                        <FlagIcon
                                                            code={item.countryCode.attributes.code.toLowerCase()}
                                                        />
                                                    </span>
                                                    <span style={{ marginLeft: 8 }}>
                                                        {item.countryCode.attributes.code}
                                                    </span>
                                                </>
                                            )}
                                            {item.countryCode && item.languageCode && <span>-</span>}
                                            {item.languageCode && <span>{item.languageCode.attributes.code}</span>}
                                        </span>

                                        <span style={{ fontWeight: "bold", marginLeft: 24 }}>{item.name}</span>
                                    </div>

                                    {this.languageSupportsMachineTranslation(item.id) ? (
                                        <Popconfirm
                                            title="Do you want to translate all empty keys for this language using machine translation? Keys with existing translations for that language are not overwritten."
                                            onConfirm={async () => {
                                                this.setState({ translatingLanguage: true });
                                                try {
                                                    const response = await MachineTranslationsAPI.translateLanguage({
                                                        languageId: item.id,
                                                        projectId: dashboardStore.currentProject.id
                                                    });

                                                    if (response.error) {
                                                        message.error("Failed to machine translate.");
                                                    } else {
                                                        message.success("Texts of language translated.");
                                                    }
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
                                            <Button type="primary">Translate missing</Button>
                                        </Popconfirm>
                                    ) : (
                                        <>
                                            <a
                                                onClick={() => {
                                                    this.setState({
                                                        supportedMachineTranslationLanguagesModalVisible: true
                                                    });
                                                }}
                                            >
                                                not supported
                                            </a>
                                        </>
                                    )}
                                </List.Item>
                            );
                        }}
                        style={{ width: "100%" }}
                    />
                )}
            </>
        );
    }

    render() {
        const defaultLanguage = LanguageUtils.getDefaultLanguage(this.state.languagesResponse);
        let defaultLanguageCountryCode;
        let defaultLanguageLanguageCode;
        if (defaultLanguage) {
            defaultLanguageCountryCode = APIUtils.getIncludedObject(
                defaultLanguage.relationships.country_code.data,
                this.state.languagesResponse.included
            );

            defaultLanguageLanguageCode = APIUtils.getIncludedObject(
                defaultLanguage.relationships.language_code.data,
                this.state.languagesResponse.included
            );
        }

        return (
            <LayoutWithSubSidebar>
                <MachineTranslationSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner>
                    <Breadcrumbs breadcrumbName="projectMachineTranslation" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Machine Translation</h1>
                        <p>
                            Machine translation allows you to automatically translate your project into different
                            languages with the click of a button.
                        </p>
                        {dashboardStore.getProjectOrganization() && (
                            <div style={{ marginBottom: 24 }}>
                                <a
                                    onClick={() => {
                                        this.setState({
                                            supportedMachineTranslationLanguagesModalVisible: true
                                        });
                                    }}
                                >
                                    Get a list of supported languages
                                </a>
                            </div>
                        )}

                        <SupportedMachineTranslationLanguagesModal
                            visible={this.state.supportedMachineTranslationLanguagesModalVisible}
                            supportedSourceLanguages={this.state.supportedSourceLanguages}
                            supportedTargetLanguages={this.state.supportedTargetLanguages}
                            onCancelRequest={() => {
                                this.setState({
                                    supportedMachineTranslationLanguagesModalVisible: false
                                });
                            }}
                        />

                        {!dashboardStore.getProjectOrganization() && (
                            <Alert
                                showIcon
                                message={
                                    <>
                                        Premium features are not available for private projects. Please move your
                                        project to an organization.
                                    </>
                                }
                                type="info"
                                style={{ marginBottom: 16, maxWidth: 400 }}
                            />
                        )}

                        {dashboardStore.getProjectOrganization() && defaultLanguage && (
                            <div style={{ marginBottom: 24 }}>
                                <h4 style={{ fontWeight: "bold" }}>Source language</h4>
                                <div>Your default language is used as the source for your machine translations.</div>
                                <div style={{ marginTop: 16, display: "flex" }}>
                                    {(defaultLanguageCountryCode || defaultLanguageLanguageCode) && (
                                        <span style={{ width: 80, display: "inline-block", marginRight: 24 }}>
                                            {defaultLanguageCountryCode && (
                                                <>
                                                    <span style={{ width: 24, display: "inline-block" }}>
                                                        <FlagIcon
                                                            code={defaultLanguageCountryCode.attributes.code.toLowerCase()}
                                                        />
                                                    </span>
                                                    <span style={{ marginLeft: 8 }}>
                                                        {defaultLanguageCountryCode.attributes.code}
                                                    </span>
                                                </>
                                            )}
                                            {defaultLanguageCountryCode && defaultLanguageLanguageCode && (
                                                <span>-</span>
                                            )}
                                            {defaultLanguageLanguageCode && (
                                                <span>{defaultLanguageLanguageCode.attributes.code}</span>
                                            )}
                                        </span>
                                    )}

                                    <div>
                                        <div style={{ fontWeight: "bold" }}>{defaultLanguage.attributes.name}</div>
                                        <div style={{ marginTop: 8 }}>
                                            {
                                                <MachineTranslationSourceSupportMessage
                                                    defaultLanguage={LanguageUtils.getDefaultLanguage(
                                                        this.state.languagesResponse
                                                    )}
                                                    languagesResponse={this.state.languagesResponse}
                                                    supportedSourceLanguages={this.state.supportedSourceLanguages}
                                                />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {dashboardStore.getProjectOrganization() && this.translateContent(defaultLanguage)}
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectMachineTranslationSite };
