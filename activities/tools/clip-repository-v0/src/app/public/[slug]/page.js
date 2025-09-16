"use client";
import { api } from "@/utils/apibase";
import { toast } from "react-toastify";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
const Page = ({ params }) => {
    const router = useRouter();
    const [imagedata, setImageData] = useState(null);
    const getUser = async () => {
        const config = {
            method: "GET",
            url: "/api/videoClipList/" + params.slug
        };
        try {
            const response = await api.request(config);
            console.log(response.data.videoClipLists);
            setImageData(response?.data?.videoClipLists?.thumbnail?.data);
        } catch (error) {
            // if (error.response.status == 401) {
            //     toast.error(error.response.data.message + ". Login to try again.", {
            //         position: "top-center",
            //     });
            //     router.push("/dashboard");
            //     return;
            // } else {
            //     toast.error(error.message, {
            //         position: "top-center",
            //     });
            // }
            // router.push("/dashboard/user");
            console.error(error);
        }
    };
    useEffect(() => {
        getUser();
    }, [params.slug]);
    // update user data
    // content type form data

    return (
        <div className=" w-screen h-screen">
            {imagedata ?
                <Image src={`${imagedata}`} width={1000} height={1000} />
                : ''}
        </div>
    );
};
export default Page;
