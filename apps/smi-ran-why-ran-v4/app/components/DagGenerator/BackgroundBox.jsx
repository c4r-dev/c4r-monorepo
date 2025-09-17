import styled from 'styled-components';

const Box = styled.div`
  background-color: lightgreen;
  width: 50px;
  height: 50px;
  position: absolute;

  /* Default position */
  top: 20px;
  left: 20px;

  /* Change position based on screen size */
  @media (min-width: 600px) {
    top: 50px;
    left: 100px;
  }

  @media (min-width: 900px) {
    top: 100px;
    left: 200px;
  }
`;

const BackgroundBox = () => {
  return <Box />;
};

export default BackgroundBox;