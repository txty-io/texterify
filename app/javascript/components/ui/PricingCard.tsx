import { CheckOutlined } from "@ant-design/icons";
import * as React from "react";

interface IProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    style?: object;
}

class PricingCard extends React.Component<IProps> {
    render() {
        return (
            <div
                style={{
                    border: "1px solid var(--color-border)",
                    padding: "20px 24px",
                    textAlign: "center",
                    flexBasis: 1,
                    flexGrow: 1,
                    ...this.props.style
                }}
            >
                <h3 style={{ fontWeight: "bold" }}>{this.props.title}</h3>
                <p style={{ fontSize: 20, fontWeight: "bold", lineHeight: "20px", marginTop: 16 }}>
                    <span>{this.props.price}</span>
                    <br />
                    <span style={{ fontSize: 12 }}>per user / per month</span>
                </p>
                <p>{this.props.description}</p>
                <div style={{ marginTop: 16 }}>{this.renderFeatureItems(this.props.features)}</div>
            </div>
        );
    }

    renderFeatureItems = (features: string[]): JSX.Element[] => {
        return features.map((feature: string, index: number) => {
            return (
                <div key={index} style={{ textAlign: "left", fontWeight: "bold" }}>
                    <CheckOutlined style={{ marginRight: 5, color: "rgb(56, 181, 25)" }} /> {feature}
                </div>
            );
        });
    };
}

export { PricingCard };
