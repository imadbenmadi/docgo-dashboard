import TemplateEditorPage from "./TemplateEditorPage";

const PasswordResetEmailPage = () => {
  return (
    <TemplateEditorPage
      templateType="password_reset"
      title="Email de réinitialisation de mot de passe"
      description="Ce template est envoyé automatiquement lorsqu'un utilisateur demande réinitialiser son mot de passe. Il contient un lien sécurisé pour réinitialiser le mot de passe."
      sampleData={{
        firstName: "Imed",
        lastName: "Benmadi",
        fullName: "Imed Benmadi",
        email: "useremail@gmail.com",
        platformName: "HealthPathGlobal",
        supportEmail: "notification@yourdomain.com",
        resetLink:
          "https://app.healthpathglobal.com/reset-password?token=abc123def456",
        expiryHours: 24,
      }}
    />
  );
};

export default PasswordResetEmailPage;
