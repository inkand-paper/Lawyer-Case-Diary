import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export const LegalVerificationEmail = ({
  userName,
  verificationUrl,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Activate your Professional Legal Account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Lawyer Case Diary</Heading>
        </Section>
        <Section style={content}>
          <Text style={text}>Dear {userName},</Text>
          <Text style={text}>
            To ensure the security and privacy of your legal files and client data, we require all professionals to verify their email address before accessing the secure portal.
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={verificationUrl}>
              Confirm Professional Identity
            </Link>
          </Section>
          <Text style={text}>
            If you did not initiate this request, please contact our security team immediately.
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

const btnContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#1e293b",
  borderRadius: "0px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "18px",
  border: "1px solid #0f172a",
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
