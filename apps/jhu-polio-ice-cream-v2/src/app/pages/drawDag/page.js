const logger = require('../../../../../../packages/logging/logger.js');
'use client'

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from 'next/image';
import DagDesigner from '@/app/activityComponents/DagDesigner/DagDesigner';

import './drawDag.css';

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
// import HeaderWithModal from "@/app/components/HeaderWithModal/HeaderWithModal";

export default function DrawPage() {

    // const searchParams = useSearchParams()
    // const labGroupId = searchParams.get('labGroupId')
    // logger.app.info('labGroupId', labGroupId);


    // Modal for instructions
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(true);
    const openModal = () => setIsGuideModalVisible(true);
    const closeModal = () => setIsGuideModalVisible(false);


    const router = useRouter();

    const loadReviewPage = (labGroupId) => {
        // router.push('/review');

        if (labGroupId) {
            router.push(`/pages/review?sessionID=${labGroupId}`);
        } else {
            router.push('/pages/review');
        }

        // router.push('/review');
    }


  return (

    
        <div className="draw-dag-container">
            <div className="designer-container">
                <Suspense fallback={<div>Loading...</div>}>
                <Header title="Draw a diagram to explain the correlation" onLogoClick={openModal} />
                {/* <HeaderWithModal /> */}

                {/* Instructions Modal */}
                <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />
                


                    {/* Contains the actual text box, align the text box to the left */}
                    {/* <div className="text-box-container"> 
                        <div className="text-box">
                            <h2>Draw a diagram that explains the correlation between ice cream consumption and Polio cases.</h2>
                        </div>
                    </div> */}

                    <DagDesigner loadReviewPage={loadReviewPage} />
                </Suspense>
            </div>    
            {/* <div>
                <button>Submit Response</button>
            </div> */}
        </div>


  )
}

// export const dynamic = 'force-dynamic';
