import { Divider, Empty, message, Popconfirm, Select } from "antd";
import * as moment from "moment";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { KeysAPI } from "../api/v1/KeysAPI";
import { TranslationsAPI } from "../api/v1/TranslationsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { FeatureNotAvailable } from "./FeatureNotAvailable";
import FlagIcon from "./FlagIcons";
import { Loading } from "./Loading";
import { Styles } from "./Styles";
import { escapeHTML } from "./Utils";

interface IProps {
    projectId: string;
    keyName: string;
    keyId: string;
    onTranslationRestored(): void;
}
interface IState {
    keyActivityResponse: any;
    keyActivityResponseRequested: boolean;
    selectedLanguageId: string;
}

class KeyHistory extends React.Component<IProps, IState> {
    state: IState = {
        keyActivityResponse: null,
        keyActivityResponseRequested: false,
        selectedLanguageId: "all-languages"
    };

    async componentDidMount() {
        await this.reload();
    }

    async componentDidUpdate() {
        // In case the site is reloaded where the key history is initially shown the information if the the feature is
        // enabled for the current organization might not be available.
        if (dashboardStore.featureEnabled("FEATURE_KEY_HISTORY") && !this.state.keyActivityResponseRequested) {
            this.setState({ keyActivityResponseRequested: true });
            await this.reload();
        }
    }

    reload = async () => {
        if (dashboardStore.featureEnabled("FEATURE_KEY_HISTORY")) {
            try {
                const keyActivityResponse = await KeysAPI.getActivity({
                    projectId: this.props.projectId,
                    keyId: this.props.keyId
                });

                this.setState({
                    keyActivityResponse: keyActivityResponse
                });
            } catch (err) {
                console.error(err);
                message.error("Failed to load key history.");
            }
        }
    };

    renderActivityElements = () => {
        // Remember discovered dates so the day divider is not
        // shown for the same day multiple times.
        const discoveredDates: string[] = [];

        const latestTranslations = {};

        const keyActivityElements =
            this.state.keyActivityResponse?.data?.filter((activity) => {
                const itemType = activity.attributes.item_type;
                if (itemType === "Translation") {
                    const translationLanguageId = activity.attributes.object
                        ? activity.attributes.object.language_id
                        : activity.attributes.object_changes.language_id[1];

                    if (!latestTranslations[translationLanguageId]) {
                        latestTranslations[translationLanguageId] = activity.attributes.object_changes.content
                            ? activity.attributes.object_changes.content[1]
                            : "";
                    }

                    return (
                        translationLanguageId === this.state.selectedLanguageId ||
                        this.state.selectedLanguageId === "all-languages"
                    );
                }
            }) || [];

        const keyActivities = keyActivityElements.map((activity) => {
            const translationLanguageId = activity.attributes.object
                ? activity.attributes.object.language_id
                : activity.attributes.object_changes.language_id[1];
            const newContent = activity.attributes.object_changes.content
                ? activity.attributes.object_changes.content[1]
                : "";
            const date = moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss").local().format("LL");
            const time = moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss").local().format("HH:mm");
            const key = APIUtils.getIncludedObject(
                activity.relationships.key.data,
                this.state.keyActivityResponse.included
            );
            const language = APIUtils.getIncludedObject(
                {
                    id: translationLanguageId,
                    type: "language"
                },
                this.state.keyActivityResponse.included
            );
            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.state.keyActivityResponse.included
            );

            let showDivider = false;
            if (!discoveredDates.includes(date)) {
                discoveredDates.push(date);
                showDivider = true;
            }

            return (
                <div style={{ display: "flex", flexDirection: "column" }} key={activity.id}>
                    {showDivider && <Divider style={{ fontSize: 14 }}>{date}</Divider>}
                    <div style={{ padding: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ wordBreak: "break-word", flexGrow: 1 }}>
                                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                                    {countryCode && (
                                        <span style={{ marginRight: 8 }}>
                                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                        </span>
                                    )}
                                    {`${language.attributes.name} content changed`}
                                </div>
                                {key.attributes.html_enabled ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: escapeHTML(newContent)
                                        }}
                                    />
                                ) : (
                                    newContent
                                )}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginLeft: 16,
                                    fontSize: 12,
                                    color: Styles.COLOR_TEXT_DISABLED
                                }}
                            >
                                {time}
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            {latestTranslations[translationLanguageId] === newContent ? (
                                <span style={{ color: "#aaa" }}>Current</span>
                            ) : (
                                <Popconfirm
                                    title="Are you sure you want to restore this version?"
                                    onConfirm={async () => {
                                        await TranslationsAPI.createTranslation({
                                            projectId: key.attributes.project_id,
                                            keyId: key.id,
                                            languageId: translationLanguageId,
                                            content: newContent
                                        });
                                        this.props.onTranslationRestored();
                                        await this.reload();
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                    placement="left"
                                >
                                    <a>Restore</a>
                                </Popconfirm>
                            )}
                        </div>
                    </div>
                </div>
            );
        });

        return keyActivityElements.length > 0 ? (
            keyActivities
        ) : (
            <Empty description="No history found" style={{ margin: "56px 0" }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        );
    };

    render() {
        if (!dashboardStore.featureEnabled("FEATURE_KEY_HISTORY")) {
            return <FeatureNotAvailable feature="FEATURE_KEY_HISTORY" />;
        }

        if (!this.state.keyActivityResponse) {
            return <Loading />;
        }

        return (
            <>
                <p>
                    Name: <span style={{ fontWeight: "bold", wordBreak: "break-word" }}>{this.props.keyName}</span>
                </p>
                <Select
                    style={{ width: "50%" }}
                    onChange={(selectedValue: string) => {
                        this.setState({
                            selectedLanguageId: selectedValue
                        });
                    }}
                    value={this.state.selectedLanguageId}
                >
                    <Select.Option value="all-languages">All languages</Select.Option>
                    {this.state.keyActivityResponse?.included
                        ?.filter((included) => {
                            return included.type === "language";
                        })
                        .map((language) => {
                            const countryCode = APIUtils.getIncludedObject(
                                language.relationships.country_code.data,
                                this.state.keyActivityResponse.included
                            );

                            return (
                                <Select.Option value={language.id} key={language.attributes.name}>
                                    {countryCode && (
                                        <span style={{ marginRight: 8 }}>
                                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                        </span>
                                    )}
                                    {language.attributes.name}
                                </Select.Option>
                            );
                        })}
                </Select>
                {this.renderActivityElements()}
            </>
        );
    }
}

export { KeyHistory };
