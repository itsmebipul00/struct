import { useRef } from "react";
import { useOnClickOutside, useMediaQuery } from "usehooks-ts";
import { NasaDataType } from "../types";

type ModalPropType = {
  data: NasaDataType;
  setOpenModal: React.Dispatch<React.SetStateAction<NasaDataType | undefined>>;
  setLocked: (locked: boolean) => void;
};

export const Modal = ({ data, setOpenModal, setLocked }: ModalPropType) => {
  const ref = useRef(null);

  const matches = useMediaQuery("(min-width: 1224px)");

  const handleClickOutside = () => {
    setOpenModal(undefined);
    setLocked(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <div className="fixed h-screen w-screen flex justify-center items-center top-0 left-0 bg-[#1E1E1E] bg-opacity-80 z-10">
      <div
        className="rounded-xl flex flex-col gap-4  bg-white text-black w-[85%] lg:w-1/2"
        ref={ref}
      >
        <div
          className="p-2 text-right cursor-pointer ml-6"
          onClick={handleClickOutside}
        >
          X
        </div>
        <div>
          {data.media_type === "image" && (
            <img
              src={data.hdurl}
              alt={data.title}
              className="w-full h-[30vh]"
            />
          )}
          {data.media_type === "video" && (
            <iframe
              src={data.url}
              title={data.title}
              className="w-full h-[30vh]"
            />
          )}
        </div>
        <div className="py-3 px-6 flex flex-col gap-4">
          <div className="text-2xl font-semibold">{data.title}</div>
          <div className="font-light">
            {matches
              ? data.explanation
              : `${data.explanation.slice(0, 350)}...`}
          </div>
          <div className="font-light">
            authored by{" "}
            <span className="font-semibold">
              {data.copyright ?? "Bipul Sharma"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
