import TemplateEditorPage from "./TemplateEditorPage";

const LoginAttemptEmailPage = () => {
  return (
    <TemplateEditorPage
      templateType="login_attempt"
      title="Email de tentative de connexion"
      description="Ce template est envoyé automatiquement lorsqu'une nouvelle connexion est détectée sur le compte utilisateur."
      sampleData={{
        firstName: "Imed",
        lastName: "Benmadi",
        fullName: "Imed Benmadi",
        email: "imed@example.com",
        platformName: "HealthPathGlobal",
        supportEmail: "notification@yourdomain.com",
        ip: "102.54.10.11",
        userAgent: "Chrome 124 / Windows 11",
        loginTime: new Date().toISOString(),
      }}
    />
  );
};

export default LoginAttemptEmailPage;
