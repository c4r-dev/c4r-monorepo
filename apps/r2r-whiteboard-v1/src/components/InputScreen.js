'use client'

import DragAndDropGame from './DragAndDropGame';

import localFont from 'next/font/local';
const myFont = localFont({ src: './GeneralSans-Regular.ttf'

 });

export default function InputScreen({showResource}) {


// Set state 
    return (
        <div>
            {/* <h1 className={myFont.className}>InputScreen</h1> */}
            <DragAndDropGame showResource={showResource} />
        </div>
    )
}