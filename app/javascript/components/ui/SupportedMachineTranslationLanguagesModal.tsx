import { Button } from "antd";
import * as React from "react";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages
} from "../api/v1/MachineTranslationsAPI";
import { TexterifyModal } from "./TexterifyModal";

export function SupportedMachineTranslationLanguagesModal(props: {
    visible: boolean;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
    onCancelRequest();
}) {
    return (
        <TexterifyModal
            title="Supported languages for machine translation"
            visible={props.visible}
            footer={
                <div style={{ margin: "6px 0" }}>
                    <Button
                        onClick={() => {
                            props.onCancelRequest();
                        }}
                    >
                        Close
                    </Button>
                </div>
            }
            onCancel={props.onCancelRequest}
        >
            <div style={{ display: "flex" }}>
                <div>
                    <h1>Supported source languages</h1>
                    <ul>
                        {props.supportedSourceLanguages?.data.map((supportedSourceLanguage) => {
                            return <li>{supportedSourceLanguage.attributes.name}</li>;
                        })}
                    </ul>
                </div>

                <div>
                    <h1>Supported target languages</h1>
                    <ul>
                        {props.supportedTargetLanguages?.data.map((supportedTargetLanguage) => {
                            return <li>{supportedTargetLanguage.attributes.name}</li>;
                        })}
                    </ul>
                </div>
            </div>
        </TexterifyModal>
    );
}
