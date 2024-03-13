import Loader from "@/components/shared/Loader";
import PersonCard from "@/components/shared/PersonCard";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations"

const AllUsers = () => {

  const { data: people, isLoading: isUserLoading } = useGetUsers();


  return (
    <div className="flex-1 p-8">
      <h2 className="text-white text-lg lg:text-2xl font-bold mb-6">People you may know</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {
          isUserLoading ? <Loader /> :
            people?.documents.map((person) => (
              <PersonCard key={person.$id} person={person} />
            ))
        }
      </div>
    </div>
  )
}

export default AllUsers
