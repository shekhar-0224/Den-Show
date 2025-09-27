import { atom, useAtom } from "jotai";

export type CreateChannelAtom = {
  channelName: string;
  channelAbout: string;
  channelHandle: string;
  nsfw: boolean;
  banner: File | null;
  pfp: File | null;
  freePerks: string[];
  paidPerks: string[];
  tncAccepted: boolean;
  fanSubscriptionFee: number;
  language: string;
  token: {
    isClanker: boolean;
    address?: string;
    symbol: string;
  };
};

const createChannelAtom = atom<CreateChannelAtom>({
  channelName: "",
  channelAbout: "",
  channelHandle: "",
  nsfw: false,
  banner: null,
  pfp: null,
  freePerks: [`"Open to All" Videos`],
  paidPerks: [
    "Earn from Reward vault",
    "Access to exclusive videos & streams",
    "Access to chatroom",
    "Airdrops & other perks",
  ],
  tncAccepted: false,
  fanSubscriptionFee: 10,
  language: "English",
  token: {
    isClanker: false,
    address: "",
    symbol: "",
  },
});

export const useCreateChannelAtom = () => useAtom(createChannelAtom);
