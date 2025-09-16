import { Card, CardHeader } from "../components/ui/card";
import { Message as MessageType } from "ai";
import { Bot, User } from "lucide-react";

// export default function Message({ message }) {
//   const { role, content } = message;
//   if (role === "assistant") {
//     return (
//       <div className="flex flex-col gap-3 p-6 whitespace-pre-wrap">
//         <div className="flex items-center gap-2">
//           <Bot />
//           Assistant:
//         </div>
//         {content}
//       </div>
//     );
//   }
//   return (
//     <Card className="whitespace-pre-wrap">
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           <User size={36} />
//           {content}
//         </div>
//       </CardHeader>
//     </Card>
//   );
// }

// function Message({ message }) {
//   const isSent = message.role === "user"; // Assuming "user" is the sender role
//   return (
//     <div
//       className={`message-container ${isSent ? "right" : "left"}`}
//     >
//       <div className="message-bubble">
//         {message.content}
//       </div>
//     </div>
//   );
// }

// export default Message;

function Message({ message }) {
  const isSent = message.role === "user"; // Assuming "user" is the sender role

  // Function to check if the message content contains numbered lists
  const isNumberedList = (content) => {
    const lines = content.split("\n");
    return lines.every((line) => /^\d+\.\s/.test(line.trim()));
  };

  // Render content as bullet points if it's a numbered list
  const renderContent = (content) => {
    if (isNumberedList(content)) {
      const lines = content.split("\n");
      return (
        <ul style={{ listStyleType: "disc", paddingLeft: "20px", margin: 0 }}>
          {lines.map((line, index) => (
            <li key={index}>{line.replace(/^\d+\.\s/, "")}</li>
          ))}
        </ul>
      );
    }
    return content;
  };

  return (
    <div className={`message-container ${isSent ? "right" : "left"}`}>
      <div className="message-bubble">{renderContent(message.content)}</div>
    </div>
  );
}

export default Message;

