import GridPostList from "@/components/shared/GridPostList";
import { FaUserEdit } from "react-icons/fa";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser, useGetRecentPosts, useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { Link, useParams } from "react-router-dom"
import { MdVerified } from "react-icons/md";

const Profile = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { id } = useParams();
  const { data: user } = useGetUserById(id || '');
  const { data: posts, isPending } = useGetRecentPosts();
  const userPosts = posts?.documents.filter((post: Models.Document) => id === post.creator.$id);

  if (!user) return <Loader />

  return (
    <div className="lg:p-10 px-2 text-white">
      <h2 className="text-2xl font-semibold mb-2 lg:mb-10 lg:font-bold">{
        currentUser?.$id === user?.$id ? 'My ' : 'User '
      } Profile</h2>
      <img className="w-14 h-14 lg:h-28 lg:w-28 lg:border-white border-2" src={user.imageUrl} alt="" />
      <h2 className="mt-2 flex items-center gap-2 text-xl lg:text-2xl lg:mt-4">{user.name} {user.$id === '65e5f7d40c6a5cb1ca6f' && <MdVerified className="text-blue-500" />}</h2>
      <p className="text-gray-400 mt-1">@{user.username}</p>
      <p className="text-white text-xs mb-3 mt-2">{user.bio || '👋👋 Hey there! I am using circlespace'}</p>
      {
        currentUser?.$id === user.$id && (
          <Link to={`/update-profile/${id}`}>
            <p className="flex items-center gap-1 text-sm text-blue-700 cursor-pointer underline">Edit Profile <FaUserEdit /></p>
          </Link>
        )
      }
      <h2 className="text-xl font-semibold mt-9 mb-2">Posts</h2>
      {
        userPosts?.length === 0 && <p className="text-md">No posts yet 🤷🏻‍♂️</p>
      }
      {
        isPending ? <Loader /> : (
          <GridPostList posts={userPosts || []} showStats={true} />
        )
      }
    </div>
  )
}

export default Profile
