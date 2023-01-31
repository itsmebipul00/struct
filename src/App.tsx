import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import axios from "axios";
import nasaImg from "./nasaImg.png";
import { url } from "inspector";
import {
  useOnClickOutside,
  useLockedBody,
  useIntersectionObserver,
} from "usehooks-ts";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// end date = today -2
// start_date = today - 30

interface NasaDataType {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: "video" | "image";
  service_version: string;
  title: string;
  url: string;
  thumbnail_url?: string;
}

type ModalPropType = {
  data: NasaDataType;
  setOpenModal: React.Dispatch<React.SetStateAction<NasaDataType | undefined>>;
  setLocked: (locked: boolean) => void;
};

const Modal = ({ data, setOpenModal, setLocked }: ModalPropType) => {
  const ref = useRef(null);

  const handleClickOutside = () => {
    setOpenModal(undefined);
    setLocked(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <div className="fixed h-screen w-screen flex justify-center items-center top-0 left-0 bg-[#1E1E1E] bg-opacity-80">
      <div
        className="rounded-xl flex flex-col gap-4  bg-white text-black w-1/2"
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
            <iframe src={data.hdurl} title={data.title} />
          )}
        </div>
        <div className="py-3 px-6 flex flex-col gap-4">
          <div className="text-2xl font-semibold">{data.title}</div>
          <div className="font-light">{data.explanation}</div>
          <div className="font-light">
            authored by <span className="font-semibold">{data.copyright}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  let sDate = new Date();
  let eDate = new Date();
  sDate.setDate(sDate.getDate() - 30);
  eDate.setDate(eDate.getDate() - 2);

  const [response, setResponse] = useState<NasaDataType[]>([]);
  const [featuredPost, setFeaturedPost] = useState<NasaDataType>();
  const [openModal, setOpenModal] = useState<NasaDataType>();
  const [locked, setLocked] = useLockedBody(false, "root");
  const intersectionRef = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(intersectionRef, { rootMargin: "20%" });
  const isVisible = !!entry?.isIntersecting;
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState<string>(
    sDate.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    eDate.toISOString().split("T")[0]
  );

  const API = `https://api.nasa.gov/planetary/apod?api_key=gaff4Pwpu0Qg6woyFty1YhVRxhj4In1ImvOCyFD7&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
  useEffect(() => {
    const nasaService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API);
        console.log(res.data.length);
        if (res.data.length === 29) {
          setFeaturedPost(res.data[res.data.length - 1]);
          res.data.length = 28;
          setResponse(res.data.reverse());
        } else {
          setResponse((prev) => [...prev, ...res.data.reverse()]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    nasaService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleModal = (data: NasaDataType) => {
    setOpenModal(data);
    setLocked(true);
  };

  useEffect(() => {
    if (isVisible) {
      console.log(startDate);
      console.log(endDate);
      let newStartDate = new Date(startDate) as string | Date;
      let newEndDate = new Date(endDate) as string | Date;

      (newEndDate as Date).setDate((newStartDate as Date).getDate() - 1);
      (newStartDate as Date).setDate((newStartDate as Date).getDate() - 28);
      newEndDate = (newEndDate as Date).toISOString().split("T")[0];
      newStartDate = (newStartDate as Date).toISOString().split("T")[0];
      setEndDate(newEndDate);
      setStartDate(newStartDate);
    }
  }, [isVisible]);

  return (
    <div className="p-12 min-h-screen bg-[#1E1E1E] text-white flex flex-col gap-16">
      <div className="flex justify-between">
        <img src={nasaImg} alt="nasaImg" className="w-[14rem] h-16" />
        <h2 className="font-semibold text-3xl">Astronomy Picture Of The Day</h2>
      </div>
      <div className="flex gap-[6rem]">
        <div className="flex gap-4 flex-col w-1/2">
          <h2 className="font-semibold text-3xl">{featuredPost?.title}</h2>
          <p className="font-light text-xl">{featuredPost?.explanation}</p>
          <p className="font-light">
            authored by{" "}
            <span className="font-semibold">{featuredPost?.copyright}</span>
          </p>
        </div>

        <div className="w-1/2">
          {featuredPost?.media_type === "image" && (
            <img
              src={featuredPost.hdurl}
              alt={featuredPost.title}
              className="rounded-xl"
            />
          )}
          {featuredPost?.media_type === "video" && (
            <iframe
              src={featuredPost.hdurl}
              title={featuredPost.title}
              className="rounded-xl"
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-20 overflow-scroll gap-8 min-h-screen">
        {response.map((data, idx) => {
          return (
            <div
              className="w-80 h-60 hover:brightness-125 cursor-pointer flex relative rounded-xl "
              key={idx}
              onClick={() => handleModal(data)}
            >
              {data.media_type === "image" && (
                <img
                  src={data.hdurl}
                  alt={data.title}
                  className="w-full h-full"
                />
              )}
              {data.media_type === "video" && (
                <iframe src={data.url} title={data.title} />
              )}
              <div className="flex gap-6 bg-[#00000080] bg-opacity-50 absolute self-end justify-between text-sm w-full py-3 px-2 ">
                <p className="font-medium">
                  {data.title.length > 22
                    ? `${data.title.slice(0, 22)}...`
                    : data.title}
                </p>
                <p className="whitespace-nowrap self-center">{data.date}</p>
              </div>
            </div>
          );
        })}
      </div>
      {!!openModal && (
        <Modal
          data={openModal}
          setOpenModal={setOpenModal}
          setLocked={setLocked}
        />
      )}
      {true && (
        <div className="[&>*]:flex [&>*]:gap-8">
          <Skeleton count={4} height="15rem" width="20rem" inline={true} />
        </div>
      )}
      <div ref={intersectionRef}></div>
    </div>
  );
}

export default App;
