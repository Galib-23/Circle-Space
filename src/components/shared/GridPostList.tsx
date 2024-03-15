import { useUserContext } from "@/context/AuthContext"
import { Models } from "appwrite"
import { Link } from "react-router-dom"
import PostStats from "./PostStats";
import { MdDelete } from "react-icons/md";
import { useDeleteSavedPost, useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { useToast } from "../ui/use-toast";

type GridPostListProps = {
    posts: Models.Document[];
    showUser?: boolean;
    showStats?: boolean;
}
const GridPostList = ({ posts, showUser = true, showStats = true }: GridPostListProps) => {

    const { toast } = useToast();
    const { user } = useUserContext();
    const { data: currentUser } = useGetCurrentUser();
    const { mutateAsync: deleteSaved} = useDeleteSavedPost();

    const handleDeleteSavedPost = async (post: Models.Document) => {
        const savedPost = currentUser?.save.find((record: Models.Document) => record.post.$id === post.$id);
        const deleteSavedRes = await deleteSaved(savedPost.$id);
        if(!deleteSavedRes){
            toast({title: 'Something went wrong!'})
        }else{
            toast({title: 'Post removed successfully'})
        }
    }

    return (
        <ul className="grid-container">
            {
                posts.map((post) => (
                    <li key={post.$id} className="relative min-w-80 h-80">
                        <Link to={`/posts/${post.$id}`} className="grid-post_link">
                            <img src={post.imageUrl} alt="post" className="h-full w-full object-cover" />
                        </Link>
                        <div className="grid-post_user">
                            {
                                showUser && (
                                    <div className="flex items-center justify-start gap-2 flex-1">
                                        <img
                                            src={post.creator.imageUrl}
                                            alt="creator"
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <p className="line-clamp-1">{post.creator.name}</p>
                                    </div>
                                )
                            }
                            {
                                showStats ? (
                                    <PostStats post={post} userId={user.id} />
                                ) : (
                                    <MdDelete onClick={()=>handleDeleteSavedPost(post)} className="text-2xl cursor-pointer text-red" />
                                )
                            }
                        </div>
                    </li>
                ))
            }
        </ul>
    )
}

export default GridPostList
