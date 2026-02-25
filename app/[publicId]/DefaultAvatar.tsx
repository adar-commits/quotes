import Image from "next/image";

const CARTOON_AVATAR_URL =
  "https://api.dicebear.com/7.x/avataaars/png?size=128&seed=rep&backgroundColor=b6e3f4";

export default function DefaultAvatar() {
  return (
    <Image
      src={CARTOON_AVATAR_URL}
      alt=""
      width={128}
      height={128}
      className="h-full w-full object-cover"
      sizes="128px"
    />
  );
}
