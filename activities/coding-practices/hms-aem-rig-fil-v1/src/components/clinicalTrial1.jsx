import { useNavigate } from "react-router-dom";

// import { ReactComponent as Raven4 } from '../assets/files-scattered.svg';

export default function ClinicalTrial1() {

    const navigate = useNavigate();

    const submitStartClick = () => {
        navigate("/clinicalTrial2")
    }

    return (

        <>
            <div className="ctbackground">
                <div className="boxes">
                    <div className="big-box yellow">
                        <div>
                            <h1 className="textLeft">RIGOR FILES</h1>
                        </div>
                        <div>
                            <h2>CLINICAL TRIAL FOR A NEW DRUG (DISCUSSION)</h2>
                        </div>
                        <h3>A pharmaceutical company is conducting
                            a phase II clinical trial to evaluate the safety
                            and efficiacy of a novel drug for treating
                            hypertension The drug aims to lower blood
                            pressure without significant side effects.</h3>
                        <div><h3>STUDY TEAM</h3></div>
                        <div>Principal Investigator (PI): Dr. Emily Carter</div>
                        <div>Research Coordinator: Sarah Patel</div>
                        <div>Data Analyst: Dr. Mark Johnson</div>
                        <div><h3>DATA ACCUMULATION</h3></div>
                        <div>Blood pressure measurements (systolic and diastolic) at baselline, weekly intervals, and study endpoint</div>
                        <div>Adverse events reporting</div>
                        <div>Laboratory tests (e.g., kidney function, liver enzymes)</div>
                        <div><h3>PARTICIPANTS</h3></div>
                        <div>500 adult participants (aged 40-65) with diagnosed hypertension.</div>
                        <div>Randomly assigned to either the experimental drug group or a placebo group.</div>
                        <div><h3>ENVIRONMENTAL CONDITIONS</h3></div>
                        <div>Clinical research center with controlled temperature, humidity, and lighting.</div>
                        <div>Standardized examination rooms.</div>
                        <div>Compliance with Good Clinical Practice (GCP) guidelines.</div>
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