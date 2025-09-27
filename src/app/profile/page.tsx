import ProfileDetails from "../_components/Profile/ProfileDetails";
import ProfileOptions from "../_components/Profile/ProfileOptions";

export default async function ProfilePage() {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <ProfileDetails />
      <ProfileOptions />
    </div>
  );
}
