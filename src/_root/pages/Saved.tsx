import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
const Saved = () => {
  const { data: user } = useGetCurrentUser();
  // console.log(user?.save)
  const savedPosts = user?.save.map((savedPost: Models.Document) => ({
    ...savedPost.post,
    creator: {
      imageUrl: user.imageUrl,
    }
  })).reverse();
  // console.log(savedPosts);
  return (
    <div className="p-1 lg:p-14">
      <h2 className="text-white text-lg lg:text-3xl font-semibold lg:font-bold mb-2 lg:mb-14">Saved Posts</h2>
      {
        !user ? <Loader /> : (
          <div>
            {
              savedPosts.length === 0 ? 
              <p>No saved posts</p> : (
                <div>
                  <GridPostList showStats={false} posts={savedPosts} />
                </div>
              )
            }
          </div>
        )
      }
    </div>
  )
}

export default Saved
