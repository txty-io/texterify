import { Divider, Popconfirm, Select, Tag } from "antd";
import * as moment from "moment";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { KeysAPI } from "../api/v1/KeysAPI";
import FlagIcon from "./FlagIcons";
import { Loading } from "./Loading";
import { Styles } from "./Styles";
import { Utils } from "./Utils";

type IProps = {
    projectId: string;
    keyId: string;
};
type IState = {
    keyActivityResponse: any;
    selectedLanguageId: string;
};

class KeyHistory extends React.Component<IProps, IState> {
    state: IState = {
        keyActivityResponse: null,
        selectedLanguageId: null
    };

    async componentDidMount(): Promise<void> {
        try {
            const keyActivityResponse = await KeysAPI.getActivity({
                projectId: this.props.projectId,
                keyId: this.props.keyId
            });

            this.setState({
                keyActivityResponse: keyActivityResponse
            });
        } catch (err) {
            if (!err.isCanceled) {
                console.error(err);
            }
        }
    }

    renderActivityElements = () => {
        // Remember discovered dates so the day divider is not
        // shown for the same day multiple times.
        const discoveredDates: string[] = [];

        return this.state.keyActivityResponse.data.map((activity) => {
            const itemType = activity.attributes.item_type;

            let activityElement;
            if (itemType === "Translation") {
                const newContent = activity.attributes.object_changes.content[1];
                const date = moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss").local().format("LL");
                const time = moment.utc(activity.attributes.created_at, "YYYY-MM-DD HH:mm:ss").local().format("HH:mm");
                const key = APIUtils.getIncludedObject(activity.relationships.key.data, this.state.keyActivityResponse.included);

                let showDivider = false;
                if (discoveredDates.indexOf(date) === -1) {
                    discoveredDates.push(date);
                    showDivider = true;
                }

                activityElement = (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {showDivider && <Divider style={{ fontSize: 14 }}>{date}</Divider>}
                        <div style={{ padding: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                <div style={{ wordBreak: "break-word", flexGrow: 1 }}>
                                    {key.attributes.html_enabled ?
                                        // tslint:disable-next-line:react-no-dangerous-html
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: Utils.getHTMLContentPreview(newContent)
                                            }}
                                        /> :
                                        newContent
                                    }
                                </div>
                                <div style={{ marginLeft: 16, fontSize: 12, color: Styles.COLOR_TEXT_DISABLED }}>
                                    {time}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <Popconfirm
                                    title="Are you sure you want to restore this version?"
                                    // onConfirm={confirm}
                                    // onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"
                                    placement="left"
                                >
                                    {/* tslint:disable-next-line:react-a11y-anchors */}
                                    <a>Restore</a>
                                </Popconfirm>
                            </div>
                        </div>
                    </div>
                );
            }

            return activityElement;
        });
    }

    onChangeLanguage(event: any) {
        const value = event.target.value;
        console.log(`radio checked: ${value}`);
    }

    render() {
        if (!this.state.keyActivityResponse) {
            return <Loading />;
        }

        return (
            <>
                <Select
                    style={{ width: "50%" }}
                    onChange={(selectedValue: string) => {
                        this.setState({
                            selectedLanguageId: selectedValue
                        });
                    }}
                    value={this.state.selectedLanguageId}
                >
                    {this.state.keyActivityResponse.included.filter((included) => {
                        return included.type === "language";
                    }).map((language) => {
                        const countryCode = APIUtils.getIncludedObject(language.relationships.country_code.data, this.state.keyActivityResponse.included);

                        return (
                            <Select.Option value={language.id} key={language.attributes.name}>
                                {countryCode && <span style={{ marginRight: 8 }}>
                                    <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                </span>}
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
