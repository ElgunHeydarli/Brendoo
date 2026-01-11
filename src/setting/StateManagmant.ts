import { atom } from "recoil";

export const RefetchBasked = atom({
  key: "refetchBasked", // unique ID
  default: false,
});

export const RefetchLocalBasked = atom({
  key: "refetchLocalBasked", // ⚠️ FƏRQLI KEY OLMALIDIR!
  default: false,
});
