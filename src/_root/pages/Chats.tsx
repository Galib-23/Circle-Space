import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const Chats = () => {
  const { data: people, isLoading: isUserLoading } = useGetUsers();

  return (
    <div>
      <div className="flex-1 sticky p-1 md:p-8">
        <h2 className="text-white text-lg lg:text-2xl font-bold mb-6 fixed ">
          My chats
        </h2>
          {isUserLoading ? (
            <Loader />
          ) : (
            <ul className="mt-10">
              {
                people?.documents.map((person) => (
                  <li key={person.$id} className="mt-5">
                    <Link to={`/chats/${person.$id}`} className="flex items-center gap-3">
                    <img className="h-12 w-12 rounded-full border-2 border-green-700" src={person.imageUrl} alt="P" />
                    <p className="text-lg">{person.name}</p>
                    </Link>
                  </li>
                ))
              }
            </ul>
          )}
      </div>
    </div>
  );
};

export default Chats;
