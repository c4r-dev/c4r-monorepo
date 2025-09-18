const logger = require('../../../../packages/logging/logger.js');
'use client'

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from 'next/image';
import DagUtility from '../components/DagUtility';
import DagDesigner from '../DagDesigner/DagDesigner';

import './drawDag1.css';



// import Raven1 from '../assets/feedback-button-1.svg';

// export default function ResQuesThree() {
export default function DrawPage() {


    // const searchParams = useSearchParams()
    // const labGroupId = searchParams.get('labGroupId')
    // logger.app.info('labGroupId', labGroupId);

    const router = useRouter();

    const loadReviewPage = (labGroupId) => {
        // router.push('/review');

        if (labGroupId) {
            router.push(`/review?labGroupId=${labGroupId}`);
        } else {
            router.push('/review');
        }

        // router.push('/review');
    }

    // const submitResponseToServer = (DagData) => {
    //     logger.app.info('submitResponseToServer');
    // }

    // const onSubmit = () => {
    //     const DagData = DagDesigner.toObject();
    //     submitResponseToServer(DagData);
    // }

    /*

    Now try your hand by creating your own DAG from scratch!
Using the directed acyclic graph (DAG) method you just learned, try to illustrate the variables surrounding someone contracting a flu virus:
the variables involved,
direction and dependencies, 
as well as potential confounders and maybe missing variables
*/


  return (

    
        <div className="draw-dag-container">

            <div className="draw-dag-instructions">
                <h2>Now try your hand by creating your own DAG from scratch!</h2>

                <p>
                    Using the directed acyclic graph (DAG) method you just learned, try to illustrate the variables surrounding someone contracting a flu virus:
                </p>
                    <ul>
                        <li>the variables involved,</li>
                        <li>direction and dependencies,</li>
                        <li>as well as potential confounders and maybe missing variables</li>
                    </ul>
            </div>

            <div className="designer-container">
                <Suspense fallback={<div>Loading...</div>}>
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
