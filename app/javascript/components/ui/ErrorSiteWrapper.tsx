import { SiteWrapper } from "../ui/SiteWrapper";
import * as React from "react";

export function ErrorSiteWrapper(props: { children: React.ReactNode }) {
    return <SiteWrapper>{props.children}</SiteWrapper>;
}
