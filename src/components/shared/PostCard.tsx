import { useUserContext } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";
import { Models } from "appwrite"
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { MdVerified } from "react-icons/md";

type PostCardProps = {
    post: Models.Document;
}

const PostCard = ({ post }: PostCardProps) => {

    const time = timeAgo(post.$createdAt);
    const { user } = useUserContext();

    if(!post.creator) return;

    return (
        <div className="post-card">
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.creator.$id}`}>
                        <img src={post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="creator" className="rounded-full w-12 lg:h-12" />
                    </Link>
                    <div className="flex flex-col">
                        <p className="base-medium flex items-center gap-2 lg:body-bold text-light-1">{post.creator.name} {post.creator.$id === '65e5f7d40c6a5cb1ca6f' && <MdVerified className="text-blue-500"/>}</p>
                        <div className="flex-center gap-2 text-light-3">
                            <p className="subtle-semibold lg:small-regular">{time}</p>
                            -
                            <p className="subtle-semibold lg:small-regular">{post.location}</p>
                        </div>
                    </div>
                </div>
                <Link to={`/update-post/${post.$id}`} className={`${user.id !== post.creator.$id && 'hidden'}`}>
                    <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
                </Link>
            </div>
            <Link to={`/posts/${post.$id}`}>
                <div className="small-medium lg:base-medium py-5">
                    <p>{post.caption}</p>
                    <ul className="flex flex-col lg:flex-row gap-1 mt-2">
                        {
                            post.tags?.map((tag: string) => (
                                <li key={tag} className="text-light-3 mr-1">#{tag}</li>
                            ))
                        }
                    </ul>
                </div>
                <img src={post.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="post image" className="post-card_image rounded-2xl mb-4" />
            </Link>
            <PostStats post={post} userId={user.id} />
        </div>
    )
}

export default PostCard
