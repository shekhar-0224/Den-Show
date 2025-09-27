import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createChannel } from "~/app/_actions";
import { useCreateChannelAtom } from "~/app/_atoms/createChannel.atom";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { uploadFile } from "~/lib/utils";
import ChannelPerksDroppable from "./ChannelPerksDroppable";
import DraggableChannelPerk from "./DraggableChannelPerk";

interface ChannelTierProps {
  onGoBack?: () => void;
}

const ChannelTier = ({ onGoBack }: ChannelTierProps) => {
  const router = useRouter();

  const [formData, setFormData] = useCreateChannelAtom();

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const { freePerks, paidPerks, tncAccepted } = formData;

  const handleCreateDen = async () => {
    if (!tncAccepted) return;

    try {
      setIsCreatingChannel(true);

      let bannerUrl: string | undefined = undefined;
      let profileUrl: string | undefined = undefined;

      if (formData.banner) {
        bannerUrl = await uploadFile(formData.banner);
      }

      if (formData.pfp) {
        profileUrl = await uploadFile(formData.pfp);
      }

      await createChannel({
        ...formData,
        bannerUrl,
        profileUrl,
      });

      toast.success("Channel created successfully");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create channel");
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === "free-perks" && active.data.current) {
      if (!freePerks.includes(active.data.current.perk)) {
        setFormData((prev) => ({
          ...prev,
          // biome-ignore lint/style/noNonNullAssertion: will always be defined
          freePerks: [...prev.freePerks, active.data.current!.perk],
          paidPerks:
            // biome-ignore lint/style/noNonNullAssertion: will always be defined
            prev.paidPerks.filter((perk) => perk !== active.data.current!.perk),
        }));
      }
    }

    if (over && over.id === "paid-perks" && active.data.current) {
      if (!paidPerks.includes(active.data.current.perk)) {
        setFormData((prev) => ({
          ...prev,
          // biome-ignore lint/style/noNonNullAssertion: will always be defined
          paidPerks: [...prev.paidPerks, active.data.current!.perk],
          freePerks:
            // biome-ignore lint/style/noNonNullAssertion: will always be defined
            prev.freePerks.filter((perk) => perk !== active.data.current!.perk),
        }));
      }
    }
  };

  const goBackHandler = () => {
    onGoBack?.();
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="w-full md:w-[60%] flex flex-col gap-4 px-12 py-14">
        <h3 className="text-2xl font-cream-medium">Setup Fan Membership</h3>
        <div className="grid grid-cols-2 gap-4 flex-1 mt-6">
          <div className="px-10 flex flex-col h-full">
            <div className="font-cream-medium text-lg">Free</div>
            <div className="font-cream-medium text-lg">
              <span className="text-[50px]">0</span> USDC
            </div>

            <ChannelPerksDroppable id="free-perks">
              {freePerks.length > 0 ? (
                freePerks.map((perk) => (
                  <DraggableChannelPerk key={perk} id={perk} perk={perk} />
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  Drag & drop perks from paid tier here
                </div>
              )}
            </ChannelPerksDroppable>
          </div>
          <div className="px-10 flex flex-col border-l border-black border-dashed h-full">
            <div className="font-cream-medium text-lg">Fan</div>
            <div className="font-cream-medium text-lg">
              <Input
                type="number"
                value={formData.fanSubscriptionFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fanSubscriptionFee: Number(e.target.value),
                  })
                }
                className="w-28 h-fit p-0 inline text-[50px] border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none mr-2"
              />{" "}
              USDC
            </div>

            <ChannelPerksDroppable id="paid-perks">
              {paidPerks.length > 0 ? (
                paidPerks.map((perk) => (
                  <DraggableChannelPerk key={perk} id={perk} perk={perk} />
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  Drag & drop perks from free tier here
                </div>
              )}
            </ChannelPerksDroppable>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="18-plus"
            checked={formData.nsfw}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, nsfw: checked })
            }
          />
          <Label htmlFor="18-plus" className="font-base text-sm">
            My channel caters to 18+ audience only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="tnc"
            checked={tncAccepted}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, tncAccepted: checked })
            }
          />
          <Label htmlFor="tnc" className="font-base text-sm">
            I've read the content & moderation Community Guidelines and agree to
            Den's T&C & Privacy Policy
          </Label>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            className="w-36"
            onClick={goBackHandler}
            disabled={isCreatingChannel}
          >
            Go Back
          </Button>
          <Button
            className="w-36"
            onClick={handleCreateDen}
            disabled={!tncAccepted || isCreatingChannel}
          >
            {isCreatingChannel ? "Creating..." : "Create Den"}
          </Button>
        </div>
      </div>
      <div className="hidden md:block w-[40%] relative h-full">
        <Image
          src="/images/channel-tier-graphic.png"
          alt="Channel Tier Graphic"
          fill
          className="object-cover"
        />
      </div>
    </DndContext>
  );
};

export default ChannelTier;
