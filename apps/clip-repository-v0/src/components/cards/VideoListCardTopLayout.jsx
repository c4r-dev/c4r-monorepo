import Image from "next/image";

const VideoListCardLayout = ({ children, imageurl }) => {
  return (
    <div className="p-3 pb-0">
      <div className="flex relative">
        <Image
          className="w-[300px] absolute right-[-97px] top-[-67px] z-10"
          src={imageurl ? imageurl : "/imoje-charecters/raven-prof.png"}
          priority={true}
          width={400}
          height={450}
          alt="Raven Stop"
        />
        <div className="bg-white text-ui-dark-gray w-[calc(100%_-40px)] h-full absolute left-[0px] rounded-tl-md rounded-bl-md"></div>
        <div className="bg-transparent text-ui-dark-gray w-[calc(100%_-40px)] left-[0px] rounded-tl-md rounded-bl-md z-20">
          <div className="mr-[45px] px-2 py-2 flex flex-col justify-between h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoListCardLayout;
