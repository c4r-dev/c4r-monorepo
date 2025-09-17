"use client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import TopCardUi from "./cards/TopCardUi";
import VideoListCardUi from "./cards/VideoListCardUi";
import MultipleSelector from "@/components/initials/MultipleSelector";
import { useState, useEffect, useContext } from "react";
import { api } from "@/utils/apibase";
import Link from "next/link";
import { FaRegEnvelope, FaReddit } from "react-icons/fa";
import { BsFacebook } from "react-icons/bs";
import { RiTwitterXFill } from "react-icons/ri";
import {
  AiFillYoutube,
  AiOutlineInstagram,
  AiFillLinkedin,
} from "react-icons/ai";
import { IoLogoWhatsapp, IoIosLink } from "react-icons/io";
import FilterVideoSelectors from "./FilterVideoSelectors";
import { toast } from "react-toastify";
import { ClipFilterContext } from "@/contextapi/ClipFilterProvider";
export default function InitPrompt() {
  return (
    <>
      <AllViews />
      {/* <ToastContainer position="top-center" /> */}
    </>
  );
}

const AllViews = () => {

  const { filterData, dispatchFilterData } = useContext(ClipFilterContext);
  const [videoClipListList, setVideoClipListList] = useState({
    page: 1,
    pages: 1,
    videoClipLists: null,
  });

  const [currentVideoLink, setCurrentVideoLink] = useState(null);
  const [nextLink, setNextLink] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [expandBottomSection, setExpandBottomSection] = useState(true);
  const [shareTooltipStatus, setShareTooltipStatus] = useState(false);
  const getvideoClipListsList = async (page = 1) => {
    const config = {
      method: "GET",
      url: "api/videoClipList",
      params: {
        pageNumber: page,
        careerStage: filterData?.careerStage? JSON.stringify(filterData?.careerStage):null,
        fieldOfResearch: filterData?.fieldOfResearch? JSON.stringify(filterData?.fieldOfResearch):null,
        institutionSelector: filterData?.institutionSelector? JSON.stringify(filterData?.institutionSelector):null,
        rigorTopic: filterData?.rigorTopic? JSON.stringify(filterData?.rigorTopic):null,
      },
    };
    setListLoading(true);
    try {
      const response = await api.request(config);
      setVideoClipListList(response.data);
      console.log(response.data);
      setListLoading(false);
    } catch (error) {
      console.log(error);
      setListLoading(false);
      if (error.response.status == 401) {
        toast.error(error.response.data.message + ", Login to try again.", {
          position: "top-center",
        });
        router.push("/");
      } else {
        toast.error(error.message, {
          position: "top-center",
        });
      }
    }
  };
  function toggleExpandBottomSection() {
    setExpandBottomSection(!expandBottomSection);
    if (expandBottomSection) {
      console.log("opening expand section");
      console.log("get filtered videos");
    }
  }
  function copyToClipBoard(value) {
    // Copy the text inside the text field
    navigator.clipboard.writeText(value);
    toast("Link copied: " + value, {
      position: "top-center",
    });
  }
  useEffect(() => {
    if (!videoClipListList.videoClipLists) {
      getvideoClipListsList();
    }
    getvideoClipListsList();
  }, [filterData]);
  return (
    <div>
      <TopCardUi />
      {/* <div className="text-white">{JSON.stringify(filterData)}</div> */}
      {!currentVideoLink && !nextLink && (
        <div className="mx-3 p-3 pb-0 border-x-2 space-y-2 border-ui-violet rounded-lg">
        <div
          className={`space-y-2 ${
            expandBottomSection ? "h-0 overflow-hidden" : "py-2"
          }`}
        >
          <FilterVideoSelectors />
          <hr className="border-ui-violet" />
          
        </div>
          <div
            className={`space-y-2 pb-3 ${
              expandBottomSection ? "h-[452px]" : "h-[367px]"
            } overflow-y-scroll`}
          >
            {videoClipListList.videoClipLists?.map((e, index) => (
              <div key={index}>
                <VideoListCardUi
                  info={e}
                  right={index % 2 !== 0}
                  setvideoLink={setCurrentVideoLink}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {currentVideoLink && !nextLink && (
        <div className="mx-3 p-3 ">
          <iframe
            width="713" height="405"
            src={`https://www.youtube.com/embed/${currentVideoLink?.videoLink}?rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
          {!shareTooltipStatus ? (<div className="relative flex justify-between text-[16px] font-bold mt-2">
            <button
              className="px-14 py-3 bg-ui-violet rounded-sm"
              onClick={() => setCurrentVideoLink(null)}
            >
              Back to Recommendations
            </button>
            <button
              className="px-14 py-3 bg-purple-400/80 rounded-sm"
              onClick={() => setShareTooltipStatus(true)}
            >
              Share Video
            </button>

            <Link
              className="px-14 py-3 bg-orange-400 rounded-sm"
              target="_blank"
              href={`${currentVideoLink?.nextLink}`}
            >
              Next
            </Link>
          </div>):(
            <div
              className="flex justify-center mt-5"
              onClick={() => setShareTooltipStatus(false)}
            >
              <div className="space-x-5 text-2xl flex">
                <Link
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  target="_blank"
                  href={`https://twitter.com/intent/tweet?text=https://youtu.be/${currentVideoLink.videoLink}`}
                >
                  <RiTwitterXFill />
                </Link>
                <Link
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  target="_blank"
                  href={`http://www.reddit.com/submit?url=https://youtu.be/${currentVideoLink.videoLink}`}
                >
                  <FaReddit />
                </Link>
                <Link
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  target="_blank"
                  href={`whatsapp://send?text=https://youtu.be/${currentVideoLink.videoLink}`}
                >
                  <IoLogoWhatsapp />
                </Link>
                <Link
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  target="_blank"
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://youtu.be/${currentVideoLink.videoLink}`}
                >
                  <BsFacebook />
                </Link>
                <Link
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  target="_blank"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://youtu.be/${currentVideoLink.videoLink}`}
                >
                  <AiFillLinkedin />
                </Link>
                <button
                  className="p-2 bg-gray-700 hover:bg-gray-500 rounded-full"
                  onClick={() =>
                    copyToClipBoard(`https://youtu.be/${currentVideoLink.videoLink}`)
                  }
                >
                  <IoIosLink />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {nextLink && (
        <div className="relative px-4 text-white w-full h-[540px]">
          <button
            className="bg-red-600 text-white absolute top-2 left-4 px-2 py-1 rounded-md text-sm"
            onClick={() => setNextLink(null)}
          >
            go back
          </button>
          <iframe
            width="374"
            height="540"
            src={`${currentVideoLink?.nextLink}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* expansion btn */}
      {!currentVideoLink && !nextLink && <div className="mx-6 ">
        <button
          className="px-2 w-full flex justify-between items-center bg-ui-violet text-black"
          onClick={() => toggleExpandBottomSection()}
        >
          <div className="w-[30px] flex justify-center text-lg">
            {expandBottomSection ? (
              <MdKeyboardArrowDown />
            ) : (
              <MdKeyboardArrowUp />
            )}
          </div>
          <p className="text-center text-[10px]">
            {expandBottomSection
              ? "Don't like our recs? Click to see all clips."
              : "Collapse clip repository"}
          </p>
          <div className="w-[30px] flex justify-center text-lg">
            {expandBottomSection ? (
              <MdKeyboardArrowDown />
            ) : (
              <MdKeyboardArrowUp />
            )}
          </div>
        </button>
      </div>}
    </div>
  );
};
