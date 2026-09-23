import HelpDesk from "./HelpDesk";

/**
 * What visitors and members wrote in, on its own screen.
 *
 * It is the same table as the ticket board — a message whose subjectType is
 * support or bug — but a different job: these are answered, not raised, so
 * the board next door stays the team's own work and this one cannot be added
 * to from the dashboard.
 */
const UserMessages = () => (
  <HelpDesk
    origin="users"
    heading="Messages des utilisateurs"
    subtitle="Ce que les visiteurs et les membres ont signalé depuis le site."
  />
);

export default UserMessages;
