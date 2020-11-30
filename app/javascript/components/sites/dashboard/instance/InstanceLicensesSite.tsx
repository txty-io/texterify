import { Card, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { ILicense, LicensesAPI } from "../../../api/v1/LicensesAPI";
import styled from "styled-components";
import { PrimaryButton } from "../../../ui/PrimaryButton";

const Wrapper = styled.div`
    display: flex;
`;

const Name = styled.div`
    width: 200px;
`;

const Value = styled.div`
    width: 200px;
`;

export const InstanceLicensesSite = observer(() => {
    const [licenses, setLicenses] = React.useState<ILicense[]>();

    async function loadLicenses() {
        try {
            const getLicensesResponse = await LicensesAPI.getLicenses();
            setLicenses(getLicensesResponse.data);
        } catch (e) {
            console.error(e);
        }
    }

    React.useEffect(() => {
        loadLicenses();
    }, []);

    function renderLicense(license: ILicense) {
        return (
            <div key={license.id} style={{ display: "flex", flexDirection: "column" }}>
                <Wrapper>
                    <Name>Name:</Name> <Value>{license.attributes.licensee.name}</Value>
                </Wrapper>
                <Wrapper>
                    <Name>E-Mail:</Name> <Value>{license.attributes.licensee.email}</Value>
                </Wrapper>
                <Wrapper>
                    <Name>Starts at:</Name> <Value>{license.attributes.starts_at}</Value>
                </Wrapper>
                <Wrapper>
                    <Name>Expires at:</Name> <Value>{license.attributes.expires_at}</Value>
                </Wrapper>
                <Wrapper>
                    <Name>Max active users:</Name>
                    <Value>{license.attributes.restrictions.active_users_count}</Value>
                </Wrapper>
            </div>
        );
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Licenses</h1>
                <PrimaryButton
                    onClick={() => {
                        // this.setState({ addDialogVisible: true });
                    }}
                >
                    Upload license
                </PrimaryButton>

                {licenses?.length > 0 && (
                    <>
                        <h3>Active license</h3>
                        <Card>
                            {licenses?.slice(0, 1).map((license) => {
                                return renderLicense(license);
                            })}
                        </Card>
                    </>
                )}

                {licenses?.length > 1 && (
                    <>
                        <h3>Old licenses</h3>
                        <Card>
                            <h3>Active license</h3>
                            {licenses?.slice(1).map((license) => {
                                return renderLicense(license);
                            })}
                        </Card>
                    </>
                )}
            </Layout.Content>
        </Layout>
    );
});
