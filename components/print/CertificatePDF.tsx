"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Register fonts if needed, or use defaults
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  province: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  municipality: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  office: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    color: "#1e293b",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    textTransform: "uppercase",
    textDecoration: "underline",
  },
  body: {
    marginTop: 20,
    textAlign: "justify",
  },
  paragraph: {
    marginBottom: 15,
    textIndent: 30,
  },
  highlight: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
  detailsTable: {
    marginTop: 20,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailLabel: {
    width: 150,
    fontWeight: "bold",
  },
  detailValue: {
    flex: 1,
  },
  footer: {
    marginTop: 50,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 40,
  },
  signatureBox: {
    width: 200,
    textAlign: "center",
  },
  signatoryName: {
    fontWeight: "bold",
    textDecoration: "underline",
    fontSize: 12,
  },
  signatoryTitle: {
    fontSize: 10,
    fontStyle: "italic",
  },
  paymentInfo: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    fontSize: 9,
    color: "#64748b",
  },
});

interface CertificatePDFProps {
  taxpayerName: string;
  tin: string;
  ownerAddress: string;
  certType: string;
  purpose: string;
  relatedTd?: string;
  remarks?: string;
  orNumber: string;
  amountPaid: string;
  paymentDate?: Date;
}

export const CertificatePDF = ({
  taxpayerName,
  tin,
  ownerAddress,
  certType,
  purpose,
  relatedTd,
  remarks,
  orNumber,
  amountPaid,
  paymentDate,
}: CertificatePDFProps) => {
  const dateStr = format(new Date(), "MMMM dd, yyyy");
  const formattedPaymentDate = paymentDate
    ? format(paymentDate, "MMMM dd, yyyy")
    : "N/A";

  const getCertTitle = (type: string) => {
    switch (type) {
      case "tax-clearance":
        return "Tax Clearance";
      case "no-improvement":
        return "Certificate of No Improvement";
      case "property-holdings":
        return "Certificate of Property Holdings";
      case "ctc-td":
        return "Certified True Copy of Tax Declaration";
      case "non-delinquency":
        return "Certificate of Non-Delinquency";
      default:
        return "Certification";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.province}>Republic of the Philippines</Text>
          <Text style={styles.province}>Province of Samar</Text>
          <Text style={styles.municipality}>Municipality of Sta. Rita</Text>
          <Text style={styles.office}>OFFICE OF THE MUNICIPAL TREASURER</Text>
        </View>

        <Text style={styles.title}>{getCertTitle(certType)}</Text>

        <View style={styles.body}>
          <Text style={styles.paragraph}>
            TO WHOM IT MAY CONCERN:
          </Text>
          <Text style={styles.paragraph}>
            THIS IS TO CERTIFY that <Text style={styles.highlight}>{taxpayerName || "____________________"}</Text>, 
            with TIN <Text style={styles.highlight}>{tin || "____________________"}</Text> and 
            residing at <Text style={styles.highlight}>{ownerAddress || "____________________"}</Text>, 
            has requested for this certification.
          </Text>

          {relatedTd && (
            <Text style={styles.paragraph}>
              This certification is specifically issued for the property covered by Tax Declaration No. 
              <Text style={styles.highlight}> {relatedTd}</Text>.
            </Text>
          )}

          <Text style={styles.paragraph}>
            This certification is issued upon the request of the above-named party for 
            <Text style={styles.highlight}> {purpose || "record purposes"}</Text>.
          </Text>

          {remarks && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Remarks:</Text>
              <Text style={{ marginTop: 5 }}>{remarks}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Issued this {dateStr} at Sta. Rita, Samar, Philippines.</Text>

          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatoryName}>NAME OF TREASURER</Text>
              <Text style={styles.signatoryTitle}>Municipal Treasurer</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text>O.R. No.: {orNumber || "__________"}</Text>
          <Text>Amount Paid: PHP {amountPaid || "0.00"}</Text>
          <Text>Date Paid: {formattedPaymentDate}</Text>
        </View>
      </Page>
    </Document>
  );
};
