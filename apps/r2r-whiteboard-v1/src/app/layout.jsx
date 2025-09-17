import "../styles/globals.css";
import Activity from "components/Activity";

export const metadata = {
  title: "Whiteboard Activity V1",
  description: "Whiteboard Activity V1",
}

function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Activity />
      </body>
    </html>
  );
}

export default RootLayout;
