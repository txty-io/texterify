import { Checkbox, DatePicker, Select } from "antd";
import moment from "moment";
import * as queryString from "query-string";
import * as React from "react";
import { useLocation } from "react-router";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetFlavorsResponse } from "../api/v1/FlavorsAPI";
import { IGetLanguagesResponse } from "../api/v1/LanguagesAPI";
import { history } from "../routing/history";
import FlagIcon from "./FlagIcons";

export function parseKeySearchSettingsFromURL(): ISearchSettings {
    const currentQueryParams = queryString.parse(history.location.search);

    return {
        languageIds: currentQueryParams.l as string[],
        flavorIds: currentQueryParams.f as string[],
        showOnlyUntranslated: currentQueryParams.ou === "true",
        onlyHTMLEnabled: currentQueryParams.he === "true",
        checkCase: currentQueryParams.cc === "true",
        showOnlyKeysWithOverwrites: currentQueryParams.oo === "true",
        changedBefore: currentQueryParams.cb as string,
        changedAfter: currentQueryParams.ca as string,
        match: currentQueryParams.m as ISearchSettingsMatch
    };
}

export function useQuery() {
    return queryString.parse(useLocation().search);
}

type ISearchSettingsMatch = "contains" | "exactly";

export interface ISearchSettings {
    languageIds: string[];
    flavorIds: string[];
    showOnlyUntranslated: boolean;
    onlyHTMLEnabled: boolean;
    checkCase: boolean;
    showOnlyKeysWithOverwrites: boolean;
    changedBefore: string;
    changedAfter: string;
    match: ISearchSettingsMatch;
}

// l == languages
// f == flavors
// ou == only untranslated
// cc == check case
// oo == only overrides
// ca == changed after
// cb == changed before
// he == html enabled
export interface ISearchSettingsQueryParams {
    l?: string | string[];
    f?: string | string[];
    ou?: boolean;
    cc?: boolean;
    oo?: boolean;
    ca?: string;
    cb?: string;
    he?: boolean;
    m?: string;
}

export function KeySearchSettings(props: {
    languagesResponse: IGetLanguagesResponse;
    flavorsResponse?: IGetFlavorsResponse;
    onChange(options: ISearchSettings): void;
}) {
    const currentQueryParams = useQuery();

    const [selectedLanguages, setSelectedLanguages] = React.useState<string | string[]>(currentQueryParams.l);
    const [selectedFlavors, setSelectedFlavors] = React.useState<string | string[]>(currentQueryParams.f);
    const [match, setMatch] = React.useState<string>((currentQueryParams.m as string) || "contains");
    const [onlyUntranslated, setOnlyUntranslated] = React.useState<boolean>(currentQueryParams.ou === "true");
    const [checkCase, setCheckCase] = React.useState<boolean>(currentQueryParams.cc === "true");
    const [onlyHTMLEnabled, setOnlyKeysWithHTMLEnabled] = React.useState<boolean>(currentQueryParams.he === "true");
    const [onlyKeysWithOverwrites, setOnlyKeysWithOverwrites] = React.useState<boolean>(
        currentQueryParams.oo === "true"
    );
    const [changedBefore, setChangedBefore] = React.useState<moment.Moment>(
        currentQueryParams.cb !== undefined ? moment(currentQueryParams.cb as string) : undefined
    );
    const [changedAfter, setChangedAfter] = React.useState<moment.Moment>(
        currentQueryParams.ca !== undefined ? moment(currentQueryParams.ca as string) : undefined
    );

    function onChange() {
        const query: ISearchSettingsQueryParams = currentQueryParams;

        query.l = selectedLanguages;
        query.f = selectedFlavors;

        if (onlyUntranslated) {
            query.ou = onlyUntranslated;
        } else {
            delete query.ou;
        }

        if (checkCase) {
            query.cc = checkCase;
        } else {
            delete query.cc;
        }

        if (onlyKeysWithOverwrites) {
            query.oo = onlyKeysWithOverwrites;
        } else {
            delete query.oo;
        }

        if (onlyHTMLEnabled) {
            query.he = onlyHTMLEnabled;
        } else {
            delete query.he;
        }

        if (changedAfter) {
            query.ca = changedAfter.format("YYYY-MM-DD");
        } else {
            delete query.ca;
        }

        if (changedBefore) {
            query.cb = changedBefore.format("YYYY-MM-DD");
        } else {
            delete query.cb;
        }

        if (match !== "contains") {
            query.m = match;
        } else {
            delete query.m;
        }

        const searchString = queryString.stringify(query);
        history.push({
            search: searchString
        });

        props.onChange(parseKeySearchSettingsFromURL());
    }

    React.useEffect(() => {
        onChange();
    }, [
        selectedLanguages,
        selectedFlavors,
        onlyUntranslated,
        checkCase,
        onlyKeysWithOverwrites,
        changedBefore,
        changedAfter,
        onlyHTMLEnabled,
        match
    ]);

    const languagesForFilterSelectOptions = (props.languagesResponse?.data || []).map((language) => {
        const countryCode = APIUtils.getIncludedObject(
            language.relationships.country_code.data,
            props.languagesResponse.included
        );

        return {
            value: language.id,
            label: language.attributes.name,
            content: (
                <>
                    {countryCode && (
                        <span style={{ marginRight: 8 }}>
                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                        </span>
                    )}
                    {language.attributes.name}
                </>
            )
        };
    }, []);

    return (
        <div style={{ width: 640, display: "flex" }}>
            <div style={{ width: "50%", marginRight: 40 }}>
                <h4>String matching</h4>
                <Select
                    placeholder="Select string matching"
                    style={{ width: "100%" }}
                    defaultValue={match}
                    onSelect={(value) => {
                        setMatch(value);
                    }}
                >
                    <Select.Option value="contains">contains</Select.Option>
                    <Select.Option value="exactly">exactly</Select.Option>
                </Select>

                <h4 style={{ marginTop: 16 }}>Filter by languages</h4>
                <Select
                    showSearch
                    placeholder="Select languages"
                    style={{ width: "100%" }}
                    onChange={(values: string[]) => {
                        setSelectedLanguages(values);
                    }}
                    optionFilterProp="label"
                    filterOption
                    mode="multiple"
                    defaultValue={selectedLanguages}
                >
                    {languagesForFilterSelectOptions.map((option) => {
                        return (
                            <Select.Option value={option.value} key={option.value} label={option.label}>
                                {option.content}
                            </Select.Option>
                        );
                    })}
                </Select>

                <h4 style={{ marginTop: 16 }}>Filter by flavors</h4>
                <Select
                    placeholder="Select flavors"
                    style={{ width: "100%" }}
                    onChange={(values: string[]) => {
                        setSelectedFlavors(values);
                    }}
                    mode="multiple"
                    defaultValue={selectedFlavors}
                >
                    {(props.flavorsResponse?.data || []).map((flavor) => {
                        return (
                            <Select.Option value={flavor.id} key={flavor.id}>
                                {flavor.attributes.name}
                            </Select.Option>
                        );
                    })}
                </Select>

                <Checkbox
                    onChange={(event) => {
                        setCheckCase(event.target.checked);
                    }}
                    style={{ marginTop: 16, marginLeft: 0, width: "100%" }}
                    defaultChecked={checkCase}
                >
                    Check case
                </Checkbox>
                <Checkbox
                    onChange={(event) => {
                        setOnlyUntranslated(event.target.checked);
                    }}
                    style={{ marginTop: 16, marginLeft: 0, width: "100%" }}
                    defaultChecked={onlyUntranslated}
                >
                    Show only untranslated keys
                </Checkbox>
                <Checkbox
                    onChange={(event) => {
                        setOnlyKeysWithOverwrites(event.target.checked);
                    }}
                    style={{ marginTop: 16, marginLeft: 0, width: "100%" }}
                    defaultChecked={onlyKeysWithOverwrites}
                >
                    Show only keys with overwrites
                </Checkbox>
                <Checkbox
                    onChange={(event) => {
                        setOnlyKeysWithHTMLEnabled(event.target.checked);
                    }}
                    style={{ marginTop: 16, marginLeft: 0, width: "100%" }}
                    defaultChecked={onlyHTMLEnabled}
                >
                    Show only keys with HTML enabled
                </Checkbox>
            </div>

            <div style={{ width: "50%" }}>
                <h4>Changed after</h4>
                <DatePicker
                    onSelect={(value) => {
                        setChangedAfter(value);
                    }}
                    onChange={(value) => {
                        setChangedAfter(value);
                    }}
                    placeholder="Select date"
                    style={{ width: "100%" }}
                    defaultValue={changedAfter}
                />

                <h4 style={{ marginTop: 16 }}>Changed before</h4>
                <DatePicker
                    onSelect={(value) => {
                        setChangedBefore(value);
                    }}
                    onChange={(value) => {
                        setChangedBefore(value);
                    }}
                    placeholder="Select date"
                    style={{ width: "100%" }}
                    defaultValue={changedBefore}
                />
            </div>
        </div>
    );
}
