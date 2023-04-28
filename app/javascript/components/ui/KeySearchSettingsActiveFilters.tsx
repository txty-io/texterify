import { Tag } from "antd";
import moment from "moment";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetFlavorsResponse } from "../api/v1/FlavorsAPI";
import FlagIcon from "./FlagIcons";
import { useQuery } from "./KeySearchSettings";

const TagStyle = { marginRight: 8, marginBottom: 4 };

export function KeySearchSettingsActiveFilters(props: {
    style?: React.CSSProperties;
    languagesResponse: any;
    flavorsResponse?: IGetFlavorsResponse;
}) {
    const currentQueryParams = useQuery();

    return (
        <div style={{ display: "flex", ...props.style }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                {currentQueryParams.m === "exactly" && (
                    <Tag color="magenta" style={TagStyle}>
                        text matches search exactly
                    </Tag>
                )}

                {currentQueryParams.ou === "true" && (
                    <Tag color="red" style={TagStyle}>
                        only untranslated
                    </Tag>
                )}
                {currentQueryParams.cc === "true" && (
                    <Tag color="volcano" style={TagStyle}>
                        case sensitive
                    </Tag>
                )}
                {currentQueryParams.oo === "true" && (
                    <Tag color="orange" style={TagStyle}>
                        only with overwrites
                    </Tag>
                )}
                {currentQueryParams.he === "true" && (
                    <Tag color="gold" style={TagStyle}>
                        only HTML
                    </Tag>
                )}
                {currentQueryParams.l && (
                    <Tag color="green" style={TagStyle}>
                        {props.languagesResponse?.data
                            ?.filter((language) => {
                                return currentQueryParams.l?.includes(language.id);
                            })
                            .map((language, index) => {
                                const countryCode = APIUtils.getIncludedObject(
                                    language.relationships.country_code.data,
                                    props.languagesResponse.included
                                );

                                return (
                                    <span key={language.id}>
                                        {countryCode && (
                                            <span style={{ marginLeft: index === 0 ? 0 : 4, marginRight: 4 }}>
                                                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                            </span>
                                        )}
                                        {language.attributes.name}
                                    </span>
                                );
                            })
                            .reduce((prev, curr) => {
                                return [prev, " or ", curr];
                            })}
                    </Tag>
                )}
                {currentQueryParams.ec && (
                    <Tag color="cyan" style={TagStyle}>
                        {props.flavorsResponse?.data
                            ?.filter((flavor) => {
                                return currentQueryParams.ec?.includes(flavor.id);
                            })
                            .map((flavor) => {
                                return flavor.attributes.name;
                            })
                            .reduce((prev, curr) => {
                                return [prev, " or ", curr];
                            })}
                    </Tag>
                )}
                {currentQueryParams.ca && (
                    <Tag color="blue" style={TagStyle}>
                        changed after {moment(currentQueryParams.ca).format("YYYY-MM-DD")}
                    </Tag>
                )}
                {currentQueryParams.cb && (
                    <Tag color="blue" style={TagStyle}>
                        changed before {moment(currentQueryParams.cb).format("YYYY-MM-DD")}
                    </Tag>
                )}
            </div>
        </div>
    );
}
