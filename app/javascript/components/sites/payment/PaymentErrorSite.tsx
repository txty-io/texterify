import { observer } from "mobx-react";
import * as React from "react";

const PaymentErrorSite = observer(() => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 40
            }}
        >
            Something went wrong.
        </div>
    );
});

export { PaymentErrorSite };
