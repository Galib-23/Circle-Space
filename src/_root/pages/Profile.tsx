import GridPostList from "@/components/shared/GridPostList";
import { FaUserEdit } from "react-icons/fa";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser, useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { Link, useParams } from "react-router-dom"

const Profile = () => {
  const { id } = useParams();
  const { data: currentUser } = useGetCurrentUser();
  const { data: posts, isPending } = useGetRecentPosts();
  const userPosts = posts?.documents.filter((post: Models.Document) => id === post.creator.$id);

  if (!currentUser) return <Loader />

  return (
    <div className="p-10 text-white">
      <h2 className="text-2xl font-semibold mb-2 lg:mb-10 lg:font-bold">{
        id === currentUser?.$id ? 'My ' : 'User '
      } Profile</h2>
      <img className="w-14 h-14 lg:h-28 lg:w-28 lg:border-white border-2" src={currentUser.imageUrl} alt="" />
      <h2 className="mt-2 text-xl lg:text-2xl lg:mt-4">{currentUser.name}</h2>
      <p className="text-gray-400 mt-1">@{currentUser.username}</p>
      <p className="text-white text-xs mb-3 mt-2">{currentUser.bio || '👋👋 Hey there! I am using circlespace'}</p>
      <Link to={`/update-profile/${id}`}>
        <p className="flex items-center gap-1 text-sm text-blue-700 cursor-pointer underline">Edit Profile <FaUserEdit /></p>
      </Link>
      <h2 className="text-xl font-semibold mt-9 mb-2">Posts</h2>
      {
        isPending ? <Loader /> : (
          <GridPostList posts={userPosts || []} showStats={true} />
        )
      }
    </div>
  )
}

export default Profile
