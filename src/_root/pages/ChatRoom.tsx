import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom"

const ChatRoom = () => {
    const { id } = useParams();
    const { data: userChattingTo } = useGetUserById(id || "");
    
  return (
    <div>
      
    </div>
  )
}

export default ChatRoom
