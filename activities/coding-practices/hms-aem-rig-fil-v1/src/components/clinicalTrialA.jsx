import { useNavigate } from "react-router-dom";

// import { ReactComponent as Raven4 } from '../assets/files-scattered.svg';

export default function ClinicalTrialA() {

    const navigate = useNavigate();

    const submitStartClick = () => {
        navigate("/clinicalTrialB")
    }

    return (

        <>
            <div className="ctbackground">
                <div className="boxes">
                    <div className="big-box blue">
                        <div>
                            <h1 className="textLeft">RIGOR FILES</h1>
                        </div>
                        <div>
                            <h2>BEHAVIORAL STUDY ON SLEEP PATTERNS (DISCUSSION)</h2>
                        </div>
                        <h3>A psychology research team is investigating the impact of blue light exposure on sleep quality. Participants are exposed to different light conditions before bedtime.</h3>
                        <div><h3>STUDY TEAM</h3></div>
                        <div>Lead Researcher: Dr. Alex Ramirez</div>
                        <div>Graduate Research Assistants: Maria Humboldt and James Chen</div>
                        <div><h3>DATA ACCUMULATION</h3></div>
                        <div>Sleep logs (self-reported bedtime, wake time, sleep duration).</div>
                        <div>Actigraphy (wrist-worn devices tracking movement during sleep).</div>
                        <div>Melatonin levels (saliva samples).</div>
                        <div><h3>PARTICIPANTS</h3></div>
                        <div>100 healthy adults (ages 18-35) recruited from the university community.</div>
                        <div>Randomly assigned to one of three groups: blue light exposure, red light exposure, or no light exposure (control).</div>
                        <div><h3>ENVIRONMENTAL CONDITIONS</h3></div>
                        <div>Participants’ homes (naturalistic setting).</div>
                        <div>Controlled light exposure in a dark room.</div>
                        <div>Compliance with ethical guidelines for human research.</div>
                        <br></br>
                        <br></br>
                        <input
                            type="button"
                            onClick={submitStartClick}
                            value="CAPTURE IDEAS AND QUESTIONS" />
                    </div>
                </div>
            </div>
        </>
    )
}