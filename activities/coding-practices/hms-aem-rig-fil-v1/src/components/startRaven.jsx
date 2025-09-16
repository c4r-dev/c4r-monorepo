import { useNavigate } from "react-router-dom";

import { ReactComponent as Raven4 } from '../assets/files.svg';

export default function StartRaven() {

    const navigate = useNavigate();

    const submitContinueClick = () => {
      navigate("/welcomePage")
    }

    return (

        <>
            <div>
                <h1>RIGOR FILES</h1>
                <h2>Select a lab scenario to explore! You will examine
                    your chosen case study for potential risks of un-masking.</h2>
            </div>
            <input
                type="button"
                onClick={submitContinueClick}
                value="CONTINUE" />
            <div>
                <Raven4 />
            </div>
        </>
    )
}