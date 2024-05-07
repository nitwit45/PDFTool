import React from "react";
import "./dashboard.css";
import Text from "../Text/Text";
const Component2 = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2 className="comp-heading" >Summarize and Translate</h2>
        <Text />
      </div>
    </div>
  );
};

export default Component2;
