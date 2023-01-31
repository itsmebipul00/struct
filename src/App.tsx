import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import axios from "axios";
import nasaImg from "./nasaImg.png";
import { useLockedBody, useIntersectionObserver } from "usehooks-ts";
import { Modal } from "./Components/Modal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { format, sub } from "date-fns";
import { NasaDataType } from "./types";

function App() {
  const sDate = format(sub(new Date(), { days: 30 }), "yyyy-MM-dd");
  const eDate = format(sub(new Date(), { days: 2 }), "yyyy-MM-dd");
  const [response, setResponse] = useState<NasaDataType[]>([]);
  const [featuredPost, setFeaturedPost] = useState<NasaDataType>();
  const [openModal, setOpenModal] = useState<NasaDataType>();
  const [, setLocked] = useLockedBody(false, "root");
  const intersectionRef = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(intersectionRef, { rootMargin: "20%" });
  const isVisible = !!entry?.isIntersecting;
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(sDate);
  const [endDate, setEndDate] = useState<string>(eDate);

  const API = `https://api.nasa.gov/planetary/apod?api_key=gaff4Pwpu0Qg6woyFty1YhVRxhj4In1ImvOCyFD7&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  useEffect(() => {
    const nasaService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API);
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
    if (isVisible && !loading) {
      const newEndDate = format(
        sub(new Date(startDate), { days: 1 }),
        "yyyy-MM-dd"
      );
      const newStartDate = format(
        sub(new Date(startDate), { days: 28 }),
        "yyyy-MM-dd"
      );
      setEndDate(newEndDate);
      setStartDate(newStartDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <div className="p-12 min-h-screen bg-[#1E1E1E] text-white flex flex-col gap-16">
      <div className="flex justify-between">
        <img src={nasaImg} alt="nasaImg" className="w-[14rem] h-16" />
        <h2 className="font-semibold text-3xl">Astronomy Picture Of The Day</h2>
      </div>
      {!featuredPost ? (
        <Skeleton count={1} height="100vh" width="100%" inline={true} />
      ) : (
        <div className="flex gap-[6rem] ">
          <div className="flex gap-4 flex-col w-1/2 self-center">
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
                src={featuredPost.url}
                title={featuredPost.title}
                className="rounded-xl"
              />
            )}
          </div>
        </div>
      )}
      {/* make each row scrollable */}
      <div className="grid grid-cols-20 overflow-scroll gap-8 min-h-screen">
        {response.map((data, idx) => {
          return (
            <div
              className="w-80 h-60 hover:brightness-125 cursor-pointer flex relative rounded-xl z-10 "
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
                <iframe
                  src={data.thumbnail_url ?? data.url}
                  title={data.title}
                />
              )}
              <div className="flex gap-6 bg-[#00000080] bg-opacity-50 absolute self-end justify-between text-sm w-full py-3 px-2 ">
                <p className="font-medium">
                  {data.media_type === "video" && (
                    <span className="text-base">🎥 </span>
                  )}
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
      {loading && (
        <div className="[&>*]:flex [&>*]:gap-8 flex flex-col gap-8">
          <Skeleton count={4} height="15rem" width="20rem" inline={true} />
          <Skeleton count={4} height="15rem" width="20rem" inline={true} />
          <Skeleton count={4} height="15rem" width="20rem" inline={true} />
          <Skeleton count={4} height="15rem" width="20rem" inline={true} />
        </div>
      )}
      <div ref={intersectionRef}></div>
    </div>
  );
}

export default App;
