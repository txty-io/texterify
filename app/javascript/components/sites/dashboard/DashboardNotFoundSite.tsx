import { Layout } from "antd";
import * as React from "react";

export function DashboardNotFoundSite() {
    return (
        <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "40px auto", width: "100%" }}>
            <p style={{ textAlign: "center", fontSize: 16 }}>The site could not be found.</p>
            <p
                style={{
                    fontSize: 42,
                    marginTop: 16,
                    marginBottom: 16,
                    textAlign: "center",
                    transform: "rotate(90deg)"
                }}
            >
                :(
            </p>
            <p style={{ textAlign: "center", fontSize: 16 }}>We are sorry for that.</p>
        </Layout>
    );
}
