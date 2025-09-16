import { ReactComponent as Raven4 } from "../assets/ravens_dots_and_clouds/raven4.svg";
import { ReactComponent as Raven61 } from "../assets/ravens_dots_and_clouds/raven6-1.svg";
import { ReactComponent as Raven62 } from "../assets/ravens_dots_and_clouds/raven6-2.svg";
import { ReactComponent as RavenIcon } from "../assets/ravens_isolated/raven-icon.svg";

import "./range-slider.css";

function ShowResults() {
    let guess = sessionStorage.getItem("guess");
    const actualAnswer = 91;

    // Determines feedback text based on the difference between the guess and the actual answer.
    function getFeedback() {
        let header = "";
        let question1 = "";
        let question2 = "";

        if (guess >= actualAnswer - 5 && guess <= actualAnswer + 5) {
            header = "Wow, great guess!";
            question1 = "What implications do you think this statistic has on the research that informs your work?";
            question2 = "Have you taken any measures to account for them?";
        }
        else if (guess >= actualAnswer - 15 && guess <= actualAnswer + 15) {
            header = "Not a bad guess!";
            question1 = "What implications do you think this statistic has on the research that informs your work?";
            question2 = "Have you taken any measures to account for them?";
        }
        else if (guess < actualAnswer) {
            header = "Shocked?";
            question1 = "Why do you think your guess was so far off?";
            question2 = "What might this suggest about your lab, its blind spots, and your field's culture more broadly?";
        }
        else {
            header = "Interesting!";
            question1 = "Do you think people generally overestimate the degree to which they can trust published work?";
            question2 = "Has this impacted how you discuss findings in your field with others?";
        }
        return { header, question1, question2 };
    }

    let feedbackText = getFeedback();

    const imageStyle = {
        // width: "100%",
        // margin: "0 auto",
        width: "45%",
        height: "45%",
    };

    return (
        <div className="content-container results-screen">
            <h1>
                What percentage of researchers do you think believe that there
                is a reproducibility crisis?
            </h1>

            <div className="percent-ravens-container">
                <div className="percent-raven-container-left">
                    <Raven61 style={imageStyle} />
                    <h1>Your Answer</h1>
                    <h2>{guess}%</h2>
                </div>
                <div className="percent-raven-container-right">
                    <Raven62 style={imageStyle} />
                    <h1>Right Answer</h1>
                    <h2>91%</h2>
                </div>
            </div>

            <div className="content-container-footer">
                <div className="footer-left">
                    <RavenIcon style={{ width: "100%", margin: "0 auto" }} />
                </div>
                <div className="footer-right">
                    <h2>{feedbackText.header}</h2>
                        <ul>
                            <li>
                                {feedbackText.question1}
                            </li>
                            <li>{feedbackText.question2}</li>
                        </ul>
                    {/* <br></br> */}
                    <p>
                        <strong>
                            This data comes as part of a 2016 online Nature
                            survey.
                        </strong>
                    </p>
                    <p>
                        Baker, M. 1,500 scientists lift the lid on
                        reproducibility. Nature 533,
                    </p>
                    <p>
                        452-454 (2016){" "}
                        <a href="https://dol.org/10.1038/533452a">
                            https://dol.org/10.1038/533452a
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ShowResults;
