import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { ForbiddenWordsListsTable } from "../../ui/ForbiddenWordsListsTable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { OrganizationQASidebar } from "../../ui/OrganizationQASidebar";

type IProps = RouteComponentProps<{ organizationId: string }>;

@observer
class OrganizationForbiddenWordsSite extends React.Component<IProps> {
    render() {
        return (
            <>
                <LayoutWithSidebar>
                    <OrganizationQASidebar organizationId={this.props.match.params.organizationId} />

                    <LayoutWithSidebarContentWrapper>
                        <Breadcrumbs breadcrumbName="organizationForbiddenWords" />
                        <LayoutWithSidebarContentWrapperInner>
                            <h1>Forbidden words</h1>
                            <p>
                                Add lists of words that should not occur in your translations. Forbidden words that you
                                add here are applied to all your projects.
                            </p>

                            {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization") && (
                                <FeatureNotAvailable
                                    feature="FEATURE_VALIDATIONS"
                                    dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                                />
                            )}

                            {dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization") && (
                                <ForbiddenWordsListsTable
                                    linkedType="organization"
                                    linkedId={this.props.match.params.organizationId}
                                />
                            )}
                        </LayoutWithSidebarContentWrapperInner>
                    </LayoutWithSidebarContentWrapper>
                </LayoutWithSidebar>
            </>
        );
    }
}

export { OrganizationForbiddenWordsSite };
