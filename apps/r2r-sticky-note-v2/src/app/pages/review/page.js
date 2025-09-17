"use client";

import DragAndDropGame from "@/app/components/ActivityComponents/DragAndDropGame";

export default function ReviewPage() {
    /* 
        Note: Both and input and review pages use the same component
        as a workaround to split the functionality across two pages.
        The state is controlled by the reviewMode prop (true) and
        URL parameters from the input page. 
    */

    const reviewMode = true;

    return (
        <div>
            <DragAndDropGame reviewMode={reviewMode}/>
        </div>
    );
}