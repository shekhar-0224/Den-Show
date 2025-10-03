import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

// tRPC removed - using dummy data instead

const Settings = () => {
  const { logout: privyLogout, unlinkTwitter, unlinkFarcaster } = usePrivy();
  const router = useRouter();

  // Dummy mutations
  const linkSocialAccountMutation = async (data: any) => {
    console.log("Dummy social account link:", data);
    return { success: true };
  };

  const linkEmailMutation = async (data: any) => {
    console.log("Dummy email link:", data);
    return { success: true };
  };

  const { linkTwitter, linkFarcaster, linkEmail } = useLinkAccount({
    // onSuccess: ({ user, linkMethod, linkedAccount }) => {
    //   if (linkMethod === "email" && user.email?.address) {
    //     linkEmailMutation({
    //       email: user.email.address,
    //     });
    //   } else if (linkMethod === "twitter" && user.twitter?.username) {
    //     linkSocialAccount({
    //       type: "twitter",
    //       id: user.twitter.subject,
    //       username: user.twitter.username,
    //     });
    //   } else if (
    //     linkMethod === "farcaster" &&
    //     user.farcaster?.username &&
    //     user.farcaster?.fid
    //   ) {
    //     linkSocialAccount({
    //       type: "farcaster",
    //       id: user.farcaster.fid.toString(),
    //       username: user.farcaster.username,
    //     });
    //   } else {
    //     toast.error("Failed to link account");
    //   }
    // },
    onError: (error) => {
      console.error("Failed to link account with error ", error);
      toast.error("Failed to link account");
    },
  });

  const logoutHandler = async () => {
    await privyLogout();
    toast.success("Logged out successfully!");
    router.push("/");
  };

  // Dummy query for profile.getProfileDetails.useQuery()
  const data = { data: [], isLoading: false, error: null };

  // if (!profileDetails) return null;
  return null;

  // const { xHandle, farcasterHandle, xSubject, fid, email } = profileDetails;

  // //unlink social allowed only if there is another social account or email linked
  // const isUnlinkSocialAllowed =
  //   (xSubject && fid) || (xSubject && email) || (fid && email);

  // return (
  //   <div className="w-full flex flex-col gap-4 p-4">
  //     {/* <Button className="justify-start">Wallets</Button> */}
  //     {!email && (
  //       <Button className="justify-start" onClick={linkEmail}>
  //         Connect Email
  //       </Button>
  //     )}
  //     {xHandle && xSubject ? (
  //       isUnlinkSocialAllowed ? (
  //         <Button
  //           className="justify-start"
  //           onClick={() => unlinkTwitter(xSubject)}
  //         >
  //           Disconnect X Account
  //         </Button>
  //       ) : null
  //     ) : (
  //       <Button className="justify-start" onClick={linkTwitter}>
  //         Connect X Account
  //       </Button>
  //     )}
  //     {farcasterHandle && fid ? (
  //       isUnlinkSocialAllowed ? (
  //         <Button
  //           className="justify-start"
  //           onClick={() => unlinkFarcaster(Number(fid))}
  //         >
  //           Disconnect Farcaster Account
  //         </Button>
  //       ) : null
  //     ) : (
  //       <Button className="justify-start" onClick={linkFarcaster}>
  //         Connect Farcaster Account
  //       </Button>
  //     )}
  //     <Button className="justify-start" onClick={logoutHandler}>
  //       Log Out
  //     </Button>
  //     {/* <Button className="justify-start">Delete Account</Button> */}
  //   </div>
  // );
};

export default Settings;
