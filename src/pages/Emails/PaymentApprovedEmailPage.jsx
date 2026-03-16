import TemplateEditorPage from "./TemplateEditorPage";

const PaymentApprovedEmailPage = () => {
  return (
    <TemplateEditorPage
      templateType="payment_approved"
      title="Email paiement approuve"
      description="Ce template est envoye automatiquement lorsqu'un paiement est approuve par l'administration."
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
      }}
    />
  );
};

export default PaymentApprovedEmailPage;
