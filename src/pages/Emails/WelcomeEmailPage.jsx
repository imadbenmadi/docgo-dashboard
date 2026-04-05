import TemplateEditorPage from "./TemplateEditorPage";

const WelcomeEmailPage = () => {
  return (
    <TemplateEditorPage
      templateType="welcome"
      title="Email de bienvenue"
      description="Ce template est envoyé automatiquement après l'inscription d'un nouvel utilisateur."
      sampleData={{
        firstName: "Imed",
        lastName: "Benmadi",
        fullName: "Imed Benmadi",
        email: "useremail@gmail.com",
        platformName: "HealthPathGlobal",
        supportEmail: "notification@yourdomain.com",
      }}
    />
  );
};

export default WelcomeEmailPage;
