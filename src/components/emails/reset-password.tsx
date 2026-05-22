import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userName: string;
  resetCode: string;
}

export const ResetPasswordEmail = ({
  userName,
  resetCode,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Professional Legal Account Password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Lawyer Case Diary</Heading>
        </Section>
        <Section style={content}>
          <Text style={text}>Dear {userName},</Text>
          <Text style={text}>
            We received a request to reset the password for your Lawyer Case Diary account. 
            Use the secure 6-digit code below to securely reset your credentials. 
            This code will expire in 15 minutes.
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{resetCode}</Text>
          </Section>
          <Text style={text}>
            If you did not request a password reset, please ignore this email or contact support immediately.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Lawyer Case Diary. Confidential & Secure.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f4f7f6",
  fontFamily: '"Times New Roman", Times, serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "4px",
  overflow: "hidden",
  border: "1px solid #d1d5db",
};

const header = {
  backgroundColor: "#1e293b",
  padding: "40px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const content = {
  padding: "40px",
};

const text = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
  padding: "24px",
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
};

const codeText = {
  color: "#0f172a",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
  textAlign: "center" as const,
};

const footer = {
  color: "#64748b",
  fontSize: "11px",
  lineHeight: "16px",
  marginTop: "60px",
  textAlign: "center" as const,
  borderTop: "1px solid #e2e8f0",
  paddingTop: "20px",
};
