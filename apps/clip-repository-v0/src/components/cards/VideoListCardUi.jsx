import Image from "next/image";
import Link from "next/link";

const VideoListCardUi = ({ right, info, setvideoLink }) => {
  return (
    <div 
    onClick={()=>setvideoLink(info)}
      className={`flex bg-[rgba(144,_123,_154,_0.38)] rounded-lg ${
        right ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`w-[123px] max-h-max flex justify-center items-center text-center rounded-lg border-black bg-white p-2 ${
          right ? "border-s-4" : "border-e-4"
        }`}
      >
        { info && info?.thumbnail ? (
          <Image
            src={`${info?.thumbnail.data}`}
            width={123}
            height={123}
            alt={`${info?.videoTitle}`}
          />
        ) : (
          <h3 className="text-black font-bold">
            THUMB
            <br />
            NAIL
          </h3>
        )}
      </div>
      <div
        className={`w-[calc(100%_-_123px)] flex flex-col justify-center space-y-1 p-2 `}
      >
        <h3 className="text-[16px]  font-bold">{info?.videoTitle}</h3>
        <p className="text-[14px] leading-[18px]">{info?.videoDetailsText}</p>
        <p className="text-[10px] leading-[18px]">
          <span className="font-bold">Keywords</span>: {info?.videoKeywords}
        </p>
      </div>
    </div>
  );
};

export default VideoListCardUi;
