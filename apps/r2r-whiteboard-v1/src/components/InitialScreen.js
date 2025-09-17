'use client'

import localFont from 'next/font/local';
const myFont = localFont({ src: './GeneralSans-Semibold.ttf'
});

import Image from 'next/image';
import raven from '../assets/raven1.svg';
import paperLeft from '../assets/paper-left.svg';
import paperCenter from '../assets/paper-center.svg';
import paperRight from '../assets/paper-right.svg';



export default function InitialScreen({ startActivity }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ textAlign: 'left', margin: '20px', zIndex: '1' }}>
                <h1 style={{ fontWeight: 'bold', fontSize: '28px' }}>Whiteboard Exercise</h1>
                <p style={{ fontSize: '28px' }}>Explore key concepts regarding Motivation in Method with Rigor.</p>
            </div>
            <div style={{ display: 'flex', flexDirection:'row-reverse', padding: '20px', zIndex: '1' }}>
                <button className={`${myFont.className} start-button`}  onClick={startActivity} style={{ alignSelf: 'flex-start' }}>START ACTIVITY</button>
            </div>
            <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', overflow: 'hidden', height: '50%' }}>
                <Image
                    priority
                    src={raven}
                    alt=""
                    style={{ position: 'relative', top: '20%', width: '500px' }}
                />
            </div>
            <div style={{ position: 'absolute', top: '0', left: '0', overflow: 'hidden', width: '50%', height: '100%' }}>
                <Image
                    priority
                    src={paperLeft}
                    alt=""
                    style={{ position: 'relative', left: '-16%', top: '17%', width: '80%' }}
                />
            </div>
            <div style={{ position: 'absolute', top: '0', right: '0', overflow: 'hidden', width: '100%', height: '100%' }}>
                <Image
                    priority
                    src={paperCenter}
                    alt=""
                    style={{ position: 'relative', right: '-35%', top: '-13%', width: '40%' }}
                />
            </div>           
            <div style={{ position: 'absolute', top: '0', right: '0', overflow: 'hidden', width: '50%', height: '100%' }}>
                <Image
                    priority
                    src={paperRight}
                    alt=""
                    style={{ position: 'relative', right: '-45%', top: '-13%', width: '80%' }}
                />
            </div>
        </div>
    );
}