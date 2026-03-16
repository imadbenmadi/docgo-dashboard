import TemplateEditorPage from "./TemplateEditorPage";

const PaymentRejectedEmailPage = () => {
  return (
    <TemplateEditorPage
      templateType="payment_rejected"
      title="Email paiement refuse"
      description="Ce template est envoye automatiquement lorsqu'un paiement est refuse par l'administration."
      sampleData={{
        firstName: "Imed",
        lastName: "Benmadi",
        fullName: "Imed Benmadi",
        email: "imed@example.com",
        platformName: "HealthPathGlobal",
        supportEmail: "notification@yourdomain.com",
        itemType: "course",
        itemLabel: "course",
        itemTitle: "Anatomy 101",
        itemLink: "https://healthpathglobal.com/courses/123",
        reason: "Screenshot is unreadable",
      }}
    />
  );
};

export default PaymentRejectedEmailPage;
